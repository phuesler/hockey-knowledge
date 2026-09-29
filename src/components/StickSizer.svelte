<script lang="ts">
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { motionDuration } from '../lib/motion';

  /** Körpergrösse in cm und Gewicht in kg, beides mit U13-tauglichen Startwerten. */
  let heightCm = $state(150);
  let weightKg = $state(40);

  /*
   * Faustregeln, wie sie im Laden verwendet werden:
   * - Der Stock steht senkrecht vor dir, Kelle auf dem Boden. Ohne Schlittschuhe
   *   reicht er bis zur Nase, mit Schlittschuhen bis zum Kinn. Beides ergibt
   *   ungefähr dieselbe Stocklänge: Körpergrösse minus ca. 12 cm.
   * - Flex ≈ halbes Körpergewicht in Pfund, also kg × 2.2 ÷ 2 ≈ kg × 1.1.
   * - Jeder gekürzte Zoll (2.5 cm) macht den Stock ca. 5 Flexpunkte härter.
   */
  const NOSE_OFFSET_CM = 12;
  const FLEX_PER_INCH_CUT = 5;

  const stickCm = $derived(Math.round(heightCm - NOSE_OFFSET_CM));
  const flex = $derived(Math.round(weightKg * 1.1));
  const flexLow = $derived(Math.max(15, Math.round(flex * 0.9)));
  const flexHigh = $derived(Math.round(flex * 1.1));

  const sizes = [
    { name: 'Youth', maxHeight: 140, flex: '20–35' },
    { name: 'Junior', maxHeight: 160, flex: '30–50' },
    { name: 'Intermediate', maxHeight: 175, flex: '50–65' },
    { name: 'Senior', maxHeight: Infinity, flex: '65–85' },
  ];
  const size = $derived(sizes.find((s) => heightCm <= s.maxHeight)!);

  /* Zeichnung: 1 cm Körpergrösse = 1.15 px, Eis auf y = 240. */
  const GROUND = 240;
  const PX_PER_CM = 1.15;

  const figureTween = new Tween(150 * PX_PER_CM, {
    duration: motionDuration(260),
    easing: cubicOut,
  });
  $effect(() => {
    figureTween.target = heightCm * PX_PER_CM;
  });

  const figurePx = $derived(figureTween.current);
  const headR = $derived(figurePx * 0.072);
  const headY = $derived(GROUND - figurePx + headR);
  const noseY = $derived(GROUND - figurePx + headR * 1.35);
  const shoulderY = $derived(GROUND - figurePx * 0.82);
  const hipY = $derived(GROUND - figurePx * 0.48);
</script>

<figure class="sizer">
  <figcaption class="title">Stock-Rechner</figcaption>

  <div class="controls">
    <label>
      <span class="label-row">
        Körpergrösse <output>{heightCm} cm</output>
      </span>
      <input type="range" min="120" max="180" step="1" bind:value={heightCm} />
    </label>

    <label>
      <span class="label-row">
        Gewicht <output>{weightKg} kg</output>
      </span>
      <input type="range" min="25" max="70" step="1" bind:value={weightKg} />
    </label>
  </div>

  <div class="panel">
    <svg viewBox="0 0 220 260" role="img" aria-label="Schematische Darstellung: Spieler mit Stock, der bis zur Nase reicht">
      <!-- Eisfläche -->
      <line x1="10" y1={GROUND} x2="210" y2={GROUND} stroke="var(--c-steel)" stroke-width="2" />
      <rect x="10" y={GROUND} width="200" height="10" fill="var(--c-ice)" opacity="0.6" />

      <!-- Spieler -->
      <g stroke="var(--c-text)" stroke-width="4" stroke-linecap="round" fill="none">
        <circle cx="80" cy={headY} r={headR} fill="var(--c-text)" stroke="none" />
        <line x1="80" y1={headY + headR} x2="80" y2={hipY} />
        <line x1="80" y1={hipY} x2="66" y2={GROUND} />
        <line x1="80" y1={hipY} x2="94" y2={GROUND} />
        <line x1="80" y1={shoulderY} x2="140" y2={shoulderY + 12} />
      </g>

      <!-- Stock: Schaft bis Nasenhöhe, Kelle auf dem Eis -->
      <g stroke="var(--c-brand)" stroke-width="6" stroke-linecap="round" fill="none">
        <line x1="140" y1={noseY} x2="140" y2={GROUND} />
        <line x1="140" y1={GROUND} x2="168" y2={GROUND - 4} stroke-width="8" />
      </g>

      <!-- Messhilfe auf Nasenhöhe -->
      <line x1="60" y1={noseY} x2="196" y2={noseY}
            stroke="var(--c-accent)" stroke-width="1.5" stroke-dasharray="5 4" />
      <text x="196" y={noseY - 7} text-anchor="end"
            fill="var(--c-accent)" font-size="11" font-weight="700">Nase</text>
    </svg>

    <dl class="results">
      <div>
        <dt>Stocklänge</dt>
        <dd class="big">{stickCm} cm</dd>
        <dd class="hint">vom Boden bis zur Nase, ohne Schlittschuhe gemessen</dd>
      </div>
      <div>
        <dt>Grösse</dt>
        <dd class="big">{size.name}</dd>
        <dd class="hint">üblicher Flex-Bereich dieser Grösse: {size.flex}</dd>
      </div>
      <div>
        <dt>Flex</dt>
        <dd class="big">{flexLow}–{flexHigh}</dd>
        <dd class="hint">Richtwert {flex} (halbes Körpergewicht in Pfund)</dd>
      </div>
    </dl>
  </div>

  <p class="note">
    Wird der Stock um 2.5 cm gekürzt, wird er rund {FLEX_PER_INCH_CUT} Flexpunkte härter.
    Wer viel kürzen muss, kauft also besser gleich einen weicheren Stock.
  </p>
</figure>

<style>
  .sizer {
    margin: var(--s-6) 0;
    padding: var(--s-5);
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
  }

  .title {
    font-size: var(--t-sm);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--c-text-muted);
    font-weight: 700;
    margin-bottom: var(--s-4);
  }

  .controls {
    display: grid;
    gap: var(--s-4);
  }
  @media (min-width: 34rem) {
    .controls { grid-template-columns: 1fr 1fr; }
  }

  label { display: block; }
  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--s-2);
    font-weight: 600;
    margin-bottom: var(--s-1);
  }
  output {
    font-variant-numeric: tabular-nums;
    color: var(--c-brand);
  }
  input[type='range'] {
    width: 100%;
    accent-color: var(--c-brand);
  }

  .panel {
    display: grid;
    gap: var(--s-4);
    align-items: center;
    margin-top: var(--s-5);
  }
  @media (min-width: 34rem) {
    .panel { grid-template-columns: minmax(0, 12rem) 1fr; }
  }

  svg {
    width: 100%;
    max-width: 14rem;
    margin-inline: auto;
    background: var(--c-surface-2);
    border-radius: var(--radius);
  }

  .results {
    display: grid;
    gap: var(--s-4);
    margin: 0;
  }
  dt {
    font-size: var(--t-sm);
    color: var(--c-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  dd { margin: 0; }
  .big {
    font-size: var(--t-h3);
    font-weight: 700;
    color: var(--c-brand);
    font-variant-numeric: tabular-nums;
  }
  .hint {
    font-size: var(--t-sm);
    color: var(--c-text-muted);
  }

  .note {
    margin-top: var(--s-5);
    padding-top: var(--s-4);
    border-top: 1px solid var(--c-border);
    font-size: var(--t-sm);
    color: var(--c-text-muted);
  }
</style>
