<?php

namespace App\Models;

use App\Enums\PageType;
use App\Models\Concerns\HasImages;
use App\Models\Concerns\HasSeo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\Translatable\HasTranslations;

class Page extends Model implements HasMedia
{
    use HasFactory, HasImages, HasSeo, HasTranslations;

    protected $guarded = [];

    /** @var list<string> */
    public array $translatable = ['slug', 'title', 'excerpt', 'body', 'meta_title', 'meta_description'];

    protected function casts(): array
    {
        return [
            'type' => PageType::class,
            'sections' => 'array',
            'is_published' => 'boolean',
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('og')->singleFile();
    }

    /** @return BelongsTo<Design, $this> */
    public function design(): BelongsTo
    {
        return $this->belongsTo(Design::class);
    }

    /** @param Builder<self> $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('is_published', true);
    }

    /** @param Builder<self> $query */
    public function scopeOfType(Builder $query, PageType $type): void
    {
        $query->where('type', $type);
    }

    /** @param Builder<self> $query */
    public function scopeWhereSlug(Builder $query, string $slug, string $locale): void
    {
        $query->where("slug->{$locale}", $slug);
    }
}
