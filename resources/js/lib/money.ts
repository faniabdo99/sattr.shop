import type { Locale } from '@/types/site';

const ARABIC_INDIC = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** Western digits in English, Arabic-Indic digits in Arabic. */
export function localDigits(value: number | string, locale: Locale): string {
    const text = String(value);

    return locale === 'ar'
        ? text.replace(/\d/g, (digit) => ARABIC_INDIC[Number(digit)])
        : text;
}

/**
 * Mirrors App\Support\Money::format. Amounts are integers in piasters.
 * "849 EGP" in English, "٨٤٩ ج.م" in Arabic.
 */
export function formatMoney(piasters: number, locale: Locale): string {
    const whole = piasters % 100 === 0;
    const amount = (piasters / 100).toLocaleString('en-US', {
        minimumFractionDigits: whole ? 0 : 2,
        maximumFractionDigits: whole ? 0 : 2,
    });

    return locale === 'ar'
        ? `${localDigits(amount, 'ar').replace(/,/g, '٬').replace('.', '٫')} ج.م`
        : `${amount} EGP`;
}
