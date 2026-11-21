<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Design;
use App\Models\Faq;
use App\Models\Product;
use App\Models\Review;
use App\Support\Present;
use Illuminate\Database\Eloquent\Collection;

/**
 * Read side of the shop: the one product, its designs and the content
 * blocks shared by several public pages. Everything is eager loaded.
 */
class Storefront
{
    private ?Product $product = null;

    /** @var Collection<int, Design>|null */
    private ?Collection $designs = null;

    public function product(): Product
    {
        return $this->product ??= Product::query()->where('is_active', true)->with('media')->oldest('id')->firstOrFail();
    }

    /** @return Collection<int, Design> */
    public function designs(): Collection
    {
        return $this->designs ??= Design::query()
            ->where('product_id', $this->product()->id)
            ->active()
            ->with(['media', 'facultyPage'])
            ->get();
    }

    /** @return array<string, mixed> */
    public function productProps(): array
    {
        return Present::product($this->product(), $this->designs());
    }

    /** @return list<array<string, mixed>> */
    public function designProps(): array
    {
        return $this->designs()->map(fn (Design $design) => Present::design($design))->values()->all();
    }

    public function inStock(): bool
    {
        return $this->designs()->contains(fn (Design $design) => ! $design->isSoldOut());
    }

    /** @return Collection<int, Faq> */
    public function faqs(): Collection
    {
        return Faq::query()->active()->get();
    }

    /** @return Collection<int, Review> */
    public function reviews(?Design $design = null): Collection
    {
        return Review::query()
            ->approved()
            ->when($design, fn ($query) => $query->where('design_id', $design->id))
            ->latest()
            ->limit(50)
            ->get();
    }

    /** @return Collection<int, Article> */
    public function latestArticles(int $limit = 3, ?Design $design = null, ?int $exceptId = null): Collection
    {
        $base = fn () => Article::query()
            ->published()
            ->with(['category', 'media'])
            ->when($exceptId, fn ($query) => $query->whereKeyNot($exceptId))
            ->latest('published_at');

        if ($design) {
            $matched = $base()->where('design_id', $design->id)->limit($limit)->get();

            if ($matched->count() >= $limit) {
                return $matched;
            }

            return $matched->concat(
                $base()->whereKeyNot($matched->modelKeys())->limit($limit - $matched->count())->get()
            );
        }

        return $base()->limit($limit)->get();
    }

    /**
     * Absolute image URLs for structured data and feeds.
     *
     * @return list<string>
     */
    public function imageUrls(?Design $design = null): array
    {
        $media = collect($design?->getMedia('gallery') ?? [])
            ->concat($this->product()->getMedia('hero'))
            ->concat($this->product()->getMedia('gallery'));

        return $media->map(fn ($item) => url($item->getUrl()))->unique()->values()->all();
    }
}
