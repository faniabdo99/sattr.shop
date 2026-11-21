import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import SiteLayout from '@/layouts/site-layout';
import { exactTitle } from '@/lib/head';

const appName = import.meta.env.VITE_APP_NAME || 'Sattr';

void createInertiaApp({
    title: (title) => {
        if (title && title === exactTitle.current) {
            return title;
        }

        return title ? `${title} - ${appName}` : appName;
    },
    layout: (name) => {
        switch (true) {
            case name.startsWith('site/'):
                return SiteLayout;
            case name === 'admin/orders/slip':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#2747D6',
    },
});
