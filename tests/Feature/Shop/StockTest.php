<?php

use App\Actions\Orders\ChangeOrderStatus;
use App\Actions\Orders\CreateOrder;
use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

beforeEach(fn () => Notification::fake());

it('never sells more packs than are in stock', function () {
    ['design' => $design] = shop(stock: 3);
    $create = app(CreateOrder::class);
    $placed = 0;
    $refused = 0;

    foreach (range(1, 6) as $attempt) {
        try {
            $create->handle(checkoutData(['phone' => '0101234567'.$attempt]));
            $placed++;
        } catch (ValidationException) {
            $refused++;
        }
    }

    expect($placed)->toBe(3)
        ->and($refused)->toBe(3)
        ->and(Order::query()->count())->toBe(3)
        ->and($design->fresh()->stock)->toBe(0);
});

it('rolls the whole order back when stock runs out mid-transaction', function () {
    ['design' => $design] = shop(stock: 1);
    $create = app(CreateOrder::class);

    $create->handle(checkoutData());

    expect(fn () => $create->handle(checkoutData()))->toThrow(ValidationException::class);

    expect(Order::query()->count())->toBe(1)
        ->and(DB::table('order_items')->count())->toBe(1)
        ->and($design->fresh()->stock)->toBe(0);
});

it('reads the design row with a lock inside the order transaction', function () {
    shop();
    $statements = [];

    DB::listen(function ($query) use (&$statements) {
        $statements[] = strtolower($query->sql);
    });

    app(CreateOrder::class)->handle(checkoutData());

    $select = collect($statements)->first(fn (string $sql) => str_contains($sql, 'from "designs"') || str_contains($sql, 'from `designs`'));

    expect($select)->not->toBeNull();

    // SQLite (used by the test suite) has no row locks, so the clause only appears on MySQL/PostgreSQL.
    if (in_array(DB::getDriverName(), ['mysql', 'mariadb', 'pgsql'], true)) {
        expect($select)->toContain('for update');
    }
});

it('puts packs back on the shelf when an order is cancelled', function () {
    ['design' => $design] = shop(stock: 5);
    $order = app(CreateOrder::class)->handle(checkoutData(['quantity' => 2]));

    expect($design->fresh()->stock)->toBe(3);

    app(ChangeOrderStatus::class)->handle($order, OrderStatus::Cancelled);

    expect($design->fresh()->stock)->toBe(5);
});

it('marks a design and the whole run as sold out on the storefront', function () {
    shop(stock: 0);

    $this->get('/en/gift-pack')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('product.sold_out', true)
            ->where('designs.0.sold_out', true));
});
