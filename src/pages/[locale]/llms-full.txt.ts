import type { APIRoute, GetStaticPaths } from 'astro';
import { getArticles, articlePath } from '../../lib/articles';
import { absoluteUrl } from '../../lib/href';
import { articleMarkdown } from '../../lib/plaintext';
import { visibleLocales, t, type Locale } from '../../lib/i18n';

/**
 * Every article of one language in a single Markdown file, e.g. /de/llms-full.txt.
 * Parents paste this one URL into their AI assistant (or attach the file) instead of
 * linking article by article. New articles show up here automatically; drafts are left out.
 */
export const getStaticPaths = (() =>
  visibleLocales.map((locale) => ({ params: { locale } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params, site }) => {
  const locale = params.locale as Locale;
  const s = t(locale);
  const articles = (await getArticles(locale)).filter((entry) => !entry.data.draft);

  const sections = articles.map((entry) => {
    const updated = entry.data.updated.toISOString().slice(0, 10);
    return [
      `# ${entry.data.title}`,
      `${s.llm.source}: ${absoluteUrl(articlePath(entry), site)}\n${s.llm.updated}: ${updated}`,
      `> ${entry.data.description}`,
      articleMarkdown(entry, site),
    ].join('\n\n');
  });

  const head = `# ${s.siteName}\n\n${s.llm.preamble}\n\n${s.llm.source}: ${absoluteUrl(`/${locale}/`, site)}`;
  const body = [head, ...sections].join('\n\n---\n\n') + '\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
