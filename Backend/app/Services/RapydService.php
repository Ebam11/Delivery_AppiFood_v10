<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class RapydService
{
    private string $accessKey;
    private string $secretKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->accessKey = config('services.rapyd.access_key');
        $this->secretKey = config('services.rapyd.secret_key');
        $this->baseUrl   = config('services.rapyd.base_url', 'https://sandboxapi.rapyd.net');
    }

    /**
     * Crea un pago en Rapyd y retorna la URL de checkout.
     */
    public function createCheckout(float $amount, string $currency, string $reference, string $completeRedirectUrl, string $cancelRedirectUrl): array
    {
        $path = '/v1/checkout';
        $body = [
            'amount'                => round($amount, 2),
            'currency'              => strtoupper($currency),
            'country'               => 'CO',
            'merchant_reference_id' => $reference,
            'complete_redirect_url' => $completeRedirectUrl,
            'cancel_redirect_url'   => $cancelRedirectUrl,
            'language'              => 'es',
            'payment_method_types_include' => ['co_pse_bank', 'co_nequi_bank', 'co_efecty_cash'],
        ];

        $response = $this->request('POST', $path, $body);
        return $response;
    }

    /**
     * Obtiene el estado de un pago de Rapyd.
     */
    public function getPayment(string $rapydPaymentId): array
    {
        return $this->request('GET', '/v1/payments/' . $rapydPaymentId);
    }

    /**
     * Firma la petición con HMAC-SHA256 según la documentación de Rapyd.
     */
    private function request(string $method, string $path, array $body = []): array
    {
        $salt      = Str::random(8);
        $timestamp = time();
        $bodyJson  = empty($body) ? '' : json_encode($body);
        $toSign    = strtolower($method) . $path . $salt . $timestamp . $this->accessKey . $this->secretKey . (empty($body) ? '' : $bodyJson);
        $signature = base64_encode(hash_hmac('sha256', $toSign, $this->secretKey, true));

        $headers = [
            'access_key'   => $this->accessKey,
            'salt'         => $salt,
            'timestamp'    => (string) $timestamp,
            'signature'    => $signature,
            'Content-Type' => 'application/json',
        ];

        $response = Http::withHeaders($headers)
            ->{strtolower($method)}($this->baseUrl . $path, empty($body) ? [] : $body);

        return $response->json() ?? [];
    }
}
