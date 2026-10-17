<script lang="ts">
  /**
   * One official showing one hand signal, as a small SVG figure. The poses live in
   * signals.ts; this component only draws the body and moves the arms.
   *
   * Server-rendered in the finished pose, so the article shows every signal without
   * JavaScript. `play()` (called by Signals.svelte when the card scrolls into view, or from
   * its replay button) drops the arms, then tweens them into the signal; a repeated gesture
   * (cross-check, hooking, wash-out …) plays its loop frames a few times and settles back on
   * the final pose. With reduced motion `motionDuration()` is 0 and `play()` does nothing,
   * so the figure never leaves its final pose.
   */
  import { Tween } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import { motionDuration } from '../lib/motion';
  import { armband, finalPose, framePose, nearestAngle, restPose, signals, type Arm, type Hand, type Pose, type SignalId } from './signals';

  let { id }: { id: SignalId } = $props();

  const s = signals[id];
  const final = finalPose(s);
  /* Unique per figure: a marker id shared by several inline SVGs would colour arrowheads
     from whichever figure came first. */
  const uid = $props.id();

  const pose = new Tween<Pose>(final, { easing: cubicInOut });
  let playing = $state(false);

  export async function play(): Promise<void> {
    const ms = motionDuration(700);
    if (ms === 0 || playing) return;
    playing = true;
    /* Hand angles aim for the nearest equivalent angle, so a hand never spins the long way. */
    const aim = (p: Pose): Pose => ({
      ...p,
      la: nearestAngle(pose.current.la, p.la),
      ra: nearestAngle(pose.current.ra, p.ra),
    });
    await pose.set(restPose(s), { duration: 0 });
    await pose.set(aim(final), { duration: ms });
    if (s.loop) {
      for (let round = 0; round < s.loop.times; round++) {
        for (const frame of s.loop.frames) {
          await pose.set(aim(framePose(s, frame, pose.current)), { duration: motionDuration(frame.ms) });
        }
      }
    }
    await pose.set(aim(final), { duration: motionDuration(300) });
    playing = false;
  }

  const p = $derived(pose.current);
  /* 0 upright, 1 bent forward: moves the jersey top, the head and the knees. */
  const c = $derived(p.crouch);

  const STRIPES = [-13, -5, 3, 11];

  const r1 = (n: number) => Math.round(n * 10) / 10;
  /** Six numbers as "x,y x,y x,y". */
  const poly = (a: number[]) => `${r1(a[0])},${r1(a[1])} ${r1(a[2])},${r1(a[3])} ${r1(a[4])},${r1(a[5])}`;
  /** -1 for a thumb drawn on the -y side, 1 for the +y side, 0 for none. */
  const thumb = (hand: Hand) => (hand.endsWith('+') ? -1 : hand.endsWith('-') ? 1 : 0);
  const shape = (hand: Hand) => hand.replace(/[+-]$/, '') as 'flat' | 'fist' | 'spread' | 'point';
</script>

<svg viewBox="0 0 160 180" aria-hidden="true" class="figure">
  <defs>
    <marker id={uid} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="arrowhead" />
    </marker>
  </defs>
  <g transform="translate(80 72)">
    {#if s.left.back}{@render arm(p.l, p.la, p.ls, s.left)}{/if}
    {#if s.right.back}{@render arm(p.r, p.ra, p.rs, s.right)}{/if}

    <!-- legs and skates -->
    <polyline points="-10,57 {r1(-10 - 3 * c)},74 -10,89" class="leg" />
    <rect x="-19" y="88" width="16" height="7" rx="2" class="boot" />
    <line x1="-21" y1="98" x2="-1" y2="98" class="blade" />
    <polyline points="10,57 {r1(10 + 3 * c)},74 10,89" class="leg" />
    <rect x="3" y="88" width="16" height="7" rx="2" class="boot" />
    <line x1="1" y1="98" x2="21" y2="98" class="blade" />

    <!-- pants and the striped jersey -->
    <rect x="-18" y="46" width="36" height="15" class="ink" />
    <rect x="-18" y={r1(20 * c)} width="36" height={r1(47 - 20 * c)} rx="6" class="jersey" />
    {#each STRIPES as x}
      <rect {x} y={r1(0.5 + 20 * c)} width="4" height={r1(46 - 20 * c)} class="ink" />
    {/each}

    <!-- head: face, hair, eyes, mouth -->
    <circle cx="0" cy={r1(-15 + 20 * c)} r="13" class="face" />
    <path d="M-13.5,{r1(-17 + 20 * c)} A13.5,13.5 0 0 1 13.5,{r1(-17 + 20 * c)} Z" class="ink" />
    <circle cx="-4.5" cy={r1(-11 + 20 * c)} r="1.6" class="ink" />
    <circle cx="4.5" cy={r1(-11 + 20 * c)} r="1.6" class="ink" />
    <path d="M-4,{r1(-6 + 20 * c)} Q0,{r1(-3 + 20 * c)} 4,{r1(-6 + 20 * c)}" class="mouth" />

    {#if s.stick}
      <line x1={r1(p.stick[0])} y1={r1(p.stick[1])} x2={r1(p.stick[2])} y2={r1(p.stick[3])} class="stick" opacity={p.show} />
    {/if}

    {#if !s.left.back}{@render arm(p.l, p.la, p.ls, s.left)}{/if}
    {#if !s.right.back}{@render arm(p.r, p.ra, p.rs, s.right)}{/if}

    {#if s.arrows}
      <g class="arrows" opacity={p.show}>
        {#each s.arrows as d}
          <path {d} class="arrow" marker-end="url(#{uid})" />
        {/each}
      </g>
    {/if}
  </g>
</svg>

{#snippet arm(a: number[], angle: number, scale: number, def: Arm)}
  <polyline points={poly(a)} class="arm-outline" />
  <polyline points={poly(a)} class="arm" />
  {#if s.who === 'referee'}
    {@const b = armband(a)}
    <line x1={r1(b.x1)} y1={r1(b.y1)} x2={r1(b.x2)} y2={r1(b.y2)} class="band" />
  {/if}
  <g transform="translate({r1(a[4])} {r1(a[5])}) rotate({r1(angle)}) scale({r1(scale)})">
    {@render hand(def.hand)}
  </g>
{/snippet}

{#snippet hand(h: Hand)}
  {@const t = thumb(h)}
  {#if shape(h) === 'flat'}
    <line x1="2" y1="0" x2="13.5" y2="0" class="h-outline" stroke-width="8.2" />
    {#if t}<line x1="3.5" y1={2.8 * t} x2="8" y2={5.6 * t} class="h-outline" stroke-width="4" />{/if}
    <line x1="2" y1="0" x2="13.5" y2="0" class="h-skin" stroke-width="6.6" />
    {#if t}<line x1="3.5" y1={2.8 * t} x2="8" y2={5.6 * t} class="h-skin" stroke-width="2.4" />{/if}
    <line x1="8" y1="-1.1" x2="13" y2="-1.1" class="h-line" />
    <line x1="8" y1="1.1" x2="13" y2="1.1" class="h-line" />
  {:else if shape(h) === 'fist'}
    <circle cx="4.2" cy="0" r="6.2" class="ink" />
    <circle cx="4.2" cy="0" r="5.4" class="skin" />
    <line x1="6.6" y1="-2" x2="9" y2="-2" class="h-line" />
    <line x1="6.6" y1="0.6" x2="9" y2="0.6" class="h-line" />
    <line x1="6.6" y1="3" x2="8.6" y2="3" class="h-line" />
  {:else if shape(h) === 'spread'}
    <ellipse cx="5" cy="0" rx="6" ry="5.6" class="ink" />
    <line x1="8.3" y1="-3.4" x2="14.1" y2="-6.4" class="h-outline" stroke-width="4" />
    <line x1="8.3" y1="-1.1" x2="14.7" y2="-2.2" class="h-outline" stroke-width="4" />
    <line x1="8.3" y1="1.1" x2="14.7" y2="2.2" class="h-outline" stroke-width="4" />
    <line x1="8.3" y1="3.4" x2="14.1" y2="6.4" class="h-outline" stroke-width="4" />
    {#if t}<line x1="4" y1={3.8 * t} x2="7.6" y2={8.6 * t} class="h-outline" stroke-width="4.2" />{/if}
    <ellipse cx="5" cy="0" rx="5.2" ry="4.8" class="skin" />
    <line x1="8.3" y1="-3.4" x2="14.1" y2="-6.4" class="h-skin" stroke-width="2.4" />
    <line x1="8.3" y1="-1.1" x2="14.7" y2="-2.2" class="h-skin" stroke-width="2.4" />
    <line x1="8.3" y1="1.1" x2="14.7" y2="2.2" class="h-skin" stroke-width="2.4" />
    <line x1="8.3" y1="3.4" x2="14.1" y2="6.4" class="h-skin" stroke-width="2.4" />
    {#if t}<line x1="4" y1={3.8 * t} x2="7.6" y2={8.6 * t} class="h-skin" stroke-width="2.6" />{/if}
  {:else}
    <circle cx="4" cy="0" r="5.8" class="ink" />
    <line x1="7" y1="-1.6" x2="15" y2="-1.6" class="h-outline" stroke-width="4" />
    <circle cx="4" cy="0" r="5" class="skin" />
    <line x1="7" y1="-1.6" x2="15" y2="-1.6" class="h-skin" stroke-width="2.4" />
  {/if}
{/snippet}

<style>
  .figure {
    display: block;
    width: 100%;
    height: auto;
  }

  /* Fills */
  .ink {
    fill: var(--c-text);
  }
  .skin {
    fill: var(--c-skin);
  }
  .jersey {
    fill: var(--c-surface);
    stroke: var(--c-text);
    stroke-width: 1;
  }
  .face {
    fill: var(--c-skin);
    stroke: var(--c-text);
    stroke-width: 0.8;
  }
  .boot {
    fill: var(--c-text-muted);
  }
  .arrowhead {
    fill: var(--c-accent);
  }

  /* Strokes */
  .leg,
  .blade,
  .mouth,
  .arm-outline,
  .arm,
  .band,
  .h-outline,
  .h-skin,
  .h-line,
  .stick,
  .arrow {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .leg {
    stroke: var(--c-text);
    stroke-width: 10;
    stroke-linecap: butt;
  }
  .blade {
    stroke: var(--c-steel);
    stroke-width: 2;
  }
  .mouth {
    stroke: var(--c-text);
    stroke-width: 1.2;
  }
  .arm-outline {
    stroke: var(--c-text);
    stroke-width: 11;
  }
  .arm {
    stroke: var(--c-surface);
    stroke-width: 8;
  }
  .band {
    stroke: var(--c-armband);
    stroke-width: 9;
    stroke-linecap: butt;
  }
  .h-outline {
    stroke: var(--c-text);
  }
  .h-skin {
    stroke: var(--c-skin);
  }
  .h-line {
    stroke: var(--c-skin-line);
    stroke-width: 0.7;
  }
  .stick {
    stroke: var(--c-wood);
    stroke-width: 3;
    stroke-dasharray: 4 3;
  }
  .arrow {
    stroke: var(--c-accent);
    stroke-width: 2;
  }
</style>
