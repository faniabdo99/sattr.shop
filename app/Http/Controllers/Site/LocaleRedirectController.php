<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LocaleRedirectController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $locale = $request->getPreferredLanguage(config('sattr.locales'));

        if (! $request->headers->has('Accept-Language') || ! in_array($locale, config('sattr.locales'), true)) {
            $locale = config('sattr.default_locale');
        }

        return redirect()->route('home', ['locale' => $locale], 302)->header('Vary', 'Accept-Language');
    }
}
