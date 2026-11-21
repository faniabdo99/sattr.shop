<?php

namespace App\Http\Requests\Site;

use App\Enums\PaymentMethod;
use App\Rules\EgyptianMobile;
use App\Rules\Turnstile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'phone' => EgyptianMobile::normalise($this->input('phone')),
            'alt_phone' => EgyptianMobile::normalise($this->input('alt_phone')),
            'cover_name' => $this->trimmed('cover_name'),
            'gift_message' => $this->trimmed('gift_message'),
            'email' => $this->trimmed('email'),
            'notes' => $this->trimmed('notes'),
        ]);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'design' => ['required', 'string', Rule::exists('designs', 'key')->where('is_active', true)],
            'quantity' => ['required', 'integer', 'min:1', 'max:'.config('sattr.orders.max_quantity')],
            'cover_name' => ['nullable', 'string', 'max:20'],
            'gift_message' => ['nullable', 'string', 'max:200'],
            'customer_name' => ['required', 'string', 'min:3', 'max:120'],
            'phone' => ['required', new EgyptianMobile],
            'alt_phone' => ['nullable', 'different:phone', new EgyptianMobile],
            'email' => ['nullable', 'email:rfc', 'max:190'],
            'governorate' => ['required', Rule::in(array_keys(config('egypt.governorates')))],
            'city' => ['required', 'string', 'max:120'],
            'address' => ['required', 'string', 'min:5', 'max:500'],
            'notes' => ['nullable', 'string', 'max:500'],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            // Honeypot: real visitors never see or fill this field.
            'website' => ['nullable', 'max:0'],
            'turnstile_token' => [Rule::requiredIf(Turnstile::enabled()), new Turnstile],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return collect(['customer_name' => 'full_name', 'phone' => 'phone', 'alt_phone' => 'alt_phone', 'email' => 'email',
            'governorate' => 'governorate', 'city' => 'city', 'address' => 'address', 'notes' => 'notes', 'quantity' => 'quantity'])
            ->map(fn (string $key) => __("site.checkout.{$key}"))
            ->all();
    }

    private function trimmed(string $key): ?string
    {
        $value = trim((string) $this->input($key));

        return $value === '' ? null : $value;
    }
}
