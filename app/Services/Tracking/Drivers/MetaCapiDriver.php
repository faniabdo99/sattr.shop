<?php

namespace App\Services\Tracking\Drivers;

use App\Services\Settings;
use App\Services\Tracking\TrackingDriver;
use Illuminate\Support\Facades\Http;

/** Meta Conversions API. Deduplicated against the browser pixel by event_id. */
class MetaCapiDriver implements TrackingDriver
{
    private const EVENTS = ['purchase' => 'Purchase', 'payment_verified' => 'PaymentVerified'];

    public function __construct(private readonly Settings $settings) {}

    public function name(): string
    {
        return 'meta';
    }

    public function enabled(): bool
    {
        return filled($this->settings->get('tracking.meta_pixel_id')) && filled($this->settings->get('tracking.meta_capi_token'));
    }

    public function send(string $event, array $payload): void
    {
        $user = $payload['user'];
        $hash = fn (?string $value) => filled($value) ? hash('sha256', strtolower(trim($value))) : null;

        Http::timeout(8)
            ->post('https://graph.facebook.com/v21.0/'.$this->settings->get('tracking.meta_pixel_id').'/events', [
                'access_token' => $this->settings->get('tracking.meta_capi_token'),
                'data' => [[
                    'event_name' => self::EVENTS[$event] ?? $event,
                    'event_time' => $payload['event_time'],
                    'event_id' => $payload['event_id'],
                    'action_source' => 'website',
                    'event_source_url' => $payload['source_url'],
                    'user_data' => array_filter([
                        'ph' => [$hash($user['phone'])],
                        'em' => $user['email'] ? [$hash($user['email'])] : null,
                        'ct' => [$hash($user['city'])],
                        'country' => [$hash($user['country'])],
                        'client_ip_address' => $user['ip'],
                        'client_user_agent' => $user['user_agent'],
                        'fbp' => $payload['client']['fbp'],
                        'fbc' => $payload['client']['fbc'],
                    ]),
                    'custom_data' => [
                        'currency' => $payload['currency'],
                        'value' => $payload['value'],
                        'order_id' => $payload['transaction_id'],
                        'content_type' => 'product',
                        'contents' => collect($payload['items'])->map(fn (array $item) => [
                            'id' => $item['item_id'],
                            'quantity' => $item['quantity'],
                            'item_price' => $item['price'],
                        ])->all(),
                    ],
                ]],
            ])
            ->throw();
    }
}
