<?php

namespace App\Http\Requests\Admin;

class FaqRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            ...$this->translatable('question', 255, bothRequired: true),
            ...$this->translatable('answer', 2000, bothRequired: true),
            'sort' => ['integer', 'min:0', 'max:1000'],
            'is_active' => ['boolean'],
        ];
    }
}
