<?php

namespace App\Http\Middleware;

use App\Services\SiteChrome;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Middleware;
use Inertia\Support\SessionKey;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Shared props. Public pages get the storefront chrome and translations
     * and never the signed-in user, so their HTML can be cached for everyone.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $storefront = fn (): bool => (bool) $request->attributes->get('storefront');

        $this->flashToast($request);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'locale' => fn () => $storefront() ? app()->getLocale() : 'en',
            'dir' => fn () => $storefront() && app()->getLocale() === 'ar' ? 'rtl' : 'ltr',
            'site' => fn () => $storefront() ? app(SiteChrome::class)->forLocale(app()->getLocale()) : null,
            't' => Inertia::once(fn () => $storefront() ? trans('site') : []),
            'auth' => fn () => ['user' => $storefront() ? null : $request->user()],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * Admin controllers redirect with ->with('success' | 'error', message).
     * Turn that into the toast the admin layout listens for.
     */
    private function flashToast(Request $request): void
    {
        if (! $request->hasSession()) {
            return;
        }

        foreach (['success', 'error'] as $type) {
            $message = $request->session()->get($type);

            if (is_string($message) && $message !== '') {
                $request->session()->now(SessionKey::FLASH_DATA, [
                    ...Inertia::getFlashed($request),
                    'toast' => ['type' => $type, 'message' => $message],
                ]);
            }
        }
    }
}
