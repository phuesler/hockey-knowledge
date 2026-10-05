<script lang="ts">
  /**
   * Close-up of the blue line from above: where the skates (and the puck) have to be
   * for offside. Static, used without a client directive.
   *
   * Units are centimetres: the blue line is 30 cm wide (y 45–75), the attacking zone is
   * above it, the neutral zone below, so we attack upwards like in the rink diagrams. A skate blade is about 28 cm long; the boot
   * around it is drawn faintly. The puck is 7.6 cm across.
   */
  import type { Locale } from '../lib/i18n';

  let { locale = 'de' }: { locale?: Locale } = $props();

  const de = {
    caption: 'An der blauen Linie',
    neutral: 'neutrale Zone',
    attack: 'Angriffszone',
    cases: {
      offside: {
        name: 'Abseits',
        text: 'Beide Schlittschuhe sind ganz über der Linie, bevor der Puck drüben ist.',
      },
      oneSkate: {
        name: 'Kein Abseits',
        text: 'Ein Schlittschuh berührt noch die Linie. Das reicht.',
      },
      stick: {
        name: 'Kein Abseits',
        text: 'Der Stock ist drüben, die Schlittschuhe nicht. Es zählen nur die Schlittschuhe.',
      },
      puck: {
        name: 'Puck auf der Linie',
        text: 'Der Puck liegt noch auf der Linie. Er ist erst drin, wenn er ganz drüben ist.',
      },
    },
    note: 'Von oben gesehen, wir greifen nach oben an. Die ganze blaue Linie gehört noch zur neutralen Zone.',
  };
  const en: typeof de = {
    caption: 'At the blue line',
    neutral: 'neutral zone',
    attack: 'attacking zone',
    cases: {
      offside: {
        name: 'Offside',
        text: 'Both skates are completely over the line before the puck is across.',
      },
      oneSkate: {
        name: 'Not offside',
        text: 'One skate is still touching the line. That is enough.',
      },
      stick: {
        name: 'Not offside',
        text: 'The stick is across, the skates are not. Only the skates count.',
      },
      puck: {
        name: 'Puck on the line',
        text: 'The puck is still on the line. It is only in when it is completely across.',
      },
    },
    note: 'Seen from above, we attack upwards. The whole blue line still belongs to the neutral zone.',
  };

  const s = $derived({ de, en }[locale]);

  type Case = keyof typeof de.cases;
  /* Top of each skate blade (y, in cm); the blade runs 28 cm down from there. */
  const cases: { id: Case; skates: [number, number] | null; stick?: boolean; puck?: boolean; offside?: boolean }[] = [
    { id: 'offside', skates: [78, 80], offside: true },
    { id: 'oneSkate', skates: [60, 78] },
    { id: 'stick', skates: [16, 15], stick: true },
    { id: 'puck', skates: null, puck: true },
  ];
  const SKATE_X = [32, 48];
</script>

<figure class="blueline">
  <figcaption>{s.caption}</figcaption>
  <ul>
    {#each cases as c}
      <li>
        <p class="name" class:offside={c.offside} class:neutral={c.puck}>{s.cases[c.id].name}</p>
        <svg viewBox="0 0 80 120" role="img" aria-label="{s.cases[c.id].name}: {s.cases[c.id].text}">
          <rect x="0" y="0" width="80" height="120" class="ice" />
          <rect x="0" y="45" width="80" height="30" class="line" />
          <text x="3" y="7" class="zone">{s.attack}</text>
          <text x="3" y="116" class="zone">{s.neutral}</text>
          <!-- Drawn with the attacking zone below, then mirrored so we attack upwards. -->
          <g transform="translate(0 120) scale(1 -1)">
          {#if c.skates}
            {#each c.skates as top, i}
              <rect x={SKATE_X[i] - 4.5} y={top - 1} width="9" height="30" rx="4" class="boot" />
              <rect x={SKATE_X[i] - 1} y={top} width="2" height="28" rx="1" class="blade" />
            {/each}
          {/if}
          {#if c.stick}
            <path d="M58 14 L57 82" class="stick" />
            <path d="M57 82 L70 86" class="stick blade-stick" />
          {/if}
          {#if c.puck}
            <circle cx="40" cy="73" r="3.8" class="puck" />
          {/if}
          </g>
        </svg>
        <p class="text">{s.cases[c.id].text}</p>
      </li>
    {/each}
  </ul>
  <p class="note">{s.note}</p>
</figure>

<style>
  .blueline {
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
    margin-bottom: var(--s-4);
  }

  ul {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--s-4);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  @media (min-width: 44rem) {
    ul {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
  /* .prose spaces consecutive list items; ul > li outranks it. */
  ul > li {
    margin: 0;
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
    border-radius: var(--radius);
    border: 1px solid var(--c-border);
  }
  .ice {
    fill: var(--c-surface-2);
  }
  .line {
    fill: var(--c-accent);
    opacity: 0.7;
  }
  .zone {
    font-family: var(--font-sans);
    font-size: 6px;
    fill: var(--c-text-muted);
  }
  .boot {
    fill: var(--c-surface);
    stroke: var(--c-text-muted);
    stroke-width: 0.6;
    opacity: 0.85;
  }
  .blade {
    fill: var(--c-text);
  }
  .stick {
    fill: none;
    stroke: var(--c-brand);
    stroke-width: 2.4;
    stroke-linecap: round;
  }
  .blade-stick {
    stroke-width: 3.2;
  }
  .puck {
    fill: var(--c-text);
  }

  .name {
    margin: 0 0 var(--s-2);
    font-weight: 700;
    color: var(--c-good);
  }
  .name.neutral {
    color: var(--c-text);
  }
  .name.offside {
    color: var(--c-brand);
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
