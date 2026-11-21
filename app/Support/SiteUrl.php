<?php

namespace App\Support;

use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\Page;

/**
 * Builds public URLs for any locale, so pages can link to their translation.
 */
final class SiteUrl
{
    /** @return list<string> */
    public static function locales(): array
    {
        return config('sattr.locales');
    }

    public static function home(?string $locale = null): string
    {
        return route('home', ['locale' => $locale ?? app()->getLocale()]);
    }

    public static function product(?string $locale = null): string
    {
        return route('product', ['locale' => $locale ?? app()->getLocale()]);
    }

    public static function checkout(?string $locale = null, ?string $design = null): string
    {
        return route('checkout', array_filter(['locale' => $locale ?? app()->getLocale(), 'design' => $design]));
    }

    public static function journal(?string $locale = null): string
    {
        return route('journal.index', ['locale' => $locale ?? app()->getLocale()]);
    }

    public static function faculty(Page $page, ?string $locale = null): string
    {
        $locale ??= app()->getLocale();

        return route('faculty', ['locale' => $locale, 'slug' => $page->getTranslation('slug', $locale)]);
    }

    public static function page(Page $page, ?string $locale = null): string
    {
        $locale ??= app()->getLocale();

        return route('page', ['locale' => $locale, 'slug' => $page->getTranslation('slug', $locale)]);
    }

    public static function article(Article $article, ?string $locale = null): string
    {
        $locale ??= app()->getLocale();

        return route('journal.show', ['locale' => $locale, 'slug' => $article->getTranslation('slug', $locale)]);
    }

    public static function category(ArticleCategory $category, ?string $locale = null): string
    {
        $locale ??= app()->getLocale();

        return route('journal.category', ['locale' => $locale, 'slug' => $category->getTranslation('slug', $locale)]);
    }

    /**
     * The same resource in every locale: ['ar' => url, 'en' => url].
     *
     * @param  callable(string): string  $resolver
     * @return array<string, string>
     */
    public static function alternates(callable $resolver): array
    {
        return collect(self::locales())->mapWithKeys(fn (string $locale) => [$locale => $resolver($locale)])->all();
    }
}
