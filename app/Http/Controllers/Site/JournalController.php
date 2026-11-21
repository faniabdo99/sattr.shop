<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Services\Seo\Schema;
use App\Services\Seo\SeoBuilder;
use App\Services\Storefront;
use App\Support\Present;
use App\Support\SiteUrl;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JournalController extends Controller
{
    public function __construct(
        private readonly SeoBuilder $seo,
        private readonly Schema $schema,
        private readonly Storefront $storefront,
    ) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('q'));

        return $this->listing(
            category: null,
            search: $search,
            title: __('site.journal.title'),
            description: __('site.journal.intro'),
            alternates: SiteUrl::alternates(fn (string $locale) => SiteUrl::journal($locale)),
        );
    }

    public function category(string $slug): Response
    {
        $category = ArticleCategory::query()->where('slug->'.app()->getLocale(), $slug)->firstOrFail();

        return $this->listing(
            category: $category,
            search: '',
            title: $category->name,
            description: __('site.journal.category_intro', ['category' => $category->name]),
            alternates: SiteUrl::alternates(fn (string $locale) => SiteUrl::category($category, $locale)),
        );
    }

    public function show(string $slug): Response
    {
        $locale = app()->getLocale();

        $article = Article::query()
            ->published()
            ->whereSlug($slug, $locale)
            ->with(['category', 'media', 'design.facultyPage'])
            ->firstOrFail();

        $url = SiteUrl::article($article);
        $cover = $article->getFirstMediaUrl('cover') ?: null;

        $related = Article::query()
            ->published()
            ->with(['category', 'media'])
            ->whereKeyNot($article->id)
            ->orderByRaw('article_category_id = ? desc', [$article->article_category_id])
            ->latest('published_at')
            ->limit(3)
            ->get();

        return Inertia::render('site/journal/show', [
            'seo' => $this->seo->make(
                title: $article->title,
                description: $article->excerpt,
                alternates: SiteUrl::alternates(fn (string $l) => SiteUrl::article($article, $l)),
                model: $article,
                type: 'article',
                schema: [
                    $this->schema->article($article, $url, $cover ? url($cover) : null),
                    $this->schema->breadcrumbs([
                        [__('site.nav.home'), SiteUrl::home()],
                        [__('site.journal.title'), SiteUrl::journal()],
                        [$article->title, $url],
                    ]),
                ],
                image: $cover,
            )->toArray(),
            'article' => [...Present::article($article), 'body' => $article->body],
            'related' => $related->map(fn ($item) => Present::article($item))->all(),
            'faculty' => $article->design?->facultyPage ? [
                'name' => $article->design->name,
                'title' => $article->design->facultyPage->title,
                'url' => SiteUrl::faculty($article->design->facultyPage),
                'tint' => $article->design->tint,
            ] : null,
            'product' => $this->storefront->productProps(),
        ]);
    }

    /** @param array<string, string> $alternates */
    private function listing(?ArticleCategory $category, string $search, string $title, string $description, array $alternates): Response
    {
        $locale = app()->getLocale();

        $articles = Article::query()
            ->published()
            ->with(['category', 'media'])
            ->when($category, fn ($query) => $query->where('article_category_id', $category->id))
            ->when($search !== '', fn ($query) => $query->where("title->{$locale}", 'like', '%'.addcslashes($search, '%_').'%'))
            ->latest('published_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('site/journal/index', [
            'seo' => $this->seo->make(
                title: $title,
                description: $description,
                alternates: $alternates,
                schema: [
                    $this->schema->breadcrumbs(array_values(array_filter([
                        [__('site.nav.home'), SiteUrl::home()],
                        [__('site.journal.title'), SiteUrl::journal()],
                        $category ? [$category->name, SiteUrl::category($category)] : null,
                    ]))),
                ],
                noindex: $search !== '' || $articles->currentPage() > 1,
            )->toArray(),
            'heading' => $title,
            'intro' => $description,
            'search' => $search,
            'journal_url' => SiteUrl::journal(),
            'articles' => collect($articles->items())->map(fn ($article) => Present::article($article))->all(),
            'pagination' => [
                'prev' => $articles->previousPageUrl(),
                'next' => $articles->nextPageUrl(),
                'current' => $articles->currentPage(),
                'last' => $articles->lastPage(),
            ],
            'categories' => ArticleCategory::query()->orderBy('sort')->get()->map(fn (ArticleCategory $item) => [
                'name' => $item->name,
                'url' => SiteUrl::category($item),
                'active' => $category?->is($item) ?? false,
            ])->all(),
        ]);
    }
}
