<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Models\Product;
use App\Support\AdminPresent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function edit(): Response
    {
        $product = Product::query()->with('media')->oldest('id')->firstOrFail();

        Gate::authorize('update', $product);

        return Inertia::render('admin/catalog/product', [
            'product' => [
                'id' => $product->id,
                'name' => $product->getTranslations('name'),
                'tagline' => $product->getTranslations('tagline'),
                'description' => $product->getTranslations('description'),
                'price_egp' => $product->price / 100,
                'instapay_discount_percent' => $product->instapay_discount_percent,
                'instapay_price_egp' => $product->instapayPrice() / 100,
                'contents' => $product->contents ?? [],
                'specs' => $product->specs ?? [],
                'meta_title' => $product->getTranslations('meta_title'),
                'meta_description' => $product->getTranslations('meta_description'),
                'canonical_url' => $product->canonical_url,
                'noindex' => $product->noindex,
            ],
            'media' => AdminPresent::mediaFor($product, ['hero', 'gallery', 'unboxing', 'og']),
            'update_url' => route('admin.product.update'),
        ]);
    }

    public function update(ProductRequest $request): RedirectResponse
    {
        $product = Product::query()->oldest('id')->firstOrFail();

        Gate::authorize('update', $product);

        $data = $request->validated();

        $product->update([
            ...collect($data)->except('price_egp')->all(),
            'price' => (int) round($data['price_egp'] * 100),
        ]);

        return back()->with('success', 'Product saved.');
    }
}
