<?php

namespace App\Http\Controllers\API\Shared;

use App\Http\Controllers\Controller;
use GuzzleHttp\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class SupportAssistantController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
            'history' => ['nullable', 'array'],
            'history.*.role' => ['nullable', 'string'],
            'history.*.text' => ['nullable', 'string'],
        ]);

        $provider = strtolower((string) config('services.support_ai.provider', 'openai'));
        $temperature = (float) config('services.support_ai.temperature', 0.3);
        $maxTokens = (int) config('services.support_ai.max_tokens', 350);
        $apiKey = $this->getApiKey($provider);

        if ($provider !== 'ollama' && $apiKey === '') {
            return response()->json([
                'message' => 'Falta configurar la API key del proveedor de IA.',
            ], 503);
        }

        $messages = [
            [
                'role' => 'system',
                'content' => implode("\n", [
                    'Eres el asistente de soporte de AppiFood.',
                    'Responde en español, con tono claro, breve y útil.',
                    'Ayuda solo sobre pedidos, checkout, pagos, direcciones, favoritos, suscripcion, perfil, restaurantes y soporte.',
                    'Si no sabes algo, dilo con transparencia y sugiere la ruta adecuada dentro de la app.',
                    'Devuelve siempre un objeto JSON valido con estas claves: reply (string) y action (object|null).',
                    'Si incluyes action, usa solo {"label": string, "path": string}.',
                    'Paths utiles: /support, /user/orders, /user/orders/{id}, /user/addresses, /user/profile, /subscription, /restaurants, /checkout, /cart.',
                ]),
            ],
        ];

        foreach (array_slice($validated['history'] ?? [], -8) as $entry) {
            $role = strtolower((string) Arr::get($entry, 'role', 'user'));
            if (!in_array($role, ['user', 'assistant'], true)) {
                continue;
            }

            $text = trim((string) Arr::get($entry, 'text', ''));
            if ($text === '') {
                continue;
            }

            $messages[] = [
                'role' => $role,
                'content' => $text,
            ];
        }

        $messages[] = [
            'role' => 'user',
            'content' => trim($validated['message']),
        ];

        try {
            $client = new Client([
                'base_uri' => $this->getBaseUrl($provider),
                'timeout' => 30,
            ]);

            $response = match ($provider) {
                'anthropic' => $client->post('/messages', [
                    'headers' => [
                        'x-api-key' => config('services.anthropic.api_key'),
                        'anthropic-version' => '2023-06-01',
                        'Content-Type' => 'application/json',
                        'Accept' => 'application/json',
                    ],
                    'json' => [
                        'model' => config('services.anthropic.model', 'claude-3-5-sonnet-20241022'),
                        'max_tokens' => $maxTokens,
                        'temperature' => $temperature,
                        'messages' => $this->toAnthropicMessages($messages),
                    ],
                ]),
                'ollama' => $client->post('/api/chat', [
                    'json' => [
                        'model' => config('services.ollama.model', 'llama3.1'),
                        'stream' => false,
                        'messages' => $messages,
                        'options' => [
                            'temperature' => $temperature,
                        ],
                    ],
                ]),
                default => $client->post('/chat/completions', [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $apiKey,
                        'Content-Type' => 'application/json',
                        'Accept' => 'application/json',
                    ],
                    'json' => [
                        'model' => config('services.openai.model', 'gpt-4o-mini'),
                        'messages' => $messages,
                        'temperature' => $temperature,
                        'max_tokens' => $maxTokens,
                        'response_format' => ['type' => 'json_object'],
                    ],
                ]),
            };

            $payload = json_decode((string) $response->getBody(), true);
            $content = $this->extractContent($provider, $payload);

            $assistantData = json_decode($content, true);
            if (json_last_error() !== JSON_ERROR_NONE || !is_array($assistantData)) {
                $assistantData = [
                    'reply' => trim($content) !== '' ? trim($content) : 'No pude generar una respuesta en este momento.',
                    'action' => null,
                ];
            }

            $reply = trim((string) Arr::get($assistantData, 'reply', ''));
            if ($reply === '') {
                $reply = 'No pude generar una respuesta en este momento.';
            }

            $action = Arr::get($assistantData, 'action');
            if (!is_array($action)) {
                $action = null;
            } else {
                $action = [
                    'label' => (string) Arr::get($action, 'label', ''),
                    'path' => (string) Arr::get($action, 'path', ''),
                ];

                if ($action['label'] === '' || $action['path'] === '') {
                    $action = null;
                }
            }

            return response()->json([
                'reply' => $reply,
                'action' => $action,
                'provider' => $provider,
            ]);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'No se pudo procesar la solicitud del asistente.',
            ], 502);
        }
    }

    private function getBaseUrl(string $provider): string
    {
        return match ($provider) {
            'anthropic' => rtrim((string) config('services.anthropic.base_url', 'https://api.anthropic.com/v1'), '/'),
            'ollama' => rtrim((string) config('services.ollama.base_url', 'http://localhost:11434'), '/'),
            default => rtrim((string) config('services.openai.base_url', 'https://api.openai.com/v1'), '/'),
        };
    }

    private function getApiKey(string $provider): string
    {
        return match ($provider) {
            'anthropic' => (string) config('services.anthropic.api_key'),
            'ollama' => '',
            default => (string) config('services.openai.api_key'),
        };
    }

    private function toAnthropicMessages(array $messages): array
    {
        $anthropicMessages = [];

        foreach ($messages as $message) {
            if (($message['role'] ?? null) === 'system') {
                continue;
            }

            $anthropicMessages[] = [
                'role' => $message['role'] ?? 'user',
                'content' => $message['content'] ?? '',
            ];
        }

        return $anthropicMessages;
    }

    private function extractContent(string $provider, array $payload): string
    {
        return match ($provider) {
            'anthropic' => (string) data_get($payload, 'content.0.text', ''),
            'ollama' => (string) data_get($payload, 'message.content', ''),
            default => (string) data_get($payload, 'choices.0.message.content', ''),
        };
    }
}
