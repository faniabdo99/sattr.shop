<?php

namespace Database\Factories;

use App\Enums\ReviewStatus;
use App\Models\Review;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Review> */
class ReviewFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->firstName(),
            'rating' => 5,
            'body' => fake()->sentence(12),
            'locale' => 'en',
            'status' => ReviewStatus::Pending,
        ];
    }

    public function approved(): static
    {
        return $this->state(['status' => ReviewStatus::Approved]);
    }
}
