<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Processing = 'processing';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
    case Returned = 'returned';

    public function label(?string $locale = null): string
    {
        return __('orders.status.'.$this->value, [], $locale);
    }

    /**
     * The forward path a customer sees on the status timeline.
     *
     * @return list<self>
     */
    public static function timeline(): array
    {
        return [self::Pending, self::Confirmed, self::Processing, self::Shipped, self::Delivered];
    }

    /** Stock goes back on the shelf when an order ends in one of these. */
    public function releasesStock(): bool
    {
        return in_array($this, [self::Cancelled, self::Returned], true);
    }
}
