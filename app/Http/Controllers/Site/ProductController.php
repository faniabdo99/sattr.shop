<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Services\Seo\Schema;
use App\Services\Seo\SeoBuilder;
use App\Services\Storefront;
use App\Support\Present;
use App\Support\SiteUrl;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __invoke(Storefront $storefront, SeoBuilder $seo, Schema $schema): Response
    {
        $product = $storefront->product();
        $faqs = $storefront->faqs();
        $reviews = $storefront->reviews();

        return Inertia::render('site/product', [
            'seo' => $seo->make(
                title: $product->name,
                description: $product->description,
                alternates: SiteUrl::alternates(fn (string $locale) => SiteUrl::product($locale)),
                model: $product,
                type: 'product',
                schema: [
                    $schema->product($product, SiteUrl::product(), $storefront->inStock(), $storefront->imageUrls(), $reviews),
                    $schema->faq($faqs),
                    $schema->breadcrumbs([[__('site.nav.home'), SiteUrl::home()], [$product->name, SiteUrl::product()]]),
                ],
                image: $product->getFirstMediaUrl('hero') ?: null,
            )->toArray(),
            'product' => $storefront->productProps(),
            'designs' => $storefront->designProps(),
            'faqs' => $faqs->map(fn ($faq) => Present::faq($faq))->all(),
            'reviews' => $reviews->take(6)->map(fn ($review) => Present::review($review))->values()->all(),
            'rating' => $reviews->isNotEmpty() ? ['value' => round($reviews->avg('rating'), 1), 'count' => $reviews->count()] : null,
            'articles' => $storefront->latestArticles(3)->map(fn ($article) => Present::article($article))->all(),
        ]);
    }
}
