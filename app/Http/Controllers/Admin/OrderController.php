<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Orders\ChangeOrderStatus;
use App\Actions\Orders\RejectPayment;
use App\Actions\Orders\VerifyPayment;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BulkOrdersRequest;
use App\Http\Requests\Admin\RejectPaymentRequest;
use App\Http\Requests\Admin\UpdateOrderRequest;
use App\Models\Design;
use App\Models\Order;
use App\Services\OrderNotifier;
use App\Support\AdminPresent;
use App\Support\Money;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    private const FILTERS = ['search', 'status', 'payment_method', 'payment_status', 'design', 'governorate', 'from', 'to', 'flagged'];

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Order::class);

        $orders = $this->filtered($request)->with('items')->latest()->paginate(25)->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => collect($orders->items())->map(fn (Order $order) => AdminPresent::orderRow($order))->all(),
            'pagination' => [
                'prev' => $orders->previousPageUrl(),
                'next' => $orders->nextPageUrl(),
                'from' => $orders->firstItem(),
                'to' => $orders->lastItem(),
                'total' => $orders->total(),
            ],
            'filters' => (object) $request->only(self::FILTERS),
            'options' => [
                'statuses' => AdminPresent::options(OrderStatus::class),
                'payment_methods' => AdminPresent::options(PaymentMethod::class),
                'payment_statuses' => AdminPresent::options(PaymentStatus::class),
                'designs' => Design::query()->orderBy('sort')->get()->map(fn (Design $design) => [
                    'value' => (string) $design->id,
                    'label' => $design->getTranslation('name', 'en'),
                ])->all(),
                'governorates' => collect(config('egypt.governorates'))->map(fn (array $names, string $key) => ['value' => $key, 'label' => $names['en']])->values()->all(),
            ],
            'urls' => [
                'index' => route('admin.orders.index'),
                'export' => route('admin.orders.export', $request->only(self::FILTERS)),
                'bulk' => route('admin.orders.bulk'),
            ],
        ]);
    }

    public function show(Order $order, OrderNotifier $notifier): Response
    {
        Gate::authorize('view', $order);

        $order->load(['items.design', 'histories.user', 'payments.verifier', 'verifier', 'review']);
        $item = $order->items->first();

        return Inertia::render('admin/orders/show', [
            'order' => [
                ...AdminPresent::orderRow($order),
                'alt_phone' => $order->alt_phone,
                'email' => $order->email,
                'city' => $order->city,
                'address' => $order->address,
                'notes' => $order->notes,
                'locale' => $order->locale,
                'subtotal_label' => Money::format($order->subtotal, 'en'),
                'discount_label' => Money::format($order->discount_amount, 'en'),
                'cod_label' => Money::format($order->codAmount(), 'en'),
                'cover_name' => $item?->cover_name,
                'gift_message' => $item?->gift_message,
                'tint' => $item?->design?->tint,
                'paid_at' => $order->paid_at?->timezone('Africa/Cairo')->format('d M Y, H:i'),
                'verified_by' => $order->verifier?->name,
                'payment_reference' => $order->payment_reference,
                'flagged_at' => $order->payment_flagged_at?->timezone('Africa/Cairo')->format('d M Y, H:i'),
                'internal_notes' => $order->internal_notes,
                'bosta_tracking_number' => $order->bosta_tracking_number,
                'ip' => $order->ip,
                'user_agent' => $order->user_agent,
                'attribution' => collect($order->only(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'ttclid', 'referrer', 'landing_page']))->filter()->all(),
                'status_url' => $order->statusUrl(),
                'whatsapp_url' => 'https://wa.me/'.$order->whatsappPhone().'?text='.rawurlencode($order->statusUrl()),
                'review' => $order->review ? ['rating' => $order->review->rating, 'status' => $order->review->status->value] : null,
                'review_url' => $notifier->reviewUrl($order),
            ],
            'payments' => $order->payments->map(fn ($payment) => [
                'id' => $payment->id,
                'status' => $payment->status->value,
                'reference' => $payment->reference,
                'rejection_reason' => $payment->rejection_reason,
                'created_at' => $payment->created_at?->timezone('Africa/Cairo')->format('d M Y, H:i'),
                'verifier' => $payment->verifier?->name,
                'proof_url' => $payment->proof_path ? route('admin.orders.proof', [$order, $payment]) : null,
            ])->all(),
            'history' => $order->histories->map(fn ($entry) => [
                'id' => $entry->id,
                'from' => $entry->from_status?->label('en'),
                'to' => $entry->to_status->label('en'),
                'note' => $entry->note,
                'by' => $entry->user?->name,
                'at' => $entry->created_at?->timezone('Africa/Cairo')->format('d M Y, H:i'),
            ])->reverse()->values()->all(),
            'options' => [
                'statuses' => AdminPresent::options(OrderStatus::class),
                'payment_statuses' => AdminPresent::options(PaymentStatus::class),
            ],
            'urls' => [
                'index' => route('admin.orders.index'),
                'update' => route('admin.orders.update', $order),
                'verify' => route('admin.orders.verify', $order),
                'reject' => route('admin.orders.reject', $order),
                'slip' => route('admin.orders.slip', $order),
            ],
        ]);
    }

    public function update(UpdateOrderRequest $request, Order $order, ChangeOrderStatus $changeStatus): RedirectResponse
    {
        Gate::authorize('update', $order);

        $data = $request->validated();

        $order->fill(collect($data)->only(['internal_notes', 'bosta_tracking_number'])->all());

        if (isset($data['payment_status'])) {
            $status = PaymentStatus::from($data['payment_status']);
            $order->payment_status = $status;
            $order->paid_at = $status === PaymentStatus::Paid ? ($order->paid_at ?? now()) : $order->paid_at;
        }

        $order->save();

        if (isset($data['status'])) {
            $changeStatus->handle($order, OrderStatus::from($data['status']), $request->user(), $data['status_note'] ?? null);
        }

        return back()->with('success', 'Order updated.');
    }

    public function bulk(BulkOrdersRequest $request, ChangeOrderStatus $changeStatus): RedirectResponse
    {
        $status = OrderStatus::from($request->validated('status'));

        Order::query()->whereKey($request->validated('ids'))->with('items')->get()
            ->each(fn (Order $order) => $changeStatus->handle($order, $status, $request->user(), 'Bulk update'));

        return back()->with('success', 'Orders updated.');
    }

    public function verify(Request $request, Order $order, VerifyPayment $verify): RedirectResponse
    {
        Gate::authorize('update', $order);

        $verify->handle($order, $request->user());

        return back()->with('success', 'Payment verified.');
    }

    public function reject(RejectPaymentRequest $request, Order $order, RejectPayment $reject): RedirectResponse
    {
        Gate::authorize('update', $order);

        $reject->handle($order, $request->user(), $request->validated('reason'));

        return back()->with('success', 'Payment rejected and the customer notified.');
    }

    public function proof(Order $order, int $payment): StreamedResponse
    {
        Gate::authorize('view', $order);

        $record = $order->payments()->whereKey($payment)->firstOrFail();

        abort_unless($record->proof_path && Storage::disk('local')->exists($record->proof_path), 404);

        return Storage::disk('local')->response($record->proof_path, null, ['Cache-Control' => 'private, no-store']);
    }

    public function slip(Order $order): Response
    {
        Gate::authorize('view', $order);

        $order->load('items.design');
        $item = $order->items->first();

        return Inertia::render('admin/orders/slip', [
            'order' => [
                'code' => $order->code,
                'date' => $order->created_at?->timezone('Africa/Cairo')->format('d M Y'),
                'customer_name' => $order->customer_name,
                'phone' => $order->phone,
                'alt_phone' => $order->alt_phone,
                'address' => $order->address,
                'city' => $order->city,
                'governorate' => config("egypt.governorates.{$order->governorate}.ar", $order->governorate),
                'notes' => $order->notes,
                'design' => $item?->design?->getTranslation('name', 'en').' / '.$item?->design?->getTranslation('name', 'ar'),
                'quantity' => $item?->quantity,
                'cover_name' => $item?->cover_name,
                'gift_message' => $item?->gift_message,
                'payment_method' => $order->payment_method->label('en'),
                'payment_status' => $order->payment_status->label('en'),
                'cod_amount' => $order->codAmount(),
                'cod_label' => Money::format($order->codAmount(), 'en'),
                'tracking' => $order->bosta_tracking_number,
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        Gate::authorize('viewAny', Order::class);

        $columns = [
            'code', 'created_at', 'status', 'payment_method', 'payment_status', 'customer_name', 'phone', 'alt_phone', 'email',
            'governorate', 'city', 'address', 'design', 'quantity', 'cover_name', 'gift_message', 'subtotal', 'discount', 'total',
            'payment_reference', 'paid_at', 'bosta_tracking_number', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term',
            'utm_content', 'gclid', 'fbclid', 'ttclid', 'referrer', 'landing_page', 'locale',
        ];

        $query = $this->filtered($request)->with('items')->oldest('id');

        return response()->streamDownload(function () use ($query, $columns) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // BOM so Excel reads Arabic correctly
            fputcsv($out, $columns);

            $query->chunkById(200, function ($orders) use ($out) {
                foreach ($orders as $order) {
                    $item = $order->items->first();

                    fputcsv($out, array_map(self::csvSafe(...), [
                        $order->code, $order->created_at?->timezone('Africa/Cairo')->toDateTimeString(), $order->status->value,
                        $order->payment_method->value, $order->payment_status->value, $order->customer_name, $order->phone,
                        $order->alt_phone, $order->email, $order->governorate, $order->city, $order->address,
                        $item?->design_name, $item?->quantity, $item?->cover_name, $item?->gift_message,
                        Money::decimal($order->subtotal), Money::decimal($order->discount_amount), Money::decimal($order->total),
                        $order->payment_reference, $order->paid_at?->timezone('Africa/Cairo')->toDateTimeString(),
                        $order->bosta_tracking_number, $order->utm_source, $order->utm_medium, $order->utm_campaign,
                        $order->utm_term, $order->utm_content, $order->gclid, $order->fbclid, $order->ttclid,
                        $order->referrer, $order->landing_page, $order->locale,
                    ]));
                }
            });

            fclose($out);
        }, 'sattr-orders-'.now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /** Stops spreadsheet apps treating customer text as a formula. */
    private static function csvSafe(mixed $value): mixed
    {
        return is_string($value) && preg_match('/^[=+\-@\t\r]/', $value) && ! preg_match('/^\+?\d+$/', $value)
            ? "'".$value
            : $value;
    }

    /** @return Builder<Order> */
    private function filtered(Request $request): Builder
    {
        $search = trim((string) $request->query('search'));

        return Order::query()
            ->when($search !== '', fn (Builder $query) => $query->where(function (Builder $inner) use ($search) {
                $like = '%'.addcslashes($search, '%_').'%';
                $inner->where('code', 'like', $like)->orWhere('customer_name', 'like', $like)->orWhere('phone', 'like', $like);
            }))
            ->when($request->query('status'), fn (Builder $query, $value) => $query->where('status', $value))
            ->when($request->query('payment_method'), fn (Builder $query, $value) => $query->where('payment_method', $value))
            ->when($request->query('payment_status'), fn (Builder $query, $value) => $query->where('payment_status', $value))
            ->when($request->query('governorate'), fn (Builder $query, $value) => $query->where('governorate', $value))
            ->when($request->query('design'), fn (Builder $query, $value) => $query->whereHas('items', fn (Builder $items) => $items->where('design_id', $value)))
            ->when($request->query('from'), fn (Builder $query, $value) => $query->where('created_at', '>=', Carbon::parse($value, 'Africa/Cairo')->startOfDay()->utc()))
            ->when($request->query('to'), fn (Builder $query, $value) => $query->where('created_at', '<=', Carbon::parse($value, 'Africa/Cairo')->endOfDay()->utc()))
            ->when($request->boolean('flagged'), fn (Builder $query) => $query->whereNotNull('payment_flagged_at')->where('payment_status', PaymentStatus::Unpaid));
    }
}
