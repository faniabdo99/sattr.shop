<?php

use App\Actions\Orders\CreateOrder;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Route;

it('sends guests to the login page', function (string $path) {
    $this->get($path)->assertRedirect('/login');
})->with(['/admin', '/admin/orders', '/admin/product', '/admin/designs', '/admin/pages', '/admin/articles', '/admin/settings']);

it('forbids signed-in users who are not admins', function (string $path) {
    $this->actingAs(User::factory()->create())->get($path)->assertForbidden();
})->with(['/admin', '/admin/orders', '/admin/settings', '/admin/orders/export']);

it('lets admins open every admin screen', function (string $path) {
    shop();

    $this->actingAs(admin())->get($path)->assertOk();
})->with([
    '/admin', '/admin/orders', '/admin/product', '/admin/designs', '/admin/designs/create',
    '/admin/pages', '/admin/pages?type=static', '/admin/pages/create', '/admin/articles', '/admin/articles/create',
    '/admin/faqs', '/admin/categories', '/admin/reviews', '/admin/redirects', '/admin/settings',
]);

it('has no public registration', function () {
    expect(Route::has('register'))->toBeFalse();

    $this->get('/register')->assertNotFound();
    $this->post('/register', ['name' => 'X', 'email' => 'x@example.com', 'password' => 'password', 'password_confirmation' => 'password'])
        ->assertStatus(405);

    expect(User::query()->count())->toBe(0);
});

it('filters, updates and exports orders', function () {
    Notification::fake();
    shop();
    $order = app(CreateOrder::class)->handle(checkoutData(['customer_name' => '=HYPERLINK("x")']), [
        'locale' => 'en',
        'attribution' => ['utm_source' => 'tiktok', 'ttclid' => 'tt-1'],
    ]);
    $admin = admin();

    $this->actingAs($admin)->get('/admin/orders?search='.$order->code)
        ->assertInertia(fn ($page) => $page->has('orders', 1)->where('orders.0.code', $order->code));

    $this->actingAs($admin)->get('/admin/orders?payment_method=cod')
        ->assertInertia(fn ($page) => $page->has('orders', 0));

    $this->actingAs($admin)->get(route('admin.orders.show', $order))->assertOk();
    $this->actingAs($admin)->get(route('admin.orders.slip', $order))->assertOk();

    $this->actingAs($admin)->patch(route('admin.orders.update', $order), [
        'status' => 'processing',
        'status_note' => 'Sent to print',
        'bosta_tracking_number' => 'BOSTA-1',
        'internal_notes' => 'Called the customer',
    ])->assertRedirect();

    $order->refresh();

    expect($order->status)->toBe(OrderStatus::Processing)
        ->and($order->bosta_tracking_number)->toBe('BOSTA-1')
        ->and($order->histories->last()->note)->toBe('Sent to print')
        ->and($order->histories->last()->user_id)->toBe($admin->id);

    $this->actingAs($admin)->post(route('admin.orders.bulk'), ['ids' => [$order->id], 'status' => 'shipped'])->assertRedirect();
    expect($order->fresh()->status)->toBe(OrderStatus::Shipped);

    $csv = $this->actingAs($admin)->get('/admin/orders/export')->assertOk()->streamedContent();

    expect($csv)->toContain($order->code)
        ->toContain('utm_source')
        ->toContain('tiktok')
        ->toContain('tt-1')
        // Customer text that looks like a formula is neutralised.
        ->toContain("'=HYPERLINK");
});

it('saves settings and keeps secrets out of the browser', function () {
    $admin = admin();

    $this->actingAs($admin)->post('/admin/settings', [
        'instapay_ipa' => 'sattr@instapay',
        'instapay_phone' => '01012345678',
        'tracking_meta_pixel_id' => '123456',
        'tracking_meta_capi_token' => 'secret-token',
    ])->assertRedirect();

    $this->actingAs($admin)->get('/admin/settings')->assertInertia(fn ($page) => $page
        ->where('values.instapay_ipa', 'sattr@instapay')
        ->where('values.tracking_meta_capi_token', '')
        ->where('secrets_set.tracking_meta_capi_token', true)
        ->where('server_drivers', ['meta']));

    shop();
    auth()->logout();

    $this->get('/en')->assertInertia(fn ($page) => $page
        ->where('site.tracking.metaPixel', '123456')
        ->missing('site.tracking.metaCapiToken'))
        ->assertDontSee('secret-token');
});

it('manages the catalog', function () {
    ['product' => $product, 'design' => $design] = shop();
    $admin = admin();

    $this->actingAs($admin)->put('/admin/product', [
        'name' => ['ar' => 'طقم', 'en' => 'Pack'],
        'price_egp' => 899,
        'instapay_discount_percent' => 12,
        'contents' => [],
        'specs' => [],
    ])->assertSessionHasNoErrors();

    expect($product->fresh()->price)->toBe(89900)->and($product->fresh()->instapayPrice())->toBe(79100);

    $this->actingAs($admin)->put(route('admin.designs.update', $design), [
        'key' => 'medical', 'name' => ['ar' => 'الطب', 'en' => 'Medicine'], 'tint' => '#112233', 'stock' => 4, 'sort' => 0, 'is_active' => true,
    ])->assertSessionHasNoErrors();

    expect($design->fresh()->stock)->toBe(4)->and($design->fresh()->getTranslation('name', 'en'))->toBe('Medicine');

    Order::factory()->create();
});
