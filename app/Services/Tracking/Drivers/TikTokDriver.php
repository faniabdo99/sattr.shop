<?php

namespace App\Services\Tracking\Drivers;

use App\Services\Settings;
use App\Services\Tracking\TrackingDriver;
use Illuminate\Support\Facades\Http;

/** TikTok Events API. Needs the pixel ID and an access token. */
class TikTokDriver implements TrackingDriver
{
    private const EVENTS = ['purchase' => 'PlaceAnOrder', 'payment_verified' => 'CompletePayment'];

    public function __construct(private readonly Settings $settings) {}

    public function name(): string
    {
        return 'tiktok';
    }

    public function enabled(): bool
    {
        return filled($this->settings->get('tracking.tiktok_pixel_id')) && filled($this->settings->get('tracking.tiktok_access_token'));
    }

    public function send(string $event, array $payload): void
    {
        $user = $payload['user'];
        $hash = fn (?string $value) => filled($value) ? hash('sha256', strtolower(trim($value))) : null;

        Http::timeout(8)
            ->withHeaders(['Access-Token' => $this->settings->get('tracking.tiktok_access_token')])
            ->post('https://business-api.tiktok.com/open_api/v1.3/event/track/', [
                'event_source' => 'web',
                'event_source_id' => $this->settings->get('tracking.tiktok_pixel_id'),
                'data' => [[
                    'event' => self::EVENTS[$event] ?? $event,
                    'event_time' => $payload['event_time'],
                    'event_id' => $payload['event_id'],
                    'user' => array_filter([
                        'phone' => $hash('+'.$user['phone']),
                        'email' => $hash($user['email']),
                        'ip' => $user['ip'],
                        'user_agent' => $user['user_agent'],
                        'ttp' => $payload['client']['ttp'],
                        'ttclid' => $payload['client']['ttclid'],
                    ]),
                    'page' => ['url' => $payload['source_url']],
                    'properties' => [
                        'currency' => $payload['currency'],
                        'value' => $payload['value'],
                        'order_id' => $payload['transaction_id'],
                        'contents' => collect($payload['items'])->map(fn (array $item) => [
                            'content_id' => $item['item_id'],
                            'content_type' => 'product',
                            'content_name' => $item['item_name'],
                            'quantity' => $item['quantity'],
                            'price' => $item['price'],
                        ])->all(),
                    ],
                ]],
            ])
            ->throw();
    }
}
