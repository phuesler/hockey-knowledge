# Hockey Knowledge

Statische Website mit Artikeln über Eishockey für U13-Kinder und ihre Eltern.
Astro + Svelte, Ausgabe ist reines HTML/CSS/JS in `dist/`.

## Commands

```bash
npm run dev          # Dev-Server auf http://localhost:4321/hockey-knowledge/
npx astro dev --background   # im Hintergrund; dazu: astro dev stop|status|logs
npm run build        # nach dist/
npm run preview      # gebautes dist/ lokal servieren
npx astro check      # Typen prüfen
```

Die Startseite liegt unter `/hockey-knowledge/de/` — **nicht** unter `/`, siehe „Base-Pfad".

---

## Einen Artikel hinzufügen

Eine Datei anlegen, sonst nichts. Der Artikel erscheint automatisch auf der Übersicht,
bekommt eine Route, ein Inhaltsverzeichnis, Lesezeit und Vor/Zurück-Links.

`src/data/articles/de/<slug>.md` (oder `.mdx`, wenn Komponenten eingebettet werden):

```markdown
---
title: "Titel des Artikels"
description: "Ein bis zwei Sätze. Erscheint auf der Übersichtskarte und als Meta-Description."
category: ausruestung      # ausruestung | theorie
order: 30                  # Sortierung innerhalb der Kategorie, kleiner = weiter oben
updated: 2026-09-28
tags: ["Stock", "Kaufberatung"]
draft: false               # true schliesst den Artikel vom Build aus
---

Text. Reines Markdown reicht — `src/styles/global.css` (`.prose`) formatiert
Überschriften, Listen, Tabellen und Zitate. Im Artikel werden **keine** CSS-Klassen
gesetzt.

## Überschriften

Nur `##` landet im Inhaltsverzeichnis, `###` nicht. Das ist Absicht: mehr Ebenen sind
auf dem Handy unlesbar.
```

Der Dateipfad bestimmt die URL: `de/schlaeger.mdx` → `/de/schlaeger`. Das Schema steht in
`src/content.config.ts`; ein neues Frontmatter-Feld muss dort zuerst ergänzt werden, sonst
schlägt der Build fehl.

Eine neue Kategorie braucht drei Stellen: das Enum in `src/content.config.ts`, `categoryOrder`
in `src/lib/articles.ts` und die Labels in `src/lib/i18n.ts`.

## Eine interaktive Komponente hinzufügen

Svelte-Komponente (Svelte 5, Runes: `$state`, `$derived`, `$effect`) unter
`src/components/`, dann in einer `.mdx`-Datei importieren:

```mdx
import FlexRechner from '../../../components/FlexRechner.svelte';

<FlexRechner client:visible />
```

`client:visible` lädt das JavaScript erst, wenn die Komponente in den Viewport scrollt.
Astro rendert sie vorher serverseitig — **die Startwerte müssen deshalb für sich allein
schon eine sinnvolle Aussage ergeben**, damit der Artikel ohne JavaScript vollständig
bleibt.

Für Hinweiskästen gibt es `Callout.astro`, in `.mdx` bereits verfügbar:

```mdx
<Callout type="tipp" title="Optionaler Titel">Text</Callout>
```

`type`: `merke` (blau, Standard) · `tipp` (grün) · `achtung` (gelb).

## Regeln

- **Base-Pfad.** Die Seite läuft auf GitHub Pages unter `/hockey-knowledge/`. Interne
  Links und Asset-Pfade **immer** über `href()` aus `src/lib/href.ts` bauen. Ein
  geschriebenes `href="/de/schlaeger"` führt im Deployment ins Leere.
- **Farben und Abstände** kommen aus `src/styles/tokens.css`. Keine Hex-Werte in
  Komponenten; fehlt ein Wert, kommt ein neues Token dazu. Sonst bricht der Dark Mode.
- **Animationen** hinter `@media (prefers-reduced-motion: ...)` bzw. über
  `motionDuration()` aus `src/lib/motion.ts`.
- **Kein CDN.** Keine `<script src="https://...">`-Tags, keine externen Stylesheets.
  Alles wird mitgebaut, damit die Seite auf jedem Host ohne Netzwerkabhängigkeit läuft.
- **Keine neuen Dependencies** ohne Rückfrage. Die Seite soll klein bleiben.
- **Mobile zuerst.** Getestet wird ab 360 px Breite, ohne horizontales Scrollen.

## Ton der Artikel

Zielgruppe sind Kinder von 11 bis 13 **und** Eltern, die noch nie in einer Kabine
gestanden haben.

- Deutsch, Schweizer Schreibweise (`ss` statt `ß`).
- Kurze Sätze. Ein Fachbegriff pro Absatz, und beim ersten Vorkommen erklärt.
- Keine Werbung, keine Markenempfehlungen. Preisspannen statt konkreter Produkte.
- Faustregeln als Faustregeln kennzeichnen. Jeder Artikel endet mit einem Hinweis, dass
  die Zahlen Richtwerte sind.
- Englische Fachbegriffe, die auf dem Eis tatsächlich benutzt werden (Flex, Lie, Hollow),
  werden verwendet und erklärt — nicht eingedeutscht.

## Aufbau

```
src/
├── content.config.ts      Schema der Artikel
├── data/articles/de/      die Artikel selbst
├── layouts/               BaseLayout (Seitengerüst), ArticleLayout (Artikelrahmen)
├── components/            .astro für Statisches, .svelte für Interaktives
├── lib/                   href(), i18n, Artikel-Abfragen, motionDuration()
├── pages/de/              index.astro (Übersicht), [...slug].astro (Artikel)
└── styles/                tokens.css (Design-Tokens), global.css (Reset + .prose)
```

## Weitere Sprache

Vorbereitet, aber noch nicht aktiv: `locales` in `src/lib/i18n.ts` ergänzen, Labels
hinzufügen, `src/data/articles/<locale>/` anlegen und `src/pages/de/` nach
`src/pages/<locale>/` kopieren. Die Artikel-ID enthält die Sprache bereits als erstes
Pfadsegment.

## Astro-Dokumentation

- [Routing](https://docs.astro.build/en/guides/routing/)
- [Komponenten](https://docs.astro.build/en/basics/astro-components/)
- [Framework-Komponenten / Islands](https://docs.astro.build/en/guides/framework-components/)
- [Content Collections](https://docs.astro.build/en/guides/content-collections/)
