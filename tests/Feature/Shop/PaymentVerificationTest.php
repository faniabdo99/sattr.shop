<?php

use App\Actions\Orders\CreateOrder;
use App\Actions\Orders\FlagStaleInstaPayOrders;
use App\Enums\OrderStatus;
use App\Enums\PaymentRecordStatus;
use App\Enums\PaymentStatus;
use App\Jobs\SendTrackingEvent;
use App\Models\Order;
use App\Models\User;
use App\Notifications\AdminAlert;
use App\Notifications\CustomerMessage;
use App\Services\Settings;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Notification::fake();
    Storage::fake('local');
    shop();
});

function instapayOrder(array $overrides = []): Order
{
    return app(CreateOrder::class)->handle(checkoutData(['payment_method' => 'instapay', ...$overrides]), ['locale' => 'en']);
}

function proofUrl(Order $order): string
{
    return route('order.proof', ['locale' => 'en', 'order' => $order->code, 't' => $order->access_token]);
}

it('accepts a transfer screenshot and waits for verification', function () {
    $order = instapayOrder();

    $this->post(proofUrl($order), [
        'proof' => UploadedFile::fake()->image('transfer.jpg'),
        'reference' => 'TX-99887',
    ])->assertRedirect($order->statusUrl());

    $order->refresh();
    $payment = $order->payments()->sole();

    expect($order->payment_status)->toBe(PaymentStatus::AwaitingVerification)
        ->and($order->status)->toBe(OrderStatus::Pending)
        ->and($order->payment_reference)->toBe('TX-99887')
        ->and($payment->status)->toBe(PaymentRecordStatus::Submitted)
        ->and($payment->amount)->toBe(76400);

    Storage::disk('local')->assertExists($payment->proof_path);
    Notification::assertSentOnDemand(AdminAlert::class, fn (AdminAlert $alert) => str_contains($alert->subject, 'Payment proof'));
});

it('accepts a reference number without a screenshot', function () {
    $order = instapayOrder();

    $this->post(proofUrl($order), ['reference' => 'TX-1'])->assertRedirect();

    expect($order->fresh()->payment_status)->toBe(PaymentStatus::AwaitingVerification);
});

it('needs a screenshot or a reference', function () {
    $order = instapayOrder();

    $this->post(proofUrl($order), [])->assertSessionHasErrors(['proof', 'reference']);
});

it('rejects files that are not images or are over 5 MB', function (UploadedFile $file) {
    $order = instapayOrder();

    $this->post(proofUrl($order), ['proof' => $file])->assertSessionHasErrors('proof');
})->with([
    'a PDF' => [fn () => UploadedFile::fake()->create('proof.pdf', 100, 'application/pdf')],
    'a 6 MB image' => [fn () => UploadedFile::fake()->image('big.jpg')->size(6000)],
]);

it('refuses proof without the order token or for cash orders', function () {
    $order = instapayOrder();
    $cod = instapayOrder(['payment_method' => 'cod', 'phone' => '01112345678']);

    $this->post(route('order.proof', ['locale' => 'en', 'order' => $order->code]), ['reference' => 'X'])->assertNotFound();
    $this->post(proofUrl($cod), ['reference' => 'X'])->assertNotFound();
});

it('lets an admin verify the payment, which confirms the order', function () {
    $order = instapayOrder();
    $this->post(proofUrl($order), ['reference' => 'TX-1']);
    $admin = admin();

    $this->actingAs($admin)->post(route('admin.orders.verify', $order))->assertRedirect();

    $order->refresh();

    expect($order->payment_status)->toBe(PaymentStatus::Paid)
        ->and($order->paid_at)->not->toBeNull()
        ->and($order->verified_by)->toBe($admin->id)
        ->and($order->status)->toBe(OrderStatus::Confirmed)
        ->and($order->payments()->sole()->status)->toBe(PaymentRecordStatus::Verified)
        ->and($order->histories()->count())->toBe(2);

    Notification::assertSentOnDemand(CustomerMessage::class, fn (CustomerMessage $message) => str_contains($message->subject, 'Payment confirmed'));
});

it('lets an admin reject the proof with a reason the customer receives', function () {
    $order = instapayOrder();
    $this->post(proofUrl($order), ['reference' => 'TX-1']);

    $this->actingAs(admin())
        ->post(route('admin.orders.reject', $order), ['reason' => 'The amount sent was 700, not 764.'])
        ->assertRedirect();

    $order->refresh();

    expect($order->payment_status)->toBe(PaymentStatus::Unpaid)
        ->and($order->status)->toBe(OrderStatus::Pending)
        ->and($order->payments()->sole()->rejection_reason)->toBe('The amount sent was 700, not 764.');

    Notification::assertSentOnDemand(CustomerMessage::class, fn (CustomerMessage $message) => str_contains($message->lines[0], '700, not 764'));

    // The customer can send proof again.
    $this->post(proofUrl($order), ['reference' => 'TX-2'])->assertRedirect();
    expect($order->fresh()->payment_status)->toBe(PaymentStatus::AwaitingVerification);
});

it('requires a reason to reject', function () {
    $order = instapayOrder();

    $this->actingAs(admin())->post(route('admin.orders.reject', $order), ['reason' => ''])->assertSessionHasErrors('reason');
});

it('does not let customers or guests verify payments', function () {
    $order = instapayOrder();

    $this->post(route('admin.orders.verify', $order))->assertRedirect('/login');
    $this->actingAs(User::factory()->create())->post(route('admin.orders.verify', $order))->assertForbidden();

    expect($order->fresh()->payment_status)->toBe(PaymentStatus::Unpaid);
});

it('serves payment proofs to admins only', function () {
    $order = instapayOrder();
    $this->post(proofUrl($order), ['proof' => UploadedFile::fake()->image('transfer.jpg')]);
    $payment = $order->payments()->sole();
    $url = route('admin.orders.proof', [$order, $payment]);

    $this->get($url)->assertRedirect('/login');
    $this->actingAs(User::factory()->create())->get($url)->assertForbidden();
    $this->actingAs(admin())->get($url)->assertOk();
});

it('flags, but does not cancel, InstaPay orders unpaid after 24 hours', function () {
    $stale = instapayOrder();
    $fresh = instapayOrder(['phone' => '01112345678']);
    $cod = instapayOrder(['payment_method' => 'cod', 'phone' => '01212345678']);

    Order::query()->whereKey([$stale->id, $cod->id])->update(['created_at' => now()->subHours(25)]);

    expect(app(FlagStaleInstaPayOrders::class)->handle())->toBe(1);

    expect($stale->fresh()->payment_flagged_at)->not->toBeNull()
        ->and($stale->fresh()->status)->toBe(OrderStatus::Pending)
        ->and($fresh->fresh()->payment_flagged_at)->toBeNull()
        ->and($cod->fresh()->payment_flagged_at)->toBeNull();

    $this->artisan('orders:flag-stale-instapay')->assertSuccessful();
});

it('sends the server-side payment_verified event only to configured providers', function () {
    Queue::fake();
    $order = instapayOrder();

    $this->actingAs(admin())->post(route('admin.orders.verify', $order));
    Queue::assertNotPushed(SendTrackingEvent::class);

    app(Settings::class)->put(['tracking.meta_pixel_id' => '123', 'tracking.meta_capi_token' => 'token']);
    $second = instapayOrder(['phone' => '01112345678']);

    Queue::assertPushed(SendTrackingEvent::class, fn (SendTrackingEvent $job) => $job->event === 'purchase' && $job->payload['event_id'] === $second->event_id);

    $this->actingAs(admin())->post(route('admin.orders.verify', $second));

    Queue::assertPushed(SendTrackingEvent::class, fn (SendTrackingEvent $job) => $job->event === 'payment_verified' && $job->payload['value'] === 764);
});
