<?php

namespace App\Listeners;

use App\Enums\OrderStatus;
use App\Events\OrderPlaced;
use App\Events\OrderStatusChanged;
use App\Events\PaymentProofSubmitted;
use App\Events\PaymentRejected;
use App\Events\PaymentVerified;
use App\Services\OrderNotifier;
use App\Services\Tracking\Tracker;
use Illuminate\Events\Dispatcher;

/** What happens after each step of an order's life. */
class OrderEventSubscriber
{
    public function __construct(
        private readonly OrderNotifier $notifier,
        private readonly Tracker $tracker,
    ) {}

    public function placed(OrderPlaced $event): void
    {
        $this->notifier->orderPlaced($event->order);
        $this->tracker->track('purchase', $event->order);
    }

    public function proofSubmitted(PaymentProofSubmitted $event): void
    {
        $this->notifier->proofSubmitted($event->order);
    }

    public function verified(PaymentVerified $event): void
    {
        $this->notifier->paymentVerified($event->order);
        $this->tracker->track('payment_verified', $event->order);
    }

    public function rejected(PaymentRejected $event): void
    {
        $this->notifier->paymentRejected($event->order, $event->reason);
    }

    public function statusChanged(OrderStatusChanged $event): void
    {
        if ($event->to === OrderStatus::Delivered && $event->order->review_requested_at === null) {
            $event->order->forceFill(['review_requested_at' => now()])->save();
            $this->notifier->reviewRequest($event->order);
        }
    }

    /** @return array<class-string, string> */
    public function subscribe(Dispatcher $events): array
    {
        return [
            OrderPlaced::class => 'placed',
            PaymentProofSubmitted::class => 'proofSubmitted',
            PaymentVerified::class => 'verified',
            PaymentRejected::class => 'rejected',
            OrderStatusChanged::class => 'statusChanged',
        ];
    }
}
