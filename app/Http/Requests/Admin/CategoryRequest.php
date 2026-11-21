<?php

namespace App\Http\Requests\Admin;

class CategoryRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            ...$this->slugRules(),
            ...$this->translatable('name', 80, bothRequired: true),
            'sort' => ['integer', 'min:0', 'max:1000'],
        ];
    }
}
