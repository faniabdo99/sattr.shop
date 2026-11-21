import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { BilingualField } from '@/components/admin/bilingual-field';
import { controlClass, Field, Panel } from '@/components/admin/form';
import { PageHeader } from '@/components/admin/page-header';
import { EmptyState } from '@/components/admin/table';
import { Button } from '@/components/ui/button';
import { bi, pageClass } from '@/lib/admin';
import { cn } from '@/lib/utils';
import type { Bilingual, FormErrors } from '@/types/admin';

type Category = {
    id: number;
    name: unknown;
    slug: unknown;
    sort: number;
    articles: number;
    url: string;
};

type Props = {
    categories: Category[];
    store_url: string;
    articles_url: string;
};

type CategoryForm = { name: Bilingual; slug: Bilingual; sort: string };

const blank: Bilingual = { ar: '', en: '' };

function CategoryFields({
    id,
    form,
}: {
    id: string;
    form: ReturnType<typeof useForm<CategoryForm>>;
}) {
    const errors = form.errors as FormErrors;

    return (
        <>
            <BilingualField
                label="Name"
                name="name"
                value={form.data.name}
                onChange={(value) => form.setData('name', value)}
                errors={errors}
                required
            />
            <BilingualField
                label="Slug"
                name="slug"
                value={form.data.slug}
                onChange={(value) => form.setData('slug', value)}
                errors={errors}
                hint="Words joined by hyphens; the English slug is lowercase Latin only."
                required
            />
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
                    required
                    value={form.data.sort}
                    onChange={(event) =>
                        form.setData('sort', event.target.value)
                    }
                    className={cn(controlClass, 'h-9 py-1 tabular-nums')}
                />
            </Field>
        </>
    );
}

function CategoryRow({ category }: { category: Category }) {
    const form = useForm<CategoryForm>({
        name: bi(category.name),
        slug: bi(category.slug),
        sort: String(category.sort),
    });
    const label = bi(category.name).en || bi(category.name).ar;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put(category.url, { preserveScroll: true });
    };

    const destroy = () => {
        if (
            window.confirm(
                `Delete the category "${label}"? Its ${category.articles} article(s) become uncategorised.`,
            )
        ) {
            router.delete(category.url, { preserveScroll: true });
        }
    };

    return (
        <li className="rounded-md border border-border bg-card">
            <form
                onSubmit={submit}
                aria-label={`Category ${label}`}
                className="space-y-4 p-4"
            >
                <CategoryFields id={`category-${category.id}`} form={form} />
                <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                    <span className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:text-danger"
                            onClick={destroy}
                        >
                            Delete
                        </Button>
                        <span className="text-xs text-muted-foreground tabular-nums">
                            {category.articles}{' '}
                            {category.articles === 1 ? 'article' : 'articles'}
                        </span>
                    </span>
                    <Button type="submit" size="sm" disabled={form.processing}>
                        Save
                    </Button>
                </div>
            </form>
        </li>
    );
}

export default function Categories({
    categories,
    store_url,
    articles_url,
}: Props) {
    const form = useForm<CategoryForm>({
        name: blank,
        slug: blank,
        sort: String(
            categories.reduce((max, item) => Math.max(max, item.sort), 0) + 1,
        ),
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(store_url, {
            preserveScroll: true,
            onSuccess: () => form.reset('name', 'slug'),
        });
    };

    return (
        <div className={pageClass}>
            <Head title="Journal categories" />
            <PageHeader
                title="Journal categories"
                back={{ href: articles_url, label: 'Journal' }}
                description="Categories group journal articles and have their own listing pages."
            />

            <Panel title="Add a category">
                <form onSubmit={submit} className="space-y-4">
                    <CategoryFields id="category-new" form={form} />
                    <Button type="submit" size="sm" disabled={form.processing}>
                        Add category
                    </Button>
                </form>
            </Panel>

            {categories.length === 0 ? (
                <EmptyState title="No categories yet">
                    Add the first category above.
                </EmptyState>
            ) : (
                <ul className="space-y-4">
                    {categories.map((category) => (
                        <CategoryRow key={category.id} category={category} />
                    ))}
                </ul>
            )}
        </div>
    );
}
