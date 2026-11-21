<?php

namespace App\Services;

use App\Services\Seo\SeoBuilder;
use App\Support\Present;
use App\Support\SiteUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class NotFoundPage
{
    public function __construct(
        private readonly Storefront $storefront,
        private readonly SeoBuilder $seo,
        private readonly SiteChrome $chrome,
    ) {}

    public function response(Request $request): Response
    {
        $segment = $request->segment(1);
        $locale = in_array($segment, config('sattr.locales'), true) ? $segment : config('sattr.default_locale');

        app()->setLocale($locale);
        URL::defaults(['locale' => $locale]);
        $request->attributes->set('storefront', true);

        return Inertia::render('site/not-found', [
            'seo' => $this->seo->make(
                title: __('site.not_found.title'),
                description: __('site.not_found.body'),
                alternates: SiteUrl::alternates(fn (string $l) => SiteUrl::home($l)),
                noindex: true,
            )->toArray(),
            'faculties' => $this->chrome->forLocale($locale)['faculties'],
            'articles' => $this->storefront->latestArticles(3)->map(fn ($article) => Present::article($article))->all(),
        ])->toResponse($request)->setStatusCode(404);
    }
}
