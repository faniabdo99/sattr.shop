import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { BilingualField } from '@/components/admin/bilingual-field';
import {
    CheckField,
    controlClass,
    Field,
    Panel,
} from '@/components/admin/form';
import { PageHeader } from '@/components/admin/page-header';
import { EmptyState } from '@/components/admin/table';
import { Button } from '@/components/ui/button';
import { bi, pageClass } from '@/lib/admin';
import { cn } from '@/lib/utils';
import type { Bilingual, FormErrors } from '@/types/admin';

type Faq = {
    id: number;
    question: unknown;
    answer: unknown;
    sort: number;
    is_active: boolean;
    url: string;
};

type Props = { faqs: Faq[]; store_url: string };

type FaqForm = {
    question: Bilingual;
    answer: Bilingual;
    sort: string;
    is_active: boolean;
};

const blank: Bilingual = { ar: '', en: '' };

function FaqFields({
    id,
    form,
}: {
    id: string;
    form: ReturnType<typeof useForm<FaqForm>>;
}) {
    const errors = form.errors as FormErrors;

    return (
        <>
            <BilingualField
                label="Question"
                name="question"
                value={form.data.question}
                onChange={(value) => form.setData('question', value)}
                errors={errors}
                required
            />
            <BilingualField
                label="Answer"
                name="answer"
                value={form.data.answer}
                onChange={(value) => form.setData('answer', value)}
                errors={errors}
                multiline
                rows={3}
                required
            />
            <div className="flex flex-wrap items-end gap-6">
                <Field
                    id={`${id}-sort`}
                    label="Sort order"
                    error={errors.sort}
                    className="w-28"
                >
                    <input
                        id={`${id}-sort`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={1000}
                        value={form.data.sort}
                        onChange={(event) =>
                            form.setData('sort', event.target.value)
                        }
                        className={cn(controlClass, 'h-9 py-1 tabular-nums')}
                    />
                </Field>
                <div className="pb-2">
                    <CheckField
                        id={`${id}-active`}
                        label="Shown on the site"
                        checked={form.data.is_active}
                        onChange={(checked) =>
                            form.setData('is_active', checked)
                        }
                        error={errors.is_active}
                    />
                </div>
            </div>
        </>
    );
}

function FaqRow({ faq, index }: { faq: Faq; index: number }) {
    const form = useForm<FaqForm>({
        question: bi(faq.question),
        answer: bi(faq.answer),
        sort: String(faq.sort),
        is_active: Boolean(faq.is_active),
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put(faq.url, { preserveScroll: true });
    };

    const destroy = () => {
        if (window.confirm('Delete this question? This cannot be undone.')) {
            router.delete(faq.url, { preserveScroll: true });
        }
    };

    return (
        <li className="rounded-md border border-border bg-card">
            <form
                onSubmit={submit}
                aria-label={`Question ${index + 1}`}
                className="space-y-4 p-4"
            >
                <FaqFields id={`faq-${faq.id}`} form={form} />
                <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-danger hover:text-danger"
                        onClick={destroy}
                    >
                        Delete
                    </Button>
                    <span className="flex items-center gap-3">
                        {form.isDirty && (
                            <span className="text-xs text-muted-foreground">
                                Unsaved changes
                            </span>
                        )}
                        <Button
                            type="submit"
                            size="sm"
                            disabled={form.processing}
                        >
                            Save
                        </Button>
                    </span>
                </div>
            </form>
        </li>
    );
}

export default function Faqs({ faqs, store_url }: Props) {
    const form = useForm<FaqForm>({
        question: blank,
        answer: blank,
        sort: '',
        is_active: true,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.transform((data) => {
            const { sort, ...rest } = data;

            // A blank sort lets the server place the question last.
            return sort === '' ? rest : data;
        });
        form.post(store_url, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <div className={pageClass}>
            <Head title="FAQ" />
            <PageHeader
                title="FAQ"
                description="Questions shown on the storefront, in sort order. Both languages are required."
            />

            <Panel title="Add a question">
                <form onSubmit={submit} className="space-y-4">
                    <FaqFields id="faq-new" form={form} />
                    <Button type="submit" size="sm" disabled={form.processing}>
                        Add question
                    </Button>
                </form>
            </Panel>

            {faqs.length === 0 ? (
                <EmptyState title="No questions yet">
                    Add the first question above.
                </EmptyState>
            ) : (
                <ul className="space-y-4">
                    {faqs.map((faq, index) => (
                        <FaqRow key={faq.id} faq={faq} index={index} />
                    ))}
                </ul>
            )}
        </div>
    );
}
