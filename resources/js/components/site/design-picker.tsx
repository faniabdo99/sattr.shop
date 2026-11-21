import { useT } from '@/hooks/use-t';
import { cn } from '@/lib/utils';
import type { Design } from '@/types/site';

type Props = {
    designs: Design[];
    value: string | null;
    onChange: (key: string) => void;
    name?: string;
    legend: string;
    error?: string;
};

/** Faculty choice as a radio group of colour chips. */
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
            <legend className="mb-3 text-sm font-medium">{legend}</legend>
            <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {designs.map((design) => {
                    const selected = design.key === value;

                    return (
                        <label
                            key={design.key}
                            className={cn(
                                'relative flex min-h-12 cursor-pointer items-center gap-3 border-b py-3 text-[0.9375rem] transition-colors duration-300',
                                selected
                                    ? 'border-line text-ink'
                                    : 'border-stone text-ink-soft hover:text-ink',
                                design.sold_out &&
                                    'cursor-not-allowed opacity-55',
                            )}
                        >
                            <input
                                type="radio"
                                name={name}
                                value={design.key}
                                checked={selected}
                                disabled={design.sold_out}
                                onChange={() => onChange(design.key)}
                                className="peer sr-only"
                            />
                            <span
                                aria-hidden="true"
                                className="size-4 shrink-0 rounded-full ring-1 ring-ink/15 ring-offset-2 ring-offset-paper peer-focus-visible:ring-2 peer-focus-visible:ring-line"
                                style={{ backgroundColor: design.tint }}
                            />
                            <span className="leading-tight">
                                {design.name}
                                {design.sold_out && (
                                    <span className="block text-xs text-ink-soft">
                                        {t('product.sold_out')}
                                    </span>
                                )}
                            </span>
                        </label>
                    );
                })}
            </div>
            {error && (
                <p id={`${name}-error`} className="mt-3 text-sm text-danger">
                    {error}
                </p>
            )}
        </fieldset>
    );
}
