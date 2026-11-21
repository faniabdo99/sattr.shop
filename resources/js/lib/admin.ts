import type { Bilingual } from '@/types/admin';

/**
 * Normalises a translations payload. Laravel sends `[]` for a model with no
 * translations and omits locales that were never filled in.
 */
export function bi(value: unknown): Bilingual {
    const source =
        value && typeof value === 'object' && !Array.isArray(value)
            ? (value as Record<string, unknown>)
            : {};

    return {
        ar: typeof source.ar === 'string' ? source.ar : '',
        en: typeof source.en === 'string' ? source.en : '',
    };
}

/** Shared page container for admin screens. */
export const pageClass = 'mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6';
