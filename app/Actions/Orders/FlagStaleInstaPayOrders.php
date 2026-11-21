<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;

class FlagStaleInstaPayOrders
{
    /** Flags (never cancels) InstaPay orders still unpaid after the grace period. */
    public function handle(): int
    {
        return Order::query()
            ->where('payment_method', PaymentMethod::InstaPay)
            ->where('payment_status', PaymentStatus::Unpaid)
            ->where('status', OrderStatus::Pending)
            ->whereNull('payment_flagged_at')
            ->where('created_at', '<=', now()->subHours(config('sattr.orders.instapay_flag_after_hours')))
            ->update(['payment_flagged_at' => now()]);
    }
}
