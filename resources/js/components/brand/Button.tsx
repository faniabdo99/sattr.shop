import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

type Props = {
    children: ReactNode;
    variant?: ButtonVariant;
    href?: string;
    /** Plain <a> for downloads, external links and in-page anchors. */
    external?: boolean;
    type?: 'button' | 'submit';
    disabled?: boolean;
    full?: boolean;
    className?: string;
    onClick?: () => void;
};

const base =
    'inline-flex items-center justify-center gap-2 text-label transition-colors duration-300 ease-quiet focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line disabled:cursor-not-allowed';

const variants: Record<ButtonVariant, string> = {
    primary:
        'h-12 rounded-md bg-line px-6 text-on-line hover:bg-line-hover disabled:bg-sand disabled:text-ink-muted',
    secondary:
        'h-12 rounded-md border-[1.5px] border-ink px-6 text-ink hover:bg-ink hover:text-paper disabled:border-sand disabled:text-ink-muted disabled:hover:bg-transparent',
    tertiary:
        'link-line min-h-11 !bg-[length:100%_1.5px] text-ink hover:!bg-[length:100%_3px]',
};

export function buttonClasses(
    variant: ButtonVariant = 'primary',
    full = false,
    className?: string,
): string {
    return cn(base, variants[variant], full && 'w-full', className);
}

/** Primary (blue), secondary (ink outline) and tertiary (blue underline) actions. */
export function Button({
    children,
    variant = 'primary',
    href,
    external,
    type = 'button',
    disabled,
    full,
    className,
    onClick,
}: Props) {
    const classes = buttonClasses(variant, full, className);

    if (href && !disabled) {
        return external ? (
            <a href={href} className={classes} onClick={onClick}>
                {children}
            </a>
        ) : (
            <Link href={href} className={classes} onClick={onClick}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            disabled={disabled}
            className={classes}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
