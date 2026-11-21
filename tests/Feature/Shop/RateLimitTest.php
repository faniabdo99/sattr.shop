<?php

use App\Models\Order;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();
    shop(stock: 50);
});

it('allows five orders an hour from one IP address, then refuses', function () {
    foreach (range(1, 5) as $n) {
        $this->post('/en/checkout', checkoutData(['phone' => '0101234560'.$n]))->assertSessionHasNoErrors();
    }

    $this->post('/en/checkout', checkoutData(['phone' => '01012345606']))->assertSessionHasErrors('throttle');

    expect(Order::query()->count())->toBe(5);
});

it('allows five orders an hour for one phone number across IP addresses', function () {
    foreach (range(1, 5) as $n) {
        $this->withServerVariables(['REMOTE_ADDR' => "10.0.0.{$n}"])
            ->post('/en/checkout', checkoutData())
            ->assertSessionHasNoErrors();
    }

    $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.99'])
        ->post('/en/checkout', checkoutData())
        ->assertSessionHasErrors('throttle');

    expect(Order::query()->count())->toBe(5);
});

it('does not count failed attempts against the limit', function () {
    foreach (range(1, 8) as $n) {
        $this->post('/en/checkout', checkoutData(['phone' => 'nope']))->assertSessionHasErrors('phone');
    }

    $this->post('/en/checkout', checkoutData())->assertSessionHasNoErrors();

    expect(Order::query()->count())->toBe(1);
});

it('lets the limit lapse after an hour', function () {
    foreach (range(1, 5) as $n) {
        $this->post('/en/checkout', checkoutData(['phone' => '0101234560'.$n]));
    }

    $this->travel(61)->minutes();

    $this->post('/en/checkout', checkoutData(['phone' => '01012345609']))->assertSessionHasNoErrors();

    expect(Order::query()->count())->toBe(6);
});
