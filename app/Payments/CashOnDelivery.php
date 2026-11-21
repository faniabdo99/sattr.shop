<?php

namespace App\Payments;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Product;

class CashOnDelivery implements PaymentMethodContract
{
    public function method(): PaymentMethod
    {
        return PaymentMethod::CashOnDelivery;
    }

    public function unitPrice(Product $product): int
    {
        return $product->price;
    }

    public function initialStatus(): PaymentStatus
    {
        return PaymentStatus::Unpaid;
    }

    public function requiresManualVerification(): bool
    {
        return false;
    }
}
