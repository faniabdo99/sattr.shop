<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

abstract class AdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    /**
     * Rules for a translatable field: Arabic is required, English optional
     * unless $bothRequired.
     *
     * @return array<string, mixed>
     */
    protected function translatable(string $field, int $max = 255, bool $required = true, bool $bothRequired = false): array
    {
        return [
            $field => [$required ? 'required' : 'nullable', 'array'],
            "{$field}.ar" => [$required ? 'required' : 'nullable', 'string', "max:{$max}"],
            "{$field}.en" => [$required && $bothRequired ? 'required' : 'nullable', 'string', "max:{$max}"],
        ];
    }

    /** @return array<string, mixed> */
    protected function seoRules(): array
    {
        return [
            ...$this->translatable('meta_title', 70, false),
            ...$this->translatable('meta_description', 170, false),
            'canonical_url' => ['nullable', 'url', 'max:255'],
            'noindex' => ['boolean'],
        ];
    }

    /** @return array<string, mixed> */
    protected function slugRules(): array
    {
        return [
            'slug' => ['required', 'array'],
            'slug.ar' => ['required', 'string', 'max:120', 'regex:/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u'],
            'slug.en' => ['required', 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
        ];
    }
}
