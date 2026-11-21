<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case InstaPay = 'instapay';
    case CashOnDelivery = 'cod';

    public function label(?string $locale = null): string
    {
        return __('orders.payment_method.'.$this->value, [], $locale);
    }
}
