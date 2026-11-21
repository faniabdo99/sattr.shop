<?php

namespace App\Http\Controllers\Site;

use App\Enums\PageType;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\Page;
use App\Services\Storefront;
use App\Support\SiteUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\SitemapIndex;
use Spatie\Sitemap\Tags\Url;
use Symfony\Component\HttpFoundation\Response;

class SitemapController extends Controller
{
    private const SECTIONS = ['pages', 'faculties', 'articles', 'images'];

    public function index(Request $request): Response
    {
        $index = SitemapIndex::create();

        foreach (self::SECTIONS as $section) {
            $index->add(route('sitemap.section', ['section' => $section]));
        }

        return $index->toResponse($request);
    }

    public function section(Request $request, string $section, Storefront $storefront): Response
    {
        abort_unless(in_array($section, self::SECTIONS, true), 404);

        $sitemap = Sitemap::create();

        match ($section) {
            'pages' => $this->pages($sitemap, $storefront),
            'faculties' => $this->faculties($sitemap),
            'articles' => $this->articles($sitemap),
            'images' => $this->images($sitemap, $storefront),
        };

        return $sitemap->toResponse($request);
    }

    private function pages(Sitemap $sitemap, Storefront $storefront): void
    {
        $product = $storefront->product();

        $this->add($sitemap, fn (string $locale) => SiteUrl::home($locale), $product->updated_at, 1.0);

        if (! $product->noindex) {
            $this->add($sitemap, fn (string $locale) => SiteUrl::product($locale), $product->updated_at, 0.9);
        }

        $this->add($sitemap, fn (string $locale) => SiteUrl::journal($locale), Article::query()->published()->max('updated_at'), 0.6);

        ArticleCategory::query()->get()->each(fn (ArticleCategory $category) => $this->add(
            $sitemap, fn (string $locale) => SiteUrl::category($category, $locale), $category->updated_at, 0.4,
        ));

        Page::query()->published()->ofType(PageType::StaticPage)->where('noindex', false)->get()
            ->each(fn (Page $page) => $this->add($sitemap, fn (string $locale) => SiteUrl::page($page, $locale), $page->updated_at, 0.3));
    }

    private function faculties(Sitemap $sitemap): void
    {
        Page::query()->published()->ofType(PageType::Faculty)->where('noindex', false)->get()
            ->each(fn (Page $page) => $this->add($sitemap, fn (string $locale) => SiteUrl::faculty($page, $locale), $page->updated_at, 0.9));
    }

    private function articles(Sitemap $sitemap): void
    {
        Article::query()->published()->where('noindex', false)->latest('published_at')->get()
            ->each(fn (Article $article) => $this->add($sitemap, fn (string $locale) => SiteUrl::article($article, $locale), $article->updated_at, 0.7));
    }

    private function images(Sitemap $sitemap, Storefront $storefront): void
    {
        $locale = config('sattr.default_locale');
        $product = $storefront->product();

        $entry = Url::create(SiteUrl::product($locale));
        $product->getMedia('hero')->concat($product->getMedia('gallery'))->concat($product->getMedia('unboxing'))
            ->each(fn ($media) => $entry->addImage(url($media->getUrl()), (string) ($media->getCustomProperty('alt')[$locale] ?? '')));

        if ($entry->images !== []) {
            $sitemap->add($entry);
        }

        foreach ($storefront->designs() as $design) {
            if (! $design->facultyPage || $design->getMedia('gallery')->isEmpty()) {
                continue;
            }

            $entry = Url::create(SiteUrl::faculty($design->facultyPage, $locale));
            $design->getMedia('gallery')->each(fn ($media) => $entry->addImage(url($media->getUrl()), (string) ($media->getCustomProperty('alt')[$locale] ?? '')));
            $sitemap->add($entry);
        }

        Article::query()->published()->with('media')->get()->each(function (Article $article) use ($sitemap, $locale) {
            if ($cover = $article->getFirstMedia('cover')) {
                $sitemap->add(Url::create(SiteUrl::article($article, $locale))
                    ->addImage(url($cover->getUrl()), (string) ($cover->getCustomProperty('alt')[$locale] ?? '')));
            }
        });
    }

    /** @param callable(string): string $resolver */
    private function add(Sitemap $sitemap, callable $resolver, mixed $lastModified, float $priority): void
    {
        $alternates = SiteUrl::alternates($resolver);

        foreach ($alternates as $url) {
            $entry = Url::create($url)->setPriority($priority);

            if ($lastModified) {
                $entry->setLastModificationDate(Carbon::parse($lastModified));
            }

            foreach ($alternates as $alternateLocale => $alternateUrl) {
                $entry->addAlternate($alternateUrl, $alternateLocale);
            }

            $entry->addAlternate($alternates[config('sattr.default_locale')], 'x-default');
            $sitemap->add($entry);
        }
    }
}
