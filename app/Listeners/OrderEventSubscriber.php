<?php

namespace App\Listeners;

use App\Enums\OrderStatus;
use App\Events\OrderPlaced;
use App\Events\OrderStatusChanged;
use App\Events\PaymentProofSubmitted;
use App\Events\PaymentRejected;
use App\Events\PaymentVerified;
use App\Services\OrderNotifier;
use App\Services\Tracking\Drivers\PostHogDriver;
use App\Services\Tracking\Tracker;
use Illuminate\Events\Dispatcher;

/** What happens after each step of an order's life. */
class OrderEventSubscriber
{
    /** Order-lifecycle events are product analytics, not ad conversions. */
    private const POSTHOG_ONLY = [PostHogDriver::class];

    /** Status changes worth an event of their own, named order_{status}. */
    private const TRACKED_STATUSES = [
        OrderStatus::Confirmed,
        OrderStatus::Shipped,
        OrderStatus::Delivered,
        OrderStatus::Cancelled,
        OrderStatus::Returned,
    ];

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
        $this->tracker->track('payment_proof_submitted', $event->order, self::POSTHOG_ONLY);
    }

    public function verified(PaymentVerified $event): void
    {
        $this->notifier->paymentVerified($event->order);
        $this->tracker->track('payment_verified', $event->order);
    }

    public function rejected(PaymentRejected $event): void
    {
        $this->notifier->paymentRejected($event->order, $event->reason);
        $this->tracker->track('payment_rejected', $event->order, self::POSTHOG_ONLY);
    }

    public function statusChanged(OrderStatusChanged $event): void
    {
        if (in_array($event->to, self::TRACKED_STATUSES, true)) {
            $this->tracker->track("order_{$event->to->value}", $event->order, self::POSTHOG_ONLY);
        }

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
