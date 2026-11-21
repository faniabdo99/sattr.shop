import { RadioCard } from '@/components/site/radio-card';
import { useT } from '@/hooks/use-t';
import type { Design } from '@/types/site';

type Props = {
    designs: Design[];
    value: string | null;
    onChange: (key: string) => void;
    name?: string;
    legend: string;
    error?: string;
};

/** "MEDICAL · طب": the edition named in both languages. */
export function editionOverline(design: Design): string {
    return `${design.names.en} · ${design.names.ar}`;
}

/** Faculty edition choice as a grid of radio cards. */
export function DesignPicker({
    designs,
    value,
    onChange,
    name = 'design',
    legend,
    error,
}: Props) {
    const t = useT();

    return (
        <fieldset aria-describedby={error ? `${name}-error` : undefined}>
            <legend className="mb-3 text-label text-ink-muted">{legend}</legend>
            <div className="grid grid-cols-2 gap-3">
                {designs.map((design) => (
                    <RadioCard
                        key={design.key}
                        name={name}
                        value={design.key}
                        checked={design.key === value}
                        disabled={design.sold_out}
                        onChange={() => onChange(design.key)}
                        className="!p-4"
                    >
                        <span className="flex items-center gap-3">
                            <span
                                aria-hidden="true"
                                className="size-3 shrink-0 rounded-full"
                                style={{ backgroundColor: design.tint }}
                            />
                            <span className="min-w-0">
                                <span className="block truncate text-label text-ink">
                                    {design.name}
                                </span>
                                {design.sold_out && (
                                    <span className="block text-caption text-ink-muted">
                                        {t('product.sold_out')}
                                    </span>
                                )}
                            </span>
                        </span>
                    </RadioCard>
                ))}
            </div>
            {error && (
                <p
                    id={`${name}-error`}
                    className="mt-3 text-caption text-danger"
                >
                    {error}
                </p>
            )}
        </fieldset>
    );
}
