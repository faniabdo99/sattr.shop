<?php

use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\NormalizeUrl;
use App\Http\Middleware\SetLocale;
use App\Services\NotFoundPage;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['sidebar_state', 'sattr_attribution', 'sattr_consent']);

        $middleware->web(prepend: [NormalizeUrl::class]);

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'locale' => SetLocale::class,
            'admin' => EnsureAdmin::class,
        ]);

        $middleware->redirectGuestsTo('/login');
        $middleware->redirectUsersTo('/admin');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Public 404s get the storefront page with suggestions.
        $exceptions->render(function (NotFoundHttpException $exception, Request $request) {
            if ($request->expectsJson() && ! $request->header('X-Inertia')) {
                return null;
            }

            if ($request->is('admin', 'admin/*', 'settings/*')) {
                return null;
            }

            return app(NotFoundPage::class)->response($request);
        });
    })->create();
