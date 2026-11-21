<?php

namespace App\Support;

use App\Models\Article;
use App\Models\Design;
use App\Models\Faq;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Support\Collection;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Shapes models into plain arrays for the storefront, in the current locale.
 */
final class Present
{
    /** @param array<string, mixed>|null $value */
    public static function t(?array $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return $value[app()->getLocale()] ?? $value[config('sattr.default_locale')] ?? null;
    }

    /** @return array<string, mixed>|null */
    public static function image(?Media $media): ?array
    {
        if (! $media) {
            return null;
        }

        $srcset = fn (string $format) => collect(Design::IMAGE_WIDTHS)
            ->filter(fn (int $width) => $media->hasGeneratedConversion("{$format}-{$width}"))
            ->map(fn (int $width) => $media->getUrl("{$format}-{$width}")." {$width}w")
            ->implode(', ');

        return [
            'id' => $media->id,
            'src' => $media->getUrl(),
            'webp' => $srcset('webp') ?: null,
            'avif' => $srcset('avif') ?: null,
            'width' => $media->getCustomProperty('width'),
            'height' => $media->getCustomProperty('height'),
            'alt' => self::t($media->getCustomProperty('alt')) ?? '',
        ];
    }

    /**
     * @param  Collection<int, Media>  $media
     * @return list<array<string, mixed>>
     */
    public static function images(Collection $media): array
    {
        return $media->map(fn (Media $item) => self::image($item))->values()->all();
    }

    /** @return array<string, mixed> */
    public static function design(Design $design): array
    {
        return [
            'id' => $design->id,
            'key' => $design->key,
            'name' => $design->name,
            'motif' => $design->motif,
            'tint' => $design->tint,
            'stock' => $design->stock,
            'sold_out' => $design->isSoldOut(),
            'url' => $design->relationLoaded('facultyPage') && $design->facultyPage ? SiteUrl::faculty($design->facultyPage) : null,
            'cover' => self::image($design->getFirstMedia('cover')),
            'images' => self::images($design->getMedia('gallery')),
        ];
    }

    /**
     * @param  Collection<int, Design>  $designs
     * @return array<string, mixed>
     */
    public static function product(Product $product, Collection $designs): array
    {
        return [
            'name' => $product->name,
            'tagline' => $product->tagline,
            'description' => $product->description,
            'contents' => collect($product->contents)->map(fn (array $item) => [
                'title' => self::t($item['title'] ?? null),
                'detail' => self::t($item['detail'] ?? null),
            ])->all(),
            'specs' => collect($product->specs)->map(fn (array $item) => [
                'label' => self::t($item['label'] ?? null),
                'value' => self::t($item['value'] ?? null),
            ])->all(),
            'price' => $product->price,
            'price_label' => Money::format($product->price),
            'instapay_price' => $product->instapayPrice(),
            'instapay_label' => Money::format($product->instapayPrice()),
            'saving' => $product->instapaySaving(),
            'saving_label' => Money::format($product->instapaySaving()),
            'discount_percent' => $product->instapay_discount_percent,
            'sold_out' => $designs->every(fn (Design $design) => $design->isSoldOut()),
            'hero' => self::image($product->getFirstMedia('hero')),
            'gallery' => self::images($product->getMedia('gallery')),
            'unboxing' => self::images($product->getMedia('unboxing')),
            'url' => SiteUrl::product(),
            'checkout_url' => SiteUrl::checkout(),
        ];
    }

    /** @return array<string, mixed> */
    public static function article(Article $article): array
    {
        return [
            'title' => $article->title,
            'excerpt' => $article->excerpt,
            'url' => SiteUrl::article($article),
            'author' => $article->author_name,
            'reading_minutes' => $article->reading_minutes,
            'published_at' => $article->published_at?->toDateString(),
            'published_label' => $article->published_at?->locale(app()->getLocale())->isoFormat('LL'),
            'category' => $article->category ? [
                'name' => $article->category->name,
                'url' => SiteUrl::category($article->category),
            ] : null,
            'cover' => self::image($article->getFirstMedia('cover')),
        ];
    }

    /** @return array<string, mixed> */
    public static function faq(Faq $faq): array
    {
        return ['id' => $faq->id, 'question' => $faq->question, 'answer' => $faq->answer];
    }

    /** @return array<string, mixed> */
    public static function review(Review $review): array
    {
        return [
            'id' => $review->id,
            'name' => $review->name,
            'rating' => $review->rating,
            'body' => $review->body,
            'date' => $review->created_at?->locale(app()->getLocale())->isoFormat('LL'),
        ];
    }
}
