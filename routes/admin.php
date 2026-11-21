<?php

use App\Http\Controllers\Admin\ArticleController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DesignController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\SimpleContentController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');

    Route::name('admin.')->group(function () {
        Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('orders/export', [OrderController::class, 'export'])->name('orders.export');
        Route::post('orders/bulk', [OrderController::class, 'bulk'])->name('orders.bulk');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{order}', [OrderController::class, 'update'])->name('orders.update');
        Route::post('orders/{order}/verify', [OrderController::class, 'verify'])->name('orders.verify');
        Route::post('orders/{order}/reject', [OrderController::class, 'reject'])->name('orders.reject');
        Route::get('orders/{order}/proof/{payment}', [OrderController::class, 'proof'])->name('orders.proof');
        Route::get('orders/{order}/slip', [OrderController::class, 'slip'])->name('orders.slip');

        Route::get('product', [ProductController::class, 'edit'])->name('product.edit');
        Route::put('product', [ProductController::class, 'update'])->name('product.update');
        Route::resource('designs', DesignController::class)->except('show');

        Route::resource('pages', PageController::class)->except('show');
        Route::resource('articles', ArticleController::class)->except('show');

        Route::controller(SimpleContentController::class)->group(function () {
            Route::get('faqs', 'faqs')->name('faqs.index');
            Route::post('faqs', 'storeFaq')->name('faqs.store');
            Route::put('faqs/{faq}', 'updateFaq')->name('faqs.update');
            Route::delete('faqs/{faq}', 'destroyFaq')->name('faqs.destroy');

            Route::get('categories', 'categories')->name('categories.index');
            Route::post('categories', 'storeCategory')->name('categories.store');
            Route::put('categories/{category}', 'updateCategory')->name('categories.update');
            Route::delete('categories/{category}', 'destroyCategory')->name('categories.destroy');

            Route::get('redirects', 'redirects')->name('redirects.index');
            Route::post('redirects', 'storeRedirect')->name('redirects.store');
            Route::put('redirects/{redirect}', 'updateRedirect')->name('redirects.update');
            Route::delete('redirects/{redirect}', 'destroyRedirect')->name('redirects.destroy');

            Route::get('reviews', 'reviews')->name('reviews.index');
            Route::put('reviews/{review}', 'updateReview')->name('reviews.update');
            Route::delete('reviews/{review}', 'destroyReview')->name('reviews.destroy');
        });

        Route::post('media', [MediaController::class, 'store'])->name('media.store');
        Route::put('media/{media}', [MediaController::class, 'update'])->name('media.update');
        Route::delete('media/{media}', [MediaController::class, 'destroy'])->name('media.destroy');

        Route::get('settings', [SettingsController::class, 'edit'])->name('settings.edit');
        Route::post('settings', [SettingsController::class, 'update'])->name('settings.update');
    });
});
