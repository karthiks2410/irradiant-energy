# UI kit

Shared primitives for every page builder. Import from `@/components/ui` (one barrel), motion islands from
`@/components/motion/*`. Everything here is a Server Component unless marked **client**. Read
`src/app/globals.css` for the tokens these components use.

## Conventions baked in

- **Surface awareness.** Put content in `<Section surface="dark">` (or any element with `data-surface="dark"`)
  and every component below switches its own colours: green-700 → green-300 eyebrows, white cards → teal-950
  tiles, carbon text → white, the focus ring → Solar Yellow. Never pass colour props around.
- **Contrast pairings only** (report §6.4): small green text is green-700 on light / green-300 on dark;
  `<Accent>` (green-600 / green-500) is for display and H2 sizes only; yellow appears only as the `signal`
  eyebrow tone on dark surfaces.
- **Flat.** 1px mist borders, `rounded-md`, no shadows, no blur, no gradients (the hatched placeholder is the
  brand PDF's own device).
- **Kannada-ready.** No fixed heights, no `nowrap` on copy; uppercase/tracking only on mono eyebrows and labels.
- **Motion.** Only `transform`/`opacity`, 200 ms micro and 300–500 ms transitions on `ease-controlled`. Nothing
  auto-moves. `<Reveal>` is a no-op under reduced motion and never touches above-the-fold content.
- **Class merging.** Every component takes `className` and appends it last; there is no `clsx`/`tailwind-merge`,
  so pass layout classes (spans, margins), not conflicting colour classes.

## Layout

### `Section`

```tsx
<Section surface="dark" aria-labelledby="why-heading">
  <SectionHeading id="why-heading" eyebrow="Why Irradiant" title={<>Design based on your <Accent>actual power needs.</Accent></>} lead="…" />
</Section>
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `surface` | `"canvas" \| "white" \| "dark"` | `"canvas"` | Alternate canvas → white → dark for rhythm. `dark` = `bg-teal-900 text-white data-surface="dark"`. |
| `as` | `"section" \| "div"` | `"section"` | `div` for non-landmark blocks. |
| `container` | `boolean` | `true` | Wraps children in `.container-page`. |
| `padded` | `boolean` | `true` | Applies `.section-y`. Turn off for heroes and bands with their own padding. |
| `className`, `containerClassName` | `string` | | |
| …rest | `<section>` attributes | | `id`, `aria-labelledby`, `aria-label` etc. pass through. |

### `SectionHeading`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `ReactNode` | required | Sentence case; wrap the trailing phrase in `<Accent>`. |
| `eyebrow` | `string` | | Rendered through `<Eyebrow>`. |
| `eyebrowTone` | `"green" \| "signal"` | `"green"` | |
| `lead` | `ReactNode` | | `text-lead`, ink-2 (white/80 on dark). |
| `align` | `"split" \| "stacked" \| "center"` | `"split"` | Split = title 7 / lead 5 columns from `lg`, stacked below. Use split in at most a third of a page's sections; center only for closing CTA bands. |
| `headingLevel` | `1 \| 2 \| 3` | `2` | Level 1 uses the display size. |
| `id` | `string` | | Goes on the heading so the parent `<Section aria-labelledby>` can reference it. |

### `Eyebrow`

`<Eyebrow>` renders a mono uppercase `<p>` with a 28 px leading rule. Props: `as` (`p` \| `span` \| `div`),
`rule` (default `true`), `tone` (`green` \| `signal`), `id`, `className`. Never use it as a heading.

### `Accent`

`<Accent>` is a `<span>` for the green trailing phrase of a display/H2 headline. Display sizes only.

## Cards

### `Card`

Flat container. Props: `as` (`div` \| `li` \| `article` \| `section`, default `div`), `interactive` (hover lift +
teal border; only when the card contains a link), `padding` (`none` \| `md` \| `lg`), `id`, `className`.
`cardSurface` (the class string) is exported for one-off panels.

### `LinkCard`

Whole-card link: one tab stop, the title is the link, its `::after` covers the card, the focus ring is drawn
on the card.

| Prop | Type | Notes |
|---|---|---|
| `href` | `string` | Only to pages that exist. |
| `title` | `ReactNode` | The link's accessible name. |
| `headingLevel` | `2 \| 3 \| 4` (default `3`) | |
| `eyebrow` | `string` | Mono label above the title. |
| `media` | `ReactNode` | Edge-to-edge image slot; images scale 1.03 on hover. Use `next/image` with `sizes`. |
| `cta` | `string` | Visible action line with an arrow; hidden from AT (the title already names the link). |
| `as`, `className`, `children` | | `children` is the short description. |

### `CardGrid`

`<CardGrid columns={3} as="ul">` — column gaps equal the page gutter, so 3-up lines up with the 12-column grid
(2-up on tablets, 1-up on phones). `columns` `1 \| 2 \| 3 \| 4`; 4-up is 2×2 on phones. `as` `ul` \| `ol` \| `div`.

### `FeatureCard`

Non-interactive proof card (prototype "why" cards, S8): green top rule, mono numeral, monoline icon, title, body.

| Prop | Type | Notes |
|---|---|---|
| `title` | `string` | |
| `children` | `ReactNode` | Body copy. |
| `icon` | `ReactNode` | An SVG with `stroke="currentColor"`; sized to 32 px, no container. |
| `numeral` | `string` | e.g. `"01"`. |
| `headingLevel` | `3 \| 4` (default `3`) | |
| `as` | `CardTag` (default `li`) | Use inside `<CardGrid as="ul">`. |

### `StatTile`

| Prop | Type | Notes |
|---|---|---|
| `value` | `string` | Pre-formatted (`"5.7"`, `"₹8,63,718"`). Format with `en-IN`. |
| `unit` | `string` | Smaller, same face. |
| `label` | `string` | |
| `estimated` | `boolean` | Muted value with a dashed rule and an "(estimated)" note (PDF p.31). Use for every calculator figure. |
| `note` | `string` | Scope/period line. |
| `size` | `"md" \| "xl"` | `text-data` or `text-data-xl`. |
| `surface` | `"canvas" \| "white"` | Canvas tile inside white panels (default); white when placed directly on the canvas. |
| `as` | `"div" \| "li"` | |

No count-up animation, ever (PDF p.66). Public numbers come only from verified facts.

## Accordion (**client**)

```tsx
<Accordion single headingLevel={3} items={faqs.map((f) => ({ id: f.slug, question: f.q, answer: <p>{f.a}</p> }))} />
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `{ id, question, answer: ReactNode }[]` | required | `id` must be unique on the page; it becomes the item's anchor. Answers can be React elements built in a Server Component. |
| `single` | `boolean` | `false` | One open at a time. |
| `defaultOpen` | `string[]` | `[]` | Rendered expanded in the server HTML. |
| `headingLevel` | `2 \| 3 \| 4` | `3` | |

`button[aria-expanded][aria-controls]` + `role="region"`, Up/Down/Home/End move between questions, all answers
are in the HTML (closed ones `hidden`), Motion height tween that is instant under reduced motion.

## Form fields

All fields: visible label above, 16 px control text (no iOS zoom), 48 px tall, grey-600 border, the global 2 px
teal focus ring, `hint` and `error` wired through `aria-describedby`, `aria-invalid` + icon + text on error.
Mark optional fields (`optional`), not required ones. Announce form-level failures yourself with a
`role="alert"` summary that links to each field; `FieldError` deliberately does not announce.

| Component | Key props | Notes |
|---|---|---|
| `TextField` | `id`, `name`, `label`, `hint?`, `error?`, `optional?`, `prefix?`, `suffix?`, plus any `<input>` attribute | Always set `type`, `inputMode`, `autoComplete`. `prefix`/`suffix` are decorative adornments ("+91", "₹"); repeat the unit in the label. |
| `SelectField` | `id`, `name`, `label`, `options: { value, label, disabled? }[]`, `placeholder?`, `hint?`, `error?`, `optional?`, plus `<select>` attributes | Native select with the brand chevron. `placeholder` renders a disabled first option selected until the user chooses. |
| `RangeField` (**client**) | `id`, `name`, `label`, `min`, `max`, `step?`, `defaultValue?` or `value` + `onValueChange`, `prefix?`/`suffix?` or `formatValue?`, `minLabel?`, `maxLabel?`, `hint?`, `error?`, `disabled?` | Live `<output>` in the data face, `aria-valuetext` with the formatted value, en-IN grouping. `formatValue` is for client callers only. Pair with a `TextField` (`inputMode="numeric"`) for precise entry. |
| `CheckboxField` | `id`, `name`, `label: ReactNode`, `hint?`, `error?`, plus `<input>` attributes | Never pre-ticked: `defaultChecked` is not accepted. One box per purpose; the label may link to the privacy notice. |
| `RadioCards` | `name`, `legend`, `hideLegend?`, `options: { value, label, description?, icon?, disabled? }[]`, `defaultValue?` or `value` + `onChange`, `required?`, `columns?` (`1 \| 2 \| 3`), `hint?`, `error?` | Native radios in card labels inside a `Fieldset`; selection = teal border + soft-green fill; arrow keys work natively. Leave `defaultValue` unset to start unselected. |
| `Fieldset` | `legend`, `hideLegend?`, `hint?`, `error?`, `children` | Group hint/error wiring via `aria-describedby`. |
| `FieldError` | `id?`, `children` | Icon + message in error red (error-tint text on dark). |
| `FieldShell` | `id`, `label`, `hint?`, `error?`, `optional?`, `children: (a11y) => ReactNode` | For custom controls: spread the `a11y` object onto your input and reuse `controlClass`. |

## Placeholders and template imagery

### `PlaceholderPanel`

`<PlaceholderPanel subject="Rooftop array on an Anekal home" aspect="16/9" />` — hatched teal-950 panel with the
caption `[APPROVED PHOTOGRAPHY] · subject`. Renders only when `showPlaceholders` (never in production);
`fallback="solid"` leaves a plain teal-950 block in production instead of nothing. `aspect`
`16/9 \| 21/9 \| 3/2 \| 4/5 \| 1/1 \| fill` (`fill` needs a `relative` parent).

### `src/content/images.ts`

`templateImages` and `heroSlides` are the prototype's photos, copied to `public/images/template/`. They are
temporary hero/section imagery only: never as projects, customers or team. Each entry has `src`, `width`,
`height`, `alt`, `subject` and `placeholder: true` (a flag, not the `next/image` prop):

```tsx
const photo = templateImages.heroHomeFamily;
{/* TODO(photography): replace with approved photo */}
<Image src={photo.src} width={photo.width} height={photo.height} alt={photo.alt} sizes="100vw" loading="eager" fetchPriority="high" />
```

## Motion islands (`@/components/motion`)

### `Reveal` / `RevealItem` (**client**)

```tsx
<Reveal>…one block…</Reveal>
<Reveal as="ul" stagger={0.06} className="grid …">
  {items.map((item) => <RevealItem as="li" key={item.id}>…</RevealItem>)}
</Reveal>
```

| Prop | Type | Notes |
|---|---|---|
| `as` | `div \| section \| article \| ul \| ol \| li \| p \| figure \| span` | Rendered tag. |
| `delay` | `number` (s) | Start delay. |
| `stagger` | `number` (s) | Between nested `RevealItem`s; the parent then only orchestrates. |
| `id`, `className` | | |

Fade + 8 px rise, once, when the block enters the viewport. The server HTML is fully visible; elements are
hidden only after hydration and only if they are still below the viewport, so it is safe anywhere below
the fold and harmless above it. **Do not wrap the hero or the LCP image**: there is nothing to gain and the
element must stay static. No-op under `prefers-reduced-motion`.

### `SmoothScroll` (**client**, mounted once in `app/layout.tsx`)

Lenis on fine-pointer devices, off under reduced motion, loaded after idle. `data-lenis-prevent` on any
internal scroll area or dialog keeps native scrolling there. For in-page anchors use a plain
`<a href="#id">` (Lenis scrolls with the header offset; without JS `scroll-padding-top` handles it), not
`<Link>`, which scrolls on its own.

## Icons

`ArrowRightIcon`, `ChevronDownIcon`, `ErrorIcon`, `CheckIcon`: monoline, `currentColor`,
`aria-hidden`. Size with `className="size-4"`. Until the brand icon masters arrive, draw feature
icons in the same style (1.75 stroke, round caps, no container).

`FeatureIcon` takes a content `IconKey` (`sun`, `battery`, `charge`, `monitor`, `site`, `doc`,
`shield`, `tools`, `dash`, `support`) and renders nothing when the item has no icon, so content
decides which glyph a card shows. Import it from here rather than redrawing it beside a page: the
same cards appear in more than one place — `proofFallback` re-exports the home page's "why" cards
onto the Business page — and two local icon sets previously drew those keys differently.
