import { useId } from 'react';
import { controlClass, FieldError } from '@/components/admin/form';
import { cn } from '@/lib/utils';
import type { Bilingual, FormErrors } from '@/types/admin';

type Locale = keyof Bilingual;

type Props = {
    label: string;
    /** Field name as the server knows it; errors are read from `name.ar` / `name.en`. */
    name: string;
    value: Bilingual;
    onChange: (value: Bilingual) => void;
    errors?: FormErrors;
    multiline?: boolean;
    rows?: number;
    /** Shows a character counter against this limit. */
    max?: number;
    hint?: string;
    /** Marks which locales are required (visual + native validation). */
    required?: boolean | Locale;
    placeholder?: Partial<Bilingual>;
};

const locales: { key: Locale; label: string; dir: 'rtl' | 'ltr' }[] = [
    { key: 'ar', label: 'Arabic', dir: 'rtl' },
    { key: 'en', label: 'English', dir: 'ltr' },
];

export function BilingualField({
    label,
    name,
    value,
    onChange,
    errors = {},
    multiline = false,
    rows = 3,
    max,
    hint,
    required = false,
    placeholder,
}: Props) {
    const id = useId();

    return (
        <fieldset className="grid min-w-0 gap-1.5">
            <legend className="mb-1.5 text-sm leading-none font-medium">
                {label}
            </legend>
            <div className="grid gap-3 md:grid-cols-2">
                {locales.map((locale) => {
                    const inputId = `${id}-${locale.key}`;
                    const error = errors[`${name}.${locale.key}`];
                    const text = value[locale.key] ?? '';
                    const isRequired =
                        required === true || required === locale.key;
                    const shared = {
                        id: inputId,
                        name: `${name}[${locale.key}]`,
                        dir: locale.dir,
                        lang: locale.key,
                        value: text,
                        required: isRequired,
                        placeholder: placeholder?.[locale.key],
                        'aria-invalid': error ? true : undefined,
                    } as const;

                    return (
                        <div
                            key={locale.key}
                            className="grid content-start gap-1"
                        >
                            <div className="flex items-baseline justify-between gap-2">
                                <label
                                    htmlFor={inputId}
                                    className="text-xs text-muted-foreground"
                                >
                                    {locale.label}
                                    {isRequired && (
                                        <span className="text-danger"> *</span>
                                    )}
                                </label>
                                {max !== undefined && (
                                    <span
                                        className={cn(
                                            'text-xs tabular-nums',
                                            text.length > max
                                                ? 'font-medium text-danger'
                                                : 'text-muted-foreground',
                                        )}
                                    >
                                        {text.length}/{max}
                                    </span>
                                )}
                            </div>
                            {multiline ? (
                                <textarea
                                    {...shared}
                                    rows={rows}
                                    className={cn(
                                        controlClass,
                                        'leading-relaxed',
                                    )}
                                    onChange={(event) =>
                                        onChange({
                                            ...value,
                                            [locale.key]: event.target.value,
                                        })
                                    }
                                />
                            ) : (
                                <input
                                    {...shared}
                                    type="text"
                                    className={cn(controlClass, 'h-9 py-1')}
                                    onChange={(event) =>
                                        onChange({
                                            ...value,
                                            [locale.key]: event.target.value,
                                        })
                                    }
                                />
                            )}
                            <FieldError message={error} />
                        </div>
                    );
                })}
            </div>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            <FieldError message={errors[name]} />
        </fieldset>
    );
}
