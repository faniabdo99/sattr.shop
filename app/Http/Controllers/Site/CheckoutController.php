<?php

namespace App\Http\Controllers\Site;

use App\Actions\Orders\CreateOrder;
use App\Http\Controllers\Controller;
use App\Http\Requests\Site\CheckoutRequest;
use App\Payments\PaymentManager;
use App\Services\Seo\SeoBuilder;
use App\Services\Storefront;
use App\Support\Money;
use App\Support\SiteUrl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function show(Request $request, Storefront $storefront, PaymentManager $payments, SeoBuilder $seo): Response
    {
        $product = $storefront->product();
        $locale = app()->getLocale();

        return Inertia::render('site/checkout', [
            'seo' => $seo->make(
                title: __('site.checkout.meta_title'),
                description: null,
                alternates: SiteUrl::alternates(fn (string $l) => SiteUrl::checkout($l)),
                noindex: true,
            )->toArray(),
            'product' => $storefront->productProps(),
            'designs' => $storefront->designProps(),
            'payment_options' => $payments->options($product),
            'governorates' => collect(config('egypt.governorates'))
                ->map(fn (array $names, string $key) => ['key' => $key, 'name' => $names[$locale]])
                ->values()
                ->all(),
            'max_quantity' => config('sattr.orders.max_quantity'),
            'preset' => [
                'design' => $request->string('design')->toString() ?: null,
                'message' => Str::limit($request->string('message')->toString(), 200, ''),
            ],
            'store_url' => route('checkout.store'),
        ]);
    }

    public function store(CheckoutRequest $request, CreateOrder $createOrder): RedirectResponse
    {
        $data = $request->validated();
        $keys = ['order:ip:'.$request->ip(), 'order:phone:'.$data['phone']];
        $limit = config('sattr.orders.rate_limit_per_hour');

        foreach ($keys as $key) {
            if (RateLimiter::tooManyAttempts($key, $limit)) {
                throw ValidationException::withMessages(['throttle' => __('orders.validation.throttled')]);
            }
        }

        $order = $createOrder->handle($data, [
            'locale' => app()->getLocale(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'attribution' => $this->attribution($request),
            'tracking' => array_filter([
                'ga_client_id' => $this->gaClientId($request->cookie('_ga')),
                'fbp' => $request->cookie('_fbp'),
                'fbc' => $request->cookie('_fbc'),
                'ttp' => $request->cookie('_ttp'),
            ]),
        ]);

        foreach ($keys as $key) {
            RateLimiter::hit($key, 3600);
        }

        // Shown once on the thank-you page so the browser fires "purchase".
        $request->session()->flash('purchase', [
            'event_id' => $order->event_id,
            'transaction_id' => $order->code,
            'value' => Money::pounds($order->total),
            'payment_type' => $order->payment_method->value,
        ]);

        return redirect()->to($order->statusUrl());
    }

    /**
     * UTM tags and click IDs captured in the browser (see lib/track.ts).
     *
     * @return array<string, string>
     */
    private function attribution(Request $request): array
    {
        $raw = $request->cookie('sattr_attribution');
        $decoded = is_string($raw) ? json_decode($raw, true) : null;

        if (! is_array($decoded)) {
            return [];
        }

        return collect($decoded)
            ->filter(fn ($value) => is_string($value) && $value !== '')
            ->map(fn (string $value) => Str::limit(strip_tags($value), 250, ''))
            ->all();
    }

    private function gaClientId(mixed $cookie): ?string
    {
        // _ga looks like GA1.1.1234567890.1700000000; the client ID is the last two parts.
        if (! is_string($cookie) || ! preg_match('/(\d+\.\d+)$/', $cookie, $matches)) {
            return null;
        }

        return $matches[1];
    }
}
