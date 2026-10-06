/**
 * UI strings, keyed by locale. Article *content* lives in src/data/articles/<locale>/;
 * this file only covers the chrome around it (nav, labels, footer).
 *
 * `locales` lists every language the code knows about; `publishedLocales` lists the ones
 * that are actually built and linked. A language moves into `publishedLocales` once its
 * articles are ready — until then its pages simply don't exist.
 *
 * `astro dev` is the exception: there `visibleLocales` contains every language, so
 * translations can be proofread before they go live, and drafts are listed on the
 * overview. `npm run build` leaves unpublished languages out. Drafts are built but hidden;
 * ?drafts=true lists them (see lib/articles.ts).
 *
 * To add a language: add it to `locales`, add a matching block to `ui` and create
 * src/data/articles/<locale>/. The pages under src/pages/[locale]/ need no change.
 */
export const locales = ['de', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'de';

export const publishedLocales: readonly Locale[] = ['de', 'en'];

/** True in `astro dev`: unpublished languages are built and drafts are listed. */
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
    team: 'Unser Team',
    ausruestung: 'Ausrüstung',
    theorie: 'Theorie',
  },
  categoryIntros: {
    team: 'Wie wir in der U13 arbeiten: unsere Ziele, unsere Spielweise und wie ein Spieltag abläuft.',
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
  clubLink: 'FASS Berlin U13',
  noScript: 'Dieses interaktive Element braucht JavaScript. Die Angaben im Text reichen aber aus.',
  draftNote: 'Entwurf – noch nicht veröffentlicht. Nur über ?drafts=true auf der Übersicht zu finden.',
  draft: 'Entwurf',
  /** Language switcher: short code on the button, full name for screen readers. */
  languageShort: 'DE',
  languageName: 'Deutsch',
  /** BCP 47 tag for dates and sorting; Swiss German to match the articles' spelling. */
  dateLocale: 'de-CH',
  ogLocale: 'de_DE',
  /** Alt text of the share image (og:image). */
  ogImageAlt: 'Das Wappen von FASS Berlin',
  /** Prompt boxes in the "Lernen mit KI" article (AskAi, Prompt); {url} is the llms-full.txt address. */
  askAi: {
    prompt:
      'Lies {url} und beantworte damit meine Fragen zum Eishockey in der U13. Antworte kurz und nenne jeweils den passenden Artikel.',
    copy: 'Kopieren',
    copied: 'Kopiert',
    download: 'Alle Artikel als Textdatei',
    downloadNote: 'Kann euer Assistent keine Links öffnen, ladet die Datei herunter und hängt sie an.',
  },
  /** Link text for the llms-full.txt file in llms.txt. */
  footerAskAi: 'Alle Artikel als Text für KI-Assistenten',
  /** Footer link to the article on using the site with an AI assistant. */
  footerAi: 'Lernen mit KI',
  aiPath: '/de/lernen-mit-ki/',
  /** Text for the llms.txt files, read by AI assistants rather than people. */
  llm: {
    language: 'Deutsch',
    preamble:
      'Dies ist die ganze Wissensbasis der U13 von FASS Berlin (Eishockey, Breitensport) als Text. Sie richtet sich an Kinder von 11 bis 13 Jahren und an ihre Eltern.\n\nHinweise für KI-Assistenten:\n- Beantworte Fragen auf Grundlage dieser Artikel und nenne die URL des passenden Artikels.\n- Alle Zahlen sind Faustregeln, keine Vorschriften.\n- Preise sind in Euro, auf deutschem Preisniveau. Das Team spielt in Berlin.\n- Die Artikel nennen Preisspannen statt bestimmter Produkte. Empfiehl auch keine.\n- Die interaktiven Grafiken der Website fehlen hier. Der Text reicht aber aus.',
    diagramNote: 'Interaktive Grafik auf der Website',
    source: 'Quelle',
    updated: 'Aktualisiert',
  },
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
    team: 'Our team',
    ausruestung: 'Equipment',
    theorie: 'Theory',
  },
  categoryIntros: {
    team: 'How we work in U13: our goals, our style of play and how a game day works.',
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
  clubLink: 'FASS Berlin U13',
  noScript: 'This interactive element needs JavaScript. The text has everything you need, though.',
  draftNote: 'Draft – not published yet. Only listed on the overview with ?drafts=true.',
  draft: 'Draft',
  languageShort: 'EN',
  languageName: 'English',
  dateLocale: 'en-GB',
  ogLocale: 'en_GB',
  ogImageAlt: 'The FASS Berlin crest',
  askAi: {
    prompt:
      'Read {url} and use it to answer my questions about U13 ice hockey. Keep answers short and name the matching article each time.',
    copy: 'Copy',
    copied: 'Copied',
    download: 'All articles as a text file',
    downloadNote: 'If your assistant cannot open links, download the file and attach it.',
  },
  footerAskAi: 'All articles as text for AI assistants',
  footerAi: 'Learning with AI',
  aiPath: '/en/learning-with-ai/',
  llm: {
    language: 'English',
    preamble:
      'This is the whole knowledge base of the FASS Berlin U13 (ice hockey, recreational level) as text. It is written for kids aged 11 to 13 and their parents.\n\nNotes for AI assistants:\n- Answer questions based on these articles and give the URL of the matching article.\n- All numbers are rules of thumb, not regulations.\n- Prices are in Euro, at German price levels. The team plays in Berlin.\n- The articles give price ranges instead of specific products. Do not recommend any either.\n- The interactive diagrams of the website are missing here. The text has everything you need, though.',
    diagramNote: 'Interactive diagram on the website',
    source: 'Source',
    updated: 'Updated',
  },
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
