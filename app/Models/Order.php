<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $hidden = ['access_token'];

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'payment_method' => PaymentMethod::class,
            'payment_status' => PaymentStatus::class,
            'subtotal' => 'integer',
            'discount_amount' => 'integer',
            'shipping_amount' => 'integer',
            'total' => 'integer',
            'tracking_context' => 'array',
            'paid_at' => 'datetime',
            'payment_flagged_at' => 'datetime',
            'review_requested_at' => 'datetime',
        ];
    }

    /**
     * Who this order belongs to in PostHog: the visitor's browser ID when it
     * was captured at checkout, otherwise the order code.
     */
    public function analyticsId(): string
    {
        return $this->tracking_context['posthog_id'] ?? $this->code;
    }

    /** @return HasMany<OrderItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** @return HasMany<OrderStatusHistory, $this> */
    public function histories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('id');
    }

    /** @return HasMany<Payment, $this> */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class)->latest('id');
    }

    /** @return HasOne<Review, $this> */
    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    /** @return BelongsTo<User, $this> */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function statusUrl(): string
    {
        return route('order.show', ['locale' => $this->locale, 'order' => $this->code, 't' => $this->access_token]);
    }

    public function tokenMatches(?string $token): bool
    {
        return is_string($token) && hash_equals($this->access_token, $token);
    }

    /** Amount the courier collects at the door, in piasters. */
    public function codAmount(): int
    {
        return $this->payment_method === PaymentMethod::CashOnDelivery && $this->payment_status !== PaymentStatus::Paid
            ? $this->total
            : 0;
    }

    public function whatsappPhone(): string
    {
        return '2'.$this->phone;
    }
}
