import { useId } from 'react';
import type {
    InputHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
    TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

/**
 * Form fields: raised paper, a hairline sand border, the label above.
 * On focus the border turns ink and the blue signature line appears under
 * the field (see .field in app.css).
 */

const control =
    'block w-full rounded-sm border border-sand bg-paper-raised px-4 text-body text-ink placeholder:text-ink-muted/70 transition-colors duration-300 focus:border-ink focus:outline-none aria-[invalid=true]:border-danger';

type Shell = {
    label: string;
    hint?: ReactNode;
    error?: string;
    optional?: string;
    counter?: string;
    className?: string;
};

function Frame({
    id,
    label,
    hint,
    error,
    optional,
    counter,
    className,
    children,
}: Shell & { id: string; children: ReactNode }) {
    return (
        <div className={className}>
            <div className="mb-2 flex items-baseline justify-between gap-4">
                <label htmlFor={id} className="text-label text-ink-muted">
                    {label}
                    {optional && (
                        <span className="ms-2 font-normal">{optional}</span>
                    )}
                </label>
                {counter && (
                    <span className="text-caption text-ink-muted tabular-nums">
                        {counter}
                    </span>
                )}
            </div>
            <span className="field">{children}</span>
            {error ? (
                <p id={`${id}-error`} className="mt-3 text-caption text-danger">
                    {error}
                </p>
            ) : (
                hint && (
                    <p
                        id={`${id}-hint`}
                        className="mt-3 text-caption text-ink-muted"
                    >
                        {hint}
                    </p>
                )
            )}
        </div>
    );
}

function described(id: string, error?: string, hint?: ReactNode) {
    return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export function TextField({
    label,
    hint,
    error,
    optional,
    counter,
    className,
    ...props
}: Shell & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>) {
    const id = useId();

    return (
        <Frame
            id={id}
            label={label}
            hint={hint}
            error={error}
            optional={optional}
            counter={counter}
            className={className}
        >
            <input
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={described(id, error, hint)}
                className={cn(control, 'h-12')}
                {...props}
            />
        </Frame>
    );
}

export function TextAreaField({
    label,
    hint,
    error,
    optional,
    counter,
    className,
    ...props
}: Shell & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>) {
    const id = useId();

    return (
        <Frame
            id={id}
            label={label}
            hint={hint}
            error={error}
            optional={optional}
            counter={counter}
            className={className}
        >
            <textarea
                id={id}
                rows={3}
                aria-invalid={error ? true : undefined}
                aria-describedby={described(id, error, hint)}
                className={cn(control, 'resize-none py-3')}
                {...props}
            />
        </Frame>
    );
}

export function SelectField({
    label,
    hint,
    error,
    optional,
    className,
    children,
    ...props
}: Shell & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'>) {
    const id = useId();

    return (
        <Frame
            id={id}
            label={label}
            hint={hint}
            error={error}
            optional={optional}
            className={className}
        >
            <span className="relative block">
                <select
                    id={id}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={described(id, error, hint)}
                    className={cn(control, 'h-12 appearance-none pe-10')}
                    {...props}
                >
                    {children}
                </select>
                <svg
                    aria-hidden="true"
                    viewBox="0 0 12 8"
                    className="pointer-events-none absolute end-4 top-1/2 h-2 w-3 -translate-y-1/2 text-ink-muted"
                >
                    <path
                        d="M1 1l5 5 5-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                </svg>
            </span>
        </Frame>
    );
}
