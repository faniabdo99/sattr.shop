import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ArticleCard } from '@/components/site/article-card';
import { Cta } from '@/components/site/cta';
import { DesignPicker } from '@/components/site/design-picker';
import { BoxClosed, BoxContents, BoxLid } from '@/components/site/drawings';
import { FaqList } from '@/components/site/faq-list';
import { TextAreaField, TextField } from '@/components/site/fields';
import { Notebook } from '@/components/site/notebook';
import { checkoutUrl } from '@/components/site/order-panel';
import { CoverPreview, MessageCard } from '@/components/site/personalizer';
import { Picture } from '@/components/site/picture';
import { Reveal } from '@/components/site/reveal';
import { ReviewList } from '@/components/site/review-list';
import { RuledLine } from '@/components/site/ruled-line';
import { SectionHeading } from '@/components/site/section-heading';
import { StickyOrderBar } from '@/components/site/sticky-order-bar';
import { useSite, useT } from '@/hooks/use-t';
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
    const { site } = useSite();
    const available = designs.find((design) => !design.sold_out) ?? designs[0];
    const [designKey, setDesignKey] = useState(available?.key ?? null);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const design = designs.find((item) => item.key === designKey) ?? available;
    const totalStock = designs.reduce((sum, item) => sum + item.stock, 0);

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
    };

    return (
        <>
            {/* Hero */}
            <section className="wrap grid items-end gap-10 pt-10 pb-16 md:grid-cols-12 md:gap-8 md:pt-16 md:pb-24">
                <div className="md:col-span-7 md:pb-6">
                    <h1 className="display text-display-xl">
                        {t('home.hero_title')}
                    </h1>
                    <span
                        aria-hidden="true"
                        className="ruled mt-6 animate-[draw_1.6s_var(--ease-quiet)_0.2s_both] text-line md:mt-8"
                    />
                    <p className="measure mt-6 text-lede text-ink-soft md:mt-8">
                        {t('home.hero_body')}
                    </p>
                    <p className="mt-8 text-lg">
                        {t('home.hero_price', { price: product.price_label })}
                    </p>
                    <p className="text-ink-soft">
                        {t('home.hero_instapay', {
                            price: product.instapay_label,
                        })}
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                        {product.sold_out ? (
                            <Cta disabled>{t('product.sold_out_all')}</Cta>
                        ) : (
                            <Cta href={product.checkout_url}>
                                {t('cta.order_pack')}
                            </Cta>
                        )}
                        <a
                            href="#contents"
                            className="link-line text-[0.9375rem]"
                        >
                            {t('cta.see_inside')}
                        </a>
                    </div>
                </div>
                <div className="md:col-span-5">
                    {product.hero ? (
                        <Picture
                            image={product.hero}
                            ratio="4 / 5"
                            sizes="(min-width: 768px) 40vw, 100vw"
                            priority
                        />
                    ) : (
                        <div
                            role="img"
                            aria-label={t('home.hero_alt')}
                            className="relative aspect-[4/5] overflow-hidden bg-paper-deep"
                        >
                            <span className="absolute inset-3 border border-ink/10 sm:inset-4" />
                            {designs.slice(0, 3).map((item, index) => (
                                <div
                                    key={item.key}
                                    className="absolute top-[14%] w-[46%] drop-shadow-[0_18px_24px_rgba(28,27,25,0.18)]"
                                    style={{
                                        insetInlineStart: `${12 + index * 16}%`,
                                        top: `${14 + index * 7}%`,
                                        zIndex: index,
                                    }}
                                >
                                    <Notebook
                                        designKey={item.key}
                                        tint={item.tint}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* What's in the pack */}
            <section
                id="contents"
                aria-labelledby="contents-title"
                className="wrap scroll-mt-8 py-16 md:py-28"
            >
                <SectionHeading
                    id="contents-title"
                    title={t('home.contents_title')}
                    lede={t('home.contents_lede')}
                />
                <div className="grid gap-10 md:grid-cols-12 md:gap-8">
                    <Reveal className="md:col-span-6">
                        <Picture
                            image={product.gallery[0]}
                            ratio="1 / 1"
                            sizes="(min-width: 768px) 50vw, 100vw"
                            fallback={
                                <BoxContents className="w-3/5 text-ink/70" />
                            }
                        />
                    </Reveal>
                    <dl className="self-center md:col-span-5 md:col-start-8">
                        {product.contents.map((item) => (
                            <div
                                key={item.title}
                                className="border-b border-stone py-5 first:border-t"
                            >
                                <dt className="display text-display-sm">
                                    {item.title}
                                </dt>
                                <dd className="mt-1 text-ink-soft">
                                    {item.detail}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* Unboxing sequence */}
            <section
                aria-labelledby="unboxing-title"
                className="bg-paper-deep/60 py-16 md:py-28"
            >
                <div className="wrap">
                    <SectionHeading
                        id="unboxing-title"
                        title={t('home.unboxing_title')}
                        lede={t('home.unboxing_lede')}
                    />
                    <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
                        {UNBOXING.map((Drawing, index) => (
                            <li key={index}>
                                <Reveal delay={index * 140}>
                                    <Picture
                                        image={product.unboxing[index]}
                                        ratio="4 / 3"
                                        sizes="(min-width: 768px) 33vw, 100vw"
                                        className="bg-paper"
                                        fallback={
                                            <Drawing className="w-3/5 text-ink/70" />
                                        }
                                    />
                                    <p className="mt-5 flex items-baseline gap-3">
                                        <span className="text-sm text-line tabular-nums">
                                            {index + 1}
                                        </span>
                                        <span className="display text-display-sm">
                                            {t(
                                                `home.unboxing_steps.${index}.title`,
                                            )}
                                        </span>
                                    </p>
                                    <p className="mt-1 text-ink-soft">
                                        {t(`home.unboxing_steps.${index}.body`)}
                                    </p>
                                </Reveal>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Faculties */}
            <section
                id="faculties"
                aria-labelledby="faculties-title"
                className="wrap scroll-mt-8 py-16 md:py-28"
            >
                <SectionHeading
                    id="faculties-title"
                    title={t('home.faculties_title')}
                    lede={t('home.faculties_lede')}
                />
                <ul className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8 md:gap-y-16">
                    {designs.map((item) => (
                        <li key={item.key}>
                            <Link
                                href={item.url ?? product.url}
                                className="group block"
                            >
                                <div className="bg-paper-deep px-[18%] py-[12%] transition-colors duration-700 group-hover:bg-stone">
                                    {item.cover ? (
                                        <Picture
                                            image={item.cover}
                                            ratio="5 / 7"
                                            sizes="(min-width: 768px) 16vw, 32vw"
                                        />
                                    ) : (
                                        <Notebook
                                            designKey={item.key}
                                            tint={item.tint}
                                            className="transition-transform duration-700 ease-quiet group-hover:-translate-y-1.5"
                                        />
                                    )}
                                </div>
                                <h3 className="display mt-4 text-display-sm">
                                    <span className="link-line">
                                        {item.name}
                                    </span>
                                </h3>
                                <p className="mt-1 text-sm text-ink-soft">
                                    {item.sold_out
                                        ? t('product.sold_out')
                                        : item.motif}
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Personalisation */}
            {design && (
                <section
                    aria-labelledby="personal-title"
                    className="wrap py-16 md:py-28"
                >
                    <SectionHeading
                        id="personal-title"
                        title={t('home.personal_title')}
                        lede={t('home.personal_lede')}
                    />
                    <div className="grid gap-12 md:grid-cols-12 md:gap-8">
                        <CoverPreview
                            design={design}
                            name={name}
                            className="md:col-span-5"
                        />
                        <div className="flex flex-col gap-9 md:col-span-6 md:col-start-7">
                            <TextField
                                label={t('product.cover_name')}
                                optional={t('product.optional')}
                                placeholder={t(
                                    'product.cover_name_placeholder',
                                )}
                                hint={t('product.cover_name_hint')}
                                counter={`${name.length}/20`}
                                maxLength={20}
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                autoComplete="off"
                            />
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
                                    href={checkoutUrl(
                                        product.checkout_url,
                                        design.key,
                                        name,
                                        message,
                                    )}
                                    disabled={design.sold_out}
                                >
                                    {design.sold_out
                                        ? t('product.sold_out')
                                        : t('cta.order_design')}
                                </Cta>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Gifting moments */}
            <section
                aria-labelledby="moments-title"
                className="wrap py-16 md:py-28"
            >
                <SectionHeading
                    id="moments-title"
                    title={t('home.moments_title')}
                />
                <div className="grid gap-10 md:grid-cols-3 md:gap-8">
                    {[0, 1, 2].map((index) => (
                        <Reveal key={index} delay={index * 140}>
                            <h3 className="display text-display-md">
                                {t(`home.moments.${index}.title`)}
                            </h3>
                            <p className="mt-3 max-w-sm text-ink-soft">
                                {t(`home.moments.${index}.body`)}
                            </p>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* Payment & delivery */}
            <section
                aria-labelledby="assurance-title"
                className="bg-ink py-16 text-paper md:py-28"
            >
                <div className="wrap">
                    <h2
                        id="assurance-title"
                        className="display text-display-lg"
                    >
                        {t('home.assurance_title')}
                    </h2>
                    <dl className="mt-12 grid gap-x-8 md:grid-cols-2">
                        {[0, 1, 2, 3].map((index) => (
                            <div
                                key={index}
                                className="border-t border-paper/20 py-7"
                            >
                                <dt className="display text-display-sm">
                                    {t(`home.assurance.${index}.title`, money)}
                                </dt>
                                <dd className="mt-2 max-w-md text-paper/70">
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
                    className="wrap py-16 md:py-28"
                >
                    <SectionHeading
                        id="reviews-title"
                        title={t('home.reviews_title')}
                    />
                    <ReviewList reviews={reviews} />
                </section>
            )}

            {/* FAQ */}
            {faqs.length > 0 && (
                <section
                    aria-labelledby="faq-title"
                    className="wrap py-16 md:py-28"
                >
                    <div className="grid gap-10 md:grid-cols-12 md:gap-8">
                        <div className="md:col-span-4">
                            <RuledLine />
                            <h2
                                id="faq-title"
                                className="display mt-8 text-display-lg"
                            >
                                {t('home.faq_title')}
                            </h2>
                        </div>
                        <div className="md:col-span-7 md:col-start-6">
                            <FaqList faqs={faqs} />
                        </div>
                    </div>
                </section>
            )}

            {/* Journal */}
            {articles.length > 0 && (
                <section
                    aria-labelledby="journal-title"
                    className="wrap py-16 md:py-28"
                >
                    <SectionHeading
                        id="journal-title"
                        title={t('home.journal_title')}
                        lede={
                            <Link
                                href={site.journal}
                                className="link-line text-ink"
                            >
                                {t('home.journal_all')}
                            </Link>
                        }
                    />
                    <div className="grid gap-12 md:grid-cols-3 md:gap-8">
                        {articles.map((article) => (
                            <ArticleCard key={article.url} article={article} />
                        ))}
                    </div>
                </section>
            )}

            {/* Final call */}
            <section className="wrap pt-10 pb-24 md:pb-36">
                <RuledLine />
                <div className="mt-12 flex flex-col items-start gap-8 md:mt-20 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="display max-w-3xl text-display-xl">
                            {t('home.final_title')}
                        </h2>
                        {totalStock > 0 && (
                            <p className="mt-5 text-ink-soft">
                                {t('home.final_body', { count: totalStock })}
                            </p>
                        )}
                    </div>
                    {product.sold_out ? (
                        <Cta disabled>{t('product.sold_out_all')}</Cta>
                    ) : (
                        <Cta href={product.checkout_url}>
                            {t('cta.order_pack')}
                        </Cta>
                    )}
                </div>
            </section>

            <StickyOrderBar product={product} href={product.checkout_url} />
        </>
    );
}
