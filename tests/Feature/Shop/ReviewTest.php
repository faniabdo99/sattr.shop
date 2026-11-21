<?php

use App\Actions\Orders\ChangeOrderStatus;
use App\Actions\Orders\CreateOrder;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ReviewStatus;
use App\Models\Review;
use App\Notifications\CustomerMessage;
use App\Services\OrderNotifier;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();
    shop();
});

it('asks for a review once an order is delivered and marks cash orders paid', function () {
    $order = app(CreateOrder::class)->handle(checkoutData(['payment_method' => 'cod']), ['locale' => 'en']);

    app(ChangeOrderStatus::class)->handle($order, OrderStatus::Delivered, admin());

    expect($order->fresh()->review_requested_at)->not->toBeNull()
        ->and($order->fresh()->payment_status)->toBe(PaymentStatus::Paid);

    Notification::assertSentOnDemand(CustomerMessage::class, fn (CustomerMessage $message) => str_contains($message->actionUrl, '/review/'));
});

it('stores a review as pending and shows it only after approval', function () {
    $order = app(CreateOrder::class)->handle(checkoutData(), ['locale' => 'en']);
    $url = app(OrderNotifier::class)->reviewUrl($order);

    $this->get($url)->assertOk();
    $this->post($url, ['name' => 'Sarah', 'rating' => 5, 'body' => 'Beautiful box, and the notebook paper is lovely.'])->assertRedirect();

    $review = Review::query()->sole();

    expect($review->status)->toBe(ReviewStatus::Pending)->and($review->design_id)->not->toBeNull();

    $this->get('/en/gift-pack')->assertDontSee('AggregateRating')->assertDontSee('Beautiful box');

    $this->actingAs(admin())->put(route('admin.reviews.update', $review), ['status' => 'approved'])->assertRedirect();
    auth()->logout();

    $this->get('/en/gift-pack')->assertSee('AggregateRating')->assertSee('Beautiful box');
    $this->get('/en/gifts/medical-student')->assertSee('AggregateRating');
});

it('rejects review links that are not signed', function () {
    $order = app(CreateOrder::class)->handle(checkoutData(), ['locale' => 'en']);

    $this->get("/en/review/{$order->code}")->assertForbidden();
});
