@php
    $props = $page['props'] ?? [];
    $seo = $props['seo'] ?? null;
    $storefront = (bool) request()->attributes->get('storefront');
    $locale = $storefront ? app()->getLocale() : 'en';
    $preload = $props['preload'] ?? null;
@endphp
<!DOCTYPE html>
<html lang="{{ $locale }}" dir="{{ $locale === 'ar' ? 'rtl' : 'ltr' }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#F6F3EC">

        @if ($seo)
            @include('partials.seo', ['seo' => $seo])
        @else
            <meta name="robots" content="noindex, nofollow">
        @endif

        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @if ($preload)
            <link rel="preload" as="image" href="{{ $preload['href'] }}" @if (! empty($preload['srcset'])) imagesrcset="{{ $preload['srcset'] }}" imagesizes="{{ $preload['sizes'] ?? '100vw' }}" @endif @if (! empty($preload['type'])) type="{{ $preload['type'] }}" @endif fetchpriority="high">
        @endif

        @fonts($locale === 'ar' ? ['amiri', 'ibm-plex-sans-arabic'] : ['fraunces', 'inter-tight'])

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @unless ($seo)
            <x-inertia::head>
                <title>{{ config('app.name', 'Sattr') }}</title>
            </x-inertia::head>
        @endunless
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
