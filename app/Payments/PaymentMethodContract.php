<?php

namespace App\Payments;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Product;

/**
 * One way of paying. Checkout only talks to this interface, so an online
 * gateway (Paymob, Fawry) is a new class plus an enum case.
 */
interface PaymentMethodContract
{
    public function method(): PaymentMethod;

    /** Price of one pack in piasters when paying this way. */
    public function unitPrice(Product $product): int;

    /** Payment status a new order starts in. */
    public function initialStatus(): PaymentStatus;

    /** Whether the customer must send proof that an admin then verifies. */
    public function requiresManualVerification(): bool;
}
