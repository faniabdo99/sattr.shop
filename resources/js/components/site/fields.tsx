import { useId } from 'react';
import type {
    InputHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
    TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

/**
 * Form fields are written on a line: no boxes, a single rule under each
 * that turns blue while you write.
 */

const control =
    'block w-full rounded-none border-0 border-b border-ink/30 bg-transparent px-0 pb-2.5 pt-1.5 text-base text-ink placeholder:text-ink-soft/60 transition-colors duration-300 focus:border-line focus:outline-none aria-[invalid=true]:border-danger';

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
            <div className="flex items-baseline justify-between gap-4">
                <label htmlFor={id} className="text-sm font-medium text-ink">
                    {label}
                    {optional && (
                        <span className="ms-2 font-normal text-ink-soft">
                            {optional}
                        </span>
                    )}
                </label>
                {counter && (
                    <span className="text-xs text-ink-soft tabular-nums">
                        {counter}
                    </span>
                )}
            </div>
            {children}
            {error ? (
                <p id={`${id}-error`} className="mt-2 text-sm text-danger">
                    {error}
                </p>
            ) : (
                hint && (
                    <p id={`${id}-hint`} className="mt-2 text-sm text-ink-soft">
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
                className={control}
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
                className={cn(control, 'resize-none')}
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
            <div className="relative">
                <select
                    id={id}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={described(id, error, hint)}
                    className={cn(control, 'appearance-none pe-8')}
                    {...props}
                >
                    {children}
                </select>
                <svg
                    aria-hidden="true"
                    viewBox="0 0 12 8"
                    className="pointer-events-none absolute end-1 top-1/2 h-2 w-3 -translate-y-1/2 text-ink-soft"
                >
                    <path
                        d="M1 1l5 5 5-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                    />
                </svg>
            </div>
        </Frame>
    );
}
