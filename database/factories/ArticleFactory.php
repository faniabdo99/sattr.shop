<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\ArticleCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Article> */
class ArticleFactory extends Factory
{
    public function definition(): array
    {
        $slug = fake()->unique()->slug(3);

        return [
            'article_category_id' => ArticleCategory::factory(),
            'slug' => ['ar' => $slug.'-ar', 'en' => $slug],
            'title' => ['ar' => 'مقال '.$slug, 'en' => 'Article '.$slug],
            'excerpt' => ['ar' => 'مقدمة', 'en' => 'Excerpt'],
            'body' => ['ar' => '<p>نص المقال</p>', 'en' => '<p>Article body</p>'],
            'author_name' => 'Sattr',
            'published_at' => now()->subDay(),
        ];
    }

    public function draft(): static
    {
        return $this->state(['published_at' => null]);
    }
}
