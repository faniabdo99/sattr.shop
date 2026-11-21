<?php

namespace App\Http\Requests\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use Illuminate\Validation\Rule;

class UpdateOrderRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::enum(OrderStatus::class)],
            'status_note' => ['nullable', 'string', 'max:500'],
            'payment_status' => ['sometimes', Rule::enum(PaymentStatus::class)],
            'internal_notes' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'bosta_tracking_number' => ['sometimes', 'nullable', 'string', 'max:60'],
        ];
    }
}
