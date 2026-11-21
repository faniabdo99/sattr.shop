<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Notifications\AdminAlert;
use App\Notifications\CustomerMessage;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();
});

it('creates an order from a valid checkout', function () {
    ['design' => $design] = shop();

    $response = $this->post('/en/checkout', checkoutData());

    $order = Order::query()->with(['items', 'histories'])->sole();

    $response->assertRedirect($order->statusUrl());

    expect($order->code)->toMatch('/^SAT-[A-Z2-9]{5}$/')
        ->and($order->status)->toBe(OrderStatus::Pending)
        ->and($order->payment_method)->toBe(PaymentMethod::InstaPay)
        ->and($order->payment_status)->toBe(PaymentStatus::Unpaid)
        ->and($order->locale)->toBe('en')
        ->and($order->ip)->not->toBeNull()
        ->and($order->items)->toHaveCount(1)
        ->and($order->items[0]->cover_name)->toBe('Sarah')
        ->and($order->items[0]->gift_message)->toBe('Congratulations')
        ->and($order->items[0]->design_name)->toBe('Medical')
        ->and($order->histories)->toHaveCount(1)
        ->and($design->fresh()->stock)->toBe(9);
});

it('stores UTM tags and click IDs captured in the browser', function () {
    shop();

    $this->withUnencryptedCookie('sattr_attribution', json_encode([
        'utm_source' => 'facebook',
        'utm_medium' => 'paid',
        'utm_campaign' => 'graduation',
        'fbclid' => 'abc123',
        'landing_page' => '/ar/gifts/medical',
    ]))->post('/ar/checkout', checkoutData());

    $order = Order::query()->sole();

    expect($order->utm_source)->toBe('facebook')
        ->and($order->utm_medium)->toBe('paid')
        ->and($order->utm_campaign)->toBe('graduation')
        ->and($order->fbclid)->toBe('abc123')
        ->and($order->landing_page)->toBe('/ar/gifts/medical');
});

it('notifies the admin and emails the customer a receipt', function () {
    shop();

    $this->post('/en/checkout', checkoutData());

    Notification::assertSentOnDemand(AdminAlert::class);
    Notification::assertSentOnDemand(
        CustomerMessage::class,
        fn (CustomerMessage $message, array $channels, object $notifiable) => $notifiable->routes['mail'] === 'sarah@example.com',
    );
});

it('sends no customer email when none was given', function () {
    shop();

    $this->post('/en/checkout', checkoutData(['email' => '']));

    Notification::assertSentOnDemandTimes(CustomerMessage::class, 0);
    expect(Order::query()->sole()->email)->toBeNull();
});

it('rejects invalid input', function (array $overrides, string $field) {
    shop();

    $this->post('/en/checkout', checkoutData($overrides))->assertSessionHasErrors($field);

    expect(Order::query()->count())->toBe(0);
})->with([
    'landline number' => [['phone' => '0223456789'], 'phone'],
    'short number' => [['phone' => '0101234567'], 'phone'],
    'unknown prefix' => [['phone' => '01312345678'], 'phone'],
    'cover name over 20 chars' => [['cover_name' => str_repeat('a', 21)], 'cover_name'],
    'gift message over 200 chars' => [['gift_message' => str_repeat('a', 201)], 'gift_message'],
    'quantity above 5' => [['quantity' => 6], 'quantity'],
    'quantity zero' => [['quantity' => 0], 'quantity'],
    'unknown governorate' => [['governorate' => 'atlantis'], 'governorate'],
    'unknown design' => [['design' => 'astrology'], 'design'],
    'unknown payment method' => [['payment_method' => 'bitcoin'], 'payment_method'],
    'filled honeypot' => [['website' => 'https://spam.example'], 'website'],
]);

it('accepts phone numbers with a country code or Arabic digits', function (string $phone) {
    shop();

    $this->post('/ar/checkout', checkoutData(['phone' => $phone]));

    expect(Order::query()->sole()->phone)->toBe('01012345678');
})->with(['+201012345678', '٠١٠١٢٣٤٥٦٧٨', '010 1234 5678']);

it('refuses a sold-out design and leaves stock untouched', function () {
    ['design' => $design] = shop(stock: 0);

    $this->post('/en/checkout', checkoutData())->assertSessionHasErrors('design');

    expect(Order::query()->count())->toBe(0)->and($design->fresh()->stock)->toBe(0);
});

it('refuses a quantity larger than the stock left', function () {
    ['design' => $design] = shop(stock: 2);

    $this->post('/en/checkout', checkoutData(['quantity' => 3]))->assertSessionHasErrors('quantity');

    expect($design->fresh()->stock)->toBe(2);
});

it('shows the order page only with its private token', function () {
    shop();
    $this->post('/en/checkout', checkoutData());
    $order = Order::query()->sole();

    $this->get($order->statusUrl())->assertOk()->assertSee($order->code);
    $this->get("/en/order/{$order->code}")->assertNotFound();
    $this->get("/en/order/{$order->code}?t=wrong")->assertNotFound();
});
