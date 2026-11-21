<?php

namespace App\Support;

/**
 * All amounts are integers in piasters (1 EGP = 100 piasters).
 */
final class Money
{
    /** Apply a percentage discount and round down to a whole pound. */
    public static function discounted(int $piasters, int $percent): int
    {
        $percent = max(0, min(100, $percent));

        return intdiv($piasters * (100 - $percent), 10000) * 100;
    }

    public static function pounds(int $piasters): int|float
    {
        return $piasters % 100 === 0 ? intdiv($piasters, 100) : $piasters / 100;
    }

    public static function format(int $piasters, ?string $locale = null): string
    {
        $locale ??= app()->getLocale();
        $amount = number_format($piasters / 100, $piasters % 100 === 0 ? 0 : 2);

        return $locale === 'ar' ? "{$amount} ج.م" : "EGP {$amount}";
    }

    /** Decimal string for feeds and structured data, e.g. "849.00". */
    public static function decimal(int $piasters): string
    {
        return number_format($piasters / 100, 2, '.', '');
    }
}
