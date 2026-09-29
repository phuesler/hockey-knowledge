<script lang="ts">
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { motionDuration } from '../lib/motion';

  /*
   * Der Hohlschliff wird als Radius angegeben: je kleiner der Radius, desto tiefer die
   * Rille zwischen den beiden Kanten und desto stärker greifen sie ins Eis.
   * Die Rille ist real nur rund ein Zehntelmillimeter tief – in der Zeichnung unten
   * ist sie stark vergrössert, sonst wäre nichts zu sehen.
   */
  const BLADE_MM = 3; // Kufenbreite
  const EXAGGERATION = 200; // px pro mm, damit die Rille überhaupt sichtbar wird

  type Grind = {
    label: string;
    mm: number;
    inch: number;
    verdict: string;
  };

  const grinds: Grind[] = [
    {
      label: '3/8"', inch: 0.375, mm: 9.5,
      verdict: 'Sehr tief. Klebt im Eis, bremst stark. Für leichte U13-Spieler fast immer zu viel.',
    },
    {
      label: '7/16"', inch: 0.4375, mm: 11.1,
      verdict: 'Tief. Viel Kantengriff, dafür merklich langsamer. Eher für schwere, kräftige Spieler.',
    },
    {
      label: '1/2"', inch: 0.5, mm: 12.7,
      verdict: 'Der Standard in den meisten Shops. Guter Kompromiss – ein sinnvoller Startpunkt.',
    },
    {
      label: '5/8"', inch: 0.625, mm: 15.9,
      verdict: 'Flacher. Läuft spürbar leichter, hält in der Kurve immer noch gut. Für viele U13-Kinder die beste Wahl.',
    },
    {
      label: '3/4"', inch: 0.75, mm: 19.1,
      verdict: 'Sehr flach. Schnell und leichtläufig, verlangt aber saubere Technik beim Bremsen.',
    },
    {
      label: '1"', inch: 1, mm: 25.4,
      verdict: 'Fast flach. Nur für sehr leichte Kinder oder auf weichem, warmem Eis.',
    },
  ];

  /** Startwert: 1/2", weil das fast überall die Voreinstellung ist. */
  let index = $state(2);
  const grind = $derived(grinds[index]);

  /** Tiefe der Rille in mm: R − √(R² − (Breite/2)²). */
  function hollowDepthMm(radiusMm: number): number {
    const half = BLADE_MM / 2;
    return radiusMm - Math.sqrt(radiusMm * radiusMm - half * half);
  }

  const depthMm = $derived(hollowDepthMm(grind.mm));

  /* Griff und Gleiten als grobe Balken, normiert über den Bereich 3/8" bis 1". */
  const grip = $derived(Math.round(((1 / grind.inch - 1) / (1 / 0.375 - 1)) * 85 + 15));
  const glide = $derived(100 - grip + 10);

  const depthTween = new Tween(hollowDepthMm(12.7) * EXAGGERATION, {
    duration: motionDuration(280),
    easing: cubicOut,
  });
  $effect(() => {
    depthTween.target = depthMm * EXAGGERATION;
  });

  /* Zeichnung: Kufenquerschnitt von vorn, Unterkante auf y = 132. */
  const LEFT = 65;
  const RIGHT = 155;
  const TOP = 26;
  const BOTTOM = 132;

  /** Quadratische Kurve zwischen den beiden Kanten; Kontrollpunkt doppelt so tief. */
  const hollowPath = $derived(
    `M ${LEFT} ${BOTTOM} Q 110 ${BOTTOM - depthTween.current * 2} ${RIGHT} ${BOTTOM}`,
  );
  const bladePath = $derived(
    `M ${LEFT} ${TOP} L ${RIGHT} ${TOP} L ${RIGHT} ${BOTTOM} Q 110 ${BOTTOM - depthTween.current * 2} ${LEFT} ${BOTTOM} Z`,
  );
</script>

<figure class="explorer">
  <figcaption class="title">Hohlschliff ausprobieren</figcaption>

  <label class="control">
    <span class="label-row">
      Hohlschliff <output>{grind.label} &middot; {grind.mm} mm</output>
    </span>
    <input type="range" min="0" max={grinds.length - 1} step="1" bind:value={index}
           aria-describedby="grind-verdict" />
    <span class="ticks" aria-hidden="true">
      {#each grinds as g}<span class:active={g.label === grind.label}>{g.label}</span>{/each}
    </span>
  </label>

  <div class="panel">
    <svg viewBox="0 0 220 190" role="img"
         aria-label={`Querschnitt einer Kufe mit Hohlschliff ${grind.label}`}>
      <!-- Eis -->
      <rect x="0" y={BOTTOM} width="220" height="58" fill="var(--c-ice)" />
      <line x1="0" y1={BOTTOM} x2="220" y2={BOTTOM} stroke="var(--c-steel)" stroke-width="1.5" />

      <!-- Kufenstahl im Querschnitt, von vorn gesehen -->
      <path d={bladePath} fill="var(--c-steel)" stroke="var(--c-text)" stroke-width="2"
            stroke-linejoin="round" />

      <!-- die Rille selbst, hervorgehoben -->
      <path d={hollowPath} fill="none" stroke="var(--c-accent)" stroke-width="3" />

      <!-- die beiden Kanten -->
      <circle cx={LEFT} cy={BOTTOM} r="5" fill="var(--c-accent)" />
      <circle cx={RIGHT} cy={BOTTOM} r="5" fill="var(--c-accent)" />
      <text x={LEFT - 6} y={BOTTOM + 21} text-anchor="middle" font-size="11"
            font-weight="700" fill="var(--c-text)">Kante</text>
      <text x={RIGHT + 6} y={BOTTOM + 21} text-anchor="middle" font-size="11"
            font-weight="700" fill="var(--c-text)">Kante</text>

      <!-- Breitenmass der Kufe -->
      <g stroke="var(--c-text-muted)" stroke-width="1">
        <line x1={LEFT} y1={TOP - 10} x2={RIGHT} y2={TOP - 10} />
        <line x1={LEFT} y1={TOP - 14} x2={LEFT} y2={TOP - 6} />
        <line x1={RIGHT} y1={TOP - 14} x2={RIGHT} y2={TOP - 6} />
      </g>
      <text x="110" y={TOP - 15} text-anchor="middle" font-size="10"
            fill="var(--c-text-muted)">ca. {BLADE_MM} mm</text>

      <text x="110" y={BOTTOM + 44} text-anchor="middle" font-size="10"
            fill="var(--c-text-muted)">Rille stark vergrössert</text>
    </svg>

    <div class="readout">
      <p class="depth">
        Rillentiefe <strong>{depthMm.toFixed(3)} mm</strong>
        <span class="hint">in der Zeichnung stark vergrössert</span>
      </p>

      <div class="bars">
        <div class="bar">
          <span class="bar-label">Kantengriff</span>
          <span class="track"><span class="fill grip" style:width={`${grip}%`}></span></span>
        </div>
        <div class="bar">
          <span class="bar-label">Gleiten</span>
          <span class="track"><span class="fill glide" style:width={`${glide}%`}></span></span>
        </div>
      </div>

      <p class="verdict" id="grind-verdict">{grind.verdict}</p>
    </div>
  </div>
</figure>

<style>
  .explorer {
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

  .control { display: block; }
  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--s-2);
    font-weight: 600;
    margin-bottom: var(--s-1);
  }
  output {
    color: var(--c-brand);
    font-variant-numeric: tabular-nums;
  }
  input[type='range'] {
    width: 100%;
    accent-color: var(--c-brand);
  }
  .ticks {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--c-text-muted);
    margin-top: var(--s-1);
  }
  .ticks .active {
    color: var(--c-brand);
    font-weight: 700;
  }

  .panel {
    display: grid;
    gap: var(--s-4);
    align-items: center;
    margin-top: var(--s-5);
  }
  @media (min-width: 34rem) {
    .panel { grid-template-columns: minmax(0, 13rem) 1fr; }
  }

  svg {
    width: 100%;
    max-width: 15rem;
    margin-inline: auto;
    background: var(--c-surface-2);
    border-radius: var(--radius);
  }

  .depth { font-size: var(--t-sm); }
  .depth strong {
    font-size: var(--t-lg);
    color: var(--c-brand);
    font-variant-numeric: tabular-nums;
  }
  .hint {
    display: block;
    color: var(--c-text-muted);
  }

  .bars {
    display: grid;
    gap: var(--s-2);
    margin: var(--s-4) 0;
  }
  .bar {
    display: grid;
    grid-template-columns: 7rem 1fr;
    align-items: center;
    gap: var(--s-3);
    font-size: var(--t-sm);
  }
  .bar-label { color: var(--c-text-muted); }
  .track {
    display: block;
    height: 0.6rem;
    background: var(--c-surface-2);
    border-radius: 999px;
    overflow: hidden;
  }
  .fill {
    display: block;
    height: 100%;
    border-radius: 999px;
    transition: width 280ms cubic-bezier(0.33, 1, 0.68, 1);
  }
  .grip { background: var(--c-accent); }
  .glide { background: var(--c-brand); }

  @media (prefers-reduced-motion: reduce) {
    .fill { transition: none; }
  }

  .verdict {
    font-size: var(--t-sm);
    padding: var(--s-3);
    background: var(--c-brand-soft);
    border-radius: var(--radius);
  }
</style>
