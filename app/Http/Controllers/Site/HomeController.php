<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Services\Seo\Schema;
use App\Services\Seo\SeoBuilder;
use App\Services\Settings;
use App\Services\Storefront;
use App\Support\Present;
use App\Support\SiteUrl;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(Storefront $storefront, SeoBuilder $seo, Schema $schema, Settings $settings): Response
    {
        $product = $storefront->product();
        $faqs = $storefront->faqs();
        $reviews = $storefront->reviews();

        return Inertia::render('site/home', [
            'seo' => $seo->make(
                title: $settings->localized('seo.default_title') ?? __('site.brand'),
                description: $settings->localized('seo.default_description'),
                alternates: SiteUrl::alternates(fn (string $locale) => SiteUrl::home($locale)),
                schema: [
                    $schema->organization(),
                    $schema->website(),
                    $schema->product($product, SiteUrl::product(), $storefront->inStock(), $storefront->imageUrls(), $reviews),
                    $schema->faq($faqs),
                ],
                image: $product->getFirstMediaUrl('hero') ?: null,
                appendBrand: false,
            )->toArray(),
            'product' => $storefront->productProps(),
            'designs' => $storefront->designProps(),
            'faqs' => $faqs->map(fn ($faq) => Present::faq($faq))->all(),
            'reviews' => $reviews->take(3)->map(fn ($review) => Present::review($review))->values()->all(),
            'articles' => $storefront->latestArticles(3)->map(fn ($article) => Present::article($article))->all(),
        ]);
    }
}
