# Changelog

## Brand identity restyle

A restyle only: no changes to controllers, data or business logic. The one new route is `/styleguide`, registered in the local environment only.

### Tokens and base styles
- New `resources/css/tokens.css`: paper and ink themes (`[data-theme="ink"]` for the footer and dark bands), state colours, strokes, the product shadow and the type scale. Registered in Tailwind v4 through `@theme` in `resources/css/app.css`, so `bg-paper`, `text-ink`, `border-sand`, `bg-paper-raised`, `text-on-line` and the rest work as utilities.
- Renamed utilities: `stone` → `sand`, `paper-deep` → `sand-deep`, `ink-soft` → `ink-muted`, `line-deep` → `line-hover`, `text-display-lg/md` → `text-display-l/m`, `text-display-sm` → `text-title`, `text-lede` → `text-body-l`.
- Radius scale (4 / 8 / 16 / pill), 1200px content width with 64px / 20px margins, 96px / 48px section padding (`.wrap`, `.section`).
- No UI shadows and no gradient washes. The ruled pattern and link underlines are drawn as lines.

### Typography
- Arabic display face is now Noto Naskh Arabic 600 (was Amiri). Weights trimmed to Fraunces 400, Inter Tight 400/600, IBM Plex Sans Arabic 400/600. Fonts stay self-hosted, subset, `font-display: swap`, with one display and one body weight preloaded per locale.
- Families switch on `:lang(ar)` / `[dir=rtl]`; components carry no per-locale classes. Arabic headlines use the taller line-heights.
- Prices use tabular figures and read `849 EGP` in English and `٨٤٩ ج.م` (Arabic-Indic digits) in Arabic. `App\Support\Money::format` and `resources/js/lib/money.ts` changed together.

### Brand components (`resources/js/components/brand/`)
- `Logo` (lockup, lockup-ar, mark, avatar; light and dark tones; never mirrored in RTL), `SignatureLine`, `RuledLine`, `Nib` and `NibLoader`, `Badge`, `Button` (primary, secondary, tertiary).
- New favicon (the mark, as SVG) and a 180px apple-touch-icon (ink rounded square with the paper and blue mark).

### Storefront
- Header: lockup, label-type nav with the blue signature underline on the active item, "Order now" CTA, sticky with 90% paper and blur after scroll.
- Footer: ink theme, reversed lockup, tagline in the display face, `@sattr.eg`.
- Inputs are raised-paper boxes with the label above and the blue signature line on focus. Design and payment choices are radio cards. Offer badge reads "InstaPay −10%".
- Home: ruled-paper hero with the new headline, "what's inside" as a four-up grid with nib bullets, faculty edition cards with bilingual overlines, message-card section on ruled paper, ink payment band, accordion FAQ with + / − icons. Every section opens overline → signature line → headline.
- Faculty and product pages: radius-lg frames, edition overline above the headline, restyled purchase panel.
- Checkout: single 640px column, sections opened by the signature line, payment radio cards with InstaPay first, summary card with tabular prices, full-width primary CTA.
- Thank-you: nib animation once, order code in display type, InstaPay instructions card, dashed upload dropzone.
- Journal: 680px text column in body-l, pull quotes in the display face under the signature line.
- Mobile order bar: ink ground, price at the start, blue CTA at the end.
- The magnetic hover on buttons is removed (motion is now 300–600ms ease-out only).

### Admin
- Same tokens and fonts, sans only. The sidebar uses the logo lockup.

### Copy
- New hero and tagline ("كل حكاية بتبدأ بسطر" / "Every story starts with a line."), "اطلب الآن / Order now", "شوف النسخ / See the editions", "ادفع بإنستاباي ووفّر ١٠٪ / Pay with InstaPay and save 10%", section overlines.

### Styleguide
- `/styleguide` (local only; add `?lang=en` for the English chrome): colours in both themes, the type scale in English and Arabic, logo variants, buttons, inputs, radio cards, badges, cards, SignatureLine, RuledLine, the ruled pattern, the nib loader and skeletons.

### Departures from the brief
- **No name on the cover.** Name printing was removed from the product earlier, so there is no typed-name cover preview and the hero reads "A gift pack for college students, in their faculty's edition" rather than "personalized". The section is built around the message card instead.
- **Faculty page H1** stays the page's own admin-editable title; the faculty name sits in the overline above it.
- **Home faculty editions** are link cards to each faculty page rather than radio inputs, so those pages keep their internal links. Radio cards are used where a choice is made (message section, product, checkout).
- **Fraunces** is the static 400 weight; the self-hosted package has no optical-size axis.
- **Not done:** browser, screenshot and Lighthouse checks were skipped at the owner's request.
