<script lang="ts">
  /**
   * A game situation on the rink: one or more drawings with a title and a sentence
   * each, plus a legend. Used without a client directive, so it is plain HTML and SVG
   * with no JavaScript. The situations themselves live in plays.ts.
   *
   *   <RinkPlay play="goal-side" />
   *   <RinkPlay play="goal-side" locale="en" />
   */
  import Rink from './Rink.svelte';
  import RinkLegend from './RinkLegend.svelte';
  import { plays, playText, type PlayId } from './plays';
  import type { Locale } from '../lib/i18n';

  let { play, locale = 'de' }: { play: PlayId; locale?: Locale } = $props();

  const de = {
    zone: {
      own: 'Unten ist unser Tor',
      attack: 'Oben ist das gegnerische Tor, wir greifen nach oben an',
      full: 'Das ganze Eis: unten unser Tor, oben das gegnerische',
      neutral: 'Die neutrale Zone: unser Tor liegt unten, wir greifen nach oben an',
    },
    verdict: { good: 'So', bad: 'Nicht so' },
  };
  const en: typeof de = {
    zone: {
      own: 'Our goal is at the bottom',
      attack: 'The opponents’ goal is at the top, we attack upwards',
      full: 'The whole rink: our goal at the bottom, the opponents’ at the top',
      neutral: 'The neutral zone: our goal is below, we attack upwards',
    },
    verdict: { good: 'Do', bad: 'Don’t' },
  };

  const s = $derived({ de, en }[locale]);
  const panels = $derived(plays[play]);
  const text = $derived(playText[locale][play]);
  const scenes = $derived(panels.map((p) => p.scene));
</script>

<figure class="play">
  <figcaption>{text.caption}</figcaption>
  <p class="zone">{s.zone[panels[0].zone]}</p>

  <div class="panels" class:pair={panels.length > 1} class:tall={panels.some((p) => p.view === 'full')}>
    {#each panels as panel, i}
      <div class="panel">
        <p class="title">
          {#if panel.verdict}
            <span class="verdict {panel.verdict}">{s.verdict[panel.verdict]}</span>
          {/if}
          {text.panels[i].title}
        </p>
        <Rink scene={panel.scene} label={text.labels[i]} view={panel.view} flip={panel.zone === 'attack'} />
        <p class="text">{text.panels[i].text}</p>
      </div>
    {/each}
  </div>

  <RinkLegend {scenes} {locale} />

  {#if text.note}<p class="note">{text.note}</p>{/if}
</figure>

<style>
  .play {
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

  .panels {
    display: grid;
    gap: var(--s-5);
  }
  /* A single drawing stays phone-sized on wide screens; it reads better that way. */
  .panels:not(.pair) {
    max-width: 26rem;
  }
  /* The full rink is twice as tall as wide; keep a pair of them from filling the screen. */
  .panels.tall {
    max-width: 34rem;
  }
  @media (min-width: 40rem) {
    .panels.pair {
      grid-template-columns: 1fr 1fr;
    }
  }

  .title {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    margin: 0 0 var(--s-2);
    font-weight: 700;
  }
  .verdict {
    flex: none;
    white-space: nowrap;
    padding: 0 var(--s-2);
    font-size: var(--t-sm);
    border-radius: var(--radius);
    border: 1px solid currentColor;
  }
  .verdict.good {
    color: var(--c-good);
    background: var(--c-good-soft);
  }
  .verdict.bad {
    color: var(--c-brand);
    background: var(--c-brand-soft);
  }

  .text {
    margin: var(--s-2) 0 0;
    font-size: var(--t-sm);
    color: var(--c-text-muted);
  }

  .note {
    margin: var(--s-4) 0 0;
    font-size: var(--t-sm);
    color: var(--c-text-muted);
  }
</style>
