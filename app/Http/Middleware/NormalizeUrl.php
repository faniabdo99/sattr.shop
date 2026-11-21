<?php

namespace App\Http\Middleware;

use App\Services\RedirectMap;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Keeps one URL per page: strips trailing slashes with a 301 and applies
 * the redirects managed in the admin.
 */
class NormalizeUrl
{
    public function __construct(private readonly RedirectMap $redirects) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->isMethod('GET')) {
            return $next($request);
        }

        $path = $request->getPathInfo();

        if ($path !== '/' && str_ends_with($path, '/')) {
            $query = $request->getQueryString();

            return redirect(rtrim($path, '/').($query ? "?{$query}" : ''), 301);
        }

        if ($target = $this->redirects->match(rawurldecode($path))) {
            return redirect($target['to'], $target['status']);
        }

        return $next($request);
    }
}
