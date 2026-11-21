<?php

namespace App\Http\Requests\Site;

use Illuminate\Foundation\Http\FormRequest;

class PaymentProofRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'proof' => ['nullable', 'required_without:reference', 'image', 'mimes:jpg,jpeg,png,webp,heic,heif', 'max:5120'],
            'reference' => ['nullable', 'required_without:proof', 'string', 'max:60'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'proof.required_without' => __('orders.validation.proof_required'),
            'reference.required_without' => __('orders.validation.proof_required'),
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['proof' => __('site.order.proof_file'), 'reference' => __('site.order.proof_reference')];
    }
}
