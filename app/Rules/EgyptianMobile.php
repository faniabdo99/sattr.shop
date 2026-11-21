<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class EgyptianMobile implements ValidationRule
{
    public const PATTERN = '/^01[0125]\d{8}$/';

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! preg_match(self::PATTERN, $value)) {
            $fail(__('orders.validation.phone'));
        }
    }

    /** Accepts Arabic digits, spaces, dashes and a +20 / 0020 prefix. */
    public static function normalise(mixed $value): mixed
    {
        if (! is_string($value) || trim($value) === '') {
            return $value;
        }

        $value = strtr($value, [
            '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
            '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
        ]);

        $digits = preg_replace('/\D+/', '', $value) ?? '';

        if (str_starts_with($digits, '0020')) {
            $digits = substr($digits, 4);
        } elseif (str_starts_with($digits, '20') && strlen($digits) === 12) {
            $digits = substr($digits, 2);
        }

        if (strlen($digits) === 10 && str_starts_with($digits, '1')) {
            $digits = '0'.$digits;
        }

        return $digits;
    }
}
