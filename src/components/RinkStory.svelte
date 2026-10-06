<script lang="ts">
  /**
   * A game situation told in steps (see stories.ts). Pick a step, press "Weiter" or let
   * it play: the players slide to their new spots, and an arrow shows the way each of
   * them came. The animal badges show who has which role.
   *
   *   <RinkStory story="backcheck" client:visible />
   *   <RinkStory story="backcheck" client:visible locale="en" />
   *
   * Server-rendered on the first step, with every step's text listed, so the article is
   * complete without JavaScript. Stepping on by one moves everyone along their way (curved
   * where a player has a `via`); other jumps use the CSS transition in Rink.svelte. Both
   * only run when the visitor has not asked for reduced motion.
   */
  import Rink from './Rink.svelte';
  import RinkLegend from './RinkLegend.svelte';
  import { untrack } from 'svelte';
  import { PLAYER_RADIUS, type Move, type Pt, type Scene } from './rink';
  import { animals, stories, storyText, type Animal, type StoryId, type StoryStep } from './stories';
  import type { Locale } from '../lib/i18n';
  import { motionDuration } from '../lib/motion';

  let { story, locale = 'de' }: { story: StoryId; locale?: Locale } = $props();

  const de = {
    steps: 'Schritte',
    back: 'Zurück',
    next: 'Weiter',
    play: 'Abspielen',
    pause: 'Pause',
    again: 'Nochmals',
    step: (n: number, total: number) => `Schritt ${n} von ${total}`,
    animals: { dog: 'Hund', fox: 'Fuchs', hawk: 'Falke', cheetah: 'Gepard' } satisfies Record<Animal, string>,
    zone: {
      own: 'Unten ist unser Tor',
      attack: 'Oben ist das gegnerische Tor, wir greifen nach oben an',
    },
  };
  const en: typeof de = {
    steps: 'Steps',
    back: 'Back',
    next: 'Next',
    play: 'Play',
    pause: 'Pause',
    again: 'Again',
    step: (n, total) => `Step ${n} of ${total}`,
    animals: { dog: 'Dog', fox: 'Fox', hawk: 'Hawk', cheetah: 'Cheetah' },
    zone: {
      own: 'Our goal is at the bottom',
      attack: 'The opponents’ goal is at the top, we attack upwards',
    },
  };

  const s = $derived({ de, en }[locale]);
  const data = $derived(stories[story]);
  const text = $derived(storyText[locale][story]);
  const last = $derived(data.steps.length - 1);

  let step = $state(0);
  let playing = $state(false);

  /* The arrows from where everyone stood in the previous step. */
  function arrivals(prev: StoryStep | undefined, cur: StoryStep): Move[] {
    if (!prev) return [];
    return cur.players.flatMap((p) => {
      const from = prev.players.find((q) => q.id === p.id)?.at;
      if (!from || Math.hypot(p.at[0] - from[0], p.at[1] - from[1]) < 0.5) return [];
      return [
        {
          kind: p.id === cur.carrier ? 'carry' : 'skate',
          team: p.team,
          path: p.via ? [from, p.via, p.at] : [from, p.at],
          trim: PLAYER_RADIUS + 0.3,
        } satisfies Move,
      ];
    });
  }

  const scenes = $derived(
    data.steps.map(
      (cur, i): Scene => ({
        players: cur.players.map((p) => ({ ...p, badge: p.badge && animals[p.badge] })),
        puck: cur.puck,
        areas: cur.areas,
        moves: [...arrivals(data.steps[i - 1], cur), ...(cur.moves ?? [])],
      }),
    ),
  );

  /* Point at t (0..1) on the way from `a` to `b`, curving past `via` if there is one. */
  function along(a: Pt, b: Pt, t: number, via?: Pt): Pt {
    const c = via ?? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const u = 1 - t;
    return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
  }

  /* Where the puck curves past: given, or along with a curving carrier. */
  function puckVia(prev: StoryStep, cur: StoryStep): Pt | undefined {
    if (cur.puckVia) return cur.puckVia;
    const now = cur.players.find((p) => p.id === cur.carrier);
    const before = prev.players.find((p) => p.id === cur.carrier);
    if (!now?.via || !before) return undefined;
    const off = (i: 0 | 1) => (prev.puck[i] - before.at[i] + cur.puck[i] - now.at[i]) / 2;
    return [now.via[0] + off(0), now.via[1] + off(1)];
  }

  /* While stepping on, the scene in between two steps; null otherwise. */
  let between = $state<Scene | null>(null);
  let shown = 0;

  $effect(() => {
    const to = step;
    const from = shown;
    shown = to;
    const ms = motionDuration(900);
    if (to !== from + 1 || !ms) return;
    const prev = data.steps[from];
    const cur = data.steps[to];
    const target = untrack(() => scenes[to]);
    const via = puckVia(prev, cur);
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const x = Math.min(1, (now - start) / ms);
      const t = x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
      between = {
        ...target,
        players: target.players.map((p, i) => {
          const from = prev.players.find((q) => q.id === cur.players[i].id)?.at;
          return from ? { ...p, at: along(from, p.at, t, cur.players[i].via) } : p;
        }),
        puck: along(prev.puck, cur.puck, t, via),
      };
      if (x < 1) frame = requestAnimationFrame(tick);
      else between = null;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      between = null;
    };
  });

  const used = $derived(
    (Object.keys(animals) as Animal[]).filter((a) => data.steps.some((st) => st.players.some((p) => p.badge === a))),
  );

  $effect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      if (step >= last) playing = false;
      else step += 1;
    }, 2800);
    return () => clearInterval(timer);
  });

  function play() {
    if (playing) {
      playing = false;
      return;
    }
    if (step >= last) step = 0;
    playing = true;
  }

  function go(i: number) {
    playing = false;
    step = i;
  }
</script>

<figure class="story">
  <figcaption>{text.caption}</figcaption>
  <p class="zone">{s.zone[data.zone]}</p>

  <div class="layout">
    <div>
      <Rink
        scene={between ?? scenes[step]}
        label={text.steps[step].label}
        view={data.view}
        flip={data.zone === 'attack'}
        still={between !== null}
      />

      <div class="controls">
        <button type="button" onclick={() => go(step - 1)} disabled={step === 0}>◀ {s.back}</button>
        <button type="button" class="primary" onclick={play}>
          {playing ? `❚❚ ${s.pause}` : step >= last ? `↻ ${s.again}` : `▶ ${s.play}`}
        </button>
        <button type="button" onclick={() => go(step + 1)} disabled={step >= last}>{s.next} ▶</button>
      </div>
      <p class="count" aria-live="polite">{s.step(step + 1, data.steps.length)}</p>

      {#if used.length}
        <ul class="animals">
          {#each used as a}
            <li><span aria-hidden="true">{animals[a]}</span> {s.animals[a]}</li>
          {/each}
        </ul>
      {/if}
      <RinkLegend {scenes} {locale} />
    </div>

    <ol class="steps" aria-label={s.steps}>
      {#each text.steps as st, i}
        <li>
          <button type="button" aria-current={i === step ? 'step' : undefined} onclick={() => go(i)}>
            <span class="num">{i + 1}</span>
            <span class="body">
              <strong>{st.title}</strong>
              <span>{st.text}</span>
            </span>
          </button>
        </li>
      {/each}
    </ol>
  </div>
</figure>

<style>
  .story {
    margin: var(--s-6) 0;
    padding: var(--s-5);
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
  }

  figcaption {
    font-size: var(--t-sm);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--c-text-muted);
    font-weight: 700;
  }
  .zone {
    margin: var(--s-1) 0 var(--s-4);
    font-size: var(--t-sm);
    color: var(--c-text-muted);
  }

  .layout {
    display: grid;
    gap: var(--s-5);
  }
  @media (min-width: 44rem) {
    .layout {
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
      align-items: start;
    }
  }

  button {
    font: inherit;
    color: var(--c-text);
    background: var(--c-surface-2);
    border: 1px solid var(--c-border);
    border-radius: var(--radius);
    cursor: pointer;
  }
  button:focus-visible {
    outline: 2px solid var(--c-accent);
    outline-offset: 2px;
  }
  button:disabled {
    opacity: 0.45;
    cursor: default;
  }

  .controls {
    display: grid;
    grid-template-columns: 1fr 1.2fr 1fr;
    gap: var(--s-2);
    margin-top: var(--s-4);
  }
  .controls button {
    min-height: 2.75rem;
    padding: var(--s-2);
    font-size: var(--t-sm);
    font-weight: 600;
  }
  .controls .primary {
    color: var(--c-header-text);
    background: var(--c-signal);
    border-color: var(--c-signal);
  }
  .count {
    margin: var(--s-2) 0 0;
    text-align: center;
    font-size: var(--t-sm);
    color: var(--c-text-muted);
  }

  .animals {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-2) var(--s-4);
    margin: var(--s-3) 0 0;
    padding: 0;
    list-style: none;
    font-size: var(--t-sm);
  }
  .animals > li {
    margin: 0;
  }

  .steps {
    display: grid;
    gap: var(--s-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  /* .prose spaces consecutive list items; .steps > li outranks it. */
  .steps > li {
    margin: 0;
  }
  .steps button {
    display: grid;
    grid-template-columns: 1.75rem 1fr;
    gap: var(--s-3);
    width: 100%;
    padding: var(--s-3);
    text-align: left;
    background: transparent;
    border-color: transparent;
  }
  .steps button[aria-current='step'] {
    background: var(--c-surface-2);
    border-color: var(--c-signal);
  }
  .num {
    display: inline-grid;
    place-items: center;
    width: 1.75rem;
    height: 1.75rem;
    font-size: var(--t-sm);
    font-weight: 700;
    color: var(--c-text-muted);
    border: 1px solid var(--c-border);
    border-radius: 999px;
  }
  [aria-current='step'] .num {
    color: var(--c-header-text);
    background: var(--c-signal);
    border-color: var(--c-signal);
  }
  .body {
    display: grid;
    gap: var(--s-1);
    font-size: var(--t-sm);
    color: var(--c-text-muted);
  }
  [aria-current='step'] .body {
    color: var(--c-text);
  }
  .body strong {
    color: var(--c-text);
  }
</style>
