<?php

namespace App\Services\Seo;

use App\Services\Settings;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;

class SeoBuilder
{
    public function __construct(private readonly Settings $settings) {}

    /**
     * Build the head for a page. Admin-entered SEO fields on $model win;
     * everything else falls back to the values given here, then to settings.
     *
     * @param  array<string, string>  $alternates
     * @param  list<array<string, mixed>|null>  $schema
     */
    public function make(
        string $title,
        ?string $description,
        array $alternates,
        ?Model $model = null,
        string $type = 'website',
        array $schema = [],
        ?string $image = null,
        bool $noindex = false,
        bool $appendBrand = true,
    ): Seo {
        $locale = app()->getLocale();
        $brand = __('site.brand');

        $metaTitle = $this->translated($model, 'meta_title');
        $metaDescription = $this->translated($model, 'meta_description');

        $resolvedTitle = $metaTitle ?: ($appendBrand ? "{$title} | {$brand}" : $title);
        $resolvedDescription = $metaDescription
            ?: ($description ? Str::limit(trim(preg_replace('/\s+/u', ' ', strip_tags($description)) ?? ''), 158, '…') : null)
            ?: $this->settings->localized('seo.default_description');

        $ogImage = null;

        if ($model instanceof HasMedia) {
            $ogImage = $model->getFirstMediaUrl('og') ?: null;
        }

        $ogImage ??= $image ?? $this->settings->url('seo.og_image_path');

        return new Seo(
            title: $resolvedTitle,
            description: $resolvedDescription,
            canonical: $model?->getAttribute('canonical_url') ?: ($alternates[$locale] ?? url()->current()),
            alternates: $alternates,
            image: $ogImage ? url($ogImage) : null,
            noindex: $noindex || (bool) $model?->getAttribute('noindex'),
            type: $type,
            schema: array_values(array_filter($schema)),
        );
    }

    private function translated(?Model $model, string $attribute): ?string
    {
        if (! $model || ! method_exists($model, 'getTranslation')) {
            return null;
        }

        return $model->getTranslation($attribute, app()->getLocale(), false) ?: null;
    }
}
