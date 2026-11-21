<?php

namespace App\Services\Seo;

use App\Models\Article;
use App\Models\Faq;
use App\Models\Product;
use App\Models\Review;
use App\Services\Settings;
use App\Support\Money;
use App\Support\SiteUrl;
use Illuminate\Support\Collection;

/**
 * JSON-LD builders. Each returns one schema.org node.
 */
class Schema
{
    public function __construct(private readonly Settings $settings) {}

    /** @return array<string, mixed> */
    public function organization(): array
    {
        $sameAs = array_values(array_filter([
            $this->settings->get('social.instagram'),
            $this->settings->get('social.facebook'),
            $this->settings->get('social.tiktok'),
        ]));

        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            '@id' => url('/').'#organization',
            'name' => __('site.brand'),
            'alternateName' => ['Sattr', 'سطر'],
            'url' => SiteUrl::home(),
            'logo' => url('/logo.png'),
            'email' => $this->settings->get('contact.email'),
            'sameAs' => $sameAs ?: null,
            'areaServed' => ['@type' => 'Country', 'name' => 'EG'],
        ]);
    }

    /** @return array<string, mixed> */
    public function website(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            '@id' => url('/').'#website',
            'name' => __('site.brand'),
            'url' => SiteUrl::home(),
            'inLanguage' => app()->getLocale(),
            'publisher' => ['@id' => url('/').'#organization'],
            'potentialAction' => [
                '@type' => 'SearchAction',
                'target' => [
                    '@type' => 'EntryPoint',
                    'urlTemplate' => SiteUrl::journal().'?q={search_term_string}',
                ],
                'query-input' => 'required name=search_term_string',
            ],
        ];
    }

    /**
     * @param  list<array{0: string, 1: string}>  $trail  [name, url] pairs, root first
     * @return array<string, mixed>
     */
    public function breadcrumbs(array $trail): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => collect($trail)->values()->map(fn (array $crumb, int $index) => [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $crumb[0],
                'item' => $crumb[1],
            ])->all(),
        ];
    }

    /**
     * @param  Collection<int, Faq>  $faqs
     * @return array<string, mixed>|null
     */
    public function faq(Collection $faqs): ?array
    {
        if ($faqs->isEmpty()) {
            return null;
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => $faqs->map(fn ($faq) => [
                '@type' => 'Question',
                'name' => $faq->question,
                'acceptedAnswer' => ['@type' => 'Answer', 'text' => $faq->answer],
            ])->values()->all(),
        ];
    }

    /**
     * @param  list<string>  $images
     * @param  Collection<int, Review>  $reviews  approved reviews only
     * @return array<string, mixed>
     */
    public function product(Product $product, string $url, bool $inStock, array $images, Collection $reviews, ?string $name = null, ?string $description = null): array
    {
        $node = [
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $name ?? $product->name,
            'description' => $description ?? $product->description,
            'sku' => $product->slug,
            'brand' => ['@type' => 'Brand', 'name' => 'Sattr'],
            'image' => $images ?: null,
            'offers' => [
                '@type' => 'Offer',
                'url' => $url,
                'price' => Money::decimal($product->price),
                'priceCurrency' => 'EGP',
                'availability' => $inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                'itemCondition' => 'https://schema.org/NewCondition',
                'seller' => ['@id' => url('/').'#organization'],
                'shippingDetails' => [
                    '@type' => 'OfferShippingDetails',
                    'shippingRate' => ['@type' => 'MonetaryAmount', 'value' => '0', 'currency' => 'EGP'],
                    'shippingDestination' => ['@type' => 'DefinedRegion', 'addressCountry' => 'EG'],
                    'deliveryTime' => [
                        '@type' => 'ShippingDeliveryTime',
                        'handlingTime' => ['@type' => 'QuantitativeValue', 'minValue' => 0, 'maxValue' => 1, 'unitCode' => 'DAY'],
                        'transitTime' => ['@type' => 'QuantitativeValue', 'minValue' => 1, 'maxValue' => 2, 'unitCode' => 'DAY'],
                    ],
                ],
                'hasMerchantReturnPolicy' => [
                    '@type' => 'MerchantReturnPolicy',
                    'applicableCountry' => 'EG',
                    'returnPolicyCategory' => 'https://schema.org/MerchantReturnFiniteReturnWindow',
                    'merchantReturnDays' => 14,
                    'returnMethod' => 'https://schema.org/ReturnByMail',
                ],
            ],
        ];

        if ($reviews->isNotEmpty()) {
            $node['aggregateRating'] = [
                '@type' => 'AggregateRating',
                'ratingValue' => round($reviews->avg('rating'), 1),
                'reviewCount' => $reviews->count(),
                'bestRating' => 5,
                'worstRating' => 1,
            ];

            $node['review'] = $reviews->take(5)->map(fn (Review $review) => [
                '@type' => 'Review',
                'author' => ['@type' => 'Person', 'name' => $review->name],
                'datePublished' => $review->created_at?->toDateString(),
                'reviewBody' => $review->body,
                'reviewRating' => ['@type' => 'Rating', 'ratingValue' => $review->rating, 'bestRating' => 5],
            ])->values()->all();
        }

        return array_filter($node);
    }

    /** @return array<string, mixed> */
    public function article(Article $article, string $url, ?string $image): array
    {
        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'BlogPosting',
            'headline' => $article->title,
            'description' => $article->excerpt,
            'image' => $image,
            'datePublished' => $article->published_at?->toAtomString(),
            'dateModified' => $article->updated_at?->toAtomString(),
            'inLanguage' => app()->getLocale(),
            'mainEntityOfPage' => $url,
            'author' => ['@type' => $article->author_name && $article->author_name !== 'Sattr' ? 'Person' : 'Organization', 'name' => $article->author_name ?: 'Sattr'],
            'publisher' => ['@id' => url('/').'#organization'],
        ]);
    }
}
