<?php

namespace App\Http\Requests\Admin;

class PageRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            ...$this->slugRules(),
            ...$this->translatable('title', 160, bothRequired: true),
            ...$this->translatable('excerpt', 600, false),
            ...$this->translatable('body', 200000, false),
            'design_id' => ['nullable', 'exists:designs,id'],
            'is_published' => ['boolean'],
            ...$this->seoRules(),
        ];
    }
}
