<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Unpaid = 'unpaid';
    case AwaitingVerification = 'awaiting_verification';
    case Paid = 'paid';
    case Refunded = 'refunded';

    public function label(?string $locale = null): string
    {
        return __('orders.payment_status.'.$this->value, [], $locale);
    }
}
