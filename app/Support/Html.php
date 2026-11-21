<?php

namespace App\Support;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

/** Cleans rich text coming from the admin editor before it is stored. */
final class Html
{
    public static function clean(?string $html): ?string
    {
        if ($html === null || trim(strip_tags($html, '<img>')) === '') {
            return null;
        }

        $config = (new HtmlSanitizerConfig)
            ->allowSafeElements()
            ->allowRelativeLinks()
            ->allowRelativeMedias()
            ->allowLinkSchemes(['https', 'http', 'mailto', 'tel'])
            ->allowMediaSchemes(['https', 'http'])
            ->dropAttribute('style', '*')
            ->dropAttribute('class', '*')
            ->forceAttribute('a', 'rel', 'noopener')
            ->withMaxInputLength(500_000);

        return (new HtmlSanitizer($config))->sanitize($html);
    }

    /**
     * @param  array<string, string|null>|null  $translations
     * @return array<string, string|null>
     */
    public static function cleanTranslations(?array $translations): array
    {
        return collect($translations ?? [])->map(fn (?string $html) => self::clean($html))->all();
    }
}
