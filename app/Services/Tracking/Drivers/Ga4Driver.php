<?php

namespace App\Services\Tracking\Drivers;

use App\Services\Settings;
use App\Services\Tracking\TrackingDriver;
use Illuminate\Support\Facades\Http;

/** GA4 Measurement Protocol. Needs the measurement ID and an API secret. */
class Ga4Driver implements TrackingDriver
{
    public function __construct(private readonly Settings $settings) {}

    public function name(): string
    {
        return 'ga4';
    }

    public function enabled(): bool
    {
        return filled($this->settings->get('tracking.ga4_id')) && filled($this->settings->get('tracking.ga4_api_secret'));
    }

    public function send(string $event, array $payload): void
    {
        Http::timeout(8)
            ->withQueryParameters([
                'measurement_id' => $this->settings->get('tracking.ga4_id'),
                'api_secret' => $this->settings->get('tracking.ga4_api_secret'),
            ])
            ->post('https://www.google-analytics.com/mp/collect', [
                'client_id' => $payload['client']['ga_client_id'] ?? $payload['transaction_id'],
                'events' => [[
                    'name' => $event,
                    'params' => [
                        'transaction_id' => $payload['transaction_id'],
                        'currency' => $payload['currency'],
                        'value' => $payload['value'],
                        'payment_type' => $payload['payment_type'],
                        'items' => $payload['items'],
                    ],
                ]],
            ])
            ->throw();
    }
}
