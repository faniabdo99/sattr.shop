<?php

use App\Http\Controllers\Site\CheckoutController;
use App\Http\Controllers\Site\FacultyController;
use App\Http\Controllers\Site\FeedController;
use App\Http\Controllers\Site\HomeController;
use App\Http\Controllers\Site\JournalController;
use App\Http\Controllers\Site\LocaleRedirectController;
use App\Http\Controllers\Site\OrderController;
use App\Http\Controllers\Site\PageController;
use App\Http\Controllers\Site\ProductController;
use App\Http\Controllers\Site\ReviewController;
use App\Http\Controllers\Site\RobotsController;
use App\Http\Controllers\Site\SitemapController;
use App\Services\NotFoundPage;
use App\Services\Seo\SeoBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Spatie\ResponseCache\Middlewares\CacheResponse;
use Spatie\ResponseCache\Middlewares\DoNotCacheResponse;

Route::get('/', LocaleRedirectController::class)->name('root');

Route::get('robots.txt', RobotsController::class)->name('robots');
Route::get('sitemap.xml', [SitemapController::class, 'index'])->name('sitemap.index');
Route::get('sitemaps/{section}.xml', [SitemapController::class, 'section'])->name('sitemap.section');
Route::get('feeds/google.xml', [FeedController::class, 'google'])->name('feeds.google');
Route::get('feeds/meta.xml', [FeedController::class, 'meta'])->name('feeds.meta');

require __DIR__.'/admin.php';
require __DIR__.'/settings.php';

Route::prefix('{locale}')
    ->whereIn('locale', config('sattr.locales'))
    ->middleware('locale')
    ->group(function () {
        // Cached, crawlable pages.
        Route::middleware([CacheResponse::class, 'cache.headers:public;max_age=60;etag'])->group(function () {
            Route::get('/', HomeController::class)->name('home');
            Route::get('gift-pack', ProductController::class)->name('product');
            Route::get('gifts/{slug}', FacultyController::class)->name('faculty');
            Route::get('journal', [JournalController::class, 'index'])->name('journal.index');
            Route::get('journal/category/{slug}', [JournalController::class, 'category'])->name('journal.category');
            Route::get('journal/{slug}', [JournalController::class, 'show'])->name('journal.show');
        });

        // Per-visitor pages: never cached, never indexed.
        Route::middleware(DoNotCacheResponse::class)->group(function () {
            Route::get('checkout', [CheckoutController::class, 'show'])->name('checkout');
            Route::post('checkout', [CheckoutController::class, 'store'])->middleware('throttle:30,1')->name('checkout.store');
            Route::get('order/{order:code}', [OrderController::class, 'show'])->name('order.show');
            Route::post('order/{order:code}/proof', [OrderController::class, 'proof'])->middleware('throttle:20,60')->name('order.proof');
            Route::get('review/{order:code}', [ReviewController::class, 'create'])->middleware('signed')->name('review.create');
            Route::post('review/{order:code}', [ReviewController::class, 'store'])->middleware(['signed', 'throttle:10,60'])->name('review.store');
        });

        Route::get('{slug}', PageController::class)
            ->middleware([CacheResponse::class, 'cache.headers:public;max_age=60;etag'])
            ->name('page');
    });

// Brand styleguide: local development only.
if (app()->isLocal()) {
    Route::get('styleguide', function (Request $request) {
        $locale = $request->query('lang') === 'en' ? 'en' : 'ar';

        app()->setLocale($locale);
        URL::defaults(['locale' => $locale]);
        $request->attributes->set('storefront', true);

        return Inertia::render('site/styleguide', [
            'seo' => app(SeoBuilder::class)->make(
                title: 'Styleguide',
                description: null,
                alternates: ['ar' => url('/styleguide'), 'en' => url('/styleguide?lang=en')],
                noindex: true,
            )->toArray(),
        ]);
    })->name('styleguide');
}

Route::fallback(fn (Request $request) => app(NotFoundPage::class)->response($request));
