<?php

namespace App\Http\Requests\Admin;

class ProductRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            ...$this->translatable('name', 120, bothRequired: true),
            ...$this->translatable('tagline', 200, false),
            ...$this->translatable('description', 2000, false),
            'price_egp' => ['required', 'numeric', 'min:1', 'max:100000'],
            'instapay_discount_percent' => ['required', 'integer', 'min:0', 'max:90'],
            'contents' => ['array', 'max:20'],
            'contents.*.title.ar' => ['required', 'string', 'max:120'],
            'contents.*.title.en' => ['required', 'string', 'max:120'],
            'contents.*.detail.ar' => ['nullable', 'string', 'max:255'],
            'contents.*.detail.en' => ['nullable', 'string', 'max:255'],
            'specs' => ['array', 'max:30'],
            'specs.*.label.ar' => ['required', 'string', 'max:120'],
            'specs.*.label.en' => ['required', 'string', 'max:120'],
            'specs.*.value.ar' => ['required', 'string', 'max:255'],
            'specs.*.value.en' => ['required', 'string', 'max:255'],
            ...$this->seoRules(),
        ];
    }
}
