<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;
use Throwable;

/** Cloudflare Turnstile. Passes automatically when no secret is configured. */
class Turnstile implements ValidationRule
{
    public static function enabled(): bool
    {
        return filled(config('sattr.turnstile.secret_key')) && filled(config('sattr.turnstile.site_key'));
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! self::enabled()) {
            return;
        }

        try {
            $passed = is_string($value) && $value !== '' && Http::asForm()->timeout(6)
                ->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                    'secret' => config('sattr.turnstile.secret_key'),
                    'response' => $value,
                    'remoteip' => request()->ip(),
                ])->json('success') === true;
        } catch (Throwable) {
            $passed = false;
        }

        if (! $passed) {
            $fail(__('orders.validation.turnstile'));
        }
    }
}
