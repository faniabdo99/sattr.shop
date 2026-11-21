<?php

namespace Database\Factories;

use App\Enums\PageType;
use App\Models\Design;
use App\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Page> */
class PageFactory extends Factory
{
    public function definition(): array
    {
        $slug = fake()->unique()->slug(2);

        return [
            'type' => PageType::StaticPage,
            'key' => null,
            'slug' => ['ar' => $slug.'-ar', 'en' => $slug],
            'title' => ['ar' => 'عنوان '.$slug, 'en' => 'Title '.$slug],
            'excerpt' => ['ar' => 'مقدمة', 'en' => 'Excerpt'],
            'body' => ['ar' => '<p>نص</p>', 'en' => '<p>Body</p>'],
            'is_published' => true,
        ];
    }

    public function faculty(?Design $design = null): static
    {
        return $this->state(fn () => [
            'type' => PageType::Faculty,
            'design_id' => $design?->id ?? Design::factory(),
        ]);
    }
}
