<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Tells search engines a URL changed, through IndexNow (Bing, Yandex and
 * others). Google no longer accepts pings and relies on sitemap lastmod.
 * Does nothing until INDEXNOW_KEY is set.
 */
class SearchPing
{
    /** @param list<string> $urls */
    public function urls(array $urls): void
    {
        $key = config('sattr.indexnow_key');

        if (! $key || $urls === [] || ! app()->isProduction()) {
            return;
        }

        dispatch(function () use ($key, $urls) {
            try {
                Http::timeout(8)->post('https://api.indexnow.org/indexnow', [
                    'host' => parse_url(config('app.url'), PHP_URL_HOST),
                    'key' => $key,
                    'keyLocation' => url("/{$key}.txt"),
                    'urlList' => $urls,
                ]);
            } catch (Throwable $exception) {
                report($exception);
            }
        })->afterResponse();
    }
}
