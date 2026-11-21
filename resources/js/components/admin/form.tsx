import { Check, Copy } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const controlClass =
    'w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive';

export function FieldError({ message }: { message?: string }) {
    return message ? (
        <p role="alert" className="text-xs text-danger">
            {message}
        </p>
    ) : null;
}

type FieldProps = {
    id: string;
    label: string;
    error?: string;
    hint?: ReactNode;
    className?: string;
    children: ReactNode;
};

/** A label, its control, an optional hint and the field error. */
export function Field({
    id,
    label,
    error,
    hint,
    className,
    children,
}: FieldProps) {
    return (
        <div className={cn('grid content-start gap-1.5', className)}>
            <label htmlFor={id} className="text-sm leading-none font-medium">
                {label}
            </label>
            {children}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            <FieldError message={error} />
        </div>
    );
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
    return (
        <textarea
            className={cn(controlClass, 'leading-relaxed', className)}
            {...props}
        />
    );
}

/** A native select: keyboard-friendly and allows an empty "any" option. */
export function NativeSelect({
    className,
    ...props
}: ComponentProps<'select'>) {
    return (
        <select
            className={cn(controlClass, 'h-9 py-1', className)}
            {...props}
        />
    );
}

type CheckFieldProps = {
    id: string;
    label: ReactNode;
    checked: boolean;
    onChange: (checked: boolean) => void;
    hint?: ReactNode;
    error?: string;
    disabled?: boolean;
};

export function CheckField({
    id,
    label,
    checked,
    onChange,
    hint,
    error,
    disabled,
}: CheckFieldProps) {
    return (
        <div className="grid gap-1">
            <label htmlFor={id} className="flex items-start gap-2 text-sm">
                <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={(event) => onChange(event.target.checked)}
                    className="mt-0.5 size-4 shrink-0 accent-line"
                />
                <span>
                    <span className="font-medium">{label}</span>
                    {hint && (
                        <span className="block text-xs text-muted-foreground">
                            {hint}
                        </span>
                    )}
                </span>
            </label>
            <FieldError message={error} />
        </div>
    );
}

type PanelProps = {
    title: string;
    description?: ReactNode;
    actions?: ReactNode;
    className?: string;
    bodyClassName?: string;
    children: ReactNode;
};

/** A titled, bordered section. */
export function Panel({
    title,
    description,
    actions,
    className,
    bodyClassName,
    children,
}: PanelProps) {
    return (
        <section
            className={cn('rounded-md border border-border bg-card', className)}
        >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div>
                    <h2 className="text-sm leading-tight font-semibold">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {actions}
            </header>
            <div className={cn('space-y-5 p-4', bodyClassName)}>{children}</div>
        </section>
    );
}

/** A read-only value with a copy button, for links the admin shares. */
export function CopyField({ label, value }: { label: string; value: string }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="grid gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
                {label}
            </span>
            <div className="flex items-center gap-2">
                <input
                    readOnly
                    value={value}
                    aria-label={label}
                    dir="ltr"
                    onFocus={(event) => event.target.select()}
                    className={cn(controlClass, 'h-8 py-1 text-xs')}
                />
                <button
                    type="button"
                    onClick={copy}
                    className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-input px-2 text-xs font-medium hover:bg-accent"
                >
                    {copied ? (
                        <Check className="size-3.5 text-success" aria-hidden />
                    ) : (
                        <Copy className="size-3.5" aria-hidden />
                    )}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
        </div>
    );
}
