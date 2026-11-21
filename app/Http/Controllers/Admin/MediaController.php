<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MediaUploadRequest;
use App\Models\Article;
use App\Models\Design;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaController extends Controller
{
    /** Which models accept images, and in which collections. */
    public const MODELS = [
        'product' => ['class' => Product::class, 'collections' => ['hero', 'gallery', 'unboxing', 'og']],
        'design' => ['class' => Design::class, 'collections' => ['gallery', 'cover']],
        'page' => ['class' => Page::class, 'collections' => ['og']],
        'article' => ['class' => Article::class, 'collections' => ['cover', 'og', 'content']],
    ];

    public function store(MediaUploadRequest $request): RedirectResponse|JsonResponse
    {
        $data = $request->validated();
        $model = self::MODELS[$data['model']]['class']::query()->findOrFail($data['id']);
        $file = $request->file('file');
        [$width, $height] = getimagesize($file->getRealPath()) ?: [null, null];

        $media = $model->addMedia($file)
            ->usingFileName(str($file->getClientOriginalName())->beforeLast('.')->slug()->limit(60, '')->append('-', substr(md5(uniqid()), 0, 6), '.', $file->extension())->toString())
            ->withCustomProperties([
                'alt' => ['ar' => $data['alt_ar'], 'en' => $data['alt_en']],
                'width' => $width,
                'height' => $height,
            ])
            ->toMediaCollection($data['collection']);

        // The rich-text editor uploads over fetch and needs the URL back.
        if ($request->wantsJson()) {
            return response()->json(['url' => $media->getUrl(), 'alt' => $data['alt_'.($request->input('locale') === 'en' ? 'en' : 'ar')]]);
        }

        return back()->with('success', 'Image uploaded.');
    }

    public function update(Request $request, Media $media): RedirectResponse
    {
        abort_unless($request->user()?->is_admin, 403);

        $data = $request->validate([
            'alt_ar' => ['required', 'string', 'max:200'],
            'alt_en' => ['required', 'string', 'max:200'],
        ]);

        $media->setCustomProperty('alt', ['ar' => $data['alt_ar'], 'en' => $data['alt_en']])->save();

        return back()->with('success', 'Alt text saved.');
    }

    public function destroy(Request $request, Media $media): RedirectResponse
    {
        abort_unless($request->user()?->is_admin, 403);

        $media->delete();

        return back()->with('success', 'Image removed.');
    }
}
