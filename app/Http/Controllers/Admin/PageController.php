<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PageType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PageRequest;
use App\Models\Page;
use App\Services\SearchPing;
use App\Support\AdminPresent;
use App\Support\Html;
use App\Support\SiteUrl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Page::class);

        $type = PageType::tryFrom((string) $request->query('type')) ?? PageType::Faculty;

        return Inertia::render('admin/content/pages', [
            'type' => $type->value,
            'pages' => Page::query()->ofType($type)->with('design')->orderBy('id')->get()->map(fn (Page $page) => [
                'id' => $page->id,
                'title' => $page->getTranslation('title', 'en', false) ?: $page->getTranslation('title', 'ar'),
                'slug' => $page->getTranslations('slug'),
                'design' => $page->design?->getTranslation('name', 'en'),
                'is_published' => $page->is_published,
                'noindex' => $page->noindex,
                'edit_url' => route('admin.pages.edit', $page),
            ])->all(),
            'urls' => [
                'faculty' => route('admin.pages.index', ['type' => 'faculty']),
                'static' => route('admin.pages.index', ['type' => 'static']),
                'create' => route('admin.pages.create'),
            ],
        ]);
    }

    public function create(): Response
    {
        return $this->form(new Page(['type' => PageType::StaticPage, 'is_published' => false]));
    }

    public function store(PageRequest $request, SearchPing $ping): RedirectResponse
    {
        Gate::authorize('create', Page::class);

        $page = Page::query()->create([...$this->payload($request), 'type' => PageType::StaticPage]);

        $this->ping($page, $ping);

        return redirect()->route('admin.pages.edit', $page)->with('success', 'Page created.');
    }

    public function edit(Page $page): Response
    {
        return $this->form($page->load('media'));
    }

    public function update(PageRequest $request, Page $page, SearchPing $ping): RedirectResponse
    {
        Gate::authorize('update', $page);

        $page->update($this->payload($request));

        $this->ping($page, $ping);

        return back()->with('success', 'Page saved.');
    }

    public function destroy(Page $page): RedirectResponse
    {
        Gate::authorize('delete', $page);

        if ($page->key !== null) {
            return back()->with('error', 'Built-in pages cannot be deleted. Unpublish it instead.');
        }

        $page->delete();

        return redirect()->route('admin.pages.index', ['type' => 'static'])->with('success', 'Page deleted.');
    }

    /** @return array<string, mixed> */
    private function payload(PageRequest $request): array
    {
        $data = $request->safe()->except('design_id');
        $data['body'] = Html::cleanTranslations($data['body'] ?? []);

        return $data;
    }

    private function ping(Page $page, SearchPing $ping): void
    {
        if ($page->is_published && ! $page->noindex) {
            $ping->urls(array_values(SiteUrl::alternates(
                fn (string $locale) => $page->type === PageType::Faculty ? SiteUrl::faculty($page, $locale) : SiteUrl::page($page, $locale),
            )));
        }
    }

    private function form(Page $page): Response
    {
        Gate::authorize($page->exists ? 'update' : 'create', $page->exists ? $page : Page::class);

        $blank = ['ar' => '', 'en' => ''];

        return Inertia::render('admin/content/page-form', [
            'page' => [
                'id' => $page->id,
                'type' => $page->type->value,
                'key' => $page->key,
                'slug' => $page->getTranslations('slug') ?: $blank,
                'title' => $page->getTranslations('title') ?: $blank,
                'excerpt' => $page->getTranslations('excerpt') ?: $blank,
                'body' => $page->getTranslations('body') ?: $blank,
                'is_published' => $page->is_published,
                'meta_title' => $page->getTranslations('meta_title') ?: $blank,
                'meta_description' => $page->getTranslations('meta_description') ?: $blank,
                'canonical_url' => $page->canonical_url,
                'noindex' => (bool) $page->noindex,
            ],
            'media' => $page->exists ? AdminPresent::mediaFor($page, ['og']) : null,
            'urls' => [
                'index' => route('admin.pages.index', ['type' => $page->type->value]),
                'save' => $page->exists ? route('admin.pages.update', $page) : route('admin.pages.store'),
                'destroy' => $page->exists && $page->key === null ? route('admin.pages.destroy', $page) : null,
                'view' => $page->exists && $page->is_published ? [
                    'ar' => $page->type === PageType::Faculty ? SiteUrl::faculty($page, 'ar') : SiteUrl::page($page, 'ar'),
                    'en' => $page->type === PageType::Faculty ? SiteUrl::faculty($page, 'en') : SiteUrl::page($page, 'en'),
                ] : null,
            ],
        ]);
    }
}
