import { Head, Link, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { BilingualField } from '@/components/admin/bilingual-field';
import {
    CheckField,
    controlClass,
    Field,
    Panel,
} from '@/components/admin/form';
import { MediaManager } from '@/components/admin/media-manager';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { bi, pageClass } from '@/lib/admin';
import { cn } from '@/lib/utils';
import type { Bilingual, FormErrors, MediaItem } from '@/types/admin';

type Props = {
    design: {
        id: number | null;
        key: string;
        name: unknown;
        motif: unknown;
        tint: string;
        stock: number;
        sort: number;
        is_active: boolean;
    };
    media: Record<'gallery' | 'cover', MediaItem[]> | null;
    urls: {
        index: string;
        save: string;
        destroy: string | null;
        page: string | null;
    };
};

type DesignForm = {
    key: string;
    name: Bilingual;
    motif: Bilingual;
    tint: string;
    stock: string;
    sort: string;
    is_active: boolean;
};

const inputClass = cn(controlClass, 'h-9 py-1');
const hexPattern = /^#[0-9a-fA-F]{6}$/;

export default function DesignFormPage({ design, media, urls }: Props) {
    const exists = design.id !== null;
    const form = useForm<DesignForm>({
        key: design.key,
        name: bi(design.name),
        motif: bi(design.motif),
        tint: design.tint ?? '#1C1B19',
        stock: String(design.stock ?? 0),
        sort: String(design.sort ?? 0),
        is_active: Boolean(design.is_active),
    });
    const errors = form.errors as FormErrors;
    const title = exists
        ? bi(design.name).en || bi(design.name).ar || 'Design'
        : 'New design';

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (exists) {
            form.put(urls.save, { preserveScroll: true });
        } else {
            form.post(urls.save);
        }
    };

    const destroy = () => {
        if (
            urls.destroy &&
            window.confirm(
                `Delete the design "${title}" and its faculty page? This cannot be undone.`,
            )
        ) {
            router.delete(urls.destroy);
        }
    };

    return (
        <div className={pageClass}>
            <Head title={title} />
            <PageHeader
                title={title}
                back={{ href: urls.index, label: 'Designs' }}
                description={
                    exists
                        ? undefined
                        : 'Saving creates the design and a draft faculty page for it. Images are added after the first save.'
                }
                actions={
                    <>
                        {urls.page && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={urls.page}>Edit faculty page</Link>
                            </Button>
                        )}
                        <Button
                            type="submit"
                            form="design-form"
                            disabled={form.processing}
                        >
                            {exists ? 'Save design' : 'Create design'}
                        </Button>
                    </>
                }
            />

            <form id="design-form" onSubmit={submit} className="space-y-6">
                <Panel title="Design">
                    <Field
                        id="key"
                        label="Key"
                        error={errors.key}
                        hint="Lowercase letters, numbers and hyphens, e.g. medicine. Used in URLs and tracking."
                        className="max-w-sm"
                    >
                        <input
                            id="key"
                            required
                            maxLength={60}
                            pattern="[a-z0-9]+(-[a-z0-9]+)*"
                            value={form.data.key}
                            onChange={(event) =>
                                form.setData('key', event.target.value)
                            }
                            className={cn(inputClass, 'font-mono')}
                        />
                    </Field>
                    <BilingualField
                        label="Name"
                        name="name"
                        value={form.data.name}
                        onChange={(value) => form.setData('name', value)}
                        errors={errors}
                        required
                    />
                    <BilingualField
                        label="Motif"
                        name="motif"
                        value={form.data.motif}
                        onChange={(value) => form.setData('motif', value)}
                        errors={errors}
                        hint="A short line describing the cover artwork."
                    />
                </Panel>

                <Panel title="Colour, stock and order">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="grid content-start gap-1.5">
                            <label
                                htmlFor="tint"
                                className="text-sm leading-none font-medium"
                            >
                                Tint colour
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    aria-label="Pick tint colour"
                                    value={
                                        hexPattern.test(form.data.tint)
                                            ? form.data.tint
                                            : '#000000'
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            'tint',
                                            event.target.value.toUpperCase(),
                                        )
                                    }
                                    className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
                                />
                                <input
                                    id="tint"
                                    required
                                    maxLength={7}
                                    pattern="#[0-9a-fA-F]{6}"
                                    placeholder="#1C1B19"
                                    value={form.data.tint}
                                    onChange={(event) =>
                                        form.setData('tint', event.target.value)
                                    }
                                    className={cn(inputClass, 'font-mono')}
                                />
                            </div>
                            {errors.tint && (
                                <p role="alert" className="text-xs text-danger">
                                    {errors.tint}
                                </p>
                            )}
                        </div>
                        <Field id="stock" label="Stock" error={errors.stock}>
                            <input
                                id="stock"
                                type="number"
                                inputMode="numeric"
                                min={0}
                                max={100000}
                                required
                                value={form.data.stock}
                                onChange={(event) =>
                                    form.setData('stock', event.target.value)
                                }
                                className={cn(inputClass, 'tabular-nums')}
                            />
                        </Field>
                        <Field
                            id="sort"
                            label="Sort order"
                            error={errors.sort}
                            hint="Lower numbers show first."
                        >
                            <input
                                id="sort"
                                type="number"
                                inputMode="numeric"
                                min={0}
                                max={1000}
                                required
                                value={form.data.sort}
                                onChange={(event) =>
                                    form.setData('sort', event.target.value)
                                }
                                className={cn(inputClass, 'tabular-nums')}
                            />
                        </Field>
                    </div>
                    <CheckField
                        id="is_active"
                        label="Active"
                        hint="Inactive designs are hidden from the storefront."
                        checked={form.data.is_active}
                        onChange={(checked) =>
                            form.setData('is_active', checked)
                        }
                        error={errors.is_active}
                    />
                </Panel>

                <div className="flex items-center justify-between gap-3">
                    {urls.destroy ? (
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-danger hover:text-danger"
                            onClick={destroy}
                        >
                            Delete design
                        </Button>
                    ) : (
                        <span />
                    )}
                    <Button type="submit" disabled={form.processing}>
                        {exists ? 'Save design' : 'Create design'}
                    </Button>
                </div>
            </form>

            {design.id !== null && media && (
                <div className="grid items-start gap-6 lg:grid-cols-2">
                    <MediaManager
                        model="design"
                        id={design.id}
                        collection="cover"
                        items={media.cover}
                        title="Cover mock-up"
                        hint="A straight-on notebook cover mock-up."
                        single
                    />
                    <MediaManager
                        model="design"
                        id={design.id}
                        collection="gallery"
                        items={media.gallery}
                        title="Gallery"
                    />
                </div>
            )}
        </div>
    );
}
