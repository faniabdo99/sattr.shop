<?php

namespace Database\Factories;

use App\Models\Design;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Design> */
class DesignFactory extends Factory
{
    public function definition(): array
    {
        $key = fake()->unique()->slug(2);

        return [
            'product_id' => Product::factory(),
            'key' => $key,
            'name' => ['ar' => 'تصميم '.$key, 'en' => ucfirst($key)],
            'motif' => ['ar' => 'خط', 'en' => 'A line'],
            'tint' => '#1C1B19',
            'stock' => 10,
            'sort' => 0,
            'is_active' => true,
        ];
    }

    public function soldOut(): static
    {
        return $this->state(['stock' => 0]);
    }
}
