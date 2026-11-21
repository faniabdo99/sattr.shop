<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ArticleRequest;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\Design;
use App\Services\SearchPing;
use App\Support\AdminPresent;
use App\Support\Html;
use App\Support\SiteUrl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Article::class);

        return Inertia::render('admin/content/articles', [
            'articles' => Article::query()->with('category')->latest('id')->get()->map(fn (Article $article) => [
                'id' => $article->id,
                'title' => $article->getTranslation('title', 'en', false) ?: $article->getTranslation('title', 'ar'),
                'category' => $article->category?->getTranslation('name', 'en'),
                'published' => $article->isPublished(),
                'published_at' => $article->published_at?->timezone('Africa/Cairo')->format('d M Y'),
                'reading_minutes' => $article->reading_minutes,
                'edit_url' => route('admin.articles.edit', $article),
            ])->all(),
            'urls' => ['create' => route('admin.articles.create'), 'categories' => route('admin.categories.index')],
        ]);
    }

    public function create(): Response
    {
        return $this->form(new Article(['author_name' => 'Sattr']));
    }

    public function store(ArticleRequest $request, SearchPing $ping): RedirectResponse
    {
        Gate::authorize('create', Article::class);

        $article = Article::query()->create($this->payload($request));

        $this->ping($article, $ping);

        return redirect()->route('admin.articles.edit', $article)->with('success', 'Article created.');
    }

    public function edit(Article $article): Response
    {
        return $this->form($article->load('media'));
    }

    public function update(ArticleRequest $request, Article $article, SearchPing $ping): RedirectResponse
    {
        Gate::authorize('update', $article);

        $article->update($this->payload($request));

        $this->ping($article, $ping);

        return back()->with('success', 'Article saved.');
    }

    public function destroy(Article $article): RedirectResponse
    {
        Gate::authorize('delete', $article);

        $article->delete();

        return redirect()->route('admin.articles.index')->with('success', 'Article deleted.');
    }

    /** @return array<string, mixed> */
    private function payload(ArticleRequest $request): array
    {
        $data = $request->validated();
        $data['body'] = Html::cleanTranslations($data['body'] ?? []);

        return $data;
    }

    private function ping(Article $article, SearchPing $ping): void
    {
        if ($article->isPublished() && ! $article->noindex) {
            $ping->urls([...array_values(SiteUrl::alternates(fn (string $locale) => SiteUrl::article($article, $locale))), route('sitemap.index')]);
        }
    }

    private function form(Article $article): Response
    {
        Gate::authorize($article->exists ? 'update' : 'create', $article->exists ? $article : Article::class);

        $blank = ['ar' => '', 'en' => ''];

        return Inertia::render('admin/content/article-form', [
            'article' => [
                'id' => $article->id,
                'slug' => $article->getTranslations('slug') ?: $blank,
                'title' => $article->getTranslations('title') ?: $blank,
                'excerpt' => $article->getTranslations('excerpt') ?: $blank,
                'body' => $article->getTranslations('body') ?: $blank,
                'article_category_id' => $article->article_category_id ? (string) $article->article_category_id : '',
                'design_id' => $article->design_id ? (string) $article->design_id : '',
                'author_name' => $article->author_name ?? '',
                'published_at' => $article->published_at?->timezone('Africa/Cairo')->format('Y-m-d\TH:i') ?? '',
                'meta_title' => $article->getTranslations('meta_title') ?: $blank,
                'meta_description' => $article->getTranslations('meta_description') ?: $blank,
                'canonical_url' => $article->canonical_url,
                'noindex' => (bool) $article->noindex,
            ],
            'media' => $article->exists ? AdminPresent::mediaFor($article, ['cover', 'og']) : null,
            'categories' => ArticleCategory::query()->orderBy('sort')->get()->map(fn (ArticleCategory $category) => [
                'value' => (string) $category->id, 'label' => $category->getTranslation('name', 'en'),
            ])->all(),
            'designs' => Design::query()->orderBy('sort')->get()->map(fn (Design $design) => [
                'value' => (string) $design->id, 'label' => $design->getTranslation('name', 'en'),
            ])->all(),
            'urls' => [
                'index' => route('admin.articles.index'),
                'save' => $article->exists ? route('admin.articles.update', $article) : route('admin.articles.store'),
                'destroy' => $article->exists ? route('admin.articles.destroy', $article) : null,
                'media' => route('admin.media.store'),
                'view' => $article->exists && $article->isPublished()
                    ? ['ar' => SiteUrl::article($article, 'ar'), 'en' => SiteUrl::article($article, 'en')]
                    : null,
            ],
        ]);
    }
}
