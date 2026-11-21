<?php

namespace App\Http\Controllers\Site;

use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Site\ReviewRequest;
use App\Models\Order;
use App\Services\Seo\SeoBuilder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PostHog\Laravel\Facades\PostHog;

class ReviewController extends Controller
{
    public function create(Request $request, Order $order, SeoBuilder $seo): Response
    {
        $order->load(['items', 'review']);

        return Inertia::render('site/review', [
            'seo' => $seo->make(
                title: __('site.review.meta_title'),
                description: null,
                alternates: [app()->getLocale() => $request->fullUrl()],
                noindex: true,
            )->toArray(),
            'done' => $order->review !== null,
            'customer_name' => $order->customer_name,
            'design' => $order->items->first()?->design_name,
            'submit_url' => $request->fullUrl(),
        ]);
    }

    public function store(ReviewRequest $request, Order $order): RedirectResponse
    {
        if (! $order->review()->exists()) {
            $review = $order->review()->create([
                ...$request->validated(),
                'design_id' => $order->items()->value('design_id'),
                'locale' => app()->getLocale(),
                'status' => ReviewStatus::Pending,
            ]);

            PostHog::capture('review_submitted', [
                'rating' => $review->rating,
                'locale' => $review->locale,
            ]);
        }

        return redirect()->to($request->fullUrl());
    }
}
