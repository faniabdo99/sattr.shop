<?php

namespace App\Http\Requests\Admin;

use App\Enums\OrderStatus;
use Illuminate\Validation\Rule;

class BulkOrdersRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1', 'max:200'],
            'ids.*' => ['integer', 'exists:orders,id'],
            'status' => ['required', Rule::enum(OrderStatus::class)],
        ];
    }
}
