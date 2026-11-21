<?php

namespace App\Models;

use App\Models\Concerns\FlushesPublicCache;
use App\Models\Concerns\HasImages;
use App\Models\Concerns\HasSeo;
use App\Support\Money;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\Translatable\HasTranslations;

class Product extends Model implements HasMedia
{
    use FlushesPublicCache, HasFactory, HasImages, HasSeo, HasTranslations;

    protected $guarded = [];

    /** @var list<string> */
    public array $translatable = ['name', 'tagline', 'description', 'meta_title', 'meta_description'];

    protected function casts(): array
    {
        return [
            'contents' => 'array',
            'specs' => 'array',
            'price' => 'integer',
            'instapay_discount_percent' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('hero')->singleFile();
        $this->addMediaCollection('gallery');
        $this->addMediaCollection('unboxing');
        $this->addMediaCollection('og')->singleFile();
    }

    /** @return HasMany<Design, $this> */
    public function designs(): HasMany
    {
        return $this->hasMany(Design::class)->orderBy('sort');
    }

    /** Unit price in piasters when paying by InstaPay, rounded down to a whole pound. */
    public function instapayPrice(): int
    {
        return Money::discounted($this->price, $this->instapay_discount_percent);
    }

    public function instapaySaving(): int
    {
        return $this->price - $this->instapayPrice();
    }

    public static function current(): self
    {
        return static::query()->where('is_active', true)->oldest('id')->firstOrFail();
    }
}
