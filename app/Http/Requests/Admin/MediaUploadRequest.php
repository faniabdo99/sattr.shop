<?php

namespace App\Http\Requests\Admin;

use App\Http\Controllers\Admin\MediaController;
use Illuminate\Validation\Rule;

class MediaUploadRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $type = (string) $this->input('model');

        return [
            'model' => ['required', Rule::in(array_keys(MediaController::MODELS))],
            'id' => ['required', 'integer'],
            'collection' => ['required', Rule::in(MediaController::MODELS[$type]['collections'] ?? [])],
            'file' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,avif', 'max:8192'],
            // Alt text is required on every upload: it is the image's SEO and accessibility text.
            'alt_ar' => ['required', 'string', 'max:200'],
            'alt_en' => ['required', 'string', 'max:200'],
        ];
    }
}
