import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/brand/Badge';
import { Nib } from '@/components/brand/Nib';
import { SignatureLine } from '@/components/brand/SignatureLine';
import { ArticleCard } from '@/components/site/article-card';
import { Cta } from '@/components/site/cta';
import { DesignPicker, editionOverline } from '@/components/site/design-picker';
import { BoxClosed, BoxContents, BoxLid } from '@/components/site/drawings';
import { FaqList } from '@/components/site/faq-list';
import { TextAreaField } from '@/components/site/fields';
import { Notebook } from '@/components/site/notebook';
import { checkoutUrl, useInstapayBadge } from '@/components/site/order-panel';
import { CoverPreview, MessageCard } from '@/components/site/personalizer';
import { Picture } from '@/components/site/picture';
import { Reveal } from '@/components/site/reveal';
import { ReviewList } from '@/components/site/review-list';
import { SectionHeading } from '@/components/site/section-heading';
import { StickyOrderBar } from '@/components/site/sticky-order-bar';
import { useSite, useT } from '@/hooks/use-t';
import { localDigits } from '@/lib/money';
import { track } from '@/lib/track';
import type {
    ArticleCard as Article,
    Design,
    Faq,
    Product,
    Review,
} from '@/types/site';

type Props = {
    product: Product;
    designs: Design[];
    faqs: Faq[];
    reviews: Review[];
    articles: Article[];
};

const UNBOXING = [BoxClosed, BoxLid, BoxContents];

export default function Home({
    product,
    designs,
    faqs,
    reviews,
    articles,
}: Props) {
    const t = useT();
    const { site, locale } = useSite();
    const available = designs.find((design) => !design.sold_out) ?? designs[0];
    const [designKey, setDesignKey] = useState(available?.key ?? null);
    const [message, setMessage] = useState('');
    const design = designs.find((item) => item.key === designKey) ?? available;
    const totalStock = designs.reduce((sum, item) => sum + item.stock, 0);
    const badge = useInstapayBadge(product);

    useEffect(() => {
        track('view_item', {
            value: product.price / 100,
            items: [
                {
                    item_id: 'gift-pack',
                    item_name: product.name,
                    price: product.price / 100,
                    quantity: 1,
                },
            ],
        });
    }, [product.name, product.price]);

    const choose = (key: string) => {
        setDesignKey(key);
        track('select_design', { design: key });
    };

    const money = {
        price: product.price_label,
        instapay: product.instapay_label,
        saving: product.saving_label,
        percent: localDigits(product.discount_percent, locale),
    };

    return (
        <>
            {/* Hero: ruled paper ground, one blue focal point (the CTA). */}
            <section className="ruled-pattern border-b border-sand">
                <div className="wrap grid items-center gap-10 py-12 md:grid-cols-12 md:gap-8 md:py-24">
                    <div className="md:col-span-7">
                        <h1 className="display text-display-xl">
                            {t('home.hero_title')}
                        </h1>
                        <p className="measure mt-6 text-body-l text-ink-muted">
                            {t('home.hero_body')}
                        </p>
                        <p className="mt-8 flex flex-wrap items-center gap-3">
                            <span className="price text-title">
                                {product.price_label}
                            </span>
                            <Badge>{badge}</Badge>
                        </p>
                        <p className="mt-1 text-caption text-ink-muted">
                            {t('product.free_delivery')}
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                            {product.sold_out ? (
                                <Cta disabled>{t('product.sold_out_all')}</Cta>
                            ) : (
                                <Cta
                                    href={product.checkout_url}
                                    onClick={() =>
                                        track('order_cta_clicked', {
                                            cta_location: 'hero',
                                        })
                                    }
                                >
                                    {t('cta.order')}
                                </Cta>
                            )}
                            <a
                                href="#faculties"
                                className="link-line !bg-[length:100%_1.5px] text-label"
                            >
                                {t('cta.see_editions')}
                            </a>
                        </div>
                    </div>
                    <div className="md:col-span-5">
                        {product.hero ? (
                            <div className="rounded-lg bg-sand-deep p-6 md:p-8">
                                <Picture
                                    image={product.hero}
                                    ratio="4 / 5"
                                    sizes="(min-width: 768px) 36vw, 90vw"
                                    priority
                                    className="rounded-sm shadow-product"
                                />
                            </div>
                        ) : (
                            <div
                                role="img"
                                aria-label={t('home.hero_alt')}
                                className="relative aspect-[4/5] overflow-hidden rounded-lg bg-sand-deep"
                            >
                                {designs.slice(0, 3).map((item, index) => (
                                    <div
                                        key={item.key}
                                        className="absolute w-[46%] drop-shadow-[0_30px_24px_rgb(28_27_25_/_0.28)]"
                                        style={{
                                            insetInlineStart: `${12 + index * 16}%`,
                                            top: `${14 + index * 7}%`,
                                            zIndex: index,
                                        }}
                                    >
                                        <Notebook
                                            designKey={item.key}
                                            tint={item.tint}
                                            overline={editionOverline(item)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* What's inside */}
            <section
                id="contents"
                aria-labelledby="contents-title"
                className="wrap section scroll-mt-24"
            >
                <SectionHeading
                    id="contents-title"
                    overline={t('home.over.contents')}
                    title={t('home.contents_title')}
                    lede={t('home.contents_lede')}
                />
                <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-8">
                    {product.contents.map((item, index) => (
                        <li key={item.title}>
                            <Reveal delay={index * 80}>
                                <Picture
                                    image={product.gallery[index]}
                                    ratio="1 / 1"
                                    sizes="(min-width: 1024px) 22vw, 45vw"
                                    fallback={
                                        <BoxContents className="w-3/5 text-ink-muted" />
                                    }
                                />
                                <h3 className="mt-4 flex items-start gap-2 text-body-l font-semibold">
                                    <Nib className="mt-1.5 h-4 shrink-0 text-ink" />
                                    {item.title}
                                </h3>
                                <p className="mt-1 ps-6 text-ink-muted">
                                    {item.detail}
                                </p>
                            </Reveal>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Unboxing sequence */}
            <section
                aria-labelledby="unboxing-title"
                className="section bg-sand-deep"
            >
                <div className="wrap">
                    <SectionHeading
                        id="unboxing-title"
                        overline={t('home.over.unboxing')}
                        title={t('home.unboxing_title')}
                        lede={t('home.unboxing_lede')}
                    />
                    <ol className="grid gap-8 md:grid-cols-3">
                        {UNBOXING.map((Drawing, index) => (
                            <li key={index}>
                                <Reveal delay={index * 100}>
                                    <Picture
                                        image={product.unboxing[index]}
                                        ratio="4 / 3"
                                        sizes="(min-width: 768px) 33vw, 100vw"
                                        className="bg-paper"
                                        fallback={
                                            <Drawing className="w-3/5 text-ink-muted" />
                                        }
                                    />
                                    <p className="mt-4 flex items-baseline gap-3">
                                        <span className="price text-label text-ink-muted">
                                            {localDigits(index + 1, locale)}
                                        </span>
                                        <span className="text-title">
                                            {t(
                                                `home.unboxing_steps.${index}.title`,
                                            )}
                                        </span>
                                    </p>
                                    <p className="mt-1 text-ink-muted">
                                        {t(`home.unboxing_steps.${index}.body`)}
                                    </p>
                                </Reveal>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Faculty editions: each card links to that edition's page. */}
            <section
                id="faculties"
                aria-labelledby="faculties-title"
                className="wrap section scroll-mt-24"
            >
                <SectionHeading
                    id="faculties-title"
                    overline={t('home.over.faculties')}
                    title={t('home.faculties_title')}
                    lede={t('home.faculties_lede')}
                />
                <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                    {designs.map((item) => (
                        <li key={item.key}>
                            <Link
                                href={item.url ?? product.url}
                                className="group block h-full rounded-lg border border-sand bg-paper-raised p-4 transition-colors duration-300 hover:border-ink md:p-6"
                            >
                                <p className="overline" dir="ltr">
                                    {editionOverline(item)}
                                </p>
                                <div className="mt-4 rounded-lg bg-sand-deep px-[20%] py-[12%]">
                                    {item.cover ? (
                                        <Picture
                                            image={item.cover}
                                            ratio="5 / 7"
                                            sizes="(min-width: 768px) 16vw, 32vw"
                                            className="rounded-sm"
                                        />
                                    ) : (
                                        <Notebook
                                            designKey={item.key}
                                            tint={item.tint}
                                        />
                                    )}
                                </div>
                                <h3 className="mt-4 text-body-l font-semibold">
                                    {item.name}
                                </h3>
                                <p className="mt-1 text-caption text-ink-muted">
                                    {item.sold_out
                                        ? t('product.sold_out')
                                        : item.motif}
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            {/* The message card */}
            {design && (
                <section
                    aria-labelledby="personal-title"
                    className="ruled-pattern border-y border-sand"
                >
                    <div className="wrap section">
                        <SectionHeading
                            id="personal-title"
                            overline={t('home.over.personal')}
                            title={t('home.personal_title')}
                            lede={t('home.personal_lede')}
                        />
                        <div className="grid gap-8 md:grid-cols-12">
                            <CoverPreview
                                design={design}
                                className="md:col-span-5"
                            />
                            <div className="flex flex-col gap-8 md:col-span-6 md:col-start-7">
                                <DesignPicker
                                    designs={designs}
                                    value={design.key}
                                    onChange={choose}
                                    name="home-design"
                                    legend={t('product.choose_design')}
                                />
                                <TextAreaField
                                    label={t('product.gift_message')}
                                    optional={t('product.optional')}
                                    placeholder={t(
                                        'product.gift_message_placeholder',
                                    )}
                                    counter={`${message.length}/200`}
                                    maxLength={200}
                                    value={message}
                                    onChange={(event) =>
                                        setMessage(event.target.value)
                                    }
                                />
                                <MessageCard message={message} />
                                <div>
                                    <Cta
                                        variant="ghost"
                                        href={checkoutUrl(
                                            product.checkout_url,
                                            design.key,
                                            message,
                                        )}
                                        disabled={design.sold_out}
                                        onClick={() =>
                                            track('order_cta_clicked', {
                                                cta_location: 'personalizer',
                                                design: design.key,
                                                has_gift_message:
                                                    message.trim() !== '',
                                            })
                                        }
                                    >
                                        {design.sold_out
                                            ? t('product.sold_out')
                                            : t('cta.order_design')}
                                    </Cta>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Occasions */}
            <section aria-labelledby="moments-title" className="wrap section">
                <SectionHeading
                    id="moments-title"
                    overline={t('home.over.moments')}
                    title={t('home.moments_title')}
                />
                <div className="grid gap-4 md:grid-cols-3 md:gap-6">
                    {[0, 1, 2].map((index) => (
                        <Reveal
                            key={index}
                            delay={index * 100}
                            className="rounded-lg border border-sand bg-paper-raised p-4 md:p-6"
                        >
                            <h3 className="text-title">
                                {t(`home.moments.${index}.title`)}
                            </h3>
                            <p className="mt-2 text-ink-muted">
                                {t(`home.moments.${index}.body`)}
                            </p>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* Payment reassurance band */}
            <section
                aria-labelledby="assurance-title"
                data-theme="ink"
                className="section"
            >
                <div className="wrap">
                    <p className="mb-3 overline">{t('home.over.assurance')}</p>
                    <SignatureLine className="max-w-24" />
                    <div className="mt-6 flex flex-wrap items-center gap-4">
                        <h2
                            id="assurance-title"
                            className="display text-display-l"
                        >
                            {t('home.assurance_title')}
                        </h2>
                        <Badge tone="line">{badge}</Badge>
                    </div>
                    <dl className="mt-8 grid gap-x-8 md:mt-12 md:grid-cols-2">
                        {[0, 1, 2, 3].map((index) => (
                            <div
                                key={index}
                                className="border-t border-sand py-6"
                            >
                                <dt className="text-title">
                                    {t(`home.assurance.${index}.title`, money)}
                                </dt>
                                <dd className="mt-2 max-w-md text-ink-muted">
                                    {t(`home.assurance.${index}.body`, money)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* Reviews */}
            {reviews.length > 0 && (
                <section
                    aria-labelledby="reviews-title"
                    className="wrap section"
                >
                    <SectionHeading
                        id="reviews-title"
                        overline={t('home.over.reviews')}
                        title={t('home.reviews_title')}
                    />
                    <ReviewList reviews={reviews} />
                </section>
            )}

            {/* FAQ */}
            {faqs.length > 0 && (
                <section aria-labelledby="faq-title" className="wrap section">
                    <div className="grid gap-8 md:grid-cols-12">
                        <SectionHeading
                            id="faq-title"
                            overline={t('home.over.faq')}
                            title={t('home.faq_title')}
                            className="md:col-span-5"
                        />
                        <div className="md:col-span-7">
                            <FaqList faqs={faqs} />
                        </div>
                    </div>
                </section>
            )}

            {/* Journal */}
            {articles.length > 0 && (
                <section
                    aria-labelledby="journal-title"
                    className="wrap section"
                >
                    <SectionHeading
                        id="journal-title"
                        overline={t('home.over.journal')}
                        title={t('home.journal_title')}
                        lede={
                            <Link
                                href={site.journal}
                                className="link-line !bg-[length:100%_1.5px] text-label text-ink"
                            >
                                {t('home.journal_all')}
                            </Link>
                        }
                    />
                    <div className="grid gap-8 md:grid-cols-3">
                        {articles.map((article) => (
                            <ArticleCard key={article.url} article={article} />
                        ))}
                    </div>
                </section>
            )}

            {/* Final call */}
            <section className="ruled-pattern border-t border-sand">
                <div className="wrap section flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="mb-3 overline">{t('home.over.final')}</p>
                        <SignatureLine className="max-w-24" />
                        <h2 className="display mt-6 max-w-3xl text-display-l">
                            {t('home.final_title')}
                        </h2>
                        {totalStock > 0 && (
                            <p className="mt-4 text-ink-muted">
                                {t('home.final_body', {
                                    count: localDigits(totalStock, locale),
                                })}
                            </p>
                        )}
                    </div>
                    {product.sold_out ? (
                        <Cta disabled>{t('product.sold_out_all')}</Cta>
                    ) : (
                        <Cta
                            href={product.checkout_url}
                            onClick={() =>
                                track('order_cta_clicked', {
                                    cta_location: 'final',
                                })
                            }
                        >
                            {t('cta.order')}
                        </Cta>
                    )}
                </div>
            </section>

            <StickyOrderBar product={product} href={product.checkout_url} />
        </>
    );
}
