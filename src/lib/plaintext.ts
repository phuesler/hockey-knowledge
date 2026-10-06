import type { Article } from './articles';
import { absoluteUrl } from './href';
import { parseEntryId, t } from './i18n';
import { quizMarkdown, quizzes, type QuizId } from '../components/quizzes';

/**
 * An article body as plain Markdown, for the llms-full.txt files that people hand to
 * their AI assistant. MDX syntax is converted or removed with a few regexes, which covers
 * what the articles actually use:
 *
 *   import lines                          -> removed
 *   <Callout type title>…</Callout>       -> blockquote with the title in bold
 *   <details><summary>Q</summary>A        -> **Q** followed by A (quiz questions)
 *   <Quiz quiz="x" />                     -> every question with options and answer
 *   <a href={href('/de/x')}>…</a>         -> [text](absolute URL)
 *   <AnyComponent … />                    -> a note that the diagram is on the website
 *
 * A new wrapper component with text inside (like Callout) needs its own rule here,
 * otherwise its tags end up in the text.
 */
export function articleMarkdown(entry: Article, site: URL | undefined): string {
  const { locale } = parseEntryId(entry.id);
  const s = t(locale);

  return (entry.body ?? '')
    .replace(/^import .*$/gm, '')
    .replace(/<Callout\b([^>]*)>([\s\S]*?)<\/Callout>/g, (_, attrs: string, inner: string) => {
      const type = attrs.match(/type="(\w+)"/)?.[1] as keyof typeof s.callouts | undefined;
      const title = attrs.match(/title="([^"]*)"/)?.[1] ?? s.callouts[type ?? 'merke'];
      const lines = `**${title}:** ${inner.trim()}`.split('\n');
      return lines.map((line) => (line ? `> ${line}` : '>')).join('\n');
    })
    .replace(/<details>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g,
      (_, question: string, answer: string) => `**${question.trim()}**\n\n${answer.trim()}`)
    .replace(/<Quiz\b[^>]*?quiz="([\w-]+)"[^>]*?\/>/g, (tag: string, id: string) =>
      id in quizzes ? quizMarkdown(id as QuizId, locale) : tag)
    .replace(/<a href=\{href\('([^']*)'\)\}>([\s\S]*?)<\/a>/g, (_, path: string, text: string) =>
      `[${text}](${absoluteUrl(path, site)})`)
    .replace(/<a href="([^"]*)">([\s\S]*?)<\/a>/g, '[$2]($1)')
    .replace(/<[A-Z]\w*\b[\s\S]*?\/>/g, `_(${s.llm.diagramNote})_`)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
