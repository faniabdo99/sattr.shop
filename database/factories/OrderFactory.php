<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Order> */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => 'SAT-'.strtoupper(Str::random(5)),
            'access_token' => Str::random(40),
            'event_id' => (string) Str::uuid(),
            'status' => OrderStatus::Pending,
            'payment_method' => PaymentMethod::CashOnDelivery,
            'payment_status' => PaymentStatus::Unpaid,
            'subtotal' => 84900,
            'discount_amount' => 0,
            'shipping_amount' => 0,
            'total' => 84900,
            'customer_name' => fake()->name(),
            'phone' => '010'.fake()->numerify('########'),
            'governorate' => 'cairo',
            'city' => 'Nasr City',
            'address' => fake()->streetAddress(),
            'locale' => 'ar',
        ];
    }

    public function instapay(): static
    {
        return $this->state([
            'payment_method' => PaymentMethod::InstaPay,
            'discount_amount' => 8500,
            'total' => 76400,
        ]);
    }
}
