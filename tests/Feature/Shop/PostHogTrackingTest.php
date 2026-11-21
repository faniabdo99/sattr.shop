<?php

use App\Enums\OrderStatus;
use App\Jobs\SendTrackingEvent;
use App\Models\Order;
use App\Services\Settings;
use App\Services\Tracking\Drivers\MetaCapiDriver;
use App\Services\Tracking\Drivers\PostHogDriver;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    Notification::fake();
    shop();
    app(Settings::class)->put([
        'tracking.posthog_key' => 'phc_test',
        'tracking.posthog_host' => 'https://ph.test',
    ]);
});

it('attributes the purchase to the PostHog visitor and session sent by the browser', function () {
    Http::fake();

    $this->withHeaders([
        'X-PostHog-Distinct-Id' => 'visitor-123',
        'X-PostHog-Session-Id' => 'session-456',
    ])->post('/en/checkout', checkoutData(['quantity' => 2]));

    $order = Order::query()->sole();

    expect($order->analyticsId())->toBe('visitor-123');

    Http::assertSent(function ($request) use ($order) {
        $properties = $request['properties'];

        return $request->url() === 'https://ph.test/capture/'
            && $request['event'] === 'purchase'
            && $request['distinct_id'] === 'visitor-123'
            && $properties['$session_id'] === 'session-456'
            && $properties['transaction_id'] === $order->code
            && $properties['quantity'] === 2
            && $properties['design'] === 'medical'
            && $properties['has_gift_message'] === true
            && $properties['$set']['last_payment_type'] === $order->payment_method->value
            && ! array_key_exists('$process_person_profile', $properties)
            && ! str_contains(json_encode($properties), $order->phone);
    });
});

it('falls back to the order code without creating a person when PostHog never loaded', function () {
    Http::fake();

    $this->withHeaders(['X-PostHog-Distinct-Id' => '<script>'])->post('/en/checkout', checkoutData());

    $order = Order::query()->sole();

    expect($order->analyticsId())->toBe($order->code);

    Http::assertSent(fn ($request) => $request['distinct_id'] === $order->code
        && $request['properties']['$process_person_profile'] === false
        && ! array_key_exists('$set', $request['properties']));
});

it('sends order lifecycle events to PostHog only', function () {
    app(Settings::class)->put(['tracking.meta_pixel_id' => '123', 'tracking.meta_capi_token' => 'token']);
    Queue::fake();

    $this->post('/en/checkout', checkoutData());
    $order = Order::query()->sole();

    $this->actingAs(admin())->patch(route('admin.orders.update', $order), ['status' => OrderStatus::Shipped->value]);

    Queue::assertPushed(SendTrackingEvent::class, fn (SendTrackingEvent $job) => $job->event === 'order_shipped'
        && $job->driver === PostHogDriver::class
        && $job->payload['order']['status'] === 'shipped');
    Queue::assertNotPushed(SendTrackingEvent::class, fn (SendTrackingEvent $job) => $job->event === 'order_shipped'
        && $job->driver === MetaCapiDriver::class);
    Queue::assertPushed(SendTrackingEvent::class, fn (SendTrackingEvent $job) => $job->event === 'purchase'
        && $job->driver === MetaCapiDriver::class);
});
