<?php

use App\Models\Design;
use App\Models\Faq;
use App\Models\Page;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/**
 * A minimal shop: the Gift Pack at 849 EGP with a 10% InstaPay discount,
 * one design with a published faculty page, and one FAQ.
 *
 * @return array{product: Product, design: Design, page: Page}
 */
function shop(int $stock = 10): array
{
    $product = Product::factory()->create(['slug' => 'gift-pack']);

    $design = Design::factory()->for($product)->create([
        'key' => 'medical',
        'name' => ['ar' => 'الطب', 'en' => 'Medical'],
        'stock' => $stock,
    ]);

    $page = Page::factory()->faculty($design)->create([
        'slug' => ['ar' => 'هدايا-طلاب-الطب', 'en' => 'medical-student'],
        'title' => ['ar' => 'هدية لطالب الطب', 'en' => 'A gift for the medical student'],
    ]);

    Faq::factory()->create();

    return compact('product', 'design', 'page');
}

/**
 * Valid checkout input.
 *
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function checkoutData(array $overrides = []): array
{
    return [
        'design' => 'medical',
        'quantity' => 1,
        'gift_message' => 'Congratulations',
        'customer_name' => 'Sarah Ahmed',
        'phone' => '01012345678',
        'email' => 'sarah@example.com',
        'governorate' => 'cairo',
        'city' => 'Nasr City',
        'address' => '12 Tahrir Street',
        'payment_method' => 'instapay',
        ...$overrides,
    ];
}

function admin(): User
{
    return User::factory()->admin()->create();
}
