import { useState } from 'react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/brand/Badge';
import { Button } from '@/components/brand/Button';
import { Logo } from '@/components/brand/Logo';
import { Nib, NibLoader } from '@/components/brand/Nib';
import { RuledLine } from '@/components/brand/RuledLine';
import { SignatureLine } from '@/components/brand/SignatureLine';
import {
    SelectField,
    TextAreaField,
    TextField,
} from '@/components/site/fields';
import { MessageCard } from '@/components/site/personalizer';
import { RadioCard } from '@/components/site/radio-card';

/** Local-only reference for the Sattr brand system. See /styleguide. */

const COLORS = [
    ['paper', 'Main background'],
    ['paper-raised', 'Cards, inputs, modals'],
    ['ink', 'Text, dark surfaces'],
    ['ink-muted', 'Secondary text (lightest allowed)'],
    ['sand', 'Borders, dividers. Never text'],
    ['sand-deep', 'Photo backdrops, bands'],
    ['line', 'The brand blue'],
    ['line-hover', 'Blue, hover'],
    ['on-line', 'Text on blue'],
    ['success', 'Order and payment states'],
    ['warning', 'Order and payment states'],
    ['danger', 'Errors'],
] as const;

const TYPE = [
    ['display text-display-xl', 'display-xl', 'Every story', 'كل حكاية'],
    ['display text-display-l', 'display-l', 'Starts with a line', 'بتبدأ بسطر'],
    [
        'display text-display-m',
        'display-m',
        'The first line is yours',
        'أول سطر ليك',
    ],
    ['text-title', 'title', 'Faculty editions', 'نسخ الكليات'],
    [
        'text-body-l',
        'body-l',
        'A gift pack for college students.',
        'باكدج هدية لطلبة الكليات.',
    ],
    [
        'text-body',
        'body',
        'Delivered across Egypt with Bosta.',
        'توصيل لكل محافظات مصر مع بوسطة.',
    ],
    ['text-label', 'label', 'Order now', 'اطلب الآن'],
    ['text-caption', 'caption', 'Up to 200 characters', 'حتى ٢٠٠ حرف'],
    ['overline', 'overline', 'What’s inside', 'جوّه الباكدج'],
    ['price text-title', 'price', '849 EGP', '٨٤٩ ج.م'],
] as const;

function Block({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="border-t border-sand py-12">
            <h2 className="text-title">{title}</h2>
            <div className="mt-6">{children}</div>
        </section>
    );
}

function Swatches() {
    return (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {COLORS.map(([name, use]) => (
                <li
                    key={name}
                    className="rounded-lg border border-sand bg-paper-raised p-4"
                >
                    <span
                        className="block h-16 rounded-sm border border-sand"
                        style={{ backgroundColor: `var(--${name})` }}
                    />
                    <p className="mt-3 text-label">--{name}</p>
                    <p className="text-caption text-ink-muted">{use}</p>
                </li>
            ))}
        </ul>
    );
}

export default function Styleguide() {
    const [choice, setChoice] = useState('instapay');
    const [text, setText] = useState('');

    return (
        <div className="wrap py-12" dir="ltr" lang="en">
            <p className="mb-3 overline">Local only</p>
            <SignatureLine className="max-w-24" />
            <h1 className="display mt-6 text-display-l">Sattr styleguide</h1>
            <p className="measure mt-4 text-body-l text-ink-muted">
                Tokens live in resources/css/tokens.css. About 70% paper, 25%
                ink, 5% blue, with one blue focal point per viewport.
            </p>

            <Block title="Colors: paper theme">
                <Swatches />
            </Block>

            <Block title='Colors: data-theme="ink"'>
                <div data-theme="ink" className="rounded-lg p-6">
                    <Swatches />
                </div>
            </Block>

            <Block title="Type scale (English and Arabic)">
                <div className="grid gap-8 md:grid-cols-2">
                    {(['en', 'ar'] as const).map((language) => (
                        <div
                            key={language}
                            lang={language}
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                            className="flex flex-col gap-6 rounded-lg border border-sand bg-paper-raised p-6 font-sans"
                        >
                            {TYPE.map(([classes, name, english, arabic]) => (
                                <div key={name}>
                                    <p
                                        className="text-caption text-ink-muted"
                                        dir="ltr"
                                    >
                                        {name}
                                    </p>
                                    <p className={classes}>
                                        {language === 'ar' ? arabic : english}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </Block>

            <Block title="Logo">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-wrap items-center gap-10 rounded-lg border border-sand bg-paper p-8">
                        <Logo variant="lockup" size={40} />
                        <Logo variant="lockup-ar" size={40} />
                        <Logo variant="mark" size={40} />
                        <Logo variant="avatar" size={56} />
                        <Logo variant="mark" size={16} />
                    </div>
                    <div
                        data-theme="ink"
                        className="flex flex-wrap items-center gap-10 rounded-lg p-8"
                    >
                        <Logo variant="lockup" tone="dark" size={40} />
                        <Logo variant="lockup-ar" tone="dark" size={40} />
                        <Logo variant="mark" tone="dark" size={40} />
                    </div>
                </div>
                <p className="mt-4 text-caption text-ink-muted">
                    The nib is always ink (paper on dark) and the line always
                    blue. Never mirrored in RTL. Clear space at least 25% of the
                    mark height. Minimum: mark 16px, lockup 96px wide.
                </p>
            </Block>

            <Block title="Buttons">
                <div className="flex flex-wrap items-center gap-6">
                    <Button>Order now</Button>
                    <Button variant="secondary">View the pack</Button>
                    <Button variant="tertiary">See the editions</Button>
                    <Button disabled>Sold out</Button>
                </div>
                <div
                    data-theme="ink"
                    className="mt-4 flex flex-wrap items-center gap-6 rounded-lg p-6"
                >
                    <Button>Order now</Button>
                    <Button variant="secondary">View the pack</Button>
                    <Button variant="tertiary">See the editions</Button>
                </div>
            </Block>

            <Block title="Inputs">
                <div className="grid max-w-2xl gap-6 md:grid-cols-2">
                    <TextField label="Full name" placeholder="Sarah Ahmed" />
                    <TextField
                        label="Mobile number"
                        hint="11 digits, starting with 01"
                    />
                    <TextField
                        label="Email"
                        error="Enter a valid email address."
                        defaultValue="sarah@"
                    />
                    <SelectField label="Governorate" defaultValue="">
                        <option value="" disabled>
                            Choose a governorate
                        </option>
                        <option>Cairo</option>
                        <option>Giza</option>
                    </SelectField>
                    <TextAreaField
                        label="Message card"
                        optional="optional"
                        counter={`${text.length}/200`}
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        className="md:col-span-2"
                    />
                </div>
            </Block>

            <Block title="Radio cards">
                <div className="grid max-w-2xl gap-3">
                    <RadioCard
                        name="sg-pay"
                        value="instapay"
                        checked={choice === 'instapay'}
                        onChange={() => setChoice('instapay')}
                    >
                        <span className="flex items-center gap-3">
                            <span className="text-body-l font-semibold">
                                InstaPay
                            </span>
                            <Badge>InstaPay −10%</Badge>
                        </span>
                        <span className="mt-1 block text-ink-muted">
                            Transfer after ordering.
                        </span>
                    </RadioCard>
                    <RadioCard
                        name="sg-pay"
                        value="cod"
                        checked={choice === 'cod'}
                        onChange={() => setChoice('cod')}
                    >
                        <span className="text-body-l font-semibold">
                            Cash on delivery
                        </span>
                        <span className="mt-1 block text-ink-muted">
                            Pay the courier when the pack arrives.
                        </span>
                    </RadioCard>
                </div>
            </Block>

            <Block title="Badges (offers only)">
                <div className="flex flex-wrap items-center gap-4">
                    <Badge>InstaPay −10%</Badge>
                    <span lang="ar" dir="rtl">
                        <Badge>إنستاباي −١٠٪</Badge>
                    </span>
                    <span data-theme="ink" className="rounded-lg p-4">
                        <Badge tone="line">InstaPay −10%</Badge>
                    </span>
                </div>
            </Block>

            <Block title="Cards">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-sand bg-paper-raised p-4 md:p-6">
                        <h3 className="text-title">A new semester</h3>
                        <p className="mt-2 text-ink-muted">
                            Raised paper, hairline sand border, radius-lg, no
                            shadow.
                        </p>
                    </div>
                    <MessageCard message={text} />
                    <div className="rounded-lg bg-sand-deep p-6">
                        <div className="aspect-[5/7] rounded-sm bg-paper-raised shadow-product" />
                        <p className="mt-4 text-caption text-ink-muted">
                            The only shadow: under product mock-ups on a
                            sand-deep frame.
                        </p>
                    </div>
                </div>
            </Block>

            <Block title="SignatureLine">
                <SignatureLine />
                <p className="mt-3 text-caption text-ink-muted">
                    3px blue. Draws from the reading edge on scroll in 600ms;
                    static with reduced motion.
                </p>
            </Block>

            <Block title="RuledLine">
                <RuledLine />
                <p className="mt-3 text-caption text-ink-muted">
                    1.5px ink. The “write here” line.
                </p>
            </Block>

            <Block title="Ruled pattern">
                <div className="ruled-pattern h-56 rounded-lg border border-sand" />
                <p className="mt-3 text-caption text-ink-muted">
                    Sand lines at a 28px pitch: hero ground, message section,
                    empty states.
                </p>
            </Block>

            <Block title="Nib">
                <div className="flex flex-wrap items-center gap-12">
                    <NibLoader size={64} label="Loading" />
                    <NibLoader size={64} once />
                    <ul className="flex flex-col gap-2">
                        {[
                            'A5 notebook',
                            '11oz mug',
                            'Four coasters',
                            'Pen',
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-2">
                                <Nib className="h-4 text-ink" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </Block>

            <Block title="Skeleton">
                <div className="flex max-w-md flex-col gap-3">
                    <div className="skeleton h-40 !rounded-lg" />
                    <div className="skeleton h-4 w-2/3" />
                    <div className="skeleton h-4 w-1/2" />
                </div>
            </Block>
        </div>
    );
}
