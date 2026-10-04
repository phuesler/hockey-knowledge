import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLocale, isPreview, parseEntryId, t, visibleLocales, type Locale } from './i18n';

export type Article = CollectionEntry<'articles'>;

/** Rough reading time in minutes, at ~200 words per minute. */
export function readingMinutes(entry: Article): number {
  const words = (entry.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Site path for an entry, without the base prefix. Feed it to href(). */
export function articlePath(entry: Article): string {
  const { locale, slug } = parseEntryId(entry.id);
  return `/${locale}/${slug}`;
}

/**
 * Every published article for a locale, in display order: by category as listed in
 * `categoryOrder`, then by the `order` frontmatter field, then alphabetically.
 * Drafts never make it into a build (see `isVisible`).
 */
export const categoryOrder = ['team', 'ausruestung', 'theorie'] as const;

/** Drafts never reach a build; only the dev preview shows them, for proofreading. */
const isVisible = ({ data }: Article) => isPreview || !data.draft;

export async function getArticles(locale: Locale): Promise<Article[]> {
  const entries = await getCollection('articles', isVisible);
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
 * Every published language version of an article, including the article itself,
 * in the order of `visibleLocales`. Feeds the language switcher and hreflang.
 */
export async function getAlternates(entry: Article): Promise<Alternate[]> {
  const key = translationKey(entry);
  const entries = await getCollection('articles', isVisible);
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
