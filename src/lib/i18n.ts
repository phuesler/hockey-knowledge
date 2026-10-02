/**
 * UI strings, keyed by locale. Article *content* lives in src/data/articles/<locale>/;
 * this file only covers the chrome around it (nav, labels, footer).
 *
 * `locales` lists every language the code knows about; `publishedLocales` lists the ones
 * that are actually built and linked. A language moves into `publishedLocales` once its
 * articles are ready — until then its pages simply don't exist.
 *
 * `astro dev` is the exception: there `visibleLocales` contains every language and drafts
 * are shown too, so translations can be proofread before they go live. `npm run build`
 * never includes them.
 *
 * To add a language: add it to `locales`, add a matching block to `ui` and create
 * src/data/articles/<locale>/. The pages under src/pages/[locale]/ need no change.
 */
export const locales = ['de', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'de';

export const publishedLocales: readonly Locale[] = ['de'];

/** True in `astro dev`: unpublished languages and drafts are shown for proofreading. */
export const isPreview = import.meta.env.DEV;

/** The languages that get pages: every locale in the dev preview, else the published ones. */
export const visibleLocales: readonly Locale[] = isPreview ? locales : publishedLocales;

const de = {
  siteName: 'FASS U13 Hockey-Wissen',
  brandShort: 'FASS U13',
  brandSub: 'Hockey-Wissen',
  tagline: 'Die Wissensbasis der U13 von FASS Berlin – Ausrüstung und Theorie, erklärt für Kinder und Eltern',
  heroEyebrow: 'Wissensbasis der FASS Berlin U13',
  heroTitleLead: 'Eishockey verstehen',
  heroTitleRest: 'für U13 und ihre Eltern',
  heroText:
    'Das Nachschlagewerk unserer U13 bei FASS Berlin: kurze, verständliche Artikel zu allem, was rund ums Eis wichtig ist. Geschrieben für Kinder, die es selber lesen wollen, und für Eltern, die noch nie in einer Kabine gestanden haben. Wir spielen Breitensport. Die Empfehlungen hier sind für Familien gedacht, die gut ausgerüstet sein wollen, ohne jedem letzten Vorteil hinterherzujagen.',
  skipToContent: 'Zum Inhalt springen',
  mainNav: 'Hauptnavigation',
  home: 'Start',
  allArticles: 'Alle Artikel',
  updatedOn: 'Aktualisiert am',
  readingTime: 'Min. Lesezeit',
  readingTimeShort: 'Min.',
  topics: 'Themen',
  inThisArticle: 'In diesem Artikel',
  moreArticles: 'Weitere Artikel',
  previous: 'Vorheriger Artikel',
  next: 'Nächster Artikel',
  backToOverview: 'Zurück zur Übersicht',
  redirectTo: 'Weiter zu',
  categories: {
    ausruestung: 'Ausrüstung',
    theorie: 'Theorie',
  },
  categoryIntros: {
    ausruestung: 'Was ihr beim Kauf und beim Unterhalt der Ausrüstung wissen müsst.',
    theorie: 'Regeln, Spielverständnis und Taktik zum Nachlesen.',
  },
  callouts: {
    tipp: 'Tipp',
    achtung: 'Achtung',
    merke: 'Merke',
  },
  footerNote:
    'Alle Angaben sind Faustregeln aus der Praxis, keine Vorschriften. Im Zweifel probiert ihr im Laden oder auf dem Eis aus, was passt.',
  repoLabel: 'GitHub',
  repoTitle: 'Quelltext auf GitHub',
  repoNote:
    'Diese Seite ist offen für alle. Fehler gefunden oder eine Idee für einen Artikel? Forkt das Repository auf GitHub und schickt einen Pull Request – oder eröffnet ein Issue.',
  repoCta: 'Zum Repository auf GitHub',
  clubLink: 'FASS Berlin Nachwuchs',
  noScript: 'Dieses interaktive Element braucht JavaScript. Die Angaben im Text reichen aber aus.',
  draftNote: 'Entwurf – nur in der lokalen Vorschau sichtbar, nicht auf der Website.',
  /** Language switcher: short code on the button, full name for screen readers. */
  languageShort: 'DE',
  languageName: 'Deutsch',
  /** BCP 47 tag for dates and sorting; Swiss German to match the articles' spelling. */
  dateLocale: 'de-CH',
  ogLocale: 'de_DE',
};

export type UiStrings = typeof de;

const en: UiStrings = {
  siteName: 'FASS U13 Hockey Knowledge',
  brandShort: 'FASS U13',
  brandSub: 'Hockey Knowledge',
  tagline: 'The knowledge base of the FASS Berlin U13 – equipment and theory, explained for kids and parents',
  heroEyebrow: 'FASS Berlin U13 knowledge base',
  heroTitleLead: 'Understanding ice hockey',
  heroTitleRest: 'for U13 players and their parents',
  heroText:
    'The reference guide of our U13 at FASS Berlin: short, clear articles on everything that matters around the ice. Written for kids who want to read it themselves, and for parents who have never set foot in a dressing room. We play recreational hockey. The advice here is meant for families who want good gear without chasing every last advantage.',
  skipToContent: 'Skip to content',
  mainNav: 'Main navigation',
  home: 'Home',
  allArticles: 'All articles',
  updatedOn: 'Updated on',
  readingTime: 'min read',
  readingTimeShort: 'min',
  topics: 'Topics',
  inThisArticle: 'In this article',
  moreArticles: 'More articles',
  previous: 'Previous article',
  next: 'Next article',
  backToOverview: 'Back to the overview',
  redirectTo: 'Continue to',
  categories: {
    ausruestung: 'Equipment',
    theorie: 'Theory',
  },
  categoryIntros: {
    ausruestung: 'What you need to know when buying and looking after equipment.',
    theorie: 'Rules, game sense and tactics to read up on.',
  },
  callouts: {
    tipp: 'Tip',
    achtung: 'Watch out',
    merke: 'Remember',
  },
  footerNote:
    'Everything here is a rule of thumb from experience, not a regulation. If in doubt, try out what works in the shop or on the ice.',
  repoLabel: 'GitHub',
  repoTitle: 'Source code on GitHub',
  repoNote:
    'This site is open to everyone. Found a mistake or have an idea for an article? Fork the repository on GitHub and send a pull request – or open an issue.',
  repoCta: 'Go to the repository on GitHub',
  clubLink: 'FASS Berlin youth hockey',
  noScript: 'This interactive element needs JavaScript. The text has everything you need, though.',
  draftNote: 'Draft – only visible in the local preview, not on the website.',
  languageShort: 'EN',
  languageName: 'English',
  dateLocale: 'en-GB',
  ogLocale: 'en_GB',
};

export const ui: Record<Locale, UiStrings> = { de, en };

export function t(locale: Locale = defaultLocale): UiStrings {
  return ui[locale];
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Split a collection entry id like "de/schlaeger" into locale + slug. */
export function parseEntryId(id: string): { locale: Locale; slug: string } {
  const [maybeLocale, ...rest] = id.split('/');
  if (isLocale(maybeLocale)) {
    return { locale: maybeLocale, slug: rest.join('/') };
  }
  return { locale: defaultLocale, slug: id };
}

/**
 * Locale of the page being rendered, from the first path segment after the base.
 * Lets .astro components used inside articles pick their strings without a prop:
 *   const s = t(localeFromUrl(Astro.url));
 */
export function localeFromUrl(url: URL): Locale {
  const base = import.meta.env.BASE_URL || '/';
  const path = url.pathname.startsWith(base) ? url.pathname.slice(base.length) : url.pathname;
  const first = path.split('/').find(Boolean) ?? '';
  return isLocale(first) ? first : defaultLocale;
}
