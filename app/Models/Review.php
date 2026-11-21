<?php

namespace App\Models;

use App\Enums\ReviewStatus;
use App\Models\Concerns\FlushesPublicCache;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use FlushesPublicCache, HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['status' => ReviewStatus::class, 'rating' => 'integer'];
    }

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** @return BelongsTo<Design, $this> */
    public function design(): BelongsTo
    {
        return $this->belongsTo(Design::class);
    }

    /** @param Builder<self> $query */
    public function scopeApproved(Builder $query): void
    {
        $query->where('status', ReviewStatus::Approved);
    }
}
