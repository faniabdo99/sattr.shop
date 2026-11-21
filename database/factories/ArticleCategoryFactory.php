<?php

namespace Database\Factories;

use App\Models\ArticleCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ArticleCategory> */
class ArticleCategoryFactory extends Factory
{
    public function definition(): array
    {
        $slug = fake()->unique()->slug(2);

        return [
            'slug' => ['ar' => $slug.'-ar', 'en' => $slug],
            'name' => ['ar' => 'قسم', 'en' => 'Category'],
            'sort' => 0,
        ];
    }
}
