import type { APIRoute } from 'astro';
import { getArticles, articlePath } from '../lib/articles';
import { absoluteUrl } from '../lib/href';
import { defaultLocale, visibleLocales, t } from '../lib/i18n';

/**
 * /llms.txt, after the llmstxt.org convention: a short summary plus a link list of every
 * article, so an AI assistant can find the right page. The full text of each language
 * lives in /<locale>/llms-full.txt.
 */
export const GET: APIRoute = async ({ site }) => {
  const sections = await Promise.all(
    visibleLocales.map(async (locale) => {
      const s = t(locale);
      const articles = (await getArticles(locale)).filter((entry) => !entry.data.draft);
      const links = articles.map(
        (entry) =>
          `- [${entry.data.title}](${absoluteUrl(articlePath(entry), site)}): ${entry.data.description}`,
      );
      const full = `- [${s.footerAskAi}](${absoluteUrl(`/${locale}/llms-full.txt`, site)})`;
      return `## ${s.llm.language}\n\n${full}\n${links.join('\n')}`;
    }),
  );

  const s = t(defaultLocale);
  const summary = t('en').llm.preamble.split('\n\n')[0];
  const body = `# ${s.siteName}\n\n> ${summary}\n\n${sections.join('\n\n')}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
