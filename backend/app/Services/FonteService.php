<?php
// app/Services/FonteService.php

namespace App\Services;

use GuzzleHttp\Client;
use Exception;

class FonteService
{
    protected $client;
    protected $apiKey;
    protected $deviceId;

    public function __construct()
    {
        $this->client = new Client([
            'base_uri' => 'https://api.fonte.id/', // Ganti dengan base URL Fonte API yang benar
            'timeout'  => 5.0,
        ]);
        $this->apiKey = env('FONTE_API_KEY');
        $this->deviceId = env('FONTE_DEVICE_ID');
    }

    public function sendMessage($to, $message)
    {
        if (empty($this->apiKey) || empty($this->deviceId)) {
            \Log::error('Fonte API Key or Device ID is not set.');
            return false;
        }

        try {
            $response = $this->client->post('send-message', [
                'json' => [
                    'api_key' => $this->apiKey,
                    'device_id' => $this->deviceId,
                    'to' => $to,
                    'message' => $message,
                ]
            ]);

            $body = json_decode($response->getBody()->getContents(), true);
            return $body['success'] ?? false;

        } catch (Exception $e) {
            \Log::error('Failed to send WhatsApp message via Fonte: ' . $e->getMessage());
            return false;
        }
    }
}