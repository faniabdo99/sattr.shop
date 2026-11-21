<?php

namespace App\Http\Requests\Admin;

class ArticleRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            ...$this->slugRules(),
            ...$this->translatable('title', 160, bothRequired: true),
            ...$this->translatable('excerpt', 400, false),
            ...$this->translatable('body', 200000, false),
            'article_category_id' => ['nullable', 'exists:article_categories,id'],
            'design_id' => ['nullable', 'exists:designs,id'],
            'author_name' => ['nullable', 'string', 'max:80'],
            'published_at' => ['nullable', 'date'],
            ...$this->seoRules(),
        ];
    }
}
