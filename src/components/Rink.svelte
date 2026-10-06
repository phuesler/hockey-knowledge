<script lang="ts">
  /**
   * The rink as an SVG, with players, arrows and shaded areas on top. `view` picks how
   * much is shown: one zone (default), half the rink up to the centre line, or the full
   * rink. `flip` turns the drawing by 180°, so the far end is at the top: the attacking
   * zone is drawn that way, so we always attack upwards and left stays left. Renders on the server without JavaScript (RinkPlay uses it that way); the
   * CoverageExplorer and RinkSequence islands reuse it and let the players slide to new spots.
   *
   * All positions are rink metres, see rink.ts. Nothing here is language-specific:
   * labels are position letters and numbers, the words live in the figure around it.
   */
  import {
    BLUE_LINE,
    CENTRE_LINE,
    CIRCLE_RADIUS,
    CORNER_RADIUS,
    DOT_D,
    DOT_X,
    FULL_LENGTH,
    GOAL_LINE,
    PLAYER_RADIUS,
    POST_X,
    RINK_WIDTH,
    VIEW_FROM,
    VIEW_LENGTH,
    moveGeometry,
    points,
    svg,
    type Area,
    type Pt,
    type Scene,
    type View,
  } from './rink';

  let {
    scene,
    label,
    view = 'zone',
    flip = false,
  }: { scene: Scene; label: string; view?: View; flip?: boolean } = $props();

  const W = RINK_WIDTH;
  const R = CORNER_RADIUS;
  const L = $derived(VIEW_LENGTH[view]);
  const from = $derived(VIEW_FROM[view]);
  /* Height of the drawing; the bottom edge is at d = from. */
  const H = $derived(L - from);
  const full = $derived(view === 'full');
  /* A view that starts above the end boards shows only the side boards. */
  const middle = $derived(from > 0);
  const shown = (d: number) => d > from && d < L;
  const at = (p: Pt) => svg(p, L);
  /* Where a point ends up after the 180° turn. Text and markers are placed with this
     instead of being turned, so they stay upright. */
  const turned = ([x, y]: [number, number]): [number, number] => (flip ? [W - x, H - y] : [x, y]);
  const place = (p: Pt) => turned(at(p));

  /* The boards with rounded corners. Unless the full rink is shown, the top is open:
     the ice continues beyond the drawing. */
  const boards = $derived(
    middle
      ? `M0 0 V${H} M${W} 0 V${H}`
      : full
      ? `M0 ${R} V${L - R} A${R} ${R} 0 0 0 ${R} ${L} H${W - R} A${R} ${R} 0 0 0 ${W} ${L - R} V${R} A${R} ${R} 0 0 0 ${W - R} 0 H${R} A${R} ${R} 0 0 0 0 ${R} Z`
      : `M0 0 V${L - R} A${R} ${R} 0 0 0 ${R} ${L} H${W - R} A${R} ${R} 0 0 0 ${W} ${L - R} V0`,
  );
  const ice = $derived(middle ? `M0 0 H${W} V${H} H0 Z` : full ? boards : `${boards} Z`);

  /* Where the goal line meets the rounded corners. */
  const goalLineInset = R - Math.sqrt(R * R - (GOAL_LINE - R) ** 2);

  /* Each end of the rink: the bottom one always, the top one only on the full rink.
     `flip` mirrors the crease and net so they open towards the middle. */
  const ends = $derived(
    (full ? [GOAL_LINE, FULL_LENGTH - GOAL_LINE] : [GOAL_LINE]).filter(shown).map((d) => ({
      y: at([0, d])[1],
      flip: d > CENTRE_LINE,
    })),
  );
  /* The faceoff circles in both zones, wherever part of a circle is in view. */
  const zoneDots = $derived(
    [DOT_D, FULL_LENGTH - DOT_D]
      .filter((d) => d + CIRCLE_RADIUS > from && d - CIRCLE_RADIUS < L)
      .flatMap((d) => [-DOT_X, DOT_X].map((x) => at([x, d]))),
  );
  const blueLines = $derived(
    [BLUE_LINE, FULL_LENGTH - BLUE_LINE].filter(shown).map((d) => at([0, d])[1]),
  );
  const neutralDots = $derived(
    [BLUE_LINE + 1.5, FULL_LENGTH - BLUE_LINE - 1.5]
      .filter(shown)
      .flatMap((d) => [-DOT_X, DOT_X].map((x) => at([x, d]))),
  );
  const centreY = $derived(shown(CENTRE_LINE) ? at([0, CENTRE_LINE])[1] : null);

  function areaLabelAt(area: Area): [number, number] | null {
    if (!area.label) return null;
    if (area.labelAt) return at(area.labelAt);
    if (area.ellipse) return at(area.ellipse.at);
    return null;
  }

  const moves = $derived((scene.moves ?? []).map((m) => ({ move: m, ...moveGeometry(m, L) })));
</script>

<svg viewBox="0 0 {W} {H}" role="img" aria-label={label}>
  <g transform={flip ? `rotate(180 ${W / 2} ${H / 2})` : undefined}>
  <path d={ice} class="ice" />

  <!-- The dangerous area and other shaded areas sit under the rink lines. -->
  {#each scene.areas ?? [] as area}
    {#if area.poly}
      <polygon points={points(area.poly, L)} class="area {area.kind}" />
    {:else if area.ellipse}
      {@const [cx, cy] = at(area.ellipse.at)}
      <ellipse {cx} {cy} rx={area.ellipse.rx} ry={area.ellipse.ry} class="area {area.kind}" />
    {/if}
  {/each}

  {#each blueLines as y}
    <rect x="0" {y} width={W} height="0.3" transform="translate(0 -0.15)" class="blue-line" />
  {/each}
  {#if centreY !== null}
    <rect x="0" y={centreY - 0.15} width={W} height="0.3" class="centre-line" />
    <circle cx={W / 2} cy={centreY} r={CIRCLE_RADIUS} class="red-line" />
    <circle cx={W / 2} cy={centreY} r="0.3" class="dot" />
  {/if}
  {#each neutralDots as [cx, cy]}
    <circle {cx} {cy} r="0.3" class="dot" />
  {/each}
  {#each zoneDots as [cx, cy]}
    <circle {cx} {cy} r={CIRCLE_RADIUS} class="red-line" />
    <circle {cx} {cy} r="0.3" class="dot" />
  {/each}
  {#each ends as end}
    <line x1={goalLineInset} y1={end.y} x2={W - goalLineInset} y2={end.y} class="red-line" />
    <g transform="translate({W / 2} {end.y}) scale(1 {end.flip ? -1 : 1})">
      <path d="M-1.8 0 A1.8 1.8 0 0 1 1.8 0 Z" class="crease" />
      <rect x={-POST_X} y="0" width={POST_X * 2} height="1.1" class="net" />
    </g>
  {/each}
  <path d={boards} class="boards" />

  {#each moves as { move, d, arrow }}
    <g class="move {move.kind} {move.team ?? 'us'}">
      <path {d} />
      <!-- A shot is two parallel lines: a thin line in the ice colour splits a wide one. -->
      {#if move.kind === 'shot'}<path {d} class="shot-gap" />{/if}
      {#if arrow}<polygon points={arrow} />{/if}
    </g>
  {/each}
  </g>

  {#each scene.areas ?? [] as area}
    {@const pos = areaLabelAt(area)}
    {#if pos}
      {@const [x, y] = turned(pos)}
      <text {x} {y} class="area-label {area.kind}">{area.label}</text>
    {/if}
  {/each}

  {#each moves as { move, stepAt }}
    {#if move.step}
      {@const [x, y] = turned(stepAt)}
      <g class="move {move.kind} {move.team ?? 'us'}">
        <circle cx={x} cy={y} r="0.85" class="step" />
        <text {x} {y} class="step-label">{move.step}</text>
      </g>
    {/if}
  {/each}

  {#each scene.players as p, i (p.id ?? `p${i}`)}
    {@const [x, y] = place(p.at)}
    <g class="player {p.team}" class:ghost={p.ghost} style="transform: translate({x}px, {y}px)">
      <circle r={PLAYER_RADIUS} />
      {#if p.label}<text>{p.label}</text>{/if}
    </g>
  {/each}

  {#if scene.puck}
    {@const [x, y] = place(scene.puck)}
    <g class="player puck" style="transform: translate({x}px, {y}px)">
      <circle r="0.55" />
    </g>
  {/if}
</svg>

<style>
  svg {
    display: block;
    width: 100%;
    height: auto;
    /* The half and neutral views cut through circles; keep them inside the drawing. */
    overflow: hidden;
  }

  .ice {
    fill: var(--c-surface);
  }
  .boards {
    fill: none;
    stroke: var(--c-steel);
    stroke-width: 0.35;
  }
  .red-line {
    fill: none;
    stroke: var(--c-brand);
    stroke-width: 0.12;
    opacity: 0.55;
  }
  .dot {
    fill: var(--c-brand);
    opacity: 0.55;
  }
  .blue-line {
    fill: var(--c-accent);
    opacity: 0.7;
  }
  .centre-line {
    fill: var(--c-brand);
    opacity: 0.7;
  }
  .crease {
    fill: var(--c-ice);
    stroke: var(--c-brand);
    stroke-width: 0.1;
  }
  .net {
    fill: var(--c-surface-2);
    stroke: var(--c-text-muted);
    stroke-width: 0.15;
  }

  .area {
    stroke-width: 0.15;
  }
  .area.danger {
    fill: var(--c-warn-soft);
    stroke: var(--c-warn);
    stroke-dasharray: 0.5 0.35;
  }
  .area.zone,
  .area.far {
    fill: var(--c-accent-soft);
    stroke: var(--c-accent);
  }
  .area.near {
    fill: var(--c-good-soft);
    stroke: var(--c-good);
  }
  .area.gap {
    fill: var(--c-brand-soft);
    stroke: var(--c-brand);
    stroke-dasharray: 0.5 0.35;
    stroke-width: 0.2;
  }
  /* Coverage areas: flat colour, thin dashed borders between them. */
  .area[class*='cover-'] {
    stroke: var(--c-steel);
    stroke-width: 0.12;
    stroke-dasharray: 0.5 0.35;
  }
  .area.cover-ld {
    fill: var(--c-zone-ld);
  }
  .area.cover-rd {
    fill: var(--c-zone-rd);
  }
  .area.cover-c {
    fill: var(--c-zone-c);
  }
  .area.cover-lw {
    fill: var(--c-zone-lw);
  }
  .area.cover-rw {
    fill: var(--c-zone-rw);
  }
  .area.cover-shared {
    fill: var(--c-zone-c);
    opacity: 0.45;
  }
  .area.bench {
    fill: var(--c-good-soft);
    stroke: var(--c-good);
    stroke-width: 0.2;
  }
  .area.shot {
    fill: var(--c-accent);
    stroke: none;
    opacity: 0.25;
  }
  .area.open {
    fill: var(--c-good-soft);
    stroke: var(--c-good);
    stroke-dasharray: 0.5 0.35;
    stroke-width: 0.2;
  }
  .area.shadow {
    fill: var(--c-steel);
    stroke: none;
    opacity: 0.35;
  }
  .area.view {
    fill: var(--c-accent);
    stroke: var(--c-accent);
    fill-opacity: 0.18;
    stroke-width: 0.12;
  }

  text {
    font-family: var(--font-sans);
    font-weight: 700;
    text-anchor: middle;
    dominant-baseline: central;
  }
  .area-label {
    font-size: 1.6px;
    fill: var(--c-accent);
  }
  .area-label.gap,
  .area-label.danger {
    fill: var(--c-brand);
  }
  .area-label.near,
  .area-label.open {
    fill: var(--c-good);
  }

  .move path {
    stroke-linejoin: round;
    fill: none;
    stroke-width: 0.28;
    stroke-linecap: round;
  }
  .move.us path {
    stroke: var(--c-brand);
  }
  .move.us polygon {
    fill: var(--c-brand);
  }
  .move.them path {
    stroke: var(--c-text-muted);
  }
  .move.them polygon {
    fill: var(--c-text-muted);
  }
  .move.pass path {
    stroke-dasharray: 0.7 0.45;
  }
  .move.shot path {
    stroke: var(--c-text);
    stroke-width: 0.6;
    stroke-linecap: butt;
  }
  .move.shot path.shot-gap {
    stroke: var(--c-surface);
    stroke-width: 0.22;
  }
  .move.shot polygon {
    fill: var(--c-text);
  }
  .move.stick path {
    stroke: var(--c-text-muted);
    stroke-width: 0.45;
  }
  .move.sight path {
    stroke: var(--c-accent);
    stroke-width: 0.2;
    stroke-dasharray: 0.1 0.4;
  }
  .move.lane path {
    stroke: var(--c-text-muted);
    stroke-width: 0.18;
    stroke-dasharray: 0.1 0.45;
  }
  .step {
    fill: var(--c-surface);
    stroke: var(--c-brand);
    stroke-width: 0.15;
  }
  .step-label {
    font-size: 1.1px;
    fill: var(--c-brand);
  }

  .player circle {
    stroke: var(--c-surface);
    stroke-width: 0.2;
  }
  .player text {
    font-size: 1.15px;
  }
  .player.us circle {
    fill: var(--c-signal);
  }
  .player.us text {
    fill: var(--c-header-text);
  }
  .player.them circle {
    fill: var(--c-text);
  }
  .player.them text {
    fill: var(--c-surface);
  }
  .player.ghost circle {
    fill: var(--c-surface);
    stroke: var(--c-signal);
    stroke-width: 0.15;
    stroke-dasharray: 0.4 0.3;
  }
  .player.ghost text {
    fill: var(--c-brand);
  }
  .puck circle {
    fill: var(--c-text);
    stroke: var(--c-surface);
    stroke-width: 0.15;
  }

  /* Only CoverageExplorer and RinkSequence move players; the static diagrams never change. */
  @media (prefers-reduced-motion: no-preference) {
    .player {
      transition: transform 450ms ease-in-out;
    }
  }
</style>
