<?php

namespace App\Http\Requests\Admin;

use App\Enums\ReviewStatus;
use Illuminate\Validation\Rule;

class ReviewModerationRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['status' => ['required', Rule::enum(ReviewStatus::class)]];
    }
}
