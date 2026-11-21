<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PageType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DesignRequest;
use App\Models\Design;
use App\Models\Product;
use App\Support\AdminPresent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class DesignController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Design::class);

        return Inertia::render('admin/catalog/designs', [
            'designs' => Design::query()->orderBy('sort')->with('media')->get()->map(fn (Design $design) => [
                'id' => $design->id,
                'key' => $design->key,
                'name' => $design->getTranslations('name'),
                'tint' => $design->tint,
                'stock' => $design->stock,
                'sort' => $design->sort,
                'is_active' => $design->is_active,
                'images' => $design->getMedia('gallery')->count(),
                'edit_url' => route('admin.designs.edit', $design),
            ])->all(),
            'create_url' => route('admin.designs.create'),
            'stock_total' => (int) Design::query()->sum('stock'),
        ]);
    }

    public function create(): Response
    {
        return $this->form(new Design(['tint' => '#1C1B19', 'stock' => 0, 'sort' => (int) Design::query()->max('sort') + 1, 'is_active' => true]));
    }

    public function store(DesignRequest $request): RedirectResponse
    {
        Gate::authorize('create', Design::class);

        $design = Design::query()->create([
            ...$request->validated(),
            'product_id' => Product::query()->oldest('id')->valueOrFail('id'),
        ]);

        // Every design gets its own SEO landing page, created as a draft.
        $design->facultyPage()->create([
            'type' => PageType::Faculty,
            'key' => "faculty-{$design->key}",
            'slug' => ['ar' => $design->key, 'en' => "{$design->key}-student"],
            'title' => $design->getTranslations('name'),
            'is_published' => false,
        ]);

        return redirect()->route('admin.designs.edit', $design)->with('success', 'Design created. Its faculty page is saved as a draft.');
    }

    public function edit(Design $design): Response
    {
        return $this->form($design->load(['media', 'facultyPage']));
    }

    public function update(DesignRequest $request, Design $design): RedirectResponse
    {
        Gate::authorize('update', $design);

        $design->update($request->validated());

        return back()->with('success', 'Design saved.');
    }

    public function destroy(Design $design): RedirectResponse
    {
        Gate::authorize('delete', $design);

        if ($design->hasOrders()) {
            return back()->with('error', 'This design has orders, so it cannot be deleted. Deactivate it instead.');
        }

        $design->facultyPage()->delete();
        $design->delete();

        return redirect()->route('admin.designs.index')->with('success', 'Design deleted.');
    }

    private function form(Design $design): Response
    {
        Gate::authorize($design->exists ? 'update' : 'create', $design->exists ? $design : Design::class);

        return Inertia::render('admin/catalog/design-form', [
            'design' => [
                'id' => $design->id,
                'key' => $design->key ?? '',
                'name' => $design->getTranslations('name') ?: ['ar' => '', 'en' => ''],
                'motif' => $design->getTranslations('motif') ?: ['ar' => '', 'en' => ''],
                'tint' => $design->tint,
                'stock' => $design->stock,
                'sort' => $design->sort,
                'is_active' => $design->is_active,
            ],
            'media' => $design->exists ? AdminPresent::mediaFor($design, ['gallery', 'cover']) : null,
            'urls' => [
                'index' => route('admin.designs.index'),
                'save' => $design->exists ? route('admin.designs.update', $design) : route('admin.designs.store'),
                'destroy' => $design->exists ? route('admin.designs.destroy', $design) : null,
                'page' => $design->exists && $design->facultyPage ? route('admin.pages.edit', $design->facultyPage) : null,
            ],
        ]);
    }
}
