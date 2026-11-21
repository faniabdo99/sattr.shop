<?php

namespace Database\Seeders;

use App\Enums\PageType;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\Design;
use App\Models\Faq;
use App\Models\Page;
use Illuminate\Database\Seeder;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $site = require __DIR__.'/content/site.php';

        if (Faq::query()->doesntExist()) {
            foreach ($site['faqs'] as $sort => $faq) {
                Faq::query()->create([...$faq, 'sort' => $sort, 'is_active' => true]);
            }
        }

        foreach ($site['pages'] as $key => $page) {
            Page::query()->updateOrCreate(
                ['key' => $key],
                [...$page, 'type' => PageType::StaticPage, 'is_published' => true],
            );
        }

        $categories = [];

        foreach (array_values($site['categories']) as $sort => $category) {
            $key = array_keys($site['categories'])[$sort];
            $categories[$key] = ArticleCategory::query()->firstOrCreate(
                ['slug->en' => $category['slug']['en']],
                [...$category, 'sort' => $sort],
            );
        }

        foreach ($site['articles'] as $index => $article) {
            if (Article::query()->where('slug->en', $article['slug']['en'])->exists()) {
                continue;
            }

            Article::query()->create([
                'article_category_id' => $categories[$article['category']]->id,
                'design_id' => $article['design'] ? Design::query()->where('key', $article['design'])->value('id') : null,
                'slug' => $article['slug'],
                'title' => $article['title'],
                'excerpt' => $article['excerpt'],
                'body' => $article['body'],
                'author_name' => 'Sattr',
                'published_at' => now()->subDays(3 * ($index + 1)),
            ]);
        }
    }
}
