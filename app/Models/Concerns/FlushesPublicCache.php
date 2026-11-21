<?php

namespace App\Models\Concerns;

use App\Services\SiteChrome;
use Illuminate\Support\Facades\DB;

/**
 * Any change to a model shown on public pages drops the cached pages,
 * once the surrounding transaction (if any) has committed.
 */
trait FlushesPublicCache
{
    public static function bootFlushesPublicCache(): void
    {
        $flush = fn () => DB::afterCommit(fn () => app(SiteChrome::class)->flush());

        static::saved($flush);
        static::deleted($flush);
    }
}
