<?php

namespace App\Http\Controllers\Site;

use App\Actions\Orders\SubmitPaymentProof;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentRecordStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Site\PaymentProofRequest;
use App\Models\Order;
use App\Services\Seo\SeoBuilder;
use App\Services\Settings;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function show(Request $request, Order $order, SeoBuilder $seo, Settings $settings): Response
    {
        abort_unless($order->tokenMatches($request->query('t')), 404);

        $order->load(['items.design', 'histories', 'payments']);
        $locale = app()->getLocale();
        $item = $order->items->first();
        $latestPayment = $order->payments->first();
        $whatsapp = preg_replace('/\D+/', '', (string) $settings->get('contact.whatsapp'));
        $reached = $order->histories->pluck('created_at', 'to_status.value');

        return Inertia::render('site/order', [
            'seo' => $seo->make(
                title: __('site.order.meta_title', ['code' => $order->code]),
                description: null,
                alternates: [$locale => $request->fullUrl()],
                noindex: true,
            )->toArray(),
            'order' => [
                'code' => $order->code,
                'customer_name' => $order->customer_name,
                'status' => $order->status->value,
                'status_label' => $order->status->label(),
                'closed' => in_array($order->status, [OrderStatus::Cancelled, OrderStatus::Returned], true),
                'payment_method' => $order->payment_method->value,
                'payment_method_label' => $order->payment_method->label(),
                'payment_status' => $order->payment_status->value,
                'payment_status_label' => $order->payment_status->label(),
                'subtotal_label' => Money::format($order->subtotal),
                'discount' => $order->discount_amount,
                'discount_label' => Money::format($order->discount_amount),
                'total' => $order->total,
                'total_label' => Money::format($order->total),
                'amount_plain' => (string) Money::pounds($order->total),
                'address' => collect([
                    $order->address,
                    $order->city,
                    config("egypt.governorates.{$order->governorate}.{$locale}"),
                ])->filter()->implode($locale === 'ar' ? '، ' : ', '),
                'phone' => $order->phone,
                'tracking_number' => $order->bosta_tracking_number,
                'item' => $item ? [
                    'product' => $item->product_name,
                    'design' => $item->design?->name ?? $item->design_name,
                    'design_key' => $item->design?->key,
                    'tint' => $item->design?->tint,
                    'quantity' => $item->quantity,
                    'cover_name' => $item->cover_name,
                    'gift_message' => $item->gift_message,
                ] : null,
            ],
            'timeline' => collect(OrderStatus::timeline())->map(fn (OrderStatus $status) => [
                'key' => $status->value,
                'label' => $status->label(),
                'reached' => $reached->has($status->value),
                'date' => $reached->get($status->value)?->locale($locale)->isoFormat('D MMM, h:mm a'),
            ])->all(),
            'instapay' => $order->payment_method === PaymentMethod::InstaPay ? [
                'ipa' => $settings->get('instapay.ipa'),
                'phone' => $settings->get('instapay.phone'),
                'qr' => $settings->url('instapay.qr_path'),
                'can_submit' => $order->payment_status === PaymentStatus::Unpaid && $order->status === OrderStatus::Pending,
                'rejection' => $order->payment_status === PaymentStatus::Unpaid && $latestPayment?->status === PaymentRecordStatus::Rejected
                    ? $latestPayment->rejection_reason
                    : null,
                'proof_url' => route('order.proof', ['order' => $order->code, 't' => $order->access_token]),
            ] : null,
            'whatsapp' => $whatsapp
                ? "https://wa.me/{$whatsapp}?text=".rawurlencode(__('site.order.whatsapp_text', ['code' => $order->code]))
                : null,
            'purchase' => $request->session()->get('purchase'),
        ]);
    }

    public function proof(PaymentProofRequest $request, Order $order, SubmitPaymentProof $submit): RedirectResponse
    {
        abort_unless($order->tokenMatches($request->query('t')), 404);
        abort_unless($order->payment_method === PaymentMethod::InstaPay, 404);
        abort_unless(
            $order->payment_status === PaymentStatus::Unpaid && $order->status === OrderStatus::Pending,
            409,
        );

        $submit->handle($order, $request->file('proof'), $request->validated('reference'));

        return redirect()->to($order->statusUrl());
    }
}
