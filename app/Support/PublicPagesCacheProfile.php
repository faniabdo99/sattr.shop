<?php

namespace App\Support;

use Illuminate\Http\Request;
use Spatie\ResponseCache\CacheProfiles\CacheAllSuccessfulGetRequests;
use Symfony\Component\HttpFoundation\Response;

/**
 * Full-page cache for public HTML. Public pages carry no per-visitor data,
 * so one copy serves everyone, signed in or not. Inertia XHR visits are
 * never cached (they are ajax requests).
 */
class PublicPagesCacheProfile extends CacheAllSuccessfulGetRequests
{
    public function useCacheNameSuffix(Request $request): string
    {
        return '';
    }

    public function shouldCacheResponse(Response $response): bool
    {
        return $response->getStatusCode() === 200 && $this->hasCacheableContentType($response);
    }
}
