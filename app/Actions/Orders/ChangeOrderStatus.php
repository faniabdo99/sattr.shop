<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Events\OrderStatusChanged;
use App\Models\Design;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ChangeOrderStatus
{
    public function handle(Order $order, OrderStatus $to, ?User $by = null, ?string $note = null): Order
    {
        $from = $order->status;

        if ($from === $to) {
            return $order;
        }

        DB::transaction(function () use ($order, $from, $to, $by, $note) {
            $order->status = $to;

            // Cash is collected at the door, so a delivered COD order is paid.
            if ($to === OrderStatus::Delivered
                && $order->payment_method === PaymentMethod::CashOnDelivery
                && $order->payment_status === PaymentStatus::Unpaid) {
                $order->payment_status = PaymentStatus::Paid;
                $order->paid_at = now();
            }

            $order->save();

            $order->histories()->create([
                'user_id' => $by?->id,
                'from_status' => $from,
                'to_status' => $to,
                'note' => $note,
                'created_at' => now(),
            ]);

            // Cancelled or returned packs go back on the shelf; undoing that takes them off again.
            if ($to->releasesStock() !== $from->releasesStock()) {
                foreach ($order->items as $item) {
                    $design = Design::query()->whereKey($item->design_id)->lockForUpdate()->first();

                    if ($design) {
                        $change = $to->releasesStock() ? $item->quantity : -$item->quantity;
                        $design->update(['stock' => max(0, $design->stock + $change)]);
                    }
                }
            }
        });

        OrderStatusChanged::dispatch($order, $from, $to);

        return $order;
    }
}
