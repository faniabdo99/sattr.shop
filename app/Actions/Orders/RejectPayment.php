<?php

namespace App\Actions\Orders;

use App\Enums\PaymentRecordStatus;
use App\Enums\PaymentStatus;
use App\Events\PaymentRejected;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RejectPayment
{
    public function handle(Order $order, User $admin, string $reason): Order
    {
        DB::transaction(function () use ($order, $admin, $reason) {
            $order->payments()
                ->where('status', PaymentRecordStatus::Submitted)
                ->update([
                    'status' => PaymentRecordStatus::Rejected,
                    'rejection_reason' => $reason,
                    'verified_by' => $admin->id,
                    'verified_at' => now(),
                ]);

            $order->update(['payment_status' => PaymentStatus::Unpaid]);
        });

        PaymentRejected::dispatch($order, $reason);

        return $order;
    }
}
