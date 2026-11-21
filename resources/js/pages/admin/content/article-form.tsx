import { Head, router, useForm } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import type { FormEvent } from 'react';
import { BilingualField } from '@/components/admin/bilingual-field';
import {
    controlClass,
    Field,
    FieldError,
    NativeSelect,
    Panel,
} from '@/components/admin/form';
import { MediaManager } from '@/components/admin/media-manager';
import { PageHeader } from '@/components/admin/page-header';
import { RichText } from '@/components/admin/rich-text';
import { SeoFields } from '@/components/admin/seo-fields';
import { Button } from '@/components/ui/button';
import { bi, pageClass } from '@/lib/admin';
import { cn } from '@/lib/utils';
import type { Bilingual, FormErrors, MediaItem, Option } from '@/types/admin';

type Props = {
    article: {
        id: number | null;
        slug: unknown;
        title: unknown;
        excerpt: unknown;
        body: unknown;
        article_category_id: string;
        design_id: string;
        author_name: string;
        published_at: string;
        meta_title: unknown;
        meta_description: unknown;
        canonical_url: string | null;
        noindex: boolean;
    };
    media: Record<'cover' | 'og', MediaItem[]> | null;
    categories: Option[];
    designs: Option[];
    urls: {
        index: string;
        save: string;
        destroy: string | null;
        media: string;
        view: Bilingual | null;
    };
};

type ArticleForm = {
    slug: Bilingual;
    title: Bilingual;
    excerpt: Bilingual;
    body: Bilingual;
    article_category_id: string;
    design_id: string;
    author_name: string;
    published_at: string;
    meta_title: Bilingual;
    meta_description: Bilingual;
    canonical_url: string;
    noindex: boolean;
};

const inputClass = cn(controlClass, 'h-9 py-1');

export default function ArticleFormPage({
    article,
    media,
    categories,
    designs,
    urls,
}: Props) {
    const articleId = article.id;
    const exists = articleId !== null;
    const form = useForm<ArticleForm>({
        slug: bi(article.slug),
        title: bi(article.title),
        excerpt: bi(article.excerpt),
        body: bi(article.body),
        article_category_id: article.article_category_id ?? '',
        design_id: article.design_id ?? '',
        author_name: article.author_name ?? '',
        published_at: article.published_at ?? '',
        meta_title: bi(article.meta_title),
        meta_description: bi(article.meta_description),
        canonical_url: article.canonical_url ?? '',
        noindex: Boolean(article.noindex),
    });
    const errors = form.errors as FormErrors;
    const heading = exists
        ? bi(article.title).en || bi(article.title).ar || 'Article'
        : 'New article';

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
                `Delete the article "${heading}"? This cannot be undone.`,
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
                back={{ href: urls.index, label: 'Journal' }}
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
                            form="article-form"
                            disabled={form.processing}
                        >
                            {exists ? 'Save article' : 'Create article'}
                        </Button>
                    </>
                }
            />

            <form id="article-form" onSubmit={submit} className="space-y-6">
                <Panel title="Article">
                    <BilingualField
                        label="Title"
                        name="title"
                        value={form.data.title}
                        onChange={(value) => form.setData('title', value)}
                        errors={errors}
                        hint="The article heading (H1)."
                        required
                    />
                    <BilingualField
                        label="Slug"
                        name="slug"
                        value={form.data.slug}
                        onChange={(value) => form.setData('slug', value)}
                        errors={errors}
                        hint="The URL segment. Words joined by hyphens; the English slug is lowercase Latin only."
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
                        max={400}
                        hint="The intro paragraph, and the default meta description."
                    />
                </Panel>

                <Panel title="Publishing">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            id="article_category_id"
                            label="Category"
                            error={errors.article_category_id}
                            hint="Categories are managed from the Journal list."
                        >
                            <NativeSelect
                                id="article_category_id"
                                value={form.data.article_category_id}
                                onChange={(event) =>
                                    form.setData(
                                        'article_category_id',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">Uncategorised</option>
                                {categories.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </NativeSelect>
                        </Field>
                        <Field
                            id="design_id"
                            label="Related faculty design"
                            error={errors.design_id}
                            hint="Used to link the article to that faculty page."
                        >
                            <NativeSelect
                                id="design_id"
                                value={form.data.design_id}
                                onChange={(event) =>
                                    form.setData(
                                        'design_id',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">None</option>
                                {designs.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </NativeSelect>
                        </Field>
                        <Field
                            id="author_name"
                            label="Author name"
                            error={errors.author_name}
                        >
                            <input
                                id="author_name"
                                maxLength={80}
                                dir="auto"
                                value={form.data.author_name}
                                onChange={(event) =>
                                    form.setData(
                                        'author_name',
                                        event.target.value,
                                    )
                                }
                                className={inputClass}
                            />
                        </Field>
                        <Field
                            id="published_at"
                            label="Publish at (Cairo time)"
                            error={errors.published_at}
                            hint="Blank keeps the article as a draft. A future time schedules it."
                        >
                            <input
                                id="published_at"
                                type="datetime-local"
                                value={form.data.published_at}
                                onChange={(event) =>
                                    form.setData(
                                        'published_at',
                                        event.target.value,
                                    )
                                }
                                className={cn(inputClass, 'tabular-nums')}
                            />
                        </Field>
                    </div>
                </Panel>

                <Panel
                    title="Body"
                    description={
                        exists
                            ? 'Use the image button in the toolbar to upload images into the text.'
                            : 'Images can be added to the body after the first save.'
                    }
                >
                    <div className="grid gap-1.5">
                        <h3 className="text-xs text-muted-foreground">
                            Arabic
                        </h3>
                        <RichText
                            label="Body, Arabic"
                            dir="rtl"
                            value={form.data.body.ar}
                            onChange={(html) => setBody('ar', html)}
                            upload={
                                articleId !== null
                                    ? {
                                          url: urls.media,
                                          model: 'article',
                                          id: articleId,
                                          locale: 'ar',
                                      }
                                    : undefined
                            }
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
                            upload={
                                articleId !== null
                                    ? {
                                          url: urls.media,
                                          model: 'article',
                                          id: articleId,
                                          locale: 'en',
                                      }
                                    : undefined
                            }
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
                            Delete article
                        </Button>
                    ) : (
                        <span />
                    )}
                    <Button type="submit" disabled={form.processing}>
                        {exists ? 'Save article' : 'Create article'}
                    </Button>
                </div>
            </form>

            {articleId !== null && media ? (
                <div className="grid items-start gap-6 lg:grid-cols-2">
                    <MediaManager
                        model="article"
                        id={articleId}
                        collection="cover"
                        items={media.cover}
                        title="Cover image"
                        single
                    />
                    <MediaManager
                        model="article"
                        id={articleId}
                        collection="og"
                        items={media.og}
                        title="Social share image"
                        hint="One image, 1200 × 630, used when the article is shared."
                        single
                    />
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">
                    Cover and social share images can be added after the first
                    save.
                </p>
            )}
        </div>
    );
}
