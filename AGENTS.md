# Hockey Knowledge

Static website with articles about ice hockey for U13 kids and their parents.
Astro + Svelte, output is plain HTML/CSS/JS in `dist/`.

## Commands

```bash
npm run dev          # dev server at http://localhost:4321/hockey-knowledge/
npx astro dev --background   # in the background; also: astro dev stop|status|logs
npm run build        # build into dist/
npm run preview      # serve the built dist/ locally
npx astro check      # type check
```

The home page lives at `/hockey-knowledge/de/` — **not** at `/`, see "Base path".

---

## Adding an article

Create one file, nothing else. The article automatically appears on the overview page and
gets a route, a table of contents, reading time and previous/next links.

`src/data/articles/de/<slug>.md` (or `.mdx` if components are embedded):

```markdown
---
title: "Titel des Artikels"
description: "Ein bis zwei Sätze. Erscheint auf der Übersichtskarte und als Meta-Description."
category: ausruestung      # ausruestung | theorie
order: 30                  # sort order within the category, lower = further up
updated: 2026-09-28
tags: ["Schläger", "Kaufberatung"]
draft: false               # true hides the article (see "Proofreading before release")
---

Text. Plain Markdown is enough — `src/styles/global.css` (`.prose`) styles headings,
lists, tables and quotes. **No** CSS classes are set inside an article.

## Headings

Only `##` ends up in the table of contents, `###` does not. This is intentional: more
levels are unreadable on a phone.
```

The file path determines the URL: `de/schlaeger.mdx` → `/de/schlaeger`. The schema lives in
`src/content.config.ts`; a new frontmatter field must be added there first, otherwise the
build fails.

A new category needs three places: the enum in `src/content.config.ts`, `categoryOrder`
in `src/lib/articles.ts` and the labels in `src/lib/i18n.ts`.

## Adding an interactive component

Create a Svelte component (Svelte 5, runes: `$state`, `$derived`, `$effect`) under
`src/components/`, then import it in an `.mdx` file:

```mdx
import FlexRechner from '../../../components/FlexRechner.svelte';

<FlexRechner client:visible />
```

`client:visible` only loads the JavaScript once the component scrolls into the viewport.
Astro renders it on the server beforehand — **so the initial values must make sense on
their own**, so that the article stays complete without JavaScript.

**Text in components** goes into a German block and an English block typed against it, so
a missing translation fails `astro check`:

```ts
const de = { caption: 'Wo sich der Schaft biegt' };
const en: typeof de = { caption: 'Where the shaft bends' };
```

`.astro` components pick the block with `{ de, en }[localeFromUrl(Astro.url)]`. Svelte
components take a `locale` prop (default `'de'`) and use
`$derived({ de, en }[locale])`; English articles pass it: `<StickSizer client:visible
locale="en" />`.

Rink diagrams: a static situation goes into `src/components/plays.ts` and is shown with
`<RinkPlay play="…" />` (no client directive). A situation told in steps, where players
slide from frame to frame, goes into `src/components/sequences.ts` and is shown with
`<RinkSequence client:visible sequence="…" />`. Both take `locale="en"` in English articles.

Quizzes: the questions live in `src/components/quizzes.ts` (geometry shared, text in `de`
and `en`), shown with `<Quiz client:visible={{ rootMargin: '300px' }} quiz="…" />` in a
`## Teste dich` / `## Test yourself` section before the article's final rules-of-thumb
Callout. Every option gets its own explanation, and each wrong option should be a real
misconception. Picture questions mark spots with `candidates`; the texts call them `{1}`,
`{2}`, `{3}` ("Platz {2}", "spot {2}"), never by a fixed number, because `Quiz.svelte`
numbers the spots and orders the answers anew on every attempt. `section` must be a heading
anchor in that language's article. The mixed
quiz page (`de/teste-dich`) only draws from `mixQuizzes`: add an article's quiz there once
the article is published.

For callout boxes there is `Callout.astro`, already available in `.mdx`:

```mdx
<Callout type="tipp" title="Optionaler Titel">Text</Callout>
```

`type`: `merke` (blue, default) · `tipp` (green) · `achtung` (yellow).

## Rules

- **Language.** Code, comments, commit messages and project documentation (README.md
  etc.) are in English. Only the articles and the reader-facing UI labels are in German.
- **Base path.** Locally the site runs under `/hockey-knowledge/`; the deployment on
  the custom domain runs at the root (see `.github/workflows/deploy.yml`). **Always**
  build internal links and asset paths with `href()` from `src/lib/href.ts`, so both
  work. A hand-written `href="/de/schlaeger"` breaks under the local base path.
- **Colors and spacing** come from `src/styles/tokens.css`. No hex values in components;
  if a value is missing, add a new token. Otherwise dark mode breaks.
- **Animations** go behind `@media (prefers-reduced-motion: ...)` or through
  `motionDuration()` from `src/lib/motion.ts`.
- **No CDN.** No `<script src="https://...">` tags, no external stylesheets. Everything is
  bundled so the site runs on any host without a network dependency.
- **No new dependencies** without asking first. The site should stay small.
- **Mobile first.** Testing starts at 360 px width, without horizontal scrolling.

## Tone of the articles

The articles are written in German (this section describes how). The audience is kids
aged 11 to 13 **and** parents who have never stood in a locker room.

- German, Swiss spelling (`ss` instead of `ß`).
- Short sentences. One technical term per paragraph, explained on first use.
- No advertising, no brand recommendations. Price ranges instead of specific products,
  in Euro (German price levels — the team plays in Berlin).
- Label rules of thumb as rules of thumb. Every article ends with a note that the numbers
  are guideline values.
- English technical terms that are actually used on the ice (Flex, Lie, Hollow) are used
  and explained — not translated into German.

### English version

English articles (`src/data/articles/en/`) translate the German ones and follow the same
rules, plus:

- British English spelling (`colour`, `centre`, `tyre`).
- Same short sentences, same rule-of-thumb notes, prices stay in Euro at German price
  levels — the readers still shop in Berlin.
- German shop terms in brackets on first use only, e.g. "sharpening (Schliff)", so
  parents recognise them in a German shop.
- English file names and URLs (`en/sticks.mdx` → `/en/sticks`), with
  `translationOf: "<German slug>"` in the frontmatter to pair them with the original.

## Structure

```
src/
├── content.config.ts      article schema
├── data/articles/de/      the articles themselves
├── layouts/               BaseLayout (page shell), ArticleLayout (article frame)
├── components/            .astro for static, .svelte for interactive
├── lib/                   href(), i18n, article queries, motionDuration()
├── pages/[locale]/        index.astro (overview), [...slug].astro (article), per language
└── styles/                tokens.css (design tokens), global.css (reset + .prose)
```

## Languages

German and English are live. Every article exists in both languages; a change to one
belongs in the other too. `src/lib/i18n.ts` has two
lists: `locales` (every language the code knows, with UI strings in `ui`) and
`publishedLocales` (the ones that are built). The pages under `src/pages/[locale]/` build
every published language — there is nothing to copy.

To publish a language: write its articles in `src/data/articles/<locale>/` (each with
`translationOf`, see above), then add it to `publishedLocales`.

**Proofreading before release.** `npm run dev` shows every language and lists every draft
(`visibleLocales` and `isPreview` in `src/lib/i18n.ts`), with a yellow banner on drafts.
`npm run build` leaves unpublished languages out. Drafts *are* built, so proofreaders can
read them on the website, but they stay hidden: the overview only lists them when the URL
has `?drafts=true` (remembered for the browser tab, `?drafts=false` turns it off),
published pages never link to them, and they get `noindex` and no sitemap entry. Anyone
who knows a draft's URL can open it. The header shows a
language switch and the pages get `hreflang` links wherever a translation exists.

Static `.astro` components inside articles pick their language with
`t(localeFromUrl(Astro.url))`, so the article needs no extra prop. Svelte components run
in the browser too and get a `locale` prop instead.

## Offline

The site works offline (wifi-only devices on the bus to a game). After every build, the
`offline` integration in `astro.config.mjs` writes `dist/sw.js` from
`src/lib/sw-template.js` with a list of every built file. Drafts are left out, and so are
files only crawlers and AI services read (sitemap, `robots.txt`, `llms*.txt`, the share
image). `BaseLayout.astro` registers it and links `src/pages/manifest.webmanifest.ts`, so
the site can be added to the home screen. Nothing to do per article.

- Pages are network first (online readers get the latest version), `/_astro/` files and
  icons cache first. A changed build changes the version hash and replaces the cache.
- `astro dev` registers no service worker. Test with `npm run build && npm run preview`,
  then Chrome DevTools → Application (Service workers, Cache storage) and Network → Offline.
- Changing the manifest colours: they mirror `tokens.css` by hand (a manifest can't read
  CSS variables).

## Search engines and AI assistants

`/llms.txt` and `/<locale>/llms-full.txt` are generated from the articles by
`src/pages/llms.txt.ts` and `src/pages/[locale]/llms-full.txt.ts`. `src/lib/plaintext.ts`
turns MDX into plain Markdown: it converts `Callout`, `<details>` quiz questions, `<Quiz>`
(written out from `quizzes.ts`), `<Prompt>` and `<AskAi />` (as quotes) and
`<a href={href(...)}>`, and replaces
every other self-closing component with a short "diagram on the website" note. A new
component that **wraps text** (like `Callout`) needs its own rule there, otherwise its tags
end up in the text file. JSON-LD and Open Graph tags are set in `BaseLayout.astro`
(`jsonLd` prop) and `ArticleLayout.astro`.

Article paths end in a slash (`articlePath()`): GitHub Pages redirects `/de/x` to `/de/x/`,
and canonical URLs must not point to a redirect.

## Astro documentation

- [Routing](https://docs.astro.build/en/guides/routing/)
- [Components](https://docs.astro.build/en/basics/astro-components/)
- [Framework components / islands](https://docs.astro.build/en/guides/framework-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
