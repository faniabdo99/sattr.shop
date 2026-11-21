<?php

namespace App\Services\Seo;

use Illuminate\Contracts\Support\Arrayable;

/**
 * Everything the document head needs for one page.
 *
 * @implements Arrayable<string, mixed>
 */
final class Seo implements Arrayable
{
    /**
     * @param  array<string, string>  $alternates  locale => absolute URL
     * @param  list<array<string, mixed>>  $schema  JSON-LD nodes
     */
    public function __construct(
        public string $title,
        public ?string $description,
        public string $canonical,
        public array $alternates = [],
        public ?string $image = null,
        public bool $noindex = false,
        public string $type = 'website',
        public array $schema = [],
    ) {}

    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'description' => $this->description,
            'canonical' => $this->canonical,
            'alternates' => $this->alternates,
            'image' => $this->image,
            'noindex' => $this->noindex,
            'type' => $this->type,
            'schema' => $this->schema,
        ];
    }
}
