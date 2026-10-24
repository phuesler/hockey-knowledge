/**
 * The officials' hand signals, drawn by SignalFigure.svelte and listed by Signals.svelte.
 * One figure per signal: a referee (orange armbands) or a linesperson in a striped jersey,
 * built from the same body with two arms and a hand shape each. The poses follow the IIHF
 * rule book 2026/27, Appendix I (Game Official Signals); the delayed penalty is Rule 15.
 *
 * Geometry is shared; the words live in `de` and `en`, typed against each other, so a
 * missing translation fails `astro check`.
 *
 * Coordinates: the figure's shoulders sit at (±15, 4), the ice at y = 98, see the body in
 * SignalFigure.svelte. An arm is "shoulder elbow wrist"; the hand group is translated to
 * the wrist and rotated by `angle` (0 = fingers pointing right, 90 = pointing down).
 */
import type { Locale } from '../lib/i18n';

export type Who = 'referee' | 'linesperson';
/** The sections of the article, in order. */
export type Group = 'arm' | 'play' | 'body' | 'stick' | 'team';
/**
 * Hand shapes. `flat+` / `flat-` and `spread+` / `spread-` draw the thumb on the -y / +y
 * side of the hand (in the hand's own coordinates, before rotation); without a sign the
 * thumb is hidden behind the hand.
 */
export type Hand = 'flat' | 'flat+' | 'flat-' | 'fist' | 'spread' | 'spread+' | 'spread-' | 'point';

export interface Arm {
  /** "shoulder elbow wrist", e.g. '-15,4 -19,24 -21,40'. */
  pts: string;
  hand: Hand;
  /** rotate() of the hand group, in degrees. */
  angle: number;
  /** Hand scale: bigger means closer to the viewer (fists pushed forward). */
  scale?: number;
  /** Drawn behind the torso. */
  back?: true;
}

/** One step of a repeated gesture: only what changes, and how long the move takes. */
export interface Frame {
  left?: Partial<Pick<Arm, 'pts' | 'angle' | 'scale'>>;
  right?: Partial<Pick<Arm, 'pts' | 'angle' | 'scale'>>;
  stick?: [number, number, number, number];
  /** 0 hides the arrows and the stick, 1 shows them. */
  show?: number;
  ms: number;
}

export interface Signal {
  who: Who;
  group: Group;
  /** IIHF rule number(s) for the caption; '' when the signal only appears in the appendix. */
  rule: string;
  /** Bent forward with the head low: the shoulders sit at y = 24 instead of 4. */
  crouch?: true;
  left: Arm;
  right: Arm;
  /** Motion arrows, as SVG path data in figure coordinates. */
  arrows?: string[];
  /** A dashed stick in the hands: x1, y1, x2, y2. */
  stick?: [number, number, number, number];
  /** A repeated gesture: the frames play in order, `times` rounds, then the final pose. */
  loop?: { frames: Frame[]; times: number };
}

/** Arms hanging down: where every animation starts. */
const REST_LEFT = '-15,4 -19,24 -21,40';
const REST_RIGHT = '15,4 19,24 21,40';
const REST_LEFT_ANGLE = 97.1;
const REST_RIGHT_ANGLE = 82.9;

const washout: Pick<Signal, 'left' | 'right' | 'arrows' | 'loop'> = {
  left: { pts: '-15,4 -36,3 -55,3', hand: 'flat-', angle: 180 },
  right: { pts: '15,4 36,3 55,3', hand: 'flat+', angle: 0 },
  arrows: ['M-18,-10 Q-36,-18 -54,-11', 'M18,-10 Q36,-18 54,-11'],
  loop: {
    times: 3,
    frames: [
      { left: { pts: '-15,4 -36,-5 -55,-11', angle: 188 }, right: { pts: '15,4 36,-5 55,-11', angle: -8 }, ms: 320 },
      { left: { pts: '-15,4 -36,3 -55,3', angle: 180 }, right: { pts: '15,4 36,3 55,3', angle: 0 }, ms: 320 },
    ],
  },
};

const geometry = {
  /* ---- Arm up: three meanings ---- */
  'delayed-offside': {
    who: 'linesperson', group: 'arm', rule: '83',
    left: { pts: '-15,4 -18,-20 -20,-42', hand: 'flat-', angle: -95.2 },
    right: { pts: REST_RIGHT, hand: 'flat-', angle: REST_RIGHT_ANGLE },
  },
  'possible-icing': {
    who: 'linesperson', group: 'arm', rule: '81',
    left: { pts: '-15,4 -18,-20 -20,-42', hand: 'spread-', angle: -95.2 },
    right: { pts: REST_RIGHT, hand: 'flat-', angle: REST_RIGHT_ANGLE },
  },
  'delayed-penalty': {
    who: 'referee', group: 'arm', rule: '15',
    left: { pts: REST_LEFT, hand: 'flat+', angle: REST_LEFT_ANGLE },
    right: { pts: '15,4 18,-20 20,-42', hand: 'spread+', angle: -84.8 },
  },

  /* ---- Signals during play ---- */
  offside: {
    who: 'linesperson', group: 'play', rule: '83',
    left: { pts: REST_LEFT, hand: 'flat+', angle: REST_LEFT_ANGLE },
    right: { pts: '15,4 36,4 56,4', hand: 'point', angle: 0 },
  },
  icing: {
    who: 'linesperson', group: 'play', rule: '81',
    left: { pts: '-15,4 -18,26 6,12', hand: 'flat+', angle: -30.3 },
    right: { pts: '15,4 18,26 -6,12', hand: 'flat-', angle: -149.7 },
  },
  'washout-linesperson': { who: 'linesperson', group: 'play', rule: '', ...washout },
  'washout-referee': { who: 'referee', group: 'play', rule: '', ...washout },
  goal: {
    who: 'referee', group: 'play', rule: '78',
    left: { pts: REST_LEFT, hand: 'flat+', angle: REST_LEFT_ANGLE },
    right: { pts: '15,4 34,12 52,20', hand: 'point', angle: 24 },
  },
  'penalty-shot': {
    who: 'referee', group: 'play', rule: '24',
    left: { pts: '-15,4 -24,-22 6,-40', hand: 'flat+', angle: -31 },
    right: { pts: '15,4 24,-22 -6,-40', hand: 'flat-', angle: -149 },
  },
  'hand-pass': {
    who: 'referee', group: 'play', rule: '79',
    left: { pts: REST_LEFT, hand: 'flat+', angle: REST_LEFT_ANGLE },
    right: { pts: '15,4 28,18 22,0', hand: 'spread+', angle: -90 },
    arrows: ['M34,-14 L44,-20'],
    loop: {
      times: 2,
      frames: [
        { right: { pts: '15,4 30,14 26,-4', scale: 1.3 }, ms: 300 },
        { right: { pts: '15,4 28,18 22,0', scale: 1 }, ms: 300 },
      ],
    },
  },
  'face-off-violation': {
    who: 'linesperson', group: 'play', rule: '76',
    left: { pts: REST_LEFT, hand: 'flat+', angle: REST_LEFT_ANGLE },
    right: { pts: '15,4 32,22 46,14', hand: 'flat', angle: 0 },
  },

  /* ---- Fouls with the body ---- */
  boarding: {
    who: 'referee', group: 'body', rule: '41',
    left: { pts: '-15,4 -24,22 -3,22', hand: 'flat', angle: -90 },
    right: { pts: '15,4 26,24 9,16', hand: 'fist', angle: 180 },
    arrows: ['M24,2 L12,6'],
    loop: {
      times: 2,
      frames: [
        { right: { pts: '15,4 30,16 20,4' }, ms: 280 },
        { right: { pts: '15,4 26,24 9,16' }, ms: 220 },
      ],
    },
  },
  charging: {
    who: 'referee', group: 'body', rule: '42',
    left: { pts: '-15,4 -26,24 -8,18', hand: 'fist', angle: 0 },
    right: { pts: '15,4 26,22 10,8', hand: 'fist', angle: 180 },
    arrows: ['M-16,30 A15,15 0 0 1 -14,0'],
    loop: {
      times: 2,
      frames: [
        { left: { pts: '-15,4 -24,14 -4,4' }, right: { pts: '15,4 24,28 6,22' }, ms: 260 },
        { left: { pts: '-15,4 -22,22 10,8' }, right: { pts: '15,4 22,18 -8,18' }, ms: 260 },
        { left: { pts: '-15,4 -18,30 6,22' }, right: { pts: '15,4 24,12 -4,4' }, ms: 260 },
        { left: { pts: '-15,4 -26,24 -8,18' }, right: { pts: '15,4 26,22 10,8' }, ms: 260 },
      ],
    },
  },
  'checking-from-behind': {
    who: 'referee', group: 'body', rule: '43',
    left: { pts: '-15,4 -28,14 -25,4', hand: 'spread-', angle: -90 },
    right: { pts: '15,4 28,14 25,4', hand: 'spread+', angle: -90 },
    loop: {
      times: 2,
      frames: [
        { left: { pts: '-15,4 -26,10 -22,2', scale: 1.35 }, right: { pts: '15,4 26,10 22,2', scale: 1.35 }, ms: 340 },
        { left: { pts: '-15,4 -28,14 -25,4', scale: 1 }, right: { pts: '15,4 28,14 25,4', scale: 1 }, ms: 340 },
      ],
    },
  },
  'check-to-the-head': {
    who: 'referee', group: 'body', rule: '48',
    left: { pts: REST_LEFT, hand: 'flat+', angle: REST_LEFT_ANGLE },
    right: { pts: '15,4 30,8 17,-6', hand: 'flat', angle: -95 },
  },
  elbowing: {
    who: 'referee', group: 'body', rule: '45',
    left: { pts: '-15,4 -30,22 -14,6', hand: 'fist', angle: -45 },
    right: { pts: '15,4 10,32 -16,26', hand: 'flat-', angle: -167 },
  },
  kneeing: {
    who: 'referee', group: 'body', rule: '50', crouch: true,
    left: { pts: '-15,24 -20,44 -22,60', hand: 'flat+', angle: REST_LEFT_ANGLE },
    right: { pts: '15,24 22,46 15,63', hand: 'spread-', angle: 112.4 },
  },
  clipping: {
    who: 'referee', group: 'body', rule: '44', crouch: true,
    left: { pts: '-15,24 -20,44 -22,60', hand: 'flat+', angle: REST_LEFT_ANGLE },
    right: { pts: '15,24 25,46 24,61', hand: 'flat', angle: 100, back: true },
  },
  tripping: {
    who: 'referee', group: 'body', rule: '57', crouch: true,
    left: { pts: '-15,24 -20,44 -22,60', hand: 'flat+', angle: REST_LEFT_ANGLE },
    right: { pts: '15,24 22,48 15,70', hand: 'flat-', angle: 107.7 },
  },
  roughing: {
    who: 'referee', group: 'body', rule: '51',
    left: { pts: REST_LEFT, hand: 'flat+', angle: REST_LEFT_ANGLE },
    right: { pts: '15,4 36,4 56,4', hand: 'fist', angle: 0 },
  },
  holding: {
    who: 'referee', group: 'body', rule: '54',
    left: { pts: '-15,4 -22,24 0,16', hand: 'fist', angle: -20 },
    right: { pts: '15,4 28,26 11,22', hand: 'spread+', angle: -166.8 },
  },
  interference: {
    who: 'referee', group: 'body', rule: '56',
    left: { pts: '-15,4 -24,22 10,4', hand: 'fist', angle: -27.9 },
    right: { pts: '15,4 24,22 -10,4', hand: 'fist', angle: -152.1 },
  },
  'illegal-hit-women': {
    who: 'referee', group: 'body', rule: '101.1',
    left: { pts: REST_LEFT, hand: 'flat+', angle: REST_LEFT_ANGLE },
    right: { pts: '15,4 16,30 -4,10', hand: 'flat-', angle: -135 },
  },

  /* ---- Fouls with the stick ---- */
  hooking: {
    who: 'referee', group: 'stick', rule: '55',
    left: { pts: '-15,4 -26,30 -8,32', hand: 'fist', angle: 0 },
    right: { pts: '15,4 26,26 8,28', hand: 'fist', angle: 180 },
    arrows: ['M-30,42 Q-20,44 -12,38', 'M30,40 Q20,42 12,35'],
    loop: {
      times: 3,
      frames: [
        { left: { pts: '-15,4 -28,24 -16,20' }, right: { pts: '15,4 28,20 16,16' }, ms: 300 },
        { left: { pts: '-15,4 -26,30 -8,32' }, right: { pts: '15,4 26,26 8,28' }, ms: 340 },
      ],
    },
  },
  'holding-the-stick': {
    who: 'referee', group: 'stick', rule: '54',
    left: { pts: '-15,4 -26,10 -8,6', hand: 'fist', angle: 0 },
    right: { pts: '15,4 24,30 10,36', hand: 'fist', angle: 180 },
    stick: [-7.5, -5.4, 11.9, 55],
  },
  slashing: {
    who: 'referee', group: 'stick', rule: '61',
    left: { pts: '-15,4 -24,26 2,20', hand: 'fist', angle: -13 },
    right: { pts: '15,4 30,14 8,3', hand: 'flat', angle: 110 },
    arrows: ['M24,-8 L18,4'],
    loop: {
      times: 2,
      frames: [
        { right: { pts: '15,4 32,2 16,-12' }, ms: 260 },
        { right: { pts: '15,4 30,14 8,3' }, ms: 200 },
      ],
    },
  },
  'cross-checking': {
    who: 'referee', group: 'stick', rule: '59',
    left: { pts: '-15,4 -26,22 -10,12', hand: 'fist', angle: 0 },
    right: { pts: '15,4 26,22 10,12', hand: 'fist', angle: 180 },
    stick: [-36, 12, 36, 12],
    loop: {
      times: 3,
      frames: [
        { left: { pts: '-15,4 -19,14 -14,10', scale: 1.6 }, right: { pts: '15,4 19,14 14,10', scale: 1.6 }, stick: [-46, 10, 46, 10], ms: 400 },
        { ms: 300 },
        { left: { pts: '-15,4 -26,22 -10,12', scale: 1 }, right: { pts: '15,4 26,22 10,12', scale: 1 }, stick: [-36, 12, 36, 12], ms: 500 },
        { ms: 400 },
      ],
    },
  },
  'high-sticking': {
    who: 'referee', group: 'stick', rule: '60, 80',
    left: { pts: '-15,4 0,8 24,-12', hand: 'fist', angle: -39.8 },
    right: { pts: '15,4 34,-4 25,-26', hand: 'fist', angle: -112.2 },
    stick: [22.4, -36, 29, 0],
  },
  'butt-ending': {
    who: 'referee', group: 'stick', rule: '58',
    left: { pts: '-15,4 -26,12 2,8', hand: 'flat', angle: 0 },
    right: { pts: '15,4 26,28 4,22', hand: 'fist', angle: 180 },
    arrows: ['M18,34 L2,32'],
    loop: {
      times: 2,
      frames: [
        { right: { pts: '15,4 28,30 16,26' }, ms: 300 },
        { right: { pts: '15,4 26,28 4,22' }, ms: 300 },
      ],
    },
  },
  spearing: {
    who: 'referee', group: 'stick', rule: '62',
    left: { pts: '-15,4 -24,30 -8,36', hand: 'fist', angle: 0 },
    right: { pts: '15,4 24,30 8,36', hand: 'fist', angle: 180 },
    loop: {
      times: 2,
      frames: [
        { left: { pts: '-15,4 -22,22 -12,30', scale: 1.4 }, right: { pts: '15,4 22,22 12,30', scale: 1.4 }, ms: 280 },
        { left: { pts: REST_LEFT, scale: 1 }, right: { pts: REST_RIGHT, scale: 1 }, ms: 420 },
        { left: { pts: '-15,4 -24,30 -8,36' }, right: { pts: '15,4 24,30 8,36' }, ms: 420 },
      ],
    },
  },

  /* ---- Penalties for the team, and the time-out ---- */
  'too-many-players': {
    who: 'referee', group: 'team', rule: '74',
    left: { pts: '-15,4 -28,32 -11,22', hand: 'spread-', angle: -90 },
    right: { pts: '15,4 28,32 11,22', hand: 'point', angle: -90 },
  },
  'delaying-the-game': {
    who: 'referee', group: 'team', rule: '63',
    left: { pts: '-15,4 -26,34 -12,34', hand: 'flat', angle: 0 },
    right: { pts: '15,4 26,30 12,24', hand: 'flat', angle: 180 },
    arrows: ['M-14,20 L-14,6'],
    loop: {
      times: 2,
      frames: [
        { right: { pts: '15,4 28,14 12,4' }, ms: 400 },
        { right: { pts: '15,4 26,30 12,24' }, ms: 300 },
      ],
    },
  },
  'unsportsmanlike-conduct': {
    who: 'referee', group: 'team', rule: '75, 64',
    left: { pts: '-15,4 -32,22 -18,42', hand: 'fist', angle: 55 },
    right: { pts: '15,4 32,22 18,42', hand: 'fist', angle: 125 },
  },
  'time-out': {
    who: 'referee', group: 'team', rule: '87',
    left: { pts: '-15,4 -22,32 10,22', hand: 'flat', angle: -90 },
    right: { pts: '15,4 32,12 18,2', hand: 'flat', angle: 180 },
  },
} satisfies Record<string, Signal>;

export type SignalId = keyof typeof geometry;
export const signals: Record<SignalId, Signal> = geometry;
export const signalIds = Object.keys(geometry) as SignalId[];
export const groups: Group[] = ['arm', 'play', 'body', 'stick', 'team'];

export function inGroup(group: Group): SignalId[] {
  return signalIds.filter((id) => signals[id].group === group);
}

/** Everything the animation moves, as plain numbers. */
export interface Pose {
  /** Left and right arm: shoulder, elbow and wrist as x, y pairs. */
  l: number[];
  r: number[];
  /** Hand angles and scales. */
  la: number;
  ra: number;
  ls: number;
  rs: number;
  /** 0 standing upright, 1 bent forward. */
  crouch: number;
  /** Opacity of the arrows and the stick. */
  show: number;
  stick: number[];
}

export const pts = (s: string): number[] => s.trim().split(/[\s,]+/).map(Number);

const NO_STICK = [0, 0, 0, 0];

/** The finished signal: what the server renders and where every animation ends. */
export function finalPose(s: Signal): Pose {
  return {
    l: pts(s.left.pts),
    r: pts(s.right.pts),
    la: s.left.angle,
    ra: s.right.angle,
    ls: s.left.scale ?? 1,
    rs: s.right.scale ?? 1,
    crouch: s.crouch ? 1 : 0,
    show: 1,
    stick: s.stick ?? NO_STICK,
  };
}

/** Standing upright with the arms down, the same hand shapes: where an animation starts. */
export function restPose(s: Signal): Pose {
  return {
    ...finalPose(s),
    l: pts(REST_LEFT),
    r: pts(REST_RIGHT),
    la: REST_LEFT_ANGLE,
    ra: REST_RIGHT_ANGLE,
    ls: 1,
    rs: 1,
    crouch: 0,
    show: 0,
  };
}

/** A frame applied on top of the final pose. */
export function framePose(s: Signal, frame: Frame, from: Pose): Pose {
  return {
    ...from,
    l: frame.left?.pts ? pts(frame.left.pts) : from.l,
    r: frame.right?.pts ? pts(frame.right.pts) : from.r,
    la: frame.left?.angle ?? from.la,
    ra: frame.right?.angle ?? from.ra,
    ls: frame.left?.scale ?? from.ls,
    rs: frame.right?.scale ?? from.rs,
    show: frame.show ?? from.show,
    stick: frame.stick ?? from.stick,
    crouch: s.crouch ? 1 : 0,
  };
}

/** The target angle within 180° of the current one, so a hand never spins the long way. */
export function nearestAngle(from: number, to: number): number {
  return to - Math.round((to - from) / 360) * 360;
}

/**
 * Where the referee's armband sits: a short piece of the upper arm, between 38 % and
 * 64 % of the way from the shoulder to the elbow.
 */
export function armband(arm: number[]): { x1: number; y1: number; x2: number; y2: number } {
  const [sx, sy, ex, ey] = arm;
  return {
    x1: sx + 0.38 * (ex - sx),
    y1: sy + 0.38 * (ey - sy),
    x2: sx + 0.64 * (ex - sx),
    y2: sy + 0.64 * (ey - sy),
  };
}

/* Every arm must be three points, otherwise the tween cannot interpolate it. */
for (const id of signalIds) {
  const s = signals[id];
  const check = (p: string, where: string) => {
    if (pts(p).length !== 6 || pts(p).some(Number.isNaN)) throw new Error(`signal ${id}: ${where} must be three points`);
  };
  check(s.left.pts, 'left arm');
  check(s.right.pts, 'right arm');
  s.loop?.frames.forEach((f, i) => {
    if (f.left?.pts) check(f.left.pts, `frame ${i + 1} left arm`);
    if (f.right?.pts) check(f.right.pts, `frame ${i + 1} right arm`);
  });
}

/* ------------------------------------------------------------------------------------ */
/* Words                                                                                */
/* ------------------------------------------------------------------------------------ */

interface SignalText {
  name: string;
  /** What it means and what follows, one or two short sentences for a 12-year-old. */
  meaning: string;
  /** How the gesture looks. */
  looks: string;
}

const de = {
  /** The tag on a card. `i` is the card's place in its group: the referee alternates
   *  between female and male from card to card, like the scenes in the articles. */
  who: (who: Who, i: number): string =>
    who === 'linesperson' ? 'Linienrichter' : i % 2 === 0 ? 'Schiedsrichterin' : 'Schiedsrichter',
  rule: (r: string) => (r.includes(',') ? `Regeln ${r}` : `Regel ${r}`),
  groups: {
    arm: 'Arm hoch: drei Bedeutungen',
    play: 'Zeichen im Spiel',
    body: 'Fouls mit dem Körper',
    stick: 'Fouls mit dem Stock',
    team: 'Strafen für das Team und die Auszeit',
  } satisfies Record<Group, string>,
  replay: 'Nochmal',
  replayFor: (name: string) => `${name}: nochmal zeigen`,
  signals: {
    'delayed-offside': {
      name: 'Verzögertes Abseits',
      meaning: 'Ein Angreifer war zu früh in der Zone. Fahren alle Angreifer wieder raus, geht der Arm runter und es geht weiter.',
      looks: 'Ein Arm gerade nach oben, die Hand flach.',
    },
    'possible-icing': {
      name: 'Mögliches Icing',
      meaning: 'Der Puck wurde über das ganze Eis geschossen. Der Arm bleibt oben, bis das Icing gepfiffen oder aufgehoben wird.',
      looks: 'Ein Arm gerade nach oben.',
    },
    'delayed-penalty': {
      name: 'Angezeigte Strafe',
      meaning: 'Eine Strafe kommt! Gespielt wird, bis das Team mit dem Foul den Puck berührt. Dann kommt der Pfiff.',
      looks: 'Ein Arm gerade nach oben, die Hand offen.',
    },
    offside: {
      name: 'Abseits',
      meaning: 'Ein Angreifer stand im Abseits und hat den Puck in der Zone gespielt. Bully vor der blauen Linie.',
      looks: 'Erst der Pfiff, dann zeigt ein Arm waagrecht zur blauen Linie.',
    },
    icing: {
      name: 'Icing',
      meaning: 'Icing! Das Spiel steht, und das Bully ist in der Zone des Teams, das den Puck geschossen hat.',
      looks: 'Beide Arme vor der Brust verschränkt.',
    },
    'washout-linesperson': {
      name: 'Auswinken (Linienrichter)',
      meaning: 'Kein Abseits, kein Icing: Es geht weiter!',
      looks: 'Beide Arme seitlich auf Schulterhöhe ausgestreckt und geschwenkt, Handflächen nach unten.',
    },
    'washout-referee': {
      name: 'Auswinken (Schiedsrichter)',
      meaning: 'Kein Tor! Oder: kein Handpass, kein hoher Stock. Das Zeichen heisst: Das zählt nicht.',
      looks: 'Beide Arme seitlich auf Schulterhöhe ausgestreckt und geschwenkt, Handflächen nach unten.',
    },
    goal: {
      name: 'Tor',
      meaning: 'Tor! Das Zeichen zeigt, in welches Tor der Puck gegangen ist.',
      looks: 'Ein Arm zeigt auf das Tor.',
    },
    'penalty-shot': {
      name: 'Penaltyschuss',
      meaning: 'Jemand bekommt einen freien Schuss, allein gegen den Torhüter.',
      looks: 'Beide Arme über dem Kopf gekreuzt.',
    },
    'hand-pass': {
      name: 'Handpass',
      meaning: 'Jemand hat den Puck mit der Hand zum eigenen Team gespielt. Das ist nicht erlaubt.',
      looks: 'Die offene Hand schiebt ein- oder zweimal nach vorne.',
    },
    'face-off-violation': {
      name: 'Warnung beim Bully',
      meaning: 'Jemand hat sich beim Bully nicht richtig hingestellt. Das ist eine Warnung.',
      looks: 'Ein Arm angewinkelt zur Seite, die Handfläche nach oben, auf der Seite des Teams mit dem Fehler.',
    },
    boarding: {
      name: 'Bandencheck',
      meaning: 'Jemand wurde hart in die Bande gestossen.',
      looks: 'Die Faust schlägt vor der Brust in die offene Hand.',
    },
    charging: {
      name: 'Unerlaubter Körperangriff (Charging)',
      meaning: 'Jemand hat Anlauf genommen und ist in ein Gegenüber hineingefahren.',
      looks: 'Beide Fäuste kreisen vor der Brust umeinander.',
    },
    'checking-from-behind': {
      name: 'Check von hinten',
      meaning: 'Jemand wurde von hinten gestossen oder gecheckt. Das ist sehr gefährlich!',
      looks: 'Beide Arme stossen auf Schulterhöhe nach vorne, die Handflächen offen.',
    },
    'check-to-the-head': {
      name: 'Check gegen den Kopf',
      meaning: 'Jemand wurde am Kopf oder am Hals getroffen. Der Kopf ist tabu!',
      looks: 'Die flache Hand klopft an die Seite des Kopfes.',
    },
    elbowing: {
      name: 'Ellbogencheck',
      meaning: 'Jemand wurde mit dem Ellbogen getroffen.',
      looks: 'Die eine Hand klopft auf den anderen Ellbogen.',
    },
    kneeing: {
      name: 'Kniecheck',
      meaning: 'Jemand wurde mit dem Knie getroffen.',
      looks: 'Die Hand schlägt auf das eigene Knie, beide Schlittschuhe bleiben auf dem Eis.',
    },
    clipping: {
      name: 'Tiefer Check (Clipping)',
      meaning: 'Jemand wurde tief getroffen, am Knie oder darunter.',
      looks: 'Nach vorne gebeugt, die Hand klopft hinter das Knie.',
    },
    tripping: {
      name: 'Beinstellen',
      meaning: 'Jemand wurde mit dem Stock, dem Bein oder dem Körper zu Fall gebracht.',
      looks: 'Die Hand schlägt unterhalb des Knies ans Bein.',
    },
    roughing: {
      name: 'Übertriebene Härte',
      meaning: 'Auf dem Eis wurde geschubst, gerangelt oder mit den Händen geschlagen.',
      looks: 'Die Faust geballt, der Arm seitlich ausgestreckt.',
    },
    holding: {
      name: 'Halten',
      meaning: 'Jemand hat ein Gegenüber festgehalten, statt den Puck zu spielen.',
      looks: 'Die eine Hand umklammert vor der Brust das andere Handgelenk.',
    },
    interference: {
      name: 'Behinderung',
      meaning: 'Jemand hat ein Gegenüber gestört, das den Puck gar nicht hatte.',
      looks: 'Die Arme vor der Brust zu einem X gekreuzt, ohne Bewegung.',
    },
    'illegal-hit-women': {
      name: 'Unerlaubter Check (Fraueneishockey)',
      meaning: 'Im Fraueneishockey sind Bodychecks verboten. Das Zeichen heisst: Jemand hat trotzdem mit dem Körper gecheckt.',
      looks: 'Die flache Hand liegt quer vor dem Körper auf der anderen Schulter.',
    },
    hooking: {
      name: 'Haken',
      meaning: 'Jemand hat den Stock wie einen Haken benutzt und ein Gegenüber zurückgezogen.',
      looks: 'Beide Arme ziehen etwas von vorne zum Bauch.',
    },
    'holding-the-stick': {
      name: 'Stockhalten',
      meaning: 'Jemand hat den Stock eines Gegenübers festgehalten.',
      looks: 'Erst das Zeichen für Halten, dann beide Hände, als hielten sie einen Stock.',
    },
    slashing: {
      name: 'Stockschlag (Slashing)',
      meaning: 'Jemand hat mit dem Stock nach einem Gegenüber geschlagen.',
      looks: 'Die Handkante hackt auf den anderen Unterarm.',
    },
    'cross-checking': {
      name: 'Cross-Check',
      meaning: 'Jemand hat ein Gegenüber mit dem Stock gestossen, beide Hände am Stock.',
      looks: 'Beide Fäuste stossen von der Brust nach vorne und zurück, als hielten sie einen Stock.',
    },
    'high-sticking': {
      name: 'Hoher Stock',
      meaning: 'Ein Stock war zu hoch, über den Schultern. Dasselbe Zeichen gilt, wenn der Puck mit hohem Stock gespielt wurde.',
      looks: 'Beide Fäuste übereinander auf Stirnhöhe, als hielten sie einen Stock.',
    },
    'butt-ending': {
      name: 'Stockendenstoss (Butt-Ending)',
      meaning: 'Jemand hat ein Gegenüber mit dem oberen Ende des Stocks gestossen.',
      looks: 'Die Faust des einen Arms stösst unter dem anderen Unterarm nach vorne.',
    },
    spearing: {
      name: 'Stockstich (Spearing)',
      meaning: 'Jemand hat mit der Schaufel des Stocks nach einem Gegenüber gestochen.',
      looks: 'Beide Hände stossen vor dem Körper nach vorne, dann fallen sie an die Seite.',
    },
    'too-many-players': {
      name: 'Zu viele Spieler',
      meaning: 'Ein Team hatte zu viele Leute gleichzeitig auf dem Eis.',
      looks: 'Sechs Finger vor der Brust: eine Hand offen, dazu ein Finger.',
    },
    'delaying-the-game': {
      name: 'Spielverzögerung',
      meaning: 'Ein Team hat absichtlich Zeit geschunden, zum Beispiel den Puck aus dem Stadion geschossen.',
      looks: 'Die flache Hand gleitet von der unteren Hand aus nach oben.',
    },
    'unsportsmanlike-conduct': {
      name: 'Unsportliches Verhalten',
      meaning: 'Jemand war nicht fair oder nicht respektvoll. Dasselbe Zeichen gilt für eine Schwalbe (so tun, als wäre man gefoult worden).',
      looks: 'Beide Hände in die Hüften gestemmt.',
    },
    'time-out': {
      name: 'Auszeit (Time-out)',
      meaning: 'Ein Team nimmt 30 Sekunden Pause, um mit dem Trainerteam zu reden.',
      looks: 'Beide Hände formen vor der Brust ein T.',
    },
  } satisfies Record<SignalId, SignalText>,
};

const en: typeof de = {
  who: (who) => (who === 'linesperson' ? 'Linesperson' : 'Referee'),
  rule: (r) => (r.includes(',') ? `Rules ${r}` : `Rule ${r}`),
  groups: {
    arm: 'Arm up: three meanings',
    play: 'Signals during play',
    body: 'Fouls with the body',
    stick: 'Fouls with the stick',
    team: 'Penalties for the team, and the time-out',
  },
  replay: 'Again',
  replayFor: (name) => `${name}: show again`,
  signals: {
    'delayed-offside': {
      name: 'Delayed offside',
      meaning: 'An attacker went into the zone too early. If all the attackers skate back out, the arm comes down and play goes on.',
      looks: 'One arm straight up, the hand flat.',
    },
    'possible-icing': {
      name: 'Possible icing',
      meaning: 'The puck was shot all the way down the ice. The arm stays up until icing is called or washed out.',
      looks: 'One arm straight up.',
    },
    'delayed-penalty': {
      name: 'Delayed penalty',
      meaning: 'A penalty is coming! Play goes on until the team that broke the rule touches the puck. Then the whistle blows.',
      looks: 'One arm straight up, the hand open.',
    },
    offside: {
      name: 'Offside',
      meaning: 'An attacker played the puck in the zone while offside. Face-off outside the blue line.',
      looks: 'The whistle first, then one arm points along the blue line.',
    },
    icing: {
      name: 'Icing',
      meaning: 'Icing! Play stops, and the face-off is in the zone of the team that shot the puck.',
      looks: 'Both arms crossed over the chest.',
    },
    'washout-linesperson': {
      name: 'Wash-out (linesperson)',
      meaning: 'No offside, no icing: play goes on!',
      looks: 'Both arms out to the sides at shoulder height and swung, palms down.',
    },
    'washout-referee': {
      name: 'Wash-out (referee)',
      meaning: 'No goal! Or: no hand pass, no high stick. The referee says it does not count.',
      looks: 'Both arms out to the sides at shoulder height and swung, palms down.',
    },
    goal: {
      name: 'Goal',
      meaning: 'Goal! The referee points at the net the puck went into.',
      looks: 'One arm points at the goal.',
    },
    'penalty-shot': {
      name: 'Penalty shot',
      meaning: 'A player gets a free shot, alone against the goalie.',
      looks: 'Both arms crossed above the head.',
    },
    'hand-pass': {
      name: 'Hand pass',
      meaning: 'A player passed the puck to a teammate with a hand. That is not allowed.',
      looks: 'The open hand pushes forward once or twice.',
    },
    'face-off-violation': {
      name: 'Face-off warning',
      meaning: 'A player did not line up properly for the face-off. This is a warning.',
      looks: 'One arm bent out to the side, palm up, on the side of the team that got it wrong.',
    },
    boarding: {
      name: 'Boarding',
      meaning: 'A player pushed someone hard into the boards.',
      looks: 'A fist strikes the open palm in front of the chest.',
    },
    charging: {
      name: 'Charging',
      meaning: 'A player took a run-up and crashed into someone.',
      looks: 'Both fists roll around each other in front of the chest.',
    },
    'checking-from-behind': {
      name: 'Checking from behind',
      meaning: 'A player pushed or checked someone from behind. That is very dangerous!',
      looks: 'Both arms push forward at shoulder height, palms open.',
    },
    'check-to-the-head': {
      name: 'Check to the head',
      meaning: 'A player hit someone in the head or neck. Heads are off limits!',
      looks: 'The flat hand pats the side of the head.',
    },
    elbowing: {
      name: 'Elbowing',
      meaning: 'A player hit someone with an elbow.',
      looks: 'One hand taps the other elbow.',
    },
    kneeing: {
      name: 'Kneeing',
      meaning: 'A player hit someone with a knee.',
      looks: 'The hand slaps the own knee, both skates stay on the ice.',
    },
    clipping: {
      name: 'Clipping',
      meaning: 'A player hit someone low, at or below the knees.',
      looks: 'Bent forward, the hand taps behind the knee.',
    },
    tripping: {
      name: 'Tripping',
      meaning: 'A player made someone fall with the stick, a leg or the body.',
      looks: 'The hand strikes the leg below the knee.',
    },
    roughing: {
      name: 'Roughing',
      meaning: 'Players were pushing, shoving or hitting with their hands.',
      looks: 'A clenched fist, the arm stretched out to the side.',
    },
    holding: {
      name: 'Holding',
      meaning: 'A player held on to someone instead of playing the puck.',
      looks: 'One hand clasps the other wrist in front of the chest.',
    },
    interference: {
      name: 'Interference',
      meaning: 'A player got in the way of someone who did not even have the puck.',
      looks: 'The arms crossed in an X in front of the chest, held still.',
    },
    'illegal-hit-women': {
      name: 'Illegal hit (women’s hockey)',
      meaning: 'In women’s hockey, body checking is not allowed. This signal means someone checked with the body anyway.',
      looks: 'The flat hand lies across the body on the opposite shoulder.',
    },
    hooking: {
      name: 'Hooking',
      meaning: 'A player used the stick like a hook to pull someone back.',
      looks: 'Both arms tug something from in front towards the stomach.',
    },
    'holding-the-stick': {
      name: 'Holding the stick',
      meaning: 'A player grabbed an opponent’s stick.',
      looks: 'First the holding signal, then both hands as if holding a stick.',
    },
    slashing: {
      name: 'Slashing',
      meaning: 'A player swung the stick at someone.',
      looks: 'The edge of one hand chops across the other forearm.',
    },
    'cross-checking': {
      name: 'Cross-checking',
      meaning: 'A player shoved someone with the stick held in both hands.',
      looks: 'Both fists push forward from the chest and back, as if holding a stick.',
    },
    'high-sticking': {
      name: 'High-sticking',
      meaning: 'A stick was too high, above the shoulders. The same signal is used when the puck was played with a high stick.',
      looks: 'Both fists one above the other at forehead height, as if holding a stick.',
    },
    'butt-ending': {
      name: 'Butt-ending',
      meaning: 'A player jabbed someone with the top end of the stick.',
      looks: 'The fist of one arm pushes forward under the other forearm.',
    },
    spearing: {
      name: 'Spearing',
      meaning: 'A player stabbed at someone with the blade of the stick.',
      looks: 'Both hands thrust forward in front of the body, then drop to the sides.',
    },
    'too-many-players': {
      name: 'Too many players',
      meaning: 'A team had too many players on the ice at the same time.',
      looks: 'Six fingers in front of the chest: one open hand plus one finger.',
    },
    'delaying-the-game': {
      name: 'Delaying the game',
      meaning: 'A team wasted time on purpose, for example by shooting the puck out of the rink.',
      looks: 'The flat hand slides up from the lower hand.',
    },
    'unsportsmanlike-conduct': {
      name: 'Unsportsmanlike conduct',
      meaning: 'A player was not fair or not respectful. The same signal is used for diving (pretending to be fouled).',
      looks: 'Both hands on the hips.',
    },
    'time-out': {
      name: 'Time-out',
      meaning: 'A team takes a 30-second break to talk to the coach.',
      looks: 'Both hands form a T in front of the chest.',
    },
  },
};

export const signalsText: Record<Locale, typeof de> = { de, en };

/** One bullet per signal of a group, for the llms-full.txt files. */
export function signalsMarkdown(group: Group, locale: Locale): string {
  const t = signalsText[locale];
  return inGroup(group)
    .map((id, i) => {
      const s = signals[id];
      const x = t.signals[id];
      const rule = s.rule ? `, ${t.rule(s.rule)}` : '';
      return `- **${x.name}** (${t.who(s.who, i)}${rule}): ${x.looks} ${x.meaning}`;
    })
    .join('\n');
}
