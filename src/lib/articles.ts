import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLocale, parseEntryId, t, visibleLocales, type Locale } from './i18n';

export type Article = CollectionEntry<'articles'>;

/** Rough reading time in minutes, at ~200 words per minute. */
export function readingMinutes(entry: Article): number {
  const words = (entry.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Site path for an entry, without the base prefix. Feed it to href(). The trailing slash
 * matters: GitHub Pages redirects /de/x to /de/x/, and canonical URLs must not redirect.
 */
export function articlePath(entry: Article): string {
  const { locale, slug } = parseEntryId(entry.id);
  return `/${locale}/${slug}/`;
}

/**
 * Every article for a locale, drafts included, in display order: by category as listed
 * in `categoryOrder`, then by the `order` frontmatter field, then alphabetically.
 *
 * Drafts are built so proofreaders can read them, but they stay out of sight: the
 * overview hides them unless the URL has ?drafts=true (see BaseLayout), published pages
 * never link to them, and they get noindex and no sitemap entry.
 */
export const categoryOrder = ['team', 'ausruestung', 'theorie', 'kultur'] as const;

export async function getArticles(locale: Locale): Promise<Article[]> {
  const entries = await getCollection('articles');
  return entries
    .filter((entry) => parseEntryId(entry.id).locale === locale)
    .sort((a, b) => {
      const byCategory =
        categoryOrder.indexOf(a.data.category) - categoryOrder.indexOf(b.data.category);
      if (byCategory !== 0) return byCategory;
      if (a.data.order !== b.data.order) return a.data.order - b.data.order;
      return a.data.title.localeCompare(b.data.title, t(locale).dateLocale);
    });
}

/** One language version of a page: the locale and its path without the base prefix. */
export interface Alternate {
  locale: Locale;
  path: string;
}

/**
 * The key that pairs an article with its translations: the slug of the German
 * original. German articles use their own slug; translations name it in
 * `translationOf`, because their own slug is in their language.
 */
function translationKey(entry: Article): string {
  const { locale, slug } = parseEntryId(entry.id);
  return locale === defaultLocale ? slug : (entry.data.translationOf ?? slug);
}

/**
 * Every language version of an article, including the article itself, in the order of
 * `visibleLocales`. Feeds the language switcher and hreflang. A published article only
 * lists published translations; a draft lists drafts too.
 */
export async function getAlternates(entry: Article): Promise<Alternate[]> {
  const key = translationKey(entry);
  const entries = await getCollection('articles', ({ data }) => entry.data.draft || !data.draft);
  return visibleLocales.flatMap((locale) => {
    const match = entries.find(
      (other) => parseEntryId(other.id).locale === locale && translationKey(other) === key,
    );
    return match ? [{ locale, path: articlePath(match) }] : [];
  });
}

/** The overview page in every published language. */
export function indexAlternates(): Alternate[] {
  return visibleLocales.map((locale) => ({ locale, path: `/${locale}/` }));
}
