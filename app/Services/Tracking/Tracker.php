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

    /**
     * @param  list<class-string<TrackingDriver>>|null  $only  limit the event to these drivers
     */
    public function track(string $event, Order $order, ?array $only = null): void
    {
        $drivers = array_filter(
            $this->enabledDrivers(),
            fn (TrackingDriver $driver) => $only === null || in_array($driver::class, $only, true),
        );

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
                'distinct_id' => $order->analyticsId(),
                'session_id' => $context['posthog_session_id'] ?? null,
                // False when the visitor never loaded PostHog (no consent): the
                // event is then sent without creating a person profile.
                'known_visitor' => isset($context['posthog_id']),
            ],
            'order' => [
                'status' => $order->status->value,
                'payment_status' => $order->payment_status->value,
                'quantity' => (int) $order->items->sum('quantity'),
                'design' => $order->items->first()?->design?->key,
                'subtotal' => Money::pounds($order->subtotal),
                'discount' => Money::pounds($order->discount_amount),
                'has_gift_message' => $order->items->contains(fn ($item) => filled($item->gift_message)),
                'governorate' => $order->governorate,
                'locale' => $order->locale,
                'utm_source' => $order->utm_source,
                'utm_medium' => $order->utm_medium,
                'utm_campaign' => $order->utm_campaign,
            ],
        ];
    }
}
