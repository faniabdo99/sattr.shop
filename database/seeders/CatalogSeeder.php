<?php

namespace Database\Seeders;

use App\Enums\PageType;
use App\Models\Design;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $site = require __DIR__.'/content/site.php';
        $faculties = require __DIR__.'/content/faculties.php';

        $product = Product::query()->updateOrCreate(
            ['slug' => $site['product']['slug']],
            [...$site['product'], 'is_active' => true],
        );

        $sort = 0;

        foreach ($faculties as $key => $faculty) {
            $design = Design::query()->updateOrCreate(
                ['key' => $key],
                [
                    'product_id' => $product->id,
                    'name' => $faculty['name'],
                    'motif' => $faculty['motif'],
                    'tint' => $faculty['tint'],
                    'stock' => $faculty['stock'],
                    'sort' => $sort++,
                    'is_active' => true,
                ],
            );

            Page::query()->updateOrCreate(
                ['key' => "faculty-{$key}"],
                [
                    'type' => PageType::Faculty,
                    'design_id' => $design->id,
                    'slug' => $faculty['slug'],
                    'title' => $faculty['title'],
                    'excerpt' => $faculty['excerpt'],
                    'body' => [
                        'ar' => "<p>{$faculty['life']['ar']}</p><p>{$faculty['moment']['ar']}</p>",
                        'en' => "<p>{$faculty['life']['en']}</p><p>{$faculty['moment']['en']}</p>",
                    ],
                    'sections' => [
                        'motif' => $faculty['motif'],
                    ],
                    'is_published' => true,
                ],
            );
        }
    }
}
