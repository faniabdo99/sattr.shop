<?php

namespace App\Models\Concerns;

/**
 * Admin-editable SEO fields shared by products, pages and articles.
 * Columns: meta_title (json), meta_description (json), canonical_url, noindex.
 * The OG image lives in the "og" media collection.
 */
trait HasSeo
{
    public function initializeHasSeo(): void
    {
        $this->mergeCasts(['noindex' => 'boolean']);
    }

    /** @return list<string> */
    public static function seoTranslatable(): array
    {
        return ['meta_title', 'meta_description'];
    }
}
