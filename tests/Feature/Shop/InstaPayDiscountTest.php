<?php

use App\Enums\PaymentMethod;
use App\Models\Order;
use App\Payments\CashOnDelivery;
use App\Payments\InstaPayManual;
use App\Payments\PaymentManager;
use Illuminate\Support\Facades\Notification;

beforeEach(fn () => Notification::fake());

it('charges 764 EGP for one pack paid by InstaPay', function () {
    shop();

    $this->post('/en/checkout', checkoutData(['payment_method' => 'instapay']));

    $order = Order::query()->sole();

    expect($order->subtotal)->toBe(84900)
        ->and($order->discount_amount)->toBe(8500)
        ->and($order->total)->toBe(76400)
        ->and($order->shipping_amount)->toBe(0);
});

it('charges the full 849 EGP for cash on delivery', function () {
    shop();

    $this->post('/en/checkout', checkoutData(['payment_method' => 'cod']));

    $order = Order::query()->sole();

    expect($order->discount_amount)->toBe(0)
        ->and($order->total)->toBe(84900)
        ->and($order->codAmount())->toBe(84900);
});

it('applies the discount per pack for larger quantities', function () {
    shop();

    $this->post('/en/checkout', checkoutData(['quantity' => 3]));

    $order = Order::query()->with('items')->sole();

    expect($order->subtotal)->toBe(254700)
        ->and($order->discount_amount)->toBe(25500)
        ->and($order->total)->toBe(229200)
        ->and($order->items[0]->unit_price)->toBe(76400);
});

it('ignores totals sent by the browser', function () {
    shop();

    $this->post('/en/checkout', checkoutData([
        'total' => 100,
        'subtotal' => 100,
        'discount_amount' => 84800,
        'unit_price' => 1,
    ]));

    expect(Order::query()->sole()->total)->toBe(76400);
});

it('follows the discount percentage set on the product', function () {
    ['product' => $product] = shop();
    $product->update(['instapay_discount_percent' => 15]);

    $this->post('/en/checkout', checkoutData());

    // 15% off 849 is 721.65, rounded down to 721.
    expect(Order::query()->sole()->total)->toBe(72100);
});

it('resolves each payment method through the contract', function () {
    ['product' => $product] = shop();
    $payments = app(PaymentManager::class);

    expect($payments->for(PaymentMethod::InstaPay))->toBeInstanceOf(InstaPayManual::class)
        ->and($payments->for(PaymentMethod::CashOnDelivery))->toBeInstanceOf(CashOnDelivery::class)
        ->and($payments->for(PaymentMethod::InstaPay)->requiresManualVerification())->toBeTrue()
        ->and($payments->options($product)[0]['key'])->toBe('instapay')
        ->and($payments->options($product)[0]['saving'])->toBe(8500);
});
