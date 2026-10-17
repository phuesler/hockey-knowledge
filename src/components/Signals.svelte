<script lang="ts">
  /**
   * The officials' hand signals of one group as a card grid: a figure (SignalFigure.svelte)
   * with the signal's name, who shows it, the rule, what it means and how it looks. The
   * signals and their words live in signals.ts.
   *
   *   <Signals client:visible={{ rootMargin: '200px' }} group="play" />
   *
   * Server-rendered with every figure in its final pose, so the article is complete without
   * JavaScript. Once the island runs, each figure plays its gesture the first time its card
   * scrolls into view, and a replay button shows it again. Under reduced motion nothing
   * moves and there is no button.
   */
  import { onMount } from 'svelte';
  import SignalFigure from './SignalFigure.svelte';
  import { inGroup, signals, signalsText, type Group, type SignalId } from './signals';
  import { motionDuration } from '../lib/motion';
  import type { Locale } from '../lib/i18n';

  let { group, locale = 'de' }: { group: Group; locale?: Locale } = $props();

  const t = $derived(signalsText[locale]);
  const ids = inGroup(group);

  const figures: Partial<Record<SignalId, SignalFigure>> = {};
  let root: HTMLElement;
  /* False on the server and until mounted, and false under reduced motion. */
  let canAnimate = $state(false);

  /* Cards that come into view together start one after the other, not all at once. */
  const STAGGER_MS = 120;

  onMount(() => {
    canAnimate = motionDuration(1) > 0;
    if (!canAnimate) return;
    let queued = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          const id = (entry.target as HTMLElement).dataset.signal as SignalId;
          const delay = STAGGER_MS * queued++;
          setTimeout(() => {
            queued = Math.max(0, queued - 1);
            figures[id]?.play();
          }, delay);
        }
      },
      { threshold: 0.6 },
    );
    for (const card of root.querySelectorAll<HTMLElement>('li[data-signal]')) observer.observe(card);
    return () => observer.disconnect();
  });
</script>

<figure class="signals" bind:this={root}>
  <figcaption>{t.groups[group]}</figcaption>
  <ul>
    {#each ids as id (id)}
      <li data-signal={id}>
        <div class="art">
          <SignalFigure {id} bind:this={figures[id]} />
        </div>
        <p>
          <strong>{t.signals[id].name}</strong>
          <span class="who">
            {t.who[signals[id].who]}{signals[id].rule ? ` · ${t.rule(signals[id].rule)}` : ''}
          </span>
          <span>{t.signals[id].meaning}</span>
          <span class="looks">{t.signals[id].looks}</span>
        </p>
        {#if canAnimate}
          <button type="button" aria-label={t.replayFor(t.signals[id].name)} onclick={() => figures[id]?.play()}>
            <span aria-hidden="true">↺</span> {t.replay}
          </button>
        {/if}
      </li>
    {/each}
  </ul>
</figure>

<style>
  .signals {
    margin: var(--s-6) 0;
    padding: var(--s-5);
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
  }
  figcaption {
    margin-bottom: var(--s-4);
    font-size: var(--t-sm);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--c-text-muted);
    font-weight: 700;
  }

  ul {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--s-5) var(--s-4);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  @media (min-width: 40rem) {
    ul {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  @media (min-width: 56rem) {
    ul {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
  /* .prose spaces consecutive list items; ul > li outranks it. */
  ul > li {
    display: flex;
    flex-direction: column;
    gap: var(--s-2);
    margin: 0;
    min-width: 0;
  }

  .art {
    width: 100%;
    max-width: 9rem;
    margin: 0 auto;
    padding: var(--s-1);
    background: var(--c-surface-2);
    border-radius: var(--radius);
  }

  p {
    display: grid;
    gap: var(--s-1);
    margin: 0;
    font-size: var(--t-sm);
    line-height: 1.45;
  }
  strong {
    font-size: var(--t-base);
    line-height: 1.25;
  }
  .who,
  .looks {
    color: var(--c-text-muted);
  }
  .who {
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  button {
    align-self: flex-start;
    min-height: 2.75rem;
    padding: var(--s-2) var(--s-3);
    white-space: nowrap;
    font: inherit;
    font-size: var(--t-sm);
    color: var(--c-text);
    background: var(--c-surface-2);
    border: 1px solid var(--c-border);
    border-radius: var(--radius);
    cursor: pointer;
  }
  button:hover {
    border-color: var(--c-text-muted);
  }
</style>
