<?php

namespace App\Services;

use App\Enums\PaymentMethod;
use App\Models\Order;
use App\Notifications\AdminAlert;
use App\Notifications\CustomerMessage;
use App\Support\Money;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

/**
 * Every message the shop sends about an order. All are queued.
 */
class OrderNotifier
{
    public function __construct(private readonly Settings $settings) {}

    public function orderPlaced(Order $order): void
    {
        $order->loadMissing('items');
        $item = $order->items->first();

        $this->admin(
            __('orders.mail.admin_subject', [
                'code' => $order->code,
                'method' => $order->payment_method->label('en'),
                'amount' => Money::format($order->total, 'en'),
            ], 'en'),
            array_values(array_filter([
                "{$order->customer_name}, {$order->phone}",
                $item ? "{$item->quantity} × {$item->design_name}".($item->cover_name ? " (cover: {$item->cover_name})" : '') : null,
                "{$order->governorate}, {$order->city}",
                $order->utm_source ? "Source: {$order->utm_source} / {$order->utm_medium}" : null,
            ])),
            $order,
        );

        $amount = Money::format($order->total, $order->locale);

        $this->customer($order, 'customer_subject', [
            __('orders.mail.customer_intro', ['name' => $order->customer_name], $order->locale),
            $order->payment_method === PaymentMethod::InstaPay
                ? __('orders.mail.customer_instapay', ['amount' => $amount], $order->locale)
                : __('orders.mail.customer_cod', ['amount' => $amount], $order->locale),
        ], 'view_order', $order->statusUrl());
    }

    public function proofSubmitted(Order $order): void
    {
        $this->admin(
            __('orders.mail.proof_subject', ['code' => $order->code], 'en'),
            array_values(array_filter([
                "{$order->customer_name}, {$order->phone}",
                'Amount: '.Money::format($order->total, 'en'),
                $order->payment_reference ? "Reference: {$order->payment_reference}" : null,
            ])),
            $order,
        );
    }

    public function paymentVerified(Order $order): void
    {
        $this->customer($order, 'verified_subject', [
            __('orders.mail.verified_body', ['amount' => Money::format($order->total, $order->locale)], $order->locale),
        ], 'view_order', $order->statusUrl());
    }

    public function paymentRejected(Order $order, string $reason): void
    {
        $this->customer($order, 'rejected_subject', [
            __('orders.mail.rejected_body', ['reason' => $reason], $order->locale),
        ], 'rejected_action', $order->statusUrl());
    }

    public function reviewRequest(Order $order): void
    {
        $this->customer($order, 'review_subject', [
            __('orders.mail.review_body', ['code' => $order->code], $order->locale),
        ], 'review_action', $this->reviewUrl($order));
    }

    public function reviewUrl(Order $order): string
    {
        return URL::signedRoute('review.create', ['locale' => $order->locale, 'order' => $order->code]);
    }

    /** @param list<string> $lines */
    private function admin(string $subject, array $lines, Order $order): void
    {
        $route = Notification::route('mail', $this->settings->get('notifications.admin_email'));

        $route->notify(new AdminAlert($subject, $lines, route('admin.orders.show', $order)));
    }

    /** @param list<string> $lines */
    private function customer(Order $order, string $subjectKey, array $lines, string $actionKey, string $url): void
    {
        if (! $order->email) {
            return;
        }

        Notification::route('mail', $order->email)->notify(new CustomerMessage(
            __("orders.mail.{$subjectKey}", ['code' => $order->code], $order->locale),
            $lines,
            __("orders.mail.{$actionKey}", [], $order->locale),
            $url,
            $order->locale,
        ));
    }
}
