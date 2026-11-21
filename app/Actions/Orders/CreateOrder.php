<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Events\OrderPlaced;
use App\Models\Design;
use App\Models\Order;
use App\Payments\PaymentManager;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CreateOrder
{
    private const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    public function __construct(private readonly PaymentManager $payments) {}

    /**
     * @param  array<string, mixed>  $data  validated checkout input
     * @param  array<string, mixed>  $context  ip, user agent, locale, attribution
     */
    public function handle(array $data, array $context = []): Order
    {
        $method = PaymentMethod::from($data['payment_method']);
        $quantity = (int) $data['quantity'];

        $order = DB::transaction(function () use ($data, $context, $method, $quantity) {
            // The row lock makes concurrent buyers of the same design queue up here.
            $design = Design::query()
                ->where('key', $data['design'])
                ->where('is_active', true)
                ->lockForUpdate()
                ->first();

            if (! $design || $design->stock < 1) {
                throw ValidationException::withMessages(['design' => __('orders.validation.design_sold_out')]);
            }

            if ($design->stock < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => __('orders.validation.not_enough_stock', ['count' => $design->stock]),
                ]);
            }

            $product = $design->product;
            $quote = $this->payments->quote($product, $method, $quantity);
            $gateway = $this->payments->for($method);

            $design->update(['stock' => $design->stock - $quantity]);

            $order = $this->insertWithUniqueCode([
                'access_token' => Str::random(40),
                'event_id' => (string) Str::uuid(),
                'status' => OrderStatus::Pending,
                'payment_method' => $method,
                'payment_status' => $gateway->initialStatus(),
                'subtotal' => $quote['subtotal'],
                'discount_amount' => $quote['discount'],
                'shipping_amount' => $quote['shipping'],
                'total' => $quote['total'],
                'customer_name' => $data['customer_name'],
                'phone' => $data['phone'],
                'alt_phone' => $data['alt_phone'] ?? null,
                'email' => $data['email'] ?? null,
                'governorate' => $data['governorate'],
                'city' => $data['city'],
                'address' => $data['address'],
                'notes' => $data['notes'] ?? null,
                'locale' => $context['locale'] ?? app()->getLocale(),
                'ip' => $context['ip'] ?? null,
                'user_agent' => isset($context['user_agent']) ? Str::limit($context['user_agent'], 1000, '') : null,
                'tracking_context' => $context['tracking'] ?? null,
                ...collect($context['attribution'] ?? [])->only([
                    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
                    'gclid', 'fbclid', 'ttclid', 'referrer', 'landing_page',
                ])->all(),
            ]);

            $order->items()->create([
                'product_id' => $product->id,
                'design_id' => $design->id,
                'product_name' => $product->getTranslation('name', $order->locale),
                'design_name' => $design->getTranslation('name', $order->locale),
                'quantity' => $quantity,
                'unit_price' => intdiv($quote['total'], $quantity),
                'line_total' => $quote['total'],
                'cover_name' => $data['cover_name'] ?? null,
                'gift_message' => $data['gift_message'] ?? null,
            ]);

            $order->histories()->create(['to_status' => OrderStatus::Pending, 'created_at' => now()]);

            return $order;
        });

        OrderPlaced::dispatch($order);

        return $order;
    }

    /** @param array<string, mixed> $attributes */
    private function insertWithUniqueCode(array $attributes): Order
    {
        for ($attempt = 0; $attempt < 8; $attempt++) {
            $code = 'SAT-'.collect(range(1, 5))
                ->map(fn () => self::CODE_ALPHABET[random_int(0, strlen(self::CODE_ALPHABET) - 1)])
                ->implode('');

            if (Order::query()->where('code', $code)->exists()) {
                continue;
            }

            try {
                return Order::query()->create([...$attributes, 'code' => $code]);
            } catch (UniqueConstraintViolationException) {
                continue;
            }
        }

        throw new \RuntimeException('Could not generate a unique order code.');
    }
}
