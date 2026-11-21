import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { controlClass, FieldError, Panel } from '@/components/admin/form';
import { PageHeader } from '@/components/admin/page-header';
import { EmptyState } from '@/components/admin/table';
import { Button } from '@/components/ui/button';
import { pageClass } from '@/lib/admin';
import { cn } from '@/lib/utils';

type Redirect = {
    id: number;
    from_path: string;
    to_url: string;
    status_code: number;
    hits: number;
    is_active: boolean;
    url: string;
};

type Props = { redirects: Redirect[]; store_url: string };

type RedirectForm = {
    from_path: string;
    to_url: string;
    status_code: number;
    is_active: boolean;
};

const inputClass = cn(controlClass, 'h-9 py-1 font-mono text-xs');
const labelClass = 'text-xs text-muted-foreground';

function RedirectFields({
    id,
    form,
}: {
    id: string;
    form: ReturnType<typeof useForm<RedirectForm>>;
}) {
    return (
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_9rem_auto] md:items-start">
            <div className="grid gap-1">
                <label htmlFor={`${id}-from`} className={labelClass}>
                    From path
                </label>
                <input
                    id={`${id}-from`}
                    dir="ltr"
                    required
                    maxLength={255}
                    placeholder="/old-page"
                    value={form.data.from_path}
                    onChange={(event) =>
                        form.setData('from_path', event.target.value)
                    }
                    className={inputClass}
                />
                <FieldError message={form.errors.from_path} />
            </div>
            <div className="grid gap-1">
                <label htmlFor={`${id}-to`} className={labelClass}>
                    To URL
                </label>
                <input
                    id={`${id}-to`}
                    dir="ltr"
                    required
                    maxLength={255}
                    placeholder="/ar/new-page or https://…"
                    value={form.data.to_url}
                    onChange={(event) =>
                        form.setData('to_url', event.target.value)
                    }
                    className={inputClass}
                />
                <FieldError message={form.errors.to_url} />
            </div>
            <div className="grid gap-1">
                <label htmlFor={`${id}-code`} className={labelClass}>
                    Type
                </label>
                <select
                    id={`${id}-code`}
                    value={form.data.status_code}
                    onChange={(event) =>
                        form.setData('status_code', Number(event.target.value))
                    }
                    className={cn(controlClass, 'h-9 py-1 text-xs')}
                >
                    <option value={301}>301 permanent</option>
                    <option value={302}>302 temporary</option>
                </select>
                <FieldError message={form.errors.status_code} />
            </div>
            <div className="grid gap-1 md:pt-7">
                <label
                    htmlFor={`${id}-active`}
                    className="flex items-center gap-2 text-sm"
                >
                    <input
                        id={`${id}-active`}
                        type="checkbox"
                        checked={form.data.is_active}
                        onChange={(event) =>
                            form.setData('is_active', event.target.checked)
                        }
                        className="size-4 accent-line"
                    />
                    Active
                </label>
                <FieldError message={form.errors.is_active} />
            </div>
        </div>
    );
}

function RedirectRow({ redirect }: { redirect: Redirect }) {
    const form = useForm<RedirectForm>({
        from_path: redirect.from_path,
        to_url: redirect.to_url,
        status_code: redirect.status_code,
        is_active: Boolean(redirect.is_active),
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put(redirect.url, { preserveScroll: true });
    };

    const destroy = () => {
        if (window.confirm(`Delete the redirect from ${redirect.from_path}?`)) {
            router.delete(redirect.url, { preserveScroll: true });
        }
    };

    return (
        <li className="border-b border-border p-4 last:border-b-0">
            <form
                onSubmit={submit}
                aria-label={`Redirect from ${redirect.from_path}`}
                className="space-y-3"
            >
                <RedirectFields id={`redirect-${redirect.id}`} form={form} />
                <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {redirect.hits} {redirect.hits === 1 ? 'hit' : 'hits'}
                    </span>
                    <span className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:text-danger"
                            onClick={destroy}
                        >
                            Delete
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            variant="outline"
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

export default function Redirects({ redirects, store_url }: Props) {
    const form = useForm<RedirectForm>({
        from_path: '',
        to_url: '',
        status_code: 301,
        is_active: true,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(store_url, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <div className={pageClass}>
            <Head title="Redirects" />
            <PageHeader
                title="Redirects"
                description="Send an old path to a new URL. Add one whenever a published slug changes."
            />

            <Panel
                title="Add a redirect"
                description="The from path starts with /. The target is a site path or a full https:// URL."
            >
                <form onSubmit={submit} className="space-y-3">
                    <RedirectFields id="redirect-new" form={form} />
                    <Button type="submit" size="sm" disabled={form.processing}>
                        Add redirect
                    </Button>
                </form>
            </Panel>

            {redirects.length === 0 ? (
                <EmptyState title="No redirects yet">
                    Nothing is being redirected.
                </EmptyState>
            ) : (
                <ul className="rounded-md border border-border bg-card">
                    {redirects.map((redirect) => (
                        <RedirectRow key={redirect.id} redirect={redirect} />
                    ))}
                </ul>
            )}
        </div>
    );
}
