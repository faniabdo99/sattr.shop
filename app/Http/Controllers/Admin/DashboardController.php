<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Design;
use App\Models\Order;
use App\Models\OrderItem;
use App\Support\AdminPresent;
use App\Support\Money;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $periods = [
            'Today' => now('Africa/Cairo')->startOfDay()->utc(),
            'Last 7 days' => now()->subDays(7),
            'Last 30 days' => now()->subDays(30),
        ];

        $month = now()->subDays(30);

        $byMethod = $this->valid()->where('created_at', '>=', $month)
            ->selectRaw('payment_method, count(*) as orders, sum(total) as revenue')
            ->groupBy('payment_method')->get()->keyBy(fn ($row) => $row->payment_method->value);

        $monthOrders = max(1, (int) $byMethod->sum('orders'));

        return Inertia::render('admin/dashboard', [
            'periods' => collect($periods)->map(function ($since, string $label) {
                $rows = $this->valid()->where('created_at', '>=', $since)
                    ->selectRaw('payment_method, count(*) as orders, sum(total) as revenue')
                    ->groupBy('payment_method')->get();

                return [
                    'label' => $label,
                    'orders' => (int) $rows->sum('orders'),
                    'revenue' => Money::format((int) $rows->sum('revenue'), 'en'),
                    'methods' => collect(PaymentMethod::cases())->map(function (PaymentMethod $method) use ($rows) {
                        $row = $rows->first(fn ($item) => $item->payment_method === $method);

                        return [
                            'label' => $method->label('en'),
                            'orders' => (int) ($row->orders ?? 0),
                            'revenue' => Money::format((int) ($row->revenue ?? 0), 'en'),
                        ];
                    })->all(),
                ];
            })->values()->all(),
            'share' => collect(PaymentMethod::cases())->map(fn (PaymentMethod $method) => [
                'label' => $method->label('en'),
                'orders' => (int) ($byMethod[$method->value]->orders ?? 0),
                'percent' => (int) round(100 * (int) ($byMethod[$method->value]->orders ?? 0) / $monthOrders),
            ])->all(),
            'pending_verifications' => Order::query()->where('payment_status', PaymentStatus::AwaitingVerification)->count(),
            'flagged' => Order::query()->whereNotNull('payment_flagged_at')->where('payment_status', PaymentStatus::Unpaid)->count(),
            'new_orders' => Order::query()->where('status', OrderStatus::Pending)->count(),
            'stock' => Design::query()->orderBy('sort')->get()->map(fn (Design $design) => [
                'name' => $design->getTranslation('name', 'en'),
                'tint' => $design->tint,
                'stock' => $design->stock,
                'active' => $design->is_active,
            ])->all(),
            'stock_total' => (int) Design::query()->sum('stock'),
            'top_faculties' => OrderItem::query()
                ->whereHas('order', fn (Builder $query) => $query->whereNotIn('status', [OrderStatus::Cancelled, OrderStatus::Returned])->where('created_at', '>=', $month))
                ->selectRaw('design_id, sum(quantity) as packs')
                ->groupBy('design_id')->orderByDesc('packs')->limit(8)->with('design')->get()
                ->map(fn ($row) => ['name' => $row->design?->getTranslation('name', 'en') ?? '—', 'packs' => (int) $row->packs])->all(),
            'top_sources' => $this->valid()->where('created_at', '>=', $month)
                ->selectRaw("coalesce(utm_source, 'direct') as source, coalesce(utm_medium, '') as medium, count(*) as orders, sum(total) as revenue")
                ->groupBy('source', 'medium')->orderByDesc('orders')->limit(8)->get()
                ->map(fn ($row) => [
                    'source' => $row->source,
                    'medium' => $row->medium,
                    'orders' => (int) $row->orders,
                    'revenue' => Money::format((int) $row->revenue, 'en'),
                ])->all(),
            'recent' => Order::query()->with('items')->latest()->limit(6)->get()->map(fn (Order $order) => AdminPresent::orderRow($order))->all(),
            'orders_url' => route('admin.orders.index'),
        ]);
    }

    /** @return Builder<Order> */
    private function valid(): Builder
    {
        return Order::query()->whereNotIn('status', [OrderStatus::Cancelled, OrderStatus::Returned]);
    }
}
