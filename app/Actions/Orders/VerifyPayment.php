<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatus;
use App\Enums\PaymentRecordStatus;
use App\Enums\PaymentStatus;
use App\Events\PaymentVerified;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class VerifyPayment
{
    public function __construct(private readonly ChangeOrderStatus $changeStatus) {}

    public function handle(Order $order, User $admin): Order
    {
        if ($order->payment_status === PaymentStatus::Paid) {
            return $order;
        }

        DB::transaction(function () use ($order, $admin) {
            $payment = $order->payments()->where('status', PaymentRecordStatus::Submitted)->first()
                ?? $order->payments()->make(['method' => $order->payment_method, 'amount' => $order->total]);

            $payment->fill([
                'status' => PaymentRecordStatus::Verified,
                'verified_by' => $admin->id,
                'verified_at' => now(),
            ])->save();

            $order->update([
                'payment_status' => PaymentStatus::Paid,
                'paid_at' => now(),
                'verified_by' => $admin->id,
                'payment_flagged_at' => null,
            ]);
        });

        if ($order->status === OrderStatus::Pending) {
            $this->changeStatus->handle($order, OrderStatus::Confirmed, $admin, 'Payment verified');
        }

        PaymentVerified::dispatch($order);

        return $order;
    }
}
