/**
 * UI strings, keyed by locale. Article *content* lives in src/data/articles/<locale>/;
 * this file only covers the chrome around it (nav, labels, footer).
 *
 * To add a language: add a key to `locales`, add a matching block to `ui`, create
 * src/data/articles/<locale>/ and copy src/pages/de/ to src/pages/<locale>/.
 */
export const locales = ['de'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'de';

export const ui = {
  de: {
    siteName: 'Hockey Wissen',
    tagline: 'Ausrüstung und Theorie für U13 – erklärt für Kinder und Eltern',
    skipToContent: 'Zum Inhalt springen',
    home: 'Start',
    allArticles: 'Alle Artikel',
    updatedOn: 'Aktualisiert am',
    readingTime: 'Min. Lesezeit',
    inThisArticle: 'In diesem Artikel',
    previous: 'Vorheriger Artikel',
    next: 'Nächster Artikel',
    backToOverview: 'Zurück zur Übersicht',
    categories: {
      ausruestung: 'Ausrüstung',
      theorie: 'Theorie',
    },
    categoryIntros: {
      ausruestung: 'Was ihr beim Kauf und beim Unterhalt der Ausrüstung wissen müsst.',
      theorie: 'Regeln, Spielverständnis und Taktik zum Nachlesen.',
    },
    footerNote:
      'Alle Angaben sind Faustregeln aus der Praxis, keine Vorschriften. Im Zweifel probiert ihr im Laden oder auf dem Eis aus, was passt.',
    noScript: 'Dieses interaktive Element braucht JavaScript. Die Angaben im Text reichen aber aus.',
  },
} as const;

export function t(locale: Locale = defaultLocale) {
  return ui[locale];
}

/** Split a collection entry id like "de/schlaeger" into locale + slug. */
export function parseEntryId(id: string): { locale: Locale; slug: string } {
  const [maybeLocale, ...rest] = id.split('/');
  if ((locales as readonly string[]).includes(maybeLocale)) {
    return { locale: maybeLocale as Locale, slug: rest.join('/') };
  }
  return { locale: defaultLocale, slug: id };
}
