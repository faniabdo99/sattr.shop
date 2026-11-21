<?php

namespace App\Services;

use App\Models\Redirect;
use Illuminate\Support\Facades\Cache;

class RedirectMap
{
    private const CACHE_KEY = 'sattr.redirects';

    /** @return array{to: string, status: int}|null */
    public function match(string $path): ?array
    {
        $path = Redirect::normalise($path);
        $map = $this->map();

        if (! isset($map[$path])) {
            return null;
        }

        Redirect::query()->where('from_path', $path)->increment('hits');

        return $map[$path];
    }

    public function flush(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /** @return array<string, array{to: string, status: int}> */
    private function map(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, fn () => Redirect::query()
            ->where('is_active', true)
            ->get(['from_path', 'to_url', 'status_code'])
            ->mapWithKeys(fn (Redirect $redirect) => [
                $redirect->from_path => ['to' => $redirect->to_url, 'status' => $redirect->status_code],
            ])
            ->all());
    }
}
