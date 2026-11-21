import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { BilingualField } from '@/components/admin/bilingual-field';
import {
    controlClass,
    Field,
    FieldError,
    Panel,
} from '@/components/admin/form';
import { MediaManager } from '@/components/admin/media-manager';
import { PageHeader } from '@/components/admin/page-header';
import { SeoFields } from '@/components/admin/seo-fields';
import { Button } from '@/components/ui/button';
import { bi, pageClass } from '@/lib/admin';
import { cn } from '@/lib/utils';
import type { Bilingual, FormErrors, MediaItem } from '@/types/admin';

type ContentRow = { title: Bilingual; detail: Bilingual };
type SpecRow = { label: Bilingual; value: Bilingual };

type Props = {
    product: {
        id: number;
        name: unknown;
        tagline: unknown;
        description: unknown;
        price_egp: number;
        instapay_discount_percent: number;
        instapay_price_egp: number;
        contents: { title?: unknown; detail?: unknown }[];
        specs: { label?: unknown; value?: unknown }[];
        meta_title: unknown;
        meta_description: unknown;
        canonical_url: string | null;
        noindex: boolean;
    };
    media: Record<'hero' | 'gallery' | 'unboxing' | 'og', MediaItem[]>;
    update_url: string;
};

type ProductForm = {
    name: Bilingual;
    tagline: Bilingual;
    description: Bilingual;
    price_egp: string;
    instapay_discount_percent: string;
    contents: ContentRow[];
    specs: SpecRow[];
    meta_title: Bilingual;
    meta_description: Bilingual;
    canonical_url: string;
    noindex: boolean;
};

const blank: Bilingual = { ar: '', en: '' };
const inputClass = cn(controlClass, 'h-9 py-1 tabular-nums');

export default function ProductEdit({ product, media, update_url }: Props) {
    const form = useForm<ProductForm>({
        name: bi(product.name),
        tagline: bi(product.tagline),
        description: bi(product.description),
        price_egp: String(product.price_egp),
        instapay_discount_percent: String(product.instapay_discount_percent),
        contents: (product.contents ?? []).map((row) => ({
            title: bi(row.title),
            detail: bi(row.detail),
        })),
        specs: (product.specs ?? []).map((row) => ({
            label: bi(row.label),
            value: bi(row.value),
        })),
        meta_title: bi(product.meta_title),
        meta_description: bi(product.meta_description),
        canonical_url: product.canonical_url ?? '',
        noindex: Boolean(product.noindex),
    });
    const errors = form.errors as FormErrors;

    const price = Number(form.data.price_egp);
    const percent = Number(form.data.instapay_discount_percent);
    const previewValid =
        Number.isFinite(price) &&
        price > 0 &&
        Number.isFinite(percent) &&
        percent >= 0 &&
        percent <= 90;
    const instapayPrice = previewValid
        ? Math.floor((price * (100 - percent)) / 100)
        : null;

    const setContent = (index: number, patch: Partial<ContentRow>) =>
        form.setData(
            'contents',
            form.data.contents.map((row, current) =>
                current === index ? { ...row, ...patch } : row,
            ),
        );

    const setSpec = (index: number, patch: Partial<SpecRow>) =>
        form.setData(
            'specs',
            form.data.specs.map((row, current) =>
                current === index ? { ...row, ...patch } : row,
            ),
        );

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put(update_url, { preserveScroll: true });
    };

    return (
        <div className={pageClass}>
            <Head title="Product" />
            <PageHeader
                title="Product"
                description="The gift pack itself: copy, price, what is inside and its images."
                actions={
                    <Button
                        type="submit"
                        form="product-form"
                        disabled={form.processing}
                    >
                        Save product
                    </Button>
                }
            />

            <form id="product-form" onSubmit={submit} className="space-y-6">
                <Panel title="Copy">
                    <BilingualField
                        label="Name"
                        name="name"
                        value={form.data.name}
                        onChange={(value) => form.setData('name', value)}
                        errors={errors}
                        required
                    />
                    <BilingualField
                        label="Tagline"
                        name="tagline"
                        value={form.data.tagline}
                        onChange={(value) => form.setData('tagline', value)}
                        errors={errors}
                    />
                    <BilingualField
                        label="Description"
                        name="description"
                        value={form.data.description}
                        onChange={(value) => form.setData('description', value)}
                        errors={errors}
                        multiline
                        rows={5}
                    />
                </Panel>

                <Panel title="Pricing">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Field
                            id="price_egp"
                            label="Price (EGP)"
                            error={errors.price_egp}
                        >
                            <input
                                id="price_egp"
                                type="number"
                                inputMode="decimal"
                                min={1}
                                max={100000}
                                step="0.01"
                                required
                                value={form.data.price_egp}
                                onChange={(event) =>
                                    form.setData(
                                        'price_egp',
                                        event.target.value,
                                    )
                                }
                                className={inputClass}
                            />
                        </Field>
                        <Field
                            id="instapay_discount_percent"
                            label="InstaPay discount (%)"
                            error={errors.instapay_discount_percent}
                        >
                            <input
                                id="instapay_discount_percent"
                                type="number"
                                inputMode="numeric"
                                min={0}
                                max={90}
                                step={1}
                                required
                                value={form.data.instapay_discount_percent}
                                onChange={(event) =>
                                    form.setData(
                                        'instapay_discount_percent',
                                        event.target.value,
                                    )
                                }
                                className={inputClass}
                            />
                        </Field>
                        <div className="grid content-start gap-1.5">
                            <span className="text-sm leading-none font-medium">
                                InstaPay price
                            </span>
                            <output
                                htmlFor="price_egp instapay_discount_percent"
                                className="flex h-9 items-center text-lg font-semibold tabular-nums"
                            >
                                {instapayPrice === null
                                    ? '—'
                                    : `EGP ${instapayPrice.toLocaleString('en')}`}
                            </output>
                            <p className="text-xs text-muted-foreground">
                                Rounded down to a whole pound.
                            </p>
                        </div>
                    </div>
                </Panel>

                <Panel
                    title="What is inside"
                    description="Each item in the pack, in display order."
                    actions={
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={form.data.contents.length >= 20}
                            onClick={() =>
                                form.setData('contents', [
                                    ...form.data.contents,
                                    { title: blank, detail: blank },
                                ])
                            }
                        >
                            <Plus aria-hidden />
                            Add item
                        </Button>
                    }
                >
                    {form.data.contents.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No items yet.
                        </p>
                    )}
                    {form.data.contents.map((row, index) => (
                        <fieldset
                            key={index}
                            className="grid gap-3 border-b border-border pb-5 last:border-b-0 last:pb-0"
                        >
                            <legend className="sr-only">
                                Item {index + 1}
                            </legend>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                                    Item {index + 1}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-danger hover:text-danger"
                                    onClick={() =>
                                        form.setData(
                                            'contents',
                                            form.data.contents.filter(
                                                (_, current) =>
                                                    current !== index,
                                            ),
                                        )
                                    }
                                >
                                    <Trash2 aria-hidden />
                                    Remove
                                </Button>
                            </div>
                            <BilingualField
                                label="Title"
                                name={`contents.${index}.title`}
                                value={row.title}
                                onChange={(title) =>
                                    setContent(index, { title })
                                }
                                errors={errors}
                                required
                            />
                            <BilingualField
                                label="Detail"
                                name={`contents.${index}.detail`}
                                value={row.detail}
                                onChange={(detail) =>
                                    setContent(index, { detail })
                                }
                                errors={errors}
                            />
                        </fieldset>
                    ))}
                    <FieldError message={errors.contents} />
                </Panel>

                <Panel
                    title="Specifications"
                    description="Label and value pairs shown in the specs table."
                    actions={
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={form.data.specs.length >= 30}
                            onClick={() =>
                                form.setData('specs', [
                                    ...form.data.specs,
                                    { label: blank, value: blank },
                                ])
                            }
                        >
                            <Plus aria-hidden />
                            Add spec
                        </Button>
                    }
                >
                    {form.data.specs.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No specs yet.
                        </p>
                    )}
                    {form.data.specs.map((row, index) => (
                        <fieldset
                            key={index}
                            className="grid gap-3 border-b border-border pb-5 last:border-b-0 last:pb-0"
                        >
                            <legend className="sr-only">
                                Spec {index + 1}
                            </legend>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                                    Spec {index + 1}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-danger hover:text-danger"
                                    onClick={() =>
                                        form.setData(
                                            'specs',
                                            form.data.specs.filter(
                                                (_, current) =>
                                                    current !== index,
                                            ),
                                        )
                                    }
                                >
                                    <Trash2 aria-hidden />
                                    Remove
                                </Button>
                            </div>
                            <BilingualField
                                label="Label"
                                name={`specs.${index}.label`}
                                value={row.label}
                                onChange={(label) => setSpec(index, { label })}
                                errors={errors}
                                required
                            />
                            <BilingualField
                                label="Value"
                                name={`specs.${index}.value`}
                                value={row.value}
                                onChange={(value) => setSpec(index, { value })}
                                errors={errors}
                                required
                            />
                        </fieldset>
                    ))}
                    <FieldError message={errors.specs} />
                </Panel>

                <Panel title="SEO">
                    <SeoFields
                        data={form.data}
                        onChange={(patch) =>
                            form.setData((data) => ({ ...data, ...patch }))
                        }
                        errors={errors}
                    />
                </Panel>

                <div className="flex justify-end">
                    <Button type="submit" disabled={form.processing}>
                        Save product
                    </Button>
                </div>
            </form>

            <section className="space-y-4">
                <div>
                    <h2 className="text-base font-semibold">Images</h2>
                    <p className="text-sm text-muted-foreground">
                        Images save on upload, separately from the form above.
                    </p>
                </div>
                <div className="grid items-start gap-6 lg:grid-cols-2">
                    <MediaManager
                        model="product"
                        id={product.id}
                        collection="hero"
                        items={media.hero}
                        title="Hero image"
                        single
                    />
                    <MediaManager
                        model="product"
                        id={product.id}
                        collection="og"
                        items={media.og}
                        title="Social share image"
                        hint="One image, 1200 × 630, used when the product is shared."
                        single
                    />
                    <MediaManager
                        model="product"
                        id={product.id}
                        collection="gallery"
                        items={media.gallery}
                        title="Gallery"
                    />
                    <MediaManager
                        model="product"
                        id={product.id}
                        collection="unboxing"
                        items={media.unboxing}
                        title="Unboxing"
                        hint="3 images, in order: box, lid, contents."
                    />
                </div>
            </section>
        </div>
    );
}
