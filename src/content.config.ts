import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * One collection for every article on the site.
 *
 * The file path under src/data/articles/ becomes the entry id, so
 *   src/data/articles/de/schlaeger.md  ->  id "de/schlaeger"  ->  URL /de/schlaeger
 * The first path segment is the locale; adding an en/ folder later needs no code change.
 */
const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/articles' }),
  schema: z.object({
    /** Shown as the page <h1> and in the site nav. */
    title: z.string(),
    /** One or two sentences. Used on the index card and as the meta description. */
    description: z.string(),
    /** Groups the article on the index page. Add new values here first. */
    category: z.enum(['ausruestung', 'theorie']).default('ausruestung'),
    /** Sort order within a category; lower comes first. */
    order: z.number().default(100),
    /** Last content update, as YYYY-MM-DD. */
    updated: z.coerce.date(),
    /** Free-form labels shown as pills on the article header. */
    tags: z.array(z.string()).default([]),
    /**
     * Translations only: slug of the German original this article translates, e.g.
     * "schlaeger" in en/sticks.mdx. Pairs the two for the language switcher.
     */
    translationOf: z.string().optional(),
    /** Drafts are excluded from the build entirely. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles };
