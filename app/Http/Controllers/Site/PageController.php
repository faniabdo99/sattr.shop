<?php

namespace App\Http\Controllers\Site;

use App\Enums\PageType;
use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Services\Seo\Schema;
use App\Services\Seo\SeoBuilder;
use App\Support\SiteUrl;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function __invoke(string $slug, SeoBuilder $seo, Schema $schema): Response
    {
        $page = Page::query()
            ->published()
            ->ofType(PageType::StaticPage)
            ->whereSlug($slug, app()->getLocale())
            ->with('media')
            ->firstOrFail();

        return Inertia::render('site/page', [
            'seo' => $seo->make(
                title: $page->title,
                description: $page->excerpt ?: $page->body,
                alternates: SiteUrl::alternates(fn (string $locale) => SiteUrl::page($page, $locale)),
                model: $page,
                schema: [
                    $schema->breadcrumbs([[__('site.nav.home'), SiteUrl::home()], [$page->title, SiteUrl::page($page)]]),
                ],
            )->toArray(),
            'page' => [
                'key' => $page->key,
                'title' => $page->title,
                'excerpt' => $page->excerpt,
                'body' => $page->body,
                'updated' => $page->updated_at?->locale(app()->getLocale())->isoFormat('LL'),
            ],
        ]);
    }
}
