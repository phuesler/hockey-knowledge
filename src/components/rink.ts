/**
 * Geometry for the rink diagrams (Rink.svelte, RinkPlay.svelte, CoverageExplorer.svelte).
 *
 * Every position is given in metres as [x, d]:
 *   x — across the ice, 0 is the middle, negative is the left of the drawing. In our own
 *       zone that is where LD and LW play, because they face up the ice, away from the
 *       goal. In the attacking zone they face the goal, so their left is on the right.
 *   d — distance from the end boards. The goal line is at d = 4, the blue line at d = 22.
 *
 * The drawing shows one zone with the goal at the bottom, so x grows to the right and d
 * grows upwards. Measurements are rounded IIHF values (rink 30 m wide), close enough
 * for a sketch.
 */

export type Pt = readonly [x: number, d: number];

export type Team = 'us' | 'them';

export interface Player {
  team: Team;
  /** Position letters inside the marker (LD, C, …). Opponents and goalies may omit it. */
  label?: string;
  at: Pt;
  /** A faded outline: where this player was before the arrow. */
  ghost?: boolean;
  /** Stable key so the interactive diagram can animate a player from one spot to the next. */
  id?: string;
}

/**
 * skate — a skating path, with an arrowhead.
 * pass  — a pass, dashed, with an arrowhead.
 * lane  — a dotted line without arrowhead: the way to the goal or a passing lane.
 */
export interface Move {
  kind: 'skate' | 'pass' | 'lane';
  /** Start and end, or start, control point (quadratic curve) and end. */
  path: readonly [Pt, Pt] | readonly [Pt, Pt, Pt];
  team?: Team;
  /** Metres to cut off the end, so an arrow stops in front of a player marker. */
  trim?: number;
  /** Step number written next to the middle of the line. */
  step?: number;
}

/**
 * danger — the dangerous area in front of the goal (between the dots).
 * zone   — an area a player is responsible for.
 * gap    — an area nobody covers.
 * shot   — what a shooter sees of the goal.
 * near / far — near and far support.
 */
export type AreaKind = 'danger' | 'zone' | 'gap' | 'shot' | 'near' | 'far';

export interface Area {
  kind: AreaKind;
  poly?: readonly Pt[];
  ellipse?: { at: Pt; rx: number; ry: number };
  /** A short, language-neutral mark such as a number or "?". */
  label?: string;
  labelAt?: Pt;
}

export interface Scene {
  players: Player[];
  /** Where the puck is. */
  puck?: Pt;
  moves?: Move[];
  areas?: Area[];
}

/** Size of the drawing in metres: the full width and the zone plus a strip beyond the blue line. */
export const RINK_WIDTH = 30;
export const RINK_LENGTH = 25;
export const CORNER_RADIUS = 7;
export const GOAL_LINE = 4;
export const BLUE_LINE = 22;
/** Faceoff dots in the zone, and their circles. */
export const DOT_D = 10;
export const DOT_X = 7;
export const CIRCLE_RADIUS = 4.5;
export const POST_X = 0.915;
export const PLAYER_RADIUS = 1.4;

/** The goal's centre on the goal line. */
export const GOAL: Pt = [0, GOAL_LINE];

/**
 * The dangerous area in front of the goal, often called "home plate": from the posts out
 * to the faceoff dots, then straight up to the top of the circles.
 */
export const DANGER_ZONE: readonly Pt[] = [
  [-POST_X, GOAL_LINE],
  [-DOT_X, DOT_D],
  [-DOT_X, DOT_D + CIRCLE_RADIUS],
  [DOT_X, DOT_D + CIRCLE_RADIUS],
  [DOT_X, DOT_D],
  [POST_X, GOAL_LINE],
];

/** Rink metres to SVG user units: the goal at the bottom, 1 unit = 1 m. */
export function svg([x, d]: Pt): [number, number] {
  return [x + RINK_WIDTH / 2, RINK_LENGTH - d];
}

const fmt = (n: number) => Math.round(n * 100) / 100;

export function points(pts: readonly Pt[]): string {
  return pts.map((p) => svg(p).map(fmt).join(',')).join(' ');
}

/** Point on a straight line or quadratic curve at t (0..1), in SVG units. */
function at(path: Move['path'], t: number): [number, number] {
  const [a, b, c] = path.map(svg);
  if (!c) return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const u = 1 - t;
  return [
    u * u * a[0] + 2 * u * t * b[0] + t * t * c[0],
    u * u * a[1] + 2 * u * t * b[1] + t * t * c[1],
  ];
}

/**
 * SVG geometry for a move: the line's path data, the arrowhead polygon (if any) and the
 * spot for its step number. The end is trimmed along the final direction, which is
 * exact for straight lines and close enough for the gentle curves used here.
 */
export function moveGeometry(move: Move) {
  const pts = move.path.map(svg);
  const end = pts[pts.length - 1];
  const before = pts[pts.length - 2];
  const len = Math.hypot(end[0] - before[0], end[1] - before[1]) || 1;
  const ux = (end[0] - before[0]) / len;
  const uy = (end[1] - before[1]) / len;
  const trim = move.trim ?? 0;
  const tip: [number, number] = [end[0] - ux * trim, end[1] - uy * trim];

  const head = move.kind === 'lane' ? 0 : 0.9;
  // The line stops at the arrowhead's base so the dashes don't poke through its tip.
  const lineEnd: [number, number] = [tip[0] - ux * head * 0.8, tip[1] - uy * head * 0.8];

  const [s, c] = pts;
  const d =
    pts.length === 3
      ? `M${fmt(s[0])} ${fmt(s[1])} Q${fmt(c[0])} ${fmt(c[1])} ${fmt(lineEnd[0])} ${fmt(lineEnd[1])}`
      : `M${fmt(s[0])} ${fmt(s[1])} L${fmt(lineEnd[0])} ${fmt(lineEnd[1])}`;

  let arrow: string | null = null;
  if (head) {
    const bx = tip[0] - ux * head * 1.4;
    const by = tip[1] - uy * head * 1.4;
    const px = -uy * head * 0.75;
    const py = ux * head * 0.75;
    arrow = [tip, [bx + px, by + py], [bx - px, by - py]]
      .map((p) => p.map(fmt).join(','))
      .join(' ');
  }

  const [mx, my] = at(move.path, 0.5);
  // The step number sits just beside the line's middle.
  const stepAt: [number, number] = [mx + -uy * 1.3, my + ux * 1.3];

  return { d, arrow, stepAt };
}
