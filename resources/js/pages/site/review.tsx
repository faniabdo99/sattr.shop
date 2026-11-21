import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { TextAreaField, TextField } from '@/components/site/fields';
import { RuledLine } from '@/components/site/ruled-line';
import { useT } from '@/hooks/use-t';
import { cn } from '@/lib/utils';

type Props = {
    done: boolean;
    customer_name: string;
    design: string | null;
    submit_url: string;
};

export default function ReviewPage({
    done,
    customer_name,
    design,
    submit_url,
}: Props) {
    const t = useT();
    const form = useForm({
        name: customer_name.split(' ')[0] ?? '',
        rating: 5,
        body: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(submit_url);
    };

    if (done) {
        return (
            <div className="wrap py-20 md:py-32">
                <h1 className="display text-display-lg">
                    {t('review.thanks_title')}
                </h1>
                <p className="measure mt-5 text-lede text-ink-soft">
                    {t('review.thanks_body')}
                </p>
            </div>
        );
    }

    return (
        <div className="wrap py-12 md:py-20">
            <div className="max-w-2xl">
                <h1 className="display text-display-lg">{t('review.title')}</h1>
                <p className="mt-5 text-lede text-ink-soft">
                    {t('review.body')}
                </p>
                {design && (
                    <p className="mt-2 text-sm text-ink-soft">{design}</p>
                )}
                <RuledLine className="mt-10" />

                <form
                    onSubmit={submit}
                    noValidate
                    className="mt-10 flex flex-col gap-9"
                >
                    <fieldset>
                        <legend className="text-sm font-medium">
                            {t('review.rating')}
                        </legend>
                        <div className="mt-3 flex gap-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <label
                                    key={value}
                                    className={cn(
                                        'flex size-12 cursor-pointer items-center justify-center border text-lg tabular-nums transition-colors duration-300 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-line',
                                        value <= form.data.rating
                                            ? 'border-line bg-line text-paper'
                                            : 'border-ink/25 text-ink-soft',
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={value}
                                        checked={form.data.rating === value}
                                        onChange={() =>
                                            form.setData('rating', value)
                                        }
                                        className="sr-only"
                                        aria-label={t('review.rating_option', {
                                            rating: value,
                                        })}
                                    />
                                    <span aria-hidden="true">{value}</span>
                                </label>
                            ))}
                        </div>
                        {form.errors.rating && (
                            <p className="mt-2 text-sm text-danger">
                                {form.errors.rating}
                            </p>
                        )}
                    </fieldset>

                    <TextField
                        label={t('review.name')}
                        maxLength={60}
                        required
                        value={form.data.name}
                        onChange={(event) =>
                            form.setData('name', event.target.value)
                        }
                        error={form.errors.name}
                    />

                    <TextAreaField
                        label={t('review.text')}
                        rows={5}
                        maxLength={1000}
                        required
                        value={form.data.body}
                        onChange={(event) =>
                            form.setData('body', event.target.value)
                        }
                        error={form.errors.body}
                    />

                    <div>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="min-h-13 bg-line px-8 font-medium text-paper transition-colors duration-300 hover:bg-line-deep disabled:bg-stone disabled:text-ink-soft"
                        >
                            {t('review.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
