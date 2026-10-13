import type { Locale } from '../lib/i18n';

/**
 * Recorded games for the "Spiele schauen" articles, shown by GameList.astro and written
 * out for llms-full.txt by gameListMarkdown(). Videos are linked, never embedded: no
 * third-party script loads with the page, and the page still works offline.
 *
 * To add a game, add an entry here. `scenes` are optional moments worth pausing on;
 * `at` is the time in the video in seconds, `article` the German slug of the article
 * the scene illustrates (the English link is looked up through `articleSlugs`).
 */
export interface Scene {
  at: number;
  article: keyof typeof articleSlugs;
  text: Record<Locale, string>;
}

export interface Game {
  /** YYYY-MM-DD */
  date: string;
  home: string;
  away: string;
  /** Age group and class, e.g. "U13 · MK1 · Nordverbund". */
  level: Record<Locale, string>;
  youtubeId: string;
  /** Who filmed it; linked as the source. */
  channel: { name: string; url: string };
  /** Optional hint, e.g. which jerseys to look for. */
  note?: Record<Locale, string>;
  scenes: Scene[];
}

/** German slug -> English slug, for the article links in scenes. */
export const articleSlugs = {
  rollen: 'roles',
  forecheck: 'forecheck',
  abwehrseite: 'defensive-side',
  zuordnung: 'coverage',
  support: 'support',
  gegenlaufen: 'skating-to-the-puck',
  cycles: 'cycles',
  bully: 'faceoffs',
  regeln: 'rules',
  torhueter: 'goalies',
  aufstellung: 'lineup',
  spielbeginn: 'game-start',
} as const;

export const games: Game[] = [
  {
    date: '2026-10-03',
    home: 'HSV Eishockey',
    away: 'REV Bremerhaven',
    level: {
      de: 'U13 · MK1 · Nordverbund',
      en: 'U13 · MK1 · Nordverbund',
    },
    youtubeId: 'm5FThhmFBOE',
    channel: { name: 'NoDVictory', url: 'https://www.youtube.com/@NoDVictory' },
    scenes: [],
  },
  {
    date: '2026-01-31',
    home: 'Crocodiles Hamburg',
    away: 'FASS Berlin',
    level: {
      de: 'U13 · MK2 · Saison 2025/26',
      en: 'U13 · MK2 · 2025/26 season',
    },
    youtubeId: '5wPisYxMJo0',
    channel: { name: 'NoDVictory', url: 'https://www.youtube.com/@NoDVictory' },
    note: {
      de: 'Unsere U13 aus der letzten Saison. FASS spielt in Weiss.',
      en: 'Our U13 from last season. FASS play in white.',
    },
    scenes: [
      {
        at: 647,
        article: 'spielbeginn',
        text: {
          de: 'Die Begrüssung: Aufstellen auf der blauen Linie, Stock hoch, Handschlag, Kreis am Tor. Etwa zwei Minuten bis zum ersten Bully.',
          en: 'The greeting: lining up on the blue line, sticks up, handshakes, huddle at the net. About two minutes until the first face-off.',
        },
      },
    ],
  },
];

export function videoUrl(game: Game, at?: number): string {
  const url = `https://www.youtube.com/watch?v=${game.youtubeId}`;
  return at ? `${url}&t=${at}s` : url;
}

/** 4265 -> "1:11:05" */
export function timestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(h ? 2 : 1, '0');
  return `${h ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
}

export function articleSlug(scene: Scene, locale: Locale): string {
  return locale === 'de' ? scene.article : articleSlugs[scene.article];
}

const md = {
  de: { video: 'Video', source: 'Aufnahme' },
  en: { video: 'Video', source: 'Filmed by' },
};

/** The game list as Markdown, for llms-full.txt. `link` turns a site path into an absolute URL. */
export function gameListMarkdown(locale: Locale, link: (path: string) => string): string {
  const s = md[locale];
  return games
    .map((game) => {
      const note = game.note ? ` ${game.note[locale]}` : '';
      const head = `**${game.home} – ${game.away}** (${game.date}, ${game.level[locale]}).${note} ${s.video}: ${videoUrl(game)} · ${s.source}: ${game.channel.name}`;
      const scenes = game.scenes.map(
        (scene) =>
          `- [${timestamp(scene.at)}](${videoUrl(game, scene.at)}): ${scene.text[locale]} (${link(`/${locale}/${articleSlug(scene, locale)}/`)})`,
      );
      return [head, ...scenes].join('\n');
    })
    .join('\n\n');
}
