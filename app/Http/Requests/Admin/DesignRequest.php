<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;

class DesignRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'key' => ['required', 'string', 'max:60', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('designs', 'key')->ignore($this->route('design'))],
            ...$this->translatable('name', 80, bothRequired: true),
            ...$this->translatable('motif', 160, false),
            'tint' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'stock' => ['required', 'integer', 'min:0', 'max:100000'],
            'sort' => ['required', 'integer', 'min:0', 'max:1000'],
            'is_active' => ['boolean'],
        ];
    }
}
