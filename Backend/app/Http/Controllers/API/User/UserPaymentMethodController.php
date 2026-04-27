<?php

namespace App\Http\Controllers\API\User;

use App\Http\Controllers\Controller;
use App\Models\UserPaymentMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserPaymentMethodController extends Controller
{
    private const METHOD_TYPES = ['card', 'wallet', 'transfer', 'pse'];

    private const CARD_PROVIDERS = ['visa', 'mastercard', 'amex', 'diners'];

    private const GENERIC_PROVIDERS = ['visa', 'mastercard', 'amex', 'diners', 'paypal', 'bancolombia', 'davivienda', 'bbva', 'nequi', 'pse'];

    public function index(Request $request): JsonResponse
    {
        $methods = UserPaymentMethod::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('is_default')
            ->latest('id')
            ->get();

        return response()->json(['data' => $methods]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type'         => ['required', 'in:' . implode(',', self::METHOD_TYPES)],
            'provider'     => ['nullable', 'in:' . implode(',', self::GENERIC_PROVIDERS)],
            'label'        => ['nullable', 'string', 'max:80'],
            'holder_name'  => ['nullable', 'string', 'max:80'],
            'card_number'  => ['nullable', 'string'],
            'exp_month'    => ['nullable', 'digits:2'],
            'exp_year'     => ['nullable', 'digits:2'],
            'cvv'          => ['nullable', 'digits_between:3,4'],
            'wallet_phone' => ['nullable', 'string', 'max:20'],
            'is_default'   => ['nullable', 'boolean'],
        ]);

        if (($validated['type'] ?? null) === 'card') {
            $digits = preg_replace('/\D+/', '', (string) ($validated['card_number'] ?? ''));
            if (strlen($digits) < 12 || strlen($digits) > 19) {
                return response()->json([
                    'message' => 'El número de tarjeta debe tener entre 12 y 19 dígitos.',
                ], 422);
            }
            $validated['last_four'] = substr($digits, -4);
            $validated['exp_month'] = str_pad((string) ($validated['exp_month'] ?? ''), 2, '0', STR_PAD_LEFT);
            $validated['exp_year'] = substr((string) ($validated['exp_year'] ?? ''), -2);
        } else {
            unset($validated['card_number'], $validated['cvv'], $validated['exp_month'], $validated['exp_year'], $validated['last_four']);
            if (($validated['type'] ?? null) === 'wallet' && empty($validated['wallet_phone'])) {
                return response()->json([
                    'message' => 'Debes indicar el teléfono de la billetera o medio digital.',
                ], 422);
            }
        }

        unset($validated['card_number']);
        unset($validated['cvv']);

        $method = DB::transaction(function () use ($request, $validated) {
            $shouldBeDefault = (bool) ($validated['is_default'] ?? false);
            $hasAny = UserPaymentMethod::query()
                ->where('user_id', $request->user()->id)
                ->exists();

            if ($shouldBeDefault || !$hasAny) {
                UserPaymentMethod::query()
                    ->where('user_id', $request->user()->id)
                    ->update(['is_default' => false]);
                $validated['is_default'] = true;
            }

            $validated['user_id'] = $request->user()->id;

            return UserPaymentMethod::query()->create($validated);
        });

        return response()->json([
            'message' => 'Metodo de pago guardado correctamente.',
            'data'    => $method,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $method = UserPaymentMethod::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'type'         => ['nullable', 'in:' . implode(',', self::METHOD_TYPES)],
            'label'        => ['nullable', 'string', 'max:80'],
            'provider'     => ['nullable', 'in:' . implode(',', self::GENERIC_PROVIDERS)],
            'holder_name'  => ['nullable', 'string', 'max:80'],
            'card_number'  => ['nullable', 'string'],
            'exp_month'    => ['nullable', 'digits:2'],
            'exp_year'     => ['nullable', 'digits:2'],
            'wallet_phone' => ['nullable', 'string', 'max:20'],
            'is_default'   => ['nullable', 'boolean'],
        ]);

        $type = $validated['type'] ?? $method->type;

        if ($request->filled('card_number')) {
            $digits = preg_replace('/\D+/', '', (string) $request->input('card_number'));
            if (strlen($digits) < 12 || strlen($digits) > 19) {
                return response()->json([
                    'message' => 'El número de tarjeta debe tener entre 12 y 19 dígitos.',
                ], 422);
            }
            $validated['last_four'] = substr($digits, -4);
        }

        if ($type === 'card') {
            if ($request->filled('exp_month')) {
                $validated['exp_month'] = str_pad((string) $request->input('exp_month'), 2, '0', STR_PAD_LEFT);
            }

            if ($request->filled('exp_year')) {
                $validated['exp_year'] = substr((string) $request->input('exp_year'), -2);
            }
        } else {
            unset($validated['card_number'], $validated['cvv'], $validated['exp_month'], $validated['exp_year'], $validated['last_four']);
        }

        if ($type === 'wallet' && !$request->filled('wallet_phone') && empty($method->wallet_phone)) {
            return response()->json([
                'message' => 'Debes indicar el teléfono de la billetera o medio digital.',
            ], 422);
        }

        if (array_key_exists('is_default', $validated) && (bool) $validated['is_default']) {
            UserPaymentMethod::query()
                ->where('user_id', $request->user()->id)
                ->update(['is_default' => false]);
        }

        $method->fill($validated);
        if (array_key_exists('is_default', $validated) && (bool) $validated['is_default']) {
            $method->is_default = true;
        }
        $method->save();

        return response()->json([
            'message' => 'Metodo de pago actualizado correctamente.',
            'data'    => $method->fresh(),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $method = UserPaymentMethod::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        $method->delete();

        return response()->json([
            'message' => 'Metodo de pago eliminado correctamente.',
        ]);
    }
}
