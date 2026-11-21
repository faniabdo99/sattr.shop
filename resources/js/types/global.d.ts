import type { Auth } from '@/types/auth';
import type { Locale, Messages, Seo, SiteChrome } from '@/types/site';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            locale: Locale;
            dir: 'rtl' | 'ltr';
            site: SiteChrome | null;
            t: Messages;
            seo?: Seo;
            [key: string]: unknown;
        };
    }
}
