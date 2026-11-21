<?php

namespace App\Models;

use App\Enums\PageType;
use App\Models\Concerns\HasImages;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\MediaLibrary\HasMedia;
use Spatie\Translatable\HasTranslations;

class Design extends Model implements HasMedia
{
    use HasFactory, HasImages, HasTranslations;

    protected $guarded = [];

    /** @var list<string> */
    public array $translatable = ['name', 'motif'];

    protected function casts(): array
    {
        return [
            'stock' => 'integer',
            'sort' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('gallery');
        $this->addMediaCollection('cover')->singleFile();
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return HasOne<Page, $this> */
    public function facultyPage(): HasOne
    {
        return $this->hasOne(Page::class)->where('type', PageType::Faculty);
    }

    /** @param Builder<self> $query */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true)->orderBy('sort');
    }

    public function isSoldOut(): bool
    {
        return $this->stock < 1;
    }
}
