<?php

namespace App\Http\Controllers\Site;

use App\Enums\PageType;
use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Services\Seo\Schema;
use App\Services\Seo\SeoBuilder;
use App\Services\Storefront;
use App\Support\Present;
use App\Support\SiteUrl;
use Inertia\Inertia;
use Inertia\Response;

class FacultyController extends Controller
{
    public function __invoke(string $slug, Storefront $storefront, SeoBuilder $seo, Schema $schema): Response
    {
        $page = Page::query()
            ->published()
            ->ofType(PageType::Faculty)
            ->whereSlug($slug, app()->getLocale())
            ->with('media')
            ->firstOrFail();

        $design = $storefront->designs()->firstWhere('id', $page->design_id);

        abort_if($design === null, 404);

        $product = $storefront->product();
        $reviews = $storefront->reviews($design);
        $url = SiteUrl::faculty($page);
        $name = __('site.faculty.product_name', ['product' => $product->name, 'design' => $design->name]);

        return Inertia::render('site/faculty', [
            'seo' => $seo->make(
                title: $page->title,
                description: $page->excerpt,
                alternates: SiteUrl::alternates(fn (string $locale) => SiteUrl::faculty($page, $locale)),
                model: $page,
                type: 'product',
                schema: [
                    $schema->product($product, $url, ! $design->isSoldOut(), $storefront->imageUrls($design), $reviews, $name, $page->excerpt),
                    $schema->breadcrumbs([
                        [__('site.nav.home'), SiteUrl::home()],
                        [$product->name, SiteUrl::product()],
                        [$design->name, $url],
                    ]),
                ],
                image: $design->getFirstMediaUrl('gallery') ?: ($product->getFirstMediaUrl('hero') ?: null),
            )->toArray(),
            'page' => [
                'title' => $page->title,
                'excerpt' => $page->excerpt,
                'body' => $page->body,
            ],
            'design' => Present::design($design),
            'product' => $storefront->productProps(),
            'designs' => $storefront->designProps(),
            'reviews' => $reviews->take(3)->map(fn ($review) => Present::review($review))->values()->all(),
            'articles' => $storefront->latestArticles(3, $design)->map(fn ($article) => Present::article($article))->all(),
            'checkout_url' => SiteUrl::checkout(design: $design->key),
        ]);
    }
}
