<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Requests\Admin\FaqRequest;
use App\Http\Requests\Admin\RedirectRequest;
use App\Http\Requests\Admin\ReviewModerationRequest;
use App\Models\ArticleCategory;
use App\Models\Faq;
use App\Models\Redirect;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The small list-and-edit-in-place screens: FAQ items, journal categories,
 * redirects and review moderation.
 */
class SimpleContentController extends Controller
{
    public function faqs(): Response
    {
        return Inertia::render('admin/content/faqs', [
            'faqs' => Faq::query()->orderBy('sort')->get()->map(fn (Faq $faq) => [
                'id' => $faq->id,
                'question' => $faq->getTranslations('question'),
                'answer' => $faq->getTranslations('answer'),
                'sort' => $faq->sort,
                'is_active' => $faq->is_active,
                'url' => route('admin.faqs.update', $faq),
            ])->all(),
            'store_url' => route('admin.faqs.store'),
        ]);
    }

    public function storeFaq(FaqRequest $request): RedirectResponse
    {
        Faq::query()->create([...$request->validated(), 'sort' => $request->integer('sort', (int) Faq::query()->max('sort') + 1)]);

        return back()->with('success', 'Question added.');
    }

    public function updateFaq(FaqRequest $request, Faq $faq): RedirectResponse
    {
        $faq->update($request->validated());

        return back()->with('success', 'Question saved.');
    }

    public function destroyFaq(Faq $faq): RedirectResponse
    {
        Gate::authorize('admin');
        $faq->delete();

        return back()->with('success', 'Question deleted.');
    }

    public function categories(): Response
    {
        return Inertia::render('admin/content/categories', [
            'categories' => ArticleCategory::query()->orderBy('sort')->withCount('articles')->get()->map(fn (ArticleCategory $category) => [
                'id' => $category->id,
                'name' => $category->getTranslations('name'),
                'slug' => $category->getTranslations('slug'),
                'sort' => $category->sort,
                'articles' => $category->articles_count,
                'url' => route('admin.categories.update', $category),
            ])->all(),
            'store_url' => route('admin.categories.store'),
            'articles_url' => route('admin.articles.index'),
        ]);
    }

    public function storeCategory(CategoryRequest $request): RedirectResponse
    {
        ArticleCategory::query()->create($request->validated());

        return back()->with('success', 'Category added.');
    }

    public function updateCategory(CategoryRequest $request, ArticleCategory $category): RedirectResponse
    {
        $category->update($request->validated());

        return back()->with('success', 'Category saved.');
    }

    public function destroyCategory(ArticleCategory $category): RedirectResponse
    {
        Gate::authorize('admin');
        $category->delete();

        return back()->with('success', 'Category deleted. Its articles are now uncategorised.');
    }

    public function redirects(): Response
    {
        return Inertia::render('admin/content/redirects', [
            'redirects' => Redirect::query()->latest('id')->get()->map(fn (Redirect $redirect) => [
                'id' => $redirect->id,
                'from_path' => $redirect->from_path,
                'to_url' => $redirect->to_url,
                'status_code' => $redirect->status_code,
                'hits' => $redirect->hits,
                'is_active' => $redirect->is_active,
                'url' => route('admin.redirects.update', $redirect),
            ])->all(),
            'store_url' => route('admin.redirects.store'),
        ]);
    }

    public function storeRedirect(RedirectRequest $request): RedirectResponse
    {
        Redirect::query()->create($request->validated());

        return back()->with('success', 'Redirect added.');
    }

    public function updateRedirect(RedirectRequest $request, Redirect $redirect): RedirectResponse
    {
        $redirect->update($request->validated());

        return back()->with('success', 'Redirect saved.');
    }

    public function destroyRedirect(Redirect $redirect): RedirectResponse
    {
        Gate::authorize('admin');
        $redirect->delete();

        return back()->with('success', 'Redirect deleted.');
    }

    public function reviews(): Response
    {
        Gate::authorize('viewAny', Review::class);

        return Inertia::render('admin/content/reviews', [
            'reviews' => Review::query()->with(['design', 'order'])->latest()->limit(200)->get()->map(fn (Review $review) => [
                'id' => $review->id,
                'name' => $review->name,
                'rating' => $review->rating,
                'body' => $review->body,
                'locale' => $review->locale,
                'status' => $review->status->value,
                'design' => $review->design?->getTranslation('name', 'en'),
                'order_code' => $review->order?->code,
                'order_url' => $review->order ? route('admin.orders.show', $review->order) : null,
                'date' => $review->created_at?->format('d M Y'),
                'url' => route('admin.reviews.update', $review),
            ])->all(),
        ]);
    }

    public function updateReview(ReviewModerationRequest $request, Review $review): RedirectResponse
    {
        Gate::authorize('update', $review);
        $review->update($request->validated());

        return back()->with('success', 'Review updated.');
    }

    public function destroyReview(Review $review): RedirectResponse
    {
        Gate::authorize('delete', $review);
        $review->delete();

        return back()->with('success', 'Review deleted.');
    }
}
