import { usePage } from '@inertiajs/react';
import type { Locale, Messages, SiteChrome } from '@/types/site';

function lookup(messages: Messages, key: string): string | undefined {
    let node: string | Messages | undefined = messages;

    for (const part of key.split('.')) {
        if (typeof node !== 'object' || node === null) {
            return undefined;
        }

        node = node[part];
    }

    return typeof node === 'string' ? node : undefined;
}

export type Translate = (
    key: string,
    replace?: Record<string, string | number>,
) => string;

/** Copy comes from lang/{locale}/site.php, shared once by the server. */
export function useT(): Translate {
    const messages = usePage().props.t;

    return (key, replace) => {
        let text = lookup(messages, key) ?? key;

        if (replace) {
            for (const [name, value] of Object.entries(replace)) {
                text = text.replaceAll(`:${name}`, String(value));
            }
        }

        return text;
    };
}

export function useSite(): { site: SiteChrome; locale: Locale; rtl: boolean } {
    const { site, locale, dir } = usePage().props;

    return { site: site as SiteChrome, locale, rtl: dir === 'rtl' };
}
