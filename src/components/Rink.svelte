<script lang="ts">
  /**
   * One zone of the rink as an SVG, with players, arrows and shaded areas on top.
   * Renders on the server without JavaScript (RinkPlay uses it that way); the
   * CoverageExplorer island reuses it and lets the players slide to new spots.
   *
   * All positions are rink metres, see rink.ts. Nothing here is language-specific:
   * labels are position letters and numbers, the words live in the figure around it.
   */
  import {
    BLUE_LINE,
    CIRCLE_RADIUS,
    CORNER_RADIUS,
    DANGER_ZONE,
    DOT_D,
    DOT_X,
    GOAL_LINE,
    PLAYER_RADIUS,
    POST_X,
    RINK_LENGTH,
    RINK_WIDTH,
    moveGeometry,
    points,
    svg,
    type Area,
    type Scene,
  } from './rink';

  let { scene, label }: { scene: Scene; label: string } = $props();

  const W = RINK_WIDTH;
  const L = RINK_LENGTH;
  const R = CORNER_RADIUS;

  /* The end boards with rounded corners; the far end is open, the zone continues. */
  const boards = `M0 0 V${L - R} A${R} ${R} 0 0 0 ${R} ${L} H${W - R} A${R} ${R} 0 0 0 ${W} ${L - R} V0`;
  const ice = `${boards} Z`;

  /* Where the goal line meets the rounded corners. */
  const goalY = L - GOAL_LINE;
  const goalLineInset = R - Math.sqrt(R * R - (GOAL_LINE - R) ** 2);

  const [goalX] = svg([-POST_X, GOAL_LINE]);
  const dots = [-DOT_X, DOT_X].map((x) => svg([x, DOT_D]));
  const neutralDots = [-DOT_X, DOT_X].map((x) => svg([x, BLUE_LINE + 1.5]));
  const [, blueY] = svg([0, BLUE_LINE]);

  function areaLabelAt(area: Area): [number, number] | null {
    if (!area.label) return null;
    if (area.labelAt) return svg(area.labelAt);
    if (area.ellipse) return svg(area.ellipse.at);
    return null;
  }

  const moves = $derived((scene.moves ?? []).map((m) => ({ move: m, ...moveGeometry(m) })));
</script>

<svg viewBox="0 0 {W} {L}" role="img" aria-label={label}>
  <path d={ice} class="ice" />

  <!-- The dangerous area and other shaded areas sit under the rink lines. -->
  {#each scene.areas ?? [] as area}
    {#if area.poly}
      <polygon points={points(area.poly)} class="area {area.kind}" />
    {:else if area.ellipse}
      {@const [cx, cy] = svg(area.ellipse.at)}
      <ellipse {cx} {cy} rx={area.ellipse.rx} ry={area.ellipse.ry} class="area {area.kind}" />
    {/if}
  {/each}

  <rect x="0" y={blueY - 0.15} width={W} height="0.3" class="blue-line" />
  <line x1={goalLineInset} y1={goalY} x2={W - goalLineInset} y2={goalY} class="red-line" />
  {#each dots as [cx, cy]}
    <circle {cx} {cy} r={CIRCLE_RADIUS} class="red-line circle" />
    <circle {cx} {cy} r="0.3" class="dot" />
  {/each}
  {#each neutralDots as [cx, cy]}
    <circle {cx} {cy} r="0.3" class="dot" />
  {/each}
  <path d="M{W / 2 - 1.8} {goalY} A1.8 1.8 0 0 1 {W / 2 + 1.8} {goalY} Z" class="crease" />
  <rect x={goalX} y={goalY} width={POST_X * 2} height="1.1" class="net" />
  <path d={boards} class="boards" />

  {#each scene.areas ?? [] as area}
    {@const at = areaLabelAt(area)}
    {#if at}
      <text x={at[0]} y={at[1]} class="area-label {area.kind}">{area.label}</text>
    {/if}
  {/each}

  {#each moves as { move, d, arrow, stepAt }}
    <g class="move {move.kind} {move.team ?? 'us'}">
      <path {d} />
      {#if arrow}<polygon points={arrow} />{/if}
      {#if move.step}
        <circle cx={stepAt[0]} cy={stepAt[1]} r="0.85" class="step" />
        <text x={stepAt[0]} y={stepAt[1]} class="step-label">{move.step}</text>
      {/if}
    </g>
  {/each}

  {#each scene.players as p, i (p.id ?? `p${i}`)}
    {@const [x, y] = svg(p.at)}
    <g class="player {p.team}" class:ghost={p.ghost} style="transform: translate({x}px, {y}px)">
      <circle r={PLAYER_RADIUS} />
      {#if p.label}<text>{p.label}</text>{/if}
    </g>
  {/each}

  {#if scene.puck}
    {@const [x, y] = svg(scene.puck)}
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
    overflow: visible;
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
  .area.shot {
    fill: var(--c-accent);
    stroke: none;
    opacity: 0.25;
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
  .area-label.near {
    fill: var(--c-good);
  }

  .move path {
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

  /* Only the CoverageExplorer ever moves a player; the static diagrams never change. */
  @media (prefers-reduced-motion: no-preference) {
    .player {
      transition: transform 450ms ease-in-out;
    }
  }
</style>
