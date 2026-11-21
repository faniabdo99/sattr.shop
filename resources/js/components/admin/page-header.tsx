import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
    title: string;
    description?: ReactNode;
    actions?: ReactNode;
    back?: { href: string; label: string };
};

export function PageHeader({ title, description, actions, back }: Props) {
    return (
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-border pb-4">
            <div className="min-w-0">
                {back && (
                    <Link
                        href={back.href}
                        className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-3" aria-hidden />
                        {back.label}
                    </Link>
                )}
                <h1 className="text-xl leading-tight font-semibold tracking-tight">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </header>
    );
}
