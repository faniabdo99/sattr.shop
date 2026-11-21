<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Foundation\Events\Dispatchable;

class PaymentVerified
{
    use Dispatchable;

    public function __construct(public Order $order) {}
}
