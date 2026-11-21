<?php

namespace App\Http\Requests\Admin;

use App\Models\Redirect;
use Illuminate\Validation\Rule;

class RedirectRequest extends AdminRequest
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('from_path')) && $this->input('from_path') !== '') {
            $this->merge(['from_path' => Redirect::normalise($this->input('from_path'))]);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'from_path' => ['required', 'string', 'max:255', 'starts_with:/', 'not_regex:#^/(admin|login|settings)#', Rule::unique('redirects', 'from_path')->ignore($this->route('redirect'))],
            'to_url' => ['required', 'string', 'max:255', 'different:from_path', 'regex:#^(/|https?://)#'],
            'status_code' => ['required', Rule::in([301, 302])],
            'is_active' => ['boolean'],
        ];
    }
}
