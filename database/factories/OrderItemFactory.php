<?php

namespace Database\Factories;

use App\Models\Design;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<OrderItem> */
class OrderItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'design_id' => Design::factory(),
            'product_id' => fn (array $attributes) => Design::query()->findOrFail($attributes['design_id'])->product_id,
            'product_name' => 'Gift Pack',
            'design_name' => 'Design',
            'quantity' => 1,
            'unit_price' => 84900,
            'line_total' => 84900,
        ];
    }
}
