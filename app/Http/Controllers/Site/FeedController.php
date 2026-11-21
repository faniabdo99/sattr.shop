<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Services\Storefront;
use App\Support\Money;
use App\Support\SiteUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\URL;

/**
 * Product feeds for Google Merchant Center and the Meta catalog.
 * One item per faculty design, grouped under the Gift Pack.
 */
class FeedController extends Controller
{
    public function google(Request $request, Storefront $storefront): Response
    {
        return $this->feed($request, $storefront, 'google');
    }

    public function meta(Request $request, Storefront $storefront): Response
    {
        return $this->feed($request, $storefront, 'meta');
    }

    private function feed(Request $request, Storefront $storefront, string $channel): Response
    {
        $locale = in_array($request->query('locale'), config('sattr.locales'), true)
            ? $request->query('locale')
            : config('sattr.default_locale');

        app()->setLocale($locale);
        URL::defaults(['locale' => $locale]);

        $product = $storefront->product();

        $items = $storefront->designs()->map(function ($design) use ($product, $storefront) {
            $images = $storefront->imageUrls($design);

            return [
                'id' => "{$product->slug}-{$design->key}",
                'group' => $product->slug,
                'title' => __('site.faculty.product_name', ['product' => $product->name, 'design' => $design->name]),
                'description' => $design->facultyPage?->excerpt ?: $product->description,
                'link' => $design->facultyPage ? SiteUrl::faculty($design->facultyPage) : SiteUrl::product(),
                'image' => $images[0] ?? null,
                'additional_images' => array_slice($images, 1, 9),
                'availability' => $design->isSoldOut() ? 'out of stock' : 'in stock',
                'price' => Money::decimal($product->price).' EGP',
                'pattern' => $design->name,
                'quantity' => $design->stock,
            ];
        });

        return response()
            ->view('feeds.products', ['items' => $items, 'channel' => $channel, 'product' => $product], 200)
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}
