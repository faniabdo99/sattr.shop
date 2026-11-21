<?php

namespace App\Models;

use App\Models\Concerns\FlushesPublicCache;
use App\Models\Concerns\HasImages;
use App\Models\Concerns\HasSeo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\Translatable\HasTranslations;

class Article extends Model implements HasMedia
{
    use FlushesPublicCache, HasFactory, HasImages, HasSeo, HasTranslations;

    protected $guarded = [];

    /** @var list<string> */
    public array $translatable = ['slug', 'title', 'excerpt', 'body', 'meta_title', 'meta_description'];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'reading_minutes' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Article $article): void {
            $longest = collect($article->getTranslations('body'))
                ->map(fn (?string $html) => count(preg_split('/\s+/u', trim(strip_tags((string) $html)), -1, PREG_SPLIT_NO_EMPTY) ?: []))
                ->max() ?? 0;

            $article->reading_minutes = max(1, (int) ceil($longest / 200));
        });
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('cover')->singleFile();
        $this->addMediaCollection('og')->singleFile();
        $this->addMediaCollection('content');
    }

    /** @return BelongsTo<ArticleCategory, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ArticleCategory::class, 'article_category_id');
    }

    /** @return BelongsTo<Design, $this> */
    public function design(): BelongsTo
    {
        return $this->belongsTo(Design::class);
    }

    /** @param Builder<self> $query */
    public function scopePublished(Builder $query): void
    {
        $query->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    /** @param Builder<self> $query */
    public function scopeWhereSlug(Builder $query, string $slug, string $locale): void
    {
        $query->where("slug->{$locale}", $slug);
    }

    public function isPublished(): bool
    {
        return $this->published_at !== null && $this->published_at->isPast();
    }
}
