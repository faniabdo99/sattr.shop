<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Product> */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'slug' => 'gift-pack-'.fake()->unique()->numberBetween(1, 99999),
            'name' => ['ar' => 'طقم هدايا', 'en' => 'Gift Pack'],
            'tagline' => ['ar' => 'أساسيات المكتب', 'en' => 'Desk essentials'],
            'description' => ['ar' => 'وصف', 'en' => 'Description'],
            'contents' => [],
            'specs' => [],
            'price' => 84900,
            'instapay_discount_percent' => 10,
            'is_active' => true,
        ];
    }
}
