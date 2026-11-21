<?php

namespace App\Payments;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Product;

class InstaPayManual implements PaymentMethodContract
{
    public function method(): PaymentMethod
    {
        return PaymentMethod::InstaPay;
    }

    public function unitPrice(Product $product): int
    {
        return $product->instapayPrice();
    }

    public function initialStatus(): PaymentStatus
    {
        return PaymentStatus::Unpaid;
    }

    public function requiresManualVerification(): bool
    {
        return true;
    }
}
