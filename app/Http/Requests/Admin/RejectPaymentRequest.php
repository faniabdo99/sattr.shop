<?php

namespace App\Http\Requests\Admin;

class RejectPaymentRequest extends AdminRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['reason' => ['required', 'string', 'min:5', 'max:500']];
    }
}
