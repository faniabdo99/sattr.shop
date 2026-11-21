@php
    /** @var array<string, mixed> $seo */
    $defaultLocale = config('sattr.default_locale');
@endphp
<title data-seo="title">{{ $seo['title'] }}</title>
<meta name="description" content="{{ $seo['description'] }}" data-seo="description">
<meta name="robots" content="{{ $seo['noindex'] ? 'noindex, follow' : 'index, follow, max-image-preview:large' }}" data-seo="robots">
<link rel="canonical" href="{{ $seo['canonical'] }}" data-seo="canonical">
@foreach ($seo['alternates'] as $alternateLocale => $alternateUrl)
<link rel="alternate" hreflang="{{ $alternateLocale }}" href="{{ $alternateUrl }}" data-seo="alternate">
@endforeach
@isset($seo['alternates'][$defaultLocale])
<link rel="alternate" hreflang="x-default" href="{{ $seo['alternates'][$defaultLocale] }}" data-seo="alternate">
@endisset
<meta property="og:site_name" content="{{ __('site.brand') }}">
<meta property="og:locale" content="{{ app()->getLocale() === 'ar' ? 'ar_EG' : 'en_US' }}">
<meta property="og:type" content="{{ $seo['type'] === 'article' ? 'article' : ($seo['type'] === 'product' ? 'product' : 'website') }}" data-seo="og:type">
<meta property="og:title" content="{{ $seo['title'] }}" data-seo="og:title">
<meta property="og:description" content="{{ $seo['description'] }}" data-seo="og:description">
<meta property="og:url" content="{{ $seo['canonical'] }}" data-seo="og:url">
@if ($seo['image'])
<meta property="og:image" content="{{ $seo['image'] }}" data-seo="og:image">
@endif
<meta name="twitter:card" content="{{ $seo['image'] ? 'summary_large_image' : 'summary' }}">
<script type="application/ld+json" data-seo="schema">{!! json_encode($seo['schema'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) !!}</script>
