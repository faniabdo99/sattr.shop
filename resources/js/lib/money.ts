import type { Locale } from '@/types/site';

/** Mirrors App\Support\Money::format. Amounts are integers in piasters. */
export function formatMoney(piasters: number, locale: Locale): string {
    const whole = piasters % 100 === 0;
    const amount = (piasters / 100).toLocaleString('en-US', {
        minimumFractionDigits: whole ? 0 : 2,
        maximumFractionDigits: whole ? 0 : 2,
    });

    return locale === 'ar' ? `${amount} ج.م` : `EGP ${amount}`;
}
