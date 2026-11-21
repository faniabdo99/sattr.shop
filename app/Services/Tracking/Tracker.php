<?php

namespace App\Services\Tracking;

use App\Jobs\SendTrackingEvent;
use App\Models\Order;
use App\Services\Tracking\Drivers\Ga4Driver;
use App\Services\Tracking\Drivers\MetaCapiDriver;
use App\Services\Tracking\Drivers\PostHogDriver;
use App\Services\Tracking\Drivers\TikTokDriver;
use App\Support\Money;

/**
 * Server-side counterpart of resources/js/lib/track.ts. Sends order events
 * to every provider whose credentials are set; with none set it does nothing.
 */
class Tracker
{
    /** @var list<class-string<TrackingDriver>> */
    public const DRIVERS = [Ga4Driver::class, MetaCapiDriver::class, PostHogDriver::class, TikTokDriver::class];

    /** @return list<TrackingDriver> */
    public function enabledDrivers(): array
    {
        return collect(self::DRIVERS)
            ->map(fn (string $driver) => app($driver))
            ->filter(fn (TrackingDriver $driver) => $driver->enabled())
            ->values()
            ->all();
    }

    public function track(string $event, Order $order): void
    {
        $drivers = $this->enabledDrivers();

        if ($drivers === []) {
            return;
        }

        $payload = $this->payload($event, $order);

        foreach ($drivers as $driver) {
            SendTrackingEvent::dispatch($driver::class, $event, $payload);
        }
    }

    /**
     * The same shape the browser sends, plus what only the server knows.
     *
     * @return array<string, mixed>
     */
    public function payload(string $event, Order $order): array
    {
        $order->loadMissing('items.design');
        $context = $order->tracking_context ?? [];

        return [
            // Shared with the browser "purchase" event so Meta can deduplicate.
            'event_id' => $event === 'purchase' ? $order->event_id : "{$order->event_id}:{$event}",
            'event_time' => now()->timestamp,
            'transaction_id' => $order->code,
            'currency' => 'EGP',
            'value' => Money::pounds($order->total),
            'payment_type' => $order->payment_method->value,
            'items' => $order->items->map(fn ($item) => [
                'item_id' => 'gift-pack-'.($item->design?->key ?? $item->design_id),
                'item_name' => $item->product_name,
                'item_variant' => $item->design_name,
                'price' => Money::pounds($item->unit_price),
                'quantity' => $item->quantity,
            ])->all(),
            'user' => [
                'phone' => '2'.$order->phone,
                'email' => $order->email,
                'ip' => $order->ip,
                'user_agent' => $order->user_agent,
                'city' => $order->city,
                'country' => 'eg',
            ],
            'source_url' => $order->statusUrl(),
            'client' => [
                'ga_client_id' => $context['ga_client_id'] ?? null,
                'fbp' => $context['fbp'] ?? null,
                'fbc' => $context['fbc'] ?? null,
                'ttp' => $context['ttp'] ?? null,
                'ttclid' => $order->ttclid,
                'distinct_id' => $context['posthog_id'] ?? $order->code,
            ],
        ];
    }
}
