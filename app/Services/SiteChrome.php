<?php

namespace App\Services;

use App\Enums\PageType;
use App\Models\Page;
use App\Support\SiteUrl;
use Illuminate\Support\Facades\Cache;
use Spatie\ResponseCache\Facades\ResponseCache;

/**
 * Header/footer data shared by every public page, plus the single place
 * that invalidates cached public output when content changes.
 */
class SiteChrome
{
    public function __construct(private readonly Settings $settings) {}

    /** @return array<string, mixed> */
    public function forLocale(string $locale): array
    {
        return Cache::rememberForever("sattr.chrome.{$locale}", function () use ($locale) {
            $pages = Page::query()->published()->with('design')->get();
            $whatsapp = preg_replace('/\D+/', '', (string) $this->settings->get('contact.whatsapp'));

            return [
                'home' => SiteUrl::home($locale),
                'product' => SiteUrl::product($locale),
                'journal' => SiteUrl::journal($locale),
                'checkout' => SiteUrl::checkout($locale),
                'faculties' => $pages
                    ->where('type', PageType::Faculty)
                    ->filter(fn (Page $page) => $page->design?->is_active)
                    ->sortBy(fn (Page $page) => $page->design->sort)
                    ->map(fn (Page $page) => [
                        'name' => $page->design->getTranslation('name', $locale),
                        'url' => SiteUrl::faculty($page, $locale),
                    ])->values()->all(),
                'pages' => $pages
                    ->where('type', PageType::StaticPage)
                    ->map(fn (Page $page) => [
                        'key' => $page->key,
                        'title' => $page->getTranslation('title', $locale),
                        'url' => SiteUrl::page($page, $locale),
                    ])->values()->all(),
                'whatsapp' => $whatsapp ? "https://wa.me/{$whatsapp}" : null,
                'email' => $this->settings->get('contact.email'),
                'social' => array_filter([
                    'instagram' => $this->settings->get('social.instagram'),
                    'facebook' => $this->settings->get('social.facebook'),
                    'tiktok' => $this->settings->get('social.tiktok'),
                ]),
                'tracking' => array_filter([
                    'ga4' => $this->settings->get('tracking.ga4_id'),
                    'gtm' => $this->settings->get('tracking.gtm_id'),
                    'metaPixel' => $this->settings->get('tracking.meta_pixel_id'),
                    'posthogKey' => $this->settings->get('tracking.posthog_key'),
                    'posthogHost' => $this->settings->get('tracking.posthog_key') ? $this->settings->get('tracking.posthog_host') : null,
                    'tiktok' => $this->settings->get('tracking.tiktok_pixel_id'),
                ]),
                'turnstileSiteKey' => config('sattr.turnstile.site_key'),
            ];
        });
    }

    /** Drop every cached public page and the cached chrome. */
    public function flush(): void
    {
        foreach (config('sattr.locales') as $locale) {
            Cache::forget("sattr.chrome.{$locale}");
        }

        Cache::forget('sattr.sitemap');
        $this->settings->flush();

        if (config('responsecache.enabled')) {
            ResponseCache::clear();
        }
    }
}
