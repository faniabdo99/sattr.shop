<?php

namespace App\Payments;

use App\Enums\PaymentMethod;
use App\Models\Product;
use App\Support\Money;
use InvalidArgumentException;

class PaymentManager
{
    /** @var array<string, class-string<PaymentMethodContract>> */
    private array $methods = [
        PaymentMethod::InstaPay->value => InstaPayManual::class,
        PaymentMethod::CashOnDelivery->value => CashOnDelivery::class,
    ];

    public function for(PaymentMethod $method): PaymentMethodContract
    {
        $class = $this->methods[$method->value]
            ?? throw new InvalidArgumentException("No payment method registered for [{$method->value}].");

        return app($class);
    }

    /**
     * Server-calculated totals for an order line. Never trust client totals.
     *
     * @return array{unit_price: int, subtotal: int, discount: int, shipping: int, total: int}
     */
    public function quote(Product $product, PaymentMethod $method, int $quantity): array
    {
        $unit = $this->for($method)->unitPrice($product);
        $subtotal = $product->price * $quantity;
        $total = $unit * $quantity;

        return [
            'unit_price' => $product->price,
            'subtotal' => $subtotal,
            'discount' => $subtotal - $total,
            'shipping' => 0,
            'total' => $total,
        ];
    }

    /**
     * What checkout shows for each method, preferred method first.
     *
     * @return list<array<string, mixed>>
     */
    public function options(Product $product): array
    {
        return collect($this->methods)->keys()->map(function (string $key) use ($product) {
            $method = PaymentMethod::from($key);
            $unit = $this->for($method)->unitPrice($product);

            return [
                'key' => $key,
                'unit_price' => $unit,
                'saving' => $product->price - $unit,
                'saving_label' => Money::format($product->price - $unit),
            ];
        })->all();
    }
}
