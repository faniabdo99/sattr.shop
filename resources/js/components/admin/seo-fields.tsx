import { useId } from 'react';
import { BilingualField } from '@/components/admin/bilingual-field';
import { CheckField, controlClass, Field } from '@/components/admin/form';
import { cn } from '@/lib/utils';
import type { FormErrors, SeoData } from '@/types/admin';

type Props = {
    data: SeoData;
    onChange: (patch: Partial<SeoData>) => void;
    errors?: FormErrors;
};

export function SeoFields({ data, onChange, errors = {} }: Props) {
    const id = useId();

    return (
        <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
                Blank fields use automatic defaults built from the title and
                intro.
            </p>
            <BilingualField
                label="Meta title"
                name="meta_title"
                value={data.meta_title}
                onChange={(meta_title) => onChange({ meta_title })}
                errors={errors}
                max={70}
            />
            <BilingualField
                label="Meta description"
                name="meta_description"
                value={data.meta_description}
                onChange={(meta_description) => onChange({ meta_description })}
                errors={errors}
                multiline
                rows={3}
                max={170}
            />
            <Field
                id={`${id}-canonical`}
                label="Canonical URL"
                error={errors.canonical_url}
                hint="Only set this when the page duplicates another URL."
            >
                <input
                    id={`${id}-canonical`}
                    type="url"
                    dir="ltr"
                    value={data.canonical_url}
                    placeholder="https://"
                    onChange={(event) =>
                        onChange({ canonical_url: event.target.value })
                    }
                    className={cn(controlClass, 'h-9 py-1')}
                />
            </Field>
            <CheckField
                id={`${id}-noindex`}
                label="Hide from search engines (noindex)"
                checked={data.noindex}
                onChange={(noindex) => onChange({ noindex })}
                error={errors.noindex}
            />
        </div>
    );
}
