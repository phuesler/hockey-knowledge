import { getCollection, type CollectionEntry } from 'astro:content';
import { parseEntryId, type Locale } from './i18n';

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
 * Drafts never make it into a build.
 */
export const categoryOrder = ['ausruestung', 'theorie'] as const;

export async function getArticles(locale: Locale): Promise<Article[]> {
  const entries = await getCollection('articles', ({ data }) => !data.draft);
  return entries
    .filter((entry) => parseEntryId(entry.id).locale === locale)
    .sort((a, b) => {
      const byCategory =
        categoryOrder.indexOf(a.data.category) - categoryOrder.indexOf(b.data.category);
      if (byCategory !== 0) return byCategory;
      if (a.data.order !== b.data.order) return a.data.order - b.data.order;
      return a.data.title.localeCompare(b.data.title, 'de');
    });
}
