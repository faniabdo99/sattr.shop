import { Head, router, useForm } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import type { FormEvent } from 'react';
import { BilingualField } from '@/components/admin/bilingual-field';
import { CheckField, FieldError, Panel } from '@/components/admin/form';
import { MediaManager } from '@/components/admin/media-manager';
import { PageHeader } from '@/components/admin/page-header';
import { RichText } from '@/components/admin/rich-text';
import { SeoFields } from '@/components/admin/seo-fields';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { bi, pageClass } from '@/lib/admin';
import type { Bilingual, FormErrors, MediaItem } from '@/types/admin';

type Props = {
    page: {
        id: number | null;
        type: 'faculty' | 'static';
        key: string | null;
        slug: unknown;
        title: unknown;
        excerpt: unknown;
        body: unknown;
        is_published: boolean;
        meta_title: unknown;
        meta_description: unknown;
        canonical_url: string | null;
        noindex: boolean;
    };
    media: Record<'og', MediaItem[]> | null;
    urls: {
        index: string;
        save: string;
        destroy: string | null;
        view: Bilingual | null;
    };
};

type PageForm = {
    slug: Bilingual;
    title: Bilingual;
    excerpt: Bilingual;
    body: Bilingual;
    is_published: boolean;
    meta_title: Bilingual;
    meta_description: Bilingual;
    canonical_url: string;
    noindex: boolean;
};

export default function PageFormPage({ page, media, urls }: Props) {
    const exists = page.id !== null;
    const isFaculty = page.type === 'faculty';
    const form = useForm<PageForm>({
        slug: bi(page.slug),
        title: bi(page.title),
        excerpt: bi(page.excerpt),
        body: bi(page.body),
        is_published: Boolean(page.is_published),
        meta_title: bi(page.meta_title),
        meta_description: bi(page.meta_description),
        canonical_url: page.canonical_url ?? '',
        noindex: Boolean(page.noindex),
    });
    const errors = form.errors as FormErrors;
    const heading = exists
        ? bi(page.title).en || bi(page.title).ar || 'Page'
        : 'New static page';

    const setBody = (locale: keyof Bilingual, html: string) =>
        form.setData((data) => ({
            ...data,
            body: { ...data.body, [locale]: html },
        }));

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
                `Delete the page "${heading}"? This cannot be undone.`,
            )
        ) {
            router.delete(urls.destroy);
        }
    };

    return (
        <div className={pageClass}>
            <Head title={heading} />
            <PageHeader
                title={heading}
                back={{
                    href: urls.index,
                    label: isFaculty ? 'Faculty pages' : 'Static pages',
                }}
                description={
                    exists && (
                        <span className="flex flex-wrap items-center gap-2">
                            <StatusBadge
                                value={
                                    page.is_published ? 'published' : 'draft'
                                }
                            />
                            {isFaculty ? 'Faculty landing page' : 'Static page'}
                            {page.key && (
                                <span className="font-mono text-xs">
                                    {page.key}
                                </span>
                            )}
                        </span>
                    )
                }
                actions={
                    <>
                        {urls.view && (
                            <>
                                <Button asChild variant="outline" size="sm">
                                    <a
                                        href={urls.view.ar}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <ExternalLink aria-hidden />
                                        View AR
                                    </a>
                                </Button>
                                <Button asChild variant="outline" size="sm">
                                    <a
                                        href={urls.view.en}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <ExternalLink aria-hidden />
                                        View EN
                                    </a>
                                </Button>
                            </>
                        )}
                        <Button
                            type="submit"
                            form="page-form"
                            disabled={form.processing}
                        >
                            {exists ? 'Save page' : 'Create page'}
                        </Button>
                    </>
                }
            />

            <form id="page-form" onSubmit={submit} className="space-y-6">
                <Panel title="Page">
                    <BilingualField
                        label="Title"
                        name="title"
                        value={form.data.title}
                        onChange={(value) => form.setData('title', value)}
                        errors={errors}
                        hint="The page heading (H1)."
                        required
                    />
                    <BilingualField
                        label="Slug"
                        name="slug"
                        value={form.data.slug}
                        onChange={(value) => form.setData('slug', value)}
                        errors={errors}
                        hint="The URL segment. Words joined by hyphens; the English slug is lowercase Latin only. Changing a published slug breaks old links unless you add a redirect."
                        required
                    />
                    <BilingualField
                        label="Excerpt"
                        name="excerpt"
                        value={form.data.excerpt}
                        onChange={(value) => form.setData('excerpt', value)}
                        errors={errors}
                        multiline
                        rows={3}
                        hint="The intro paragraph, and the default meta description."
                    />
                    <CheckField
                        id="is_published"
                        label="Published"
                        hint="Drafts are not visible on the site."
                        checked={form.data.is_published}
                        onChange={(checked) =>
                            form.setData('is_published', checked)
                        }
                        error={errors.is_published}
                    />
                </Panel>

                <Panel title="Body">
                    <div className="grid gap-1.5">
                        <h3 className="text-xs text-muted-foreground">
                            Arabic
                        </h3>
                        <RichText
                            label="Body, Arabic"
                            dir="rtl"
                            value={form.data.body.ar}
                            onChange={(html) => setBody('ar', html)}
                        />
                        <FieldError message={errors['body.ar']} />
                    </div>
                    <div className="grid gap-1.5">
                        <h3 className="text-xs text-muted-foreground">
                            English
                        </h3>
                        <RichText
                            label="Body, English"
                            dir="ltr"
                            value={form.data.body.en}
                            onChange={(html) => setBody('en', html)}
                        />
                        <FieldError message={errors['body.en']} />
                    </div>
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

                <div className="flex items-center justify-between gap-3">
                    {urls.destroy ? (
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-danger hover:text-danger"
                            onClick={destroy}
                        >
                            Delete page
                        </Button>
                    ) : (
                        <span />
                    )}
                    <Button type="submit" disabled={form.processing}>
                        {exists ? 'Save page' : 'Create page'}
                    </Button>
                </div>
            </form>

            {page.id !== null && media ? (
                <MediaManager
                    model="page"
                    id={page.id}
                    collection="og"
                    items={media.og}
                    title="Social share image"
                    hint="One image, 1200 × 630, used when the page is shared."
                    single
                />
            ) : (
                <p className="text-sm text-muted-foreground">
                    The social share image can be added after the first save.
                </p>
            )}
        </div>
    );
}
