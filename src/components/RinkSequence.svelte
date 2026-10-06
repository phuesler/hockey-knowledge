<script lang="ts">
  /**
   * A game situation in steps: one rink drawing, buttons to step through it or play it,
   * and the text for every step. Players slide to their next spot (the CSS transition in
   * Rink.svelte, off for reduced motion). The situations live in sequences.ts.
   *
   *   <RinkSequence client:visible sequence="pass-shadow" />
   *
   * Server-rendered at step 1 with every step's text listed, so the article stays
   * complete without JavaScript.
   */
  import { onDestroy } from 'svelte';
  import Rink from './Rink.svelte';
  import RinkLegend from './RinkLegend.svelte';
  import { sequences, sequenceText, type SequenceId } from './sequences';
  import type { Locale } from '../lib/i18n';

  let { sequence, locale = 'de' }: { sequence: SequenceId; locale?: Locale } = $props();

  const de = {
    zone: {
      own: 'Unten ist unser Tor',
      attack: 'Oben ist das gegnerische Tor, wir greifen nach oben an',
      full: 'Das ganze Eis: unten unser Tor, oben das gegnerische',
      neutral: 'Die neutrale Zone: unser Tor liegt unten, wir greifen nach oben an',
    },
    back: 'Zurück',
    next: 'Weiter',
    play: 'Abspielen',
    pause: 'Anhalten',
    again: 'Nochmal',
    step: (n: number, of: number) => `Schritt ${n} von ${of}`,
    steps: 'Schritte',
  };
  const en: typeof de = {
    zone: {
      own: 'Our goal is at the bottom',
      attack: 'The opponents’ goal is at the top, we attack upwards',
      full: 'The whole rink: our goal at the bottom, the opponents’ at the top',
      neutral: 'The neutral zone: our goal is below, we attack upwards',
    },
    back: 'Back',
    next: 'Next',
    play: 'Play',
    pause: 'Pause',
    again: 'Again',
    step: (n, of) => `Step ${n} of ${of}`,
    steps: 'Steps',
  };

  /* How long each step stays on screen while playing. */
  const STEP_MS = 3200;

  const s = $derived({ de, en }[locale]);
  const seq = $derived(sequences[sequence]);
  const text = $derived(sequenceText[locale][sequence]);
  const last = $derived(seq.frames.length - 1);

  let step = $state(0);
  let timer: ReturnType<typeof setInterval> | null = $state(null);
  const playing = $derived(timer !== null);

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function go(to: number) {
    stop();
    step = Math.max(0, Math.min(last, to));
  }

  function toggle() {
    if (playing) return stop();
    if (step === last) step = 0;
    timer = setInterval(() => {
      if (step >= last) return stop();
      step += 1;
      if (step >= last) stop();
    }, STEP_MS);
  }

  onDestroy(stop);
</script>

<figure class="sequence">
  <figcaption>{text.caption}</figcaption>
  <p class="zone">{s.zone[seq.zone]}</p>

  <div class="layout">
    <div class="drawing">
      <Rink
        scene={seq.frames[step]}
        label={text.labels[step]}
        view={seq.view}
        flip={seq.zone === 'attack'}
      />

      <div class="controls">
        <button type="button" onclick={() => go(step - 1)} disabled={step === 0}>
          <span aria-hidden="true">‹</span> {s.back}
        </button>
        <button type="button" class="play" onclick={toggle} aria-pressed={playing}>
          {#if playing}
            <span aria-hidden="true">❚❚</span> {s.pause}
          {:else if step === last}
            <span aria-hidden="true">↺</span> {s.again}
          {:else}
            <span aria-hidden="true">▶</span> {s.play}
          {/if}
        </button>
        <button type="button" onclick={() => go(step + 1)} disabled={step === last}>
          {s.next} <span aria-hidden="true">›</span>
        </button>
      </div>
      <p class="counter" aria-live="polite">{s.step(step + 1, seq.frames.length)}</p>
    </div>

    <ol class="steps" aria-label={s.steps}>
      {#each text.steps as item, i}
        <li class:current={i === step}>
          <button type="button" onclick={() => go(i)} aria-current={i === step ? 'step' : undefined}>
            <span class="num">{i + 1}</span>
            <span>
              <strong>{item.title}</strong>
              {item.text}
            </span>
          </button>
        </li>
      {/each}
    </ol>
  </div>

  <RinkLegend scenes={seq.frames} {locale} />

  {#if text.note}<p class="note">{text.note}</p>{/if}
</figure>

<style>
  .sequence {
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
  .drawing {
    max-width: 26rem;
  }
  @media (min-width: 44rem) {
    .layout {
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
      align-items: start;
    }
  }

  .controls {
    display: grid;
    grid-template-columns: 1fr 1.2fr 1fr;
    gap: var(--s-2);
    margin-top: var(--s-3);
  }
  .controls button {
    min-height: 2.75rem;
    padding: var(--s-2);
    font: inherit;
    font-size: var(--t-sm);
    font-weight: 600;
    color: var(--c-text);
    background: var(--c-surface-2);
    border: 1px solid var(--c-border);
    border-radius: var(--radius);
    cursor: pointer;
  }
  .controls button.play {
    color: var(--c-header-text);
    background: var(--c-signal);
    border-color: var(--c-signal);
  }
  .controls button:disabled {
    opacity: 0.45;
    cursor: default;
  }
  button:focus-visible {
    outline: 2px solid var(--c-accent);
    outline-offset: 2px;
  }

  .counter {
    margin: var(--s-2) 0 0;
    font-size: var(--t-sm);
    color: var(--c-text-muted);
    text-align: center;
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
    gap: var(--s-2);
    align-items: start;
    width: 100%;
    padding: var(--s-2);
    font: inherit;
    font-size: var(--t-sm);
    text-align: left;
    color: var(--c-text-muted);
    background: none;
    border: 1px solid transparent;
    border-radius: var(--radius);
    cursor: pointer;
  }
  .steps strong {
    display: block;
    color: var(--c-text);
  }
  .current button {
    color: var(--c-text);
    background: var(--c-surface-2);
    border-color: var(--c-border);
  }
  .num {
    display: inline-grid;
    place-items: center;
    width: 1.75rem;
    height: 1.75rem;
    font-weight: 700;
    color: var(--c-text);
    background: var(--c-surface-2);
    border: 1px solid var(--c-border);
    border-radius: 999px;
  }
  .current .num {
    color: var(--c-header-text);
    background: var(--c-signal);
    border-color: var(--c-signal);
  }

  .note {
    margin: var(--s-4) 0 0;
    font-size: var(--t-sm);
    color: var(--c-text-muted);
  }
</style>
