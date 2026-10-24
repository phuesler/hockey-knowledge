/**
 * Game situations told in steps, drawn by RinkSequence.svelte. Each frame is one moment;
 * players keep their `id` from frame to frame, so they slide to their new spot when the
 * reader steps on. Arrows in a frame show what happens next.
 *
 * Positions are rink metres, see rink.ts. In the attacking zone our left is at positive x.
 */
import { DANGER_ZONE, benches, bubble, passShadow, viewCone, type Area, type Move, type Player, type Pt, type Scene, type View } from './rink';
import type { PlayPanel } from './plays';

export interface Sequence {
  zone: PlayPanel['zone'];
  view?: View;
  frames: Scene[];
}

const danger = { kind: 'danger', poly: DANGER_ZONE } as const;

const us = (id: string, label: string, at: Pt): Player => ({ id, team: 'us', label, at });
const them = (id: string, at: Pt): Player => ({ id, team: 'them', at });

/* role-switch: the four-roles attack situation; the pass to the boards is picked off. */
const roleSwitchThem = [
  them('o1', [5.4, 11.2]),
  them('o3', [1.6, 5.6]),
  them('o4', [-3.2, 8.4]),
  them('o5', [-7.5, 15.5]),
];

/* pass-shadow: the puck on the left boards, a defender in the slot. */
const shadowPuck: Pt = [10.4, 11];
const shadowDefender: Pt = [3, 10];

/* close-lane: the carrier's puck on our left half-boards, and the Wächter's stick blade in
   the lane to the free opponent at the right dot. */
const laneCarrierPuck: Pt = [-10.2, 13.4];
const laneStickBlade: Pt = [-0.5, 12.6];

/* scan: the winger on the left half-boards in our zone, before the breakout pass. */
const scanWinger: Pt = [-12.5, 12];


/* greeting: the start of a game on the full rink. Each team lines up on its blue line,
   both benches are on the left boards, the referee's crease is on the right boards at the
   centre line. Players keep their ids from the line-up to the huddle at their own net to
   their spot at the opening face-off (or on the bench). */
/* The captain stands at x = -1.5, between the others. */
const lineXs = [-10.5, -7.5, -4.5, 1.5, 4.5, 7.5, 10.5];
const OUR_LINE = 22;
const THEIR_LINE = 38;
const greetingAreas: Area[] = [
  { kind: 'bench', poly: [[-15, 22], [-13.8, 22], [-13.8, 29.9], [-15, 29.9]] },
  { kind: 'bench-them', poly: [[-15, 30.1], [-13.8, 30.1], [-13.8, 38], [-15, 38]] },
  {
    kind: 'ref-crease',
    poly: Array.from({ length: 13 }, (_, i): Pt => {
      const a = (i / 12) * Math.PI;
      return [15 - 3 * Math.sin(a), 30 - 3 * Math.cos(a)];
    }),
  },
];
const coaches: Player[] = [
  { id: 'coach-u1', team: 'us', at: [-13.6, 24.5] },
  { id: 'coach-u2', team: 'us', at: [-13.6, 27.5] },
  { id: 'coach-t1', team: 'them', at: [-13.6, 32.5] },
  { id: 'coach-t2', team: 'them', at: [-13.6, 35.5] },
];
/* Index of the goalie in lineXs. */
const GOALIE = 5;
type Spots = { us: Pt[]; them: Pt[]; ourC: Pt; theirC: Pt; refs: [Pt, Pt]; labels?: (string | undefined)[] };
const onLines = { us: lineXs.map((x): Pt => [x, OUR_LINE]), them: lineXs.map((x): Pt => [x, THEIR_LINE]) };
function greetingFrame({ us, them, ourC, theirC, refs, labels }: Spots, moves: Move[], puck?: Pt): Scene {
  const label = (i: number) => (labels ? labels[i] : i === GOALIE ? 'G' : undefined);
  return {
    areas: greetingAreas,
    players: [
      ...coaches,
      ...us.map((at, i): Player => ({ id: `u${i}`, team: 'us', label: label(i), at })),
      ...them.map((at, i): Player => ({ id: `t${i}`, team: 'them', label: i === GOALIE ? 'G' : undefined, at })),
      { id: 'cu', team: 'us', label: 'C', at: ourC },
      { id: 'ct', team: 'them', label: 'C', at: theirC },
      { id: 'r1', team: 'ref', at: refs[0] },
      { id: 'r2', team: 'ref', at: refs[1] },
    ],
    moves,
    puck,
  };
}
const REFS_AT_CREASE: [Pt, Pt] = [[13.2, 28.4], [13.2, 31.6]];
/* Every player's stick raised towards the other team. */
const salute: Move[] = [-1.5, ...lineXs].flatMap((x): Move[] => [
  { kind: 'stick', path: [[x, OUR_LINE], [x, OUR_LINE + 2.8]] },
  { kind: 'stick', team: 'them', path: [[x, THEIR_LINE], [x, THEIR_LINE - 2.8]] },
]);
const OUR_C_LINE: Pt = [-1.5, OUR_LINE];
const THEIR_C_LINE: Pt = [-1.5, THEIR_LINE];
const OUR_C_CENTRE: Pt = [-1.5, 30];
const THEIR_C_CENTRE: Pt = [1.5, 30];
const OUR_C_REFS: Pt = [10.2, 31.6];
const THEIR_C_REFS: Pt = [10.2, 28.4];
const OUR_C_BENCH: Pt = [-10.8, 34];
const THEIR_C_BENCH: Pt = [-10.8, 26];
/* In front of the own line, at its left end, ready for the fist bumps. */
const OUR_C_BUMPS: Pt = [-10.5, OUR_LINE + 3];
const THEIR_C_BUMPS: Pt = [-10.5, THEIR_LINE - 3];
const OUR_C_BUMPS_END: Pt = [10.5, OUR_LINE + 3];
const THEIR_C_BUMPS_END: Pt = [10.5, THEIR_LINE - 3];
/* A huddle: the goalie in the middle, everyone else in a ring around them. */
function huddle(centre: Pt): { players: Pt[]; captain: Pt } {
  const ring = Array.from({ length: 7 }, (_, i): Pt => {
    const a = (i / 7) * 2 * Math.PI;
    return [centre[0] + 3.4 * Math.cos(a), centre[1] + 3.4 * Math.sin(a)];
  });
  const players = lineXs.map((_, i): Pt => (i === GOALIE ? centre : ring[i < GOALIE ? i : i - 1]));
  return { players, captain: ring[6] };
}
const ourHuddle = huddle([0, 8.6]);
const theirHuddle = huddle([0, 51.4]);
/* The opening face-off: line 1 and the goalie on the ice, three players on each bench.
   Index order follows lineXs; the captain is our centre. */
const ourStart: Pt[] = [[-11, 22.6], [-5, 24], [-7, 27.6], [-11, 25.6], [7, 27.6], [0, 5.6], [5, 24]];
const theirStart: Pt[] = [[-11, 34.4], [5, 36], [7, 32.4], [-11, 37.4], [-7, 32.4], [0, 54.4], [-5, 36]];
const startLabels = [undefined, 'LD', 'LW', undefined, 'RW', 'G', 'RD'];
const BENCH_PLAYERS = [0, 3];

/* dump-change: period 2, our bench in the opponents' half. The fresh forwards wait on
   the bench (drawn on the ice next to it, so the bench stays visible) until the tired
   ones come off. */
const dumpBench = benches('even');
const benchSpots: Pt[] = [[-12.2, 31.4], [-12.2, 34], [-12.2, 36.6]];
const goalies = [us('g', 'G', [0, 5.5]), { id: 'tg', team: 'them', label: 'G', at: [0, 54.5] } as Player];

const geometry = {
  'role-switch': {
    zone: 'attack',
    frames: [
      {
        areas: [danger],
        players: [
          ...roleSwitchThem,
          them('o2', [10, 6.8]),
          us('a', 'K', [9, 13.5]),
          us('b', 'S', [11.5, 4.5]),
          us('c', 'S', [-0.6, 7.2]),
          us('d', 'S', [8, 20.5]),
          us('e', 'S', [-8, 20.5]),
        ],
        puck: [8.4, 12.2],
        moves: [
          { kind: 'pass', path: [[8.4, 12.2], [11.5, 4.5]], trim: 1.6 },
          { kind: 'skate', team: 'them', path: [[10, 6.8], [10.2, 7.8]], trim: 0 },
        ],
      },
      {
        areas: [danger],
        players: [
          ...roleSwitchThem,
          them('o2', [10.2, 7.8]),
          us('a', 'J', [9, 13.5]),
          us('b', 'W', [11.5, 4.5]),
          us('c', 'W', [-0.6, 7.2]),
          us('d', 'W', [8, 20.5]),
          us('e', 'W', [-8, 20.5]),
        ],
        puck: [9.6, 8.6],
        moves: [
          { kind: 'skate', path: [[9, 13.5], [9.2, 10.2]], trim: 0.4 },
          { kind: 'skate', path: [[11.5, 4.5], [12.4, 11.5], [4.8, 13.8]], trim: 0.4 },
          { kind: 'skate', path: [[-0.6, 7.2], [-2.6, 11]], trim: 0.4 },
          { kind: 'skate', path: [[8, 20.5], [2.5, 17.5]], trim: 0.4 },
          { kind: 'skate', path: [[-8, 20.5], [-7, 18]], trim: 0.4 },
        ],
      },
      {
        areas: [danger],
        players: [
          ...roleSwitchThem,
          them('o2', [10.2, 7.8]),
          us('a', 'J', [9.2, 10.2]),
          us('b', 'W', [4.8, 13.8]),
          us('c', 'W', [-2.6, 11]),
          us('d', 'W', [2.5, 17.5]),
          us('e', 'W', [-7, 18]),
        ],
        puck: [9.6, 8.6],
        moves: [{ kind: 'stick', path: [[9.2, 10.2], [9.6, 8.9]] }],
      },
    ],
  },

  scan: {
    zone: 'own',
    frames: [
      {
        areas: [{ kind: 'view', poly: viewCone(scanWinger, [-6, 19], 80, 10) }],
        players: [
          them('o1', [2.5, 6]),
          them('o2', [-7, 19.5]),
          them('o3', [3, 14]),
          us('d', 'K', [-1.6, 2.6]),
          us('w', 'S', scanWinger),
          us('c', 'S', [-3.5, 14]),
        ],
        puck: [-2.6, 2.2],
        moves: [
          { kind: 'skate', team: 'them', path: [[2.5, 6], [0.4, 3.6]], trim: 1.4 },
          { kind: 'skate', team: 'them', path: [[-7, 19.5], [-9.5, 16.5]], trim: 0.4 },
        ],
      },
      {
        areas: [{ kind: 'view', poly: viewCone(scanWinger, [-2.6, 2.2], 70, 10) }],
        players: [
          them('o1', [0.4, 3.6]),
          them('o2', [-9.5, 16.5]),
          them('o3', [3, 14]),
          us('d', 'K', [-1.6, 2.6]),
          us('w', 'S', scanWinger),
          us('c', 'S', [-3.5, 14]),
        ],
        puck: [-2.6, 2.2],
        moves: [{ kind: 'pass', path: [[-2.6, 2.2], [-12, 11.2]], trim: 1.2 }],
      },
      {
        areas: [{ kind: 'view', poly: viewCone(scanWinger, [-3.5, 14], 70, 10) }],
        players: [
          them('o1', [0.4, 3.6]),
          them('o2', [-9.8, 15.6]),
          them('o3', [3, 14]),
          us('d', 'S', [-1.6, 2.6]),
          us('w', 'K', scanWinger),
          us('c', 'S', [-3.5, 14]),
        ],
        puck: [-12, 11.2],
        moves: [{ kind: 'pass', path: [[-12, 11.2], [-3.5, 14]], trim: 1.6 }],
      },
      {
        players: [
          them('o1', [0.4, 3.6]),
          them('o2', [-10.6, 14.6]),
          them('o3', [3, 14]),
          us('d', 'S', [-1.6, 2.6]),
          us('w', 'S', scanWinger),
          us('c', 'K', [-3.5, 14]),
        ],
        puck: [-3, 15],
        moves: [{ kind: 'carry', path: [[-3, 15], [-3, 21.5]], trim: 0.4 }],
      },
    ],
  },

  'pass-shadow': {
    zone: 'attack',
    frames: [
      {
        areas: [{ kind: 'shadow', poly: passShadow(shadowPuck, shadowDefender, 7) }],
        players: [
          them('o1', shadowDefender),
          them('o2', [8.4, 9]),
          them('o3', [-1, 5.8]),
          us('k', 'K', [11, 12.2]),
          us('s', 'S', [-1.2, 9.4]),
        ],
        puck: shadowPuck,
        moves: [{ kind: 'lane', path: [shadowPuck, [-1.2, 9.4]] }],
      },
      {
        areas: [{ kind: 'shadow', poly: passShadow(shadowPuck, shadowDefender, 7) }],
        players: [
          them('o1', shadowDefender),
          them('o2', [8.4, 9]),
          them('o3', [-1, 5.8]),
          us('k', 'K', [11, 12.2]),
          us('s', 'S', [-1.2, 9.4]),
        ],
        puck: shadowPuck,
        moves: [{ kind: 'skate', path: [[-1.2, 9.4], [-1, 12], [-0.2, 14]], trim: 0.4 }],
      },
      {
        areas: [{ kind: 'shadow', poly: passShadow(shadowPuck, shadowDefender, 7) }],
        players: [
          them('o1', shadowDefender),
          them('o2', [8.4, 9]),
          them('o3', [-1, 5.8]),
          us('k', 'K', [11, 12.2]),
          us('s', 'S', [-0.2, 14]),
        ],
        puck: shadowPuck,
        moves: [{ kind: 'pass', path: [shadowPuck, [-0.2, 14]], trim: 1.6 }],
      },
    ],
  },

  'net-drive': {
    zone: 'attack',
    frames: [
      {
        areas: [danger],
        players: [
          them('o1', [1.8, 10.2]),
          them('o2', [9.4, 8.8]),
          them('o3', [-6, 6.4]),
          them('o4', [-5, 17]),
          us('k', 'K', [11, 13.4]),
          us('s', 'S', [1.6, 12.8]),
          us('t', 'S', [-9, 7.4]),
          us('d', 'S', [7.5, 20.5]),
        ],
        puck: [10.4, 12.4],
        moves: [
          { kind: 'skate', path: [[1.6, 12.8], [0.6, 9], [-0.4, 6.4]], trim: 0.4 },
          { kind: 'skate', team: 'them', path: [[1.8, 10.2], [-0.6, 8.8], [-2.2, 5.6]], trim: 0.4 },
        ],
      },
      {
        areas: [danger, { kind: 'open', ellipse: { at: [4.2, 12], rx: 3, ry: 2.2 } }],
        players: [
          them('o1', [-2.2, 5.6]),
          them('o2', [9.4, 8.8]),
          them('o3', [-6, 6.4]),
          them('o4', [-5, 17]),
          us('k', 'K', [11, 13.4]),
          us('s', 'S', [-0.4, 6.4]),
          us('t', 'S', [-9, 7.4]),
          us('d', 'S', [7.5, 20.5]),
        ],
        puck: [10.4, 12.4],
        moves: [{ kind: 'carry', path: [[10.4, 12.4], [7.6, 13.4], [4.6, 11.6]], trim: 0.4 }],
      },
      {
        areas: [danger, { kind: 'open', ellipse: { at: [4.2, 12], rx: 3, ry: 2.2 } }],
        players: [
          them('o1', [-2.2, 5.6]),
          them('o2', [9, 10]),
          them('o3', [-6, 6.4]),
          them('o4', [-5, 17]),
          us('k', 'K', [5.2, 12.6]),
          us('s', 'S', [-0.4, 6.4]),
          us('t', 'S', [-9, 7.4]),
          us('d', 'S', [7.5, 20.5]),
        ],
        puck: [4.4, 11.4],
        moves: [{ kind: 'shot', path: [[4.4, 11.4], [0.6, 4.3]], trim: 0.2 }],
      },
    ],
  },


  'guard-tight': {
    zone: 'own',
    frames: [
      {
        areas: [danger, { kind: 'view', poly: viewCone([-1.4, 12.4], [5, 16], 120, 9) }],
        players: [
          them('o1', [10.4, 14.4]),
          them('o2', [-2, 16.4]),
          us('j', 'J', [9.2, 11.8]),
          us('w', 'W', [-1.4, 12.4]),
        ],
        puck: [10.6, 15.8],
        moves: [
          { kind: 'skate', team: 'them', path: [[-2, 16.4], [-4, 11.5], [-1.8, 8.2]], trim: 0.4 },
          { kind: 'skate', path: [[-1.4, 12.4], [0, 9], [-0.4, 5.4]], trim: 0.4 },
        ],
      },
      {
        areas: [danger, { kind: 'view', poly: viewCone([-0.4, 5.4], [5, 12], 120, 9) }],
        players: [
          them('o1', [10.4, 14.4]),
          them('o2', [-1.8, 8.2]),
          us('j', 'J', [9.2, 11.8]),
          us('w', 'W', [-0.4, 5.4]),
        ],
        puck: [10.6, 15.8],
        moves: [
          { kind: 'stick', path: [[-0.4, 5.4], [0.7, 6.5]] },
          { kind: 'pass', team: 'them', path: [[10.6, 15.8], [0.9, 6.8]], trim: 0.6 },
        ],
      },
      {
        areas: [danger],
        players: [
          them('o1', [10.4, 14.4]),
          them('o2', [-1.8, 8.2]),
          us('j', 'J', [9.2, 11.8]),
          us('w', 'W', [-0.4, 5.4]),
        ],
        puck: [0.9, 6.8],
      },
    ],
  },
  /* goalie-rebound: a pass across, the goalie pushes over, saves, and follows the
     rebound until LD clears it. */
  'goalie-rebound': {
    zone: 'own',
    frames: [
      {
        areas: [danger],
        players: [
          them('a', [-8.2, 12]),
          them('b', [5.6, 9.6]),
          us('d', 'LD', [-4.8, 12.6]),
          us('g', 'G', [-1.1, 5.1]),
        ],
        puck: [-7.6, 11.2],
        moves: [{ kind: 'pass', path: [[-7.6, 11.2], [5, 9]], trim: 1.4 }],
      },
      {
        areas: [danger],
        players: [
          them('a', [-8.2, 12]),
          them('b', [5.6, 9.6]),
          us('d', 'LD', [-4.8, 12.6]),
          us('g', 'G', [1.06, 5.06]),
        ],
        puck: [4.6, 8.6],
        moves: [{ kind: 'shot', path: [[4.6, 8.6], [1.06, 5.06]], trim: 1.4 }],
      },
      {
        areas: [danger],
        players: [
          them('a', [-8.2, 12]),
          them('b', [5.6, 9.6]),
          us('d', 'LD', [-4.8, 12.6]),
          us('g', 'G', [1.06, 5.06]),
        ],
        puck: [-3, 7.5],
        moves: [
          { kind: 'sight', path: [[1.06, 5.06], [-3, 7.5]] },
          { kind: 'skate', path: [[-4.8, 12.6], [-3.4, 8.4]], trim: 1.4 },
        ],
      },
      {
        areas: [danger],
        players: [
          them('a', [-8.2, 12]),
          them('b', [5.6, 9.6]),
          us('d', 'LD', [-3.4, 8.8]),
          us('g', 'G', [-0.98, 5.14]),
        ],
        puck: [-3, 7.5],
        moves: [{ kind: 'shot', path: [[-3, 7.5], [-12.5, 3.5]] }],
      },
    ],
  },

  greeting: {
    zone: 'full',
    view: 'full',
    frames: [
      greetingFrame({ ...onLines, ourC: OUR_C_LINE, theirC: THEIR_C_LINE, refs: [[3, 26], [3, 34]] }, [
        { kind: 'skate', team: 'ref', path: [[3, 26], REFS_AT_CREASE[0]], trim: 1.6 },
        { kind: 'skate', team: 'ref', path: [[3, 34], REFS_AT_CREASE[1]], trim: 1.6 },
      ]),
      greetingFrame({ ...onLines, ourC: OUR_C_LINE, theirC: THEIR_C_LINE, refs: REFS_AT_CREASE }, salute),
      greetingFrame({ ...onLines, ourC: OUR_C_LINE, theirC: THEIR_C_LINE, refs: REFS_AT_CREASE }, [
        { kind: 'skate', path: [OUR_C_LINE, OUR_C_CENTRE], trim: 1.6 },
        { kind: 'skate', team: 'them', path: [THEIR_C_LINE, THEIR_C_CENTRE], trim: 1.6 },
      ]),
      greetingFrame({ ...onLines, ourC: OUR_C_CENTRE, theirC: THEIR_C_CENTRE, refs: REFS_AT_CREASE }, [
        { kind: 'skate', path: [OUR_C_CENTRE, [4, 32.4], OUR_C_REFS], trim: 1.6 },
        { kind: 'skate', team: 'them', path: [THEIR_C_CENTRE, [6, 28.6], THEIR_C_REFS], trim: 1.6 },
      ]),
      greetingFrame({ ...onLines, ourC: OUR_C_REFS, theirC: THEIR_C_REFS, refs: REFS_AT_CREASE }, [
        { kind: 'skate', path: [OUR_C_REFS, [0, 35.5], OUR_C_BENCH], trim: 1.6 },
        { kind: 'skate', team: 'them', path: [THEIR_C_REFS, [0, 24.5], THEIR_C_BENCH], trim: 1.6 },
      ]),
      /* No arrows back to the line: the two would cross right at the benches. */
      greetingFrame({ ...onLines, ourC: OUR_C_BENCH, theirC: THEIR_C_BENCH, refs: REFS_AT_CREASE }, []),
      greetingFrame({ ...onLines, ourC: OUR_C_BUMPS, theirC: THEIR_C_BUMPS, refs: REFS_AT_CREASE }, [
        { kind: 'skate', path: [OUR_C_BUMPS, OUR_C_BUMPS_END], trim: 1.6 },
        { kind: 'skate', team: 'them', path: [THEIR_C_BUMPS, THEIR_C_BUMPS_END], trim: 1.6 },
      ]),
      greetingFrame({ ...onLines, ourC: OUR_C_BUMPS_END, theirC: THEIR_C_BUMPS_END, refs: REFS_AT_CREASE }, [
        { kind: 'skate', path: [[0, OUR_LINE - 1.5], [0, 13.5]], trim: 0 },
        { kind: 'skate', team: 'them', path: [[0, THEIR_LINE + 1.5], [0, 46.5]], trim: 0 },
      ]),
      greetingFrame(
        { us: ourHuddle.players, them: theirHuddle.players, ourC: ourHuddle.captain, theirC: theirHuddle.captain, refs: REFS_AT_CREASE },
        BENCH_PLAYERS.flatMap((i): Move[] => [
          { kind: 'skate', path: [ourHuddle.players[i], [-8, 16], ourStart[i]], trim: 1.6 },
          { kind: 'skate', team: 'them', path: [theirHuddle.players[i], [-8, 44], theirStart[i]], trim: 1.6 },
        ]),
      ),
      greetingFrame(
        { us: ourStart, them: theirStart, ourC: [0, 28.4], theirC: [0, 31.6], refs: [[2.6, 30], [9, 30]], labels: startLabels },
        [],
        [0, 30],
      ),
    ],
  },

  /* Zeit und Raum: the bubble is always the second area, so it grows and shrinks between
     frames. bubble-pass is in the attacking zone (our left at positive x), bubble-shrink is
     the Jäger closing the gap in our zone, seen from the puck carrier. */

  'bubble-pass': {
    zone: 'attack',
    frames: [
      {
        areas: [danger, bubble([12, 14], 2, '< 1 s', [12.6, 9.6])],
        players: [
          them('o1', [9, 12]),
          them('o2', [11.6, 18.6]),
          them('o3', [0, 8]),
          us('k', 'K', [12, 14]),
          us('s', 'S', [-5, 15]),
        ],
        puck: [11.2, 13.4],
        moves: [{ kind: 'pass', path: [[11.2, 13.4], [-4.2, 13.6]], trim: 0.6 }],
      },
      {
        areas: [danger, bubble([-5, 15], 4.3, '≈ 2 s', [-8, 14])],
        players: [
          them('o1', [9, 12]),
          them('o2', [11.6, 18.6]),
          them('o3', [0, 8]),
          us('k', 'K', [12, 14]),
          us('s', 'S', [-5, 15]),
        ],
        puck: [-4.4, 13.4],
        moves: [
          { kind: 'carry', path: [[-4.4, 13.4], [-3.2, 9.6]], trim: 0.2 },
          { kind: 'skate', team: 'them', path: [[9, 12], [3.6, 12.8]], trim: 0.2 },
        ],
      },
      {
        areas: [danger, bubble([-3, 11], 3.2, '≈ 1 s', [-3, 15.4])],
        players: [
          them('o1', [4, 13]),
          them('o2', [11.6, 18.6]),
          them('o3', [2.6, 8.4]),
          us('k', 'K', [12, 14]),
          us('s', 'S', [-3, 11]),
        ],
        puck: [-2.6, 10],
        moves: [{ kind: 'shot', path: [[-2.6, 10], [-0.5, 4.4]], trim: 0.2 }],
      },
    ],
  },

  'bubble-shrink': {
    zone: 'own',
    frames: [
      {
        areas: [danger, bubble([-9, 20], 4.8, '≈ 2 s', [-12, 17.2])],
        players: [them('o1', [-9, 20]), us('j', 'J', [-3.6, 11])],
        puck: [-8.4, 18.9],
        moves: [
          { kind: 'carry', team: 'them', path: [[-8.4, 18.9], [-5, 13]], trim: 0.4 },
          { kind: 'skate', path: [[-3.6, 11], [-6.4, 15.6]], trim: 0.4 },
        ],
      },
      {
        areas: [danger, bubble([-9, 17.4], 2, '< 1 s', [-9.4, 21])],
        players: [them('o1', [-9, 17.4]), us('j', 'J', [-6.6, 15.4])],
        puck: [-8.6, 16.2],
        moves: [
          { kind: 'stick', path: [[-6.6, 15.4], [-7.8, 15.8]] },
          { kind: 'carry', team: 'them', path: [[-8.6, 16.2], [-11.6, 13], [-12.4, 9]], trim: 0.4 },
          { kind: 'skate', path: [[-6.6, 15.4], [-9.2, 12.4], [-10, 8.4]], trim: 0.4 },
        ],
      },
      {
        areas: [danger, bubble([-12.8, 9.6], 1.9, '< 1 s', [-12.4, 13.4])],
        players: [them('o1', [-12.8, 9.6]), us('j', 'J', [-10, 8.4])],
        puck: [-12.6, 8.2],
        moves: [{ kind: 'stick', path: [[-10, 8.4], [-11.6, 8]] }],
      },
    ],
  },

  /* close-lane: our zone, the Jäger presses the carrier on the left half-boards. The
     Wächter puts their stick into the lane to the free opponent on the right; the shadow
     is cast by the stick blade, so the free opponent stands inside it; when the puck moves
     in the last frame, the Wächter moves the stick with it. */
  'close-lane': {
    zone: 'own',
    frames: [
      {
        areas: [danger, bubble([-11, 14], 1.9, '< 1 s', [-11.4, 17.4])],
        players: [them('o1', [-11, 14]), them('o2', [6.5, 12]), us('j', 'J', [-9, 11.4]), us('w', 'W', [1.6, 5.6])],
        puck: laneCarrierPuck,
        moves: [
          { kind: 'lane', path: [laneCarrierPuck, [6.5, 12]] },
          { kind: 'skate', path: [[1.6, 5.6], [-0.5, 10.2]], trim: 0.4 },
        ],
      },
      {
        areas: [danger, bubble([-11, 14], 1.9, '< 1 s', [-11.4, 17.4]), { kind: 'shadow', poly: passShadow(laneCarrierPuck, laneStickBlade, 8) }],
        players: [them('o1', [-11, 14]), them('o2', [6.5, 12]), us('j', 'J', [-9, 11.4]), us('w', 'W', [-0.6, 10.4])],
        puck: laneCarrierPuck,
        moves: [
          { kind: 'stick', path: [[-0.6, 10.4], laneStickBlade] },
          { kind: 'carry', team: 'them', path: [laneCarrierPuck, [-12.6, 11.4]], trim: 0.4 },
        ],
      },
      {
        areas: [danger, bubble([-12.8, 12.2], 1.6, '< 1 s', [-12, 15.6]), { kind: 'shadow', poly: passShadow([-12.4, 11.2], [-0.4, 11.7], 8) }],
        players: [them('o1', [-12.8, 12.2]), them('o2', [6.5, 12]), us('j', 'J', [-10.6, 11]), us('w', 'W', [-0.7, 9.8])],
        puck: [-12.4, 11.2],
        moves: [
          { kind: 'stick', path: [[-0.7, 9.8], [-0.4, 11.7]] },
          { kind: 'stick', path: [[-10.6, 11], [-11.8, 11]] },
        ],
      },
    ],
  },

  /* delay: K comes into the attacking zone alone, turns away on the boards and keeps the
     puck until both Satelliten have arrived, then passes into the high slot. */
  delay: {
    zone: 'attack',
    frames: [
      {
        areas: [danger, bubble([10, 19], 2.8, '≈ 1 s', [5.2, 20.8])],
        players: [
          them('o1', [5.6, 14.6]),
          them('o2', [-1.4, 9]),
          them('o3', [3, 6.4]),
          us('k', 'K', [10, 19]),
          us('s1', 'S', [2, 24.2]),
          us('s2', 'S', [-7, 24.4]),
        ],
        puck: [9.4, 18],
        moves: [
          { kind: 'carry', path: [[9.4, 18], [15.6, 8.4], [12.4, 16]], trim: 0.4 },
          { kind: 'skate', team: 'them', path: [[5.6, 14.6], [8.8, 14.4]], trim: 0 },
          { kind: 'skate', path: [[2, 24.2], [1.2, 19.4]], trim: 0.4 },
          { kind: 'skate', path: [[-7, 24.4], [-8.4, 16.4]], trim: 0.4 },
        ],
      },
      {
        areas: [danger, bubble([12.8, 16.6], 2.4, '≈ 1 s', [12.8, 20.4])],
        players: [
          them('o1', [9.2, 13.8]),
          them('o2', [-1.4, 9]),
          them('o3', [3, 6.4]),
          us('k', 'K', [12.8, 16.6]),
          us('s1', 'S', [1.2, 19.4]),
          us('s2', 'S', [-8.4, 16.4]),
        ],
        puck: [12, 15.8],
        moves: [
          { kind: 'skate', path: [[1.2, 19.4], [0.6, 14.4]], trim: 0.4 },
          { kind: 'skate', path: [[-8.4, 16.4], [-9.6, 7]], trim: 0.4 },
        ],
      },
      {
        areas: [danger, bubble([12.8, 16.6], 2, '< 1 s', [12.8, 20.2])],
        players: [
          them('o1', [10.4, 14.4]),
          them('o2', [-1.4, 9]),
          them('o3', [3, 6.4]),
          us('k', 'K', [12.8, 16.6]),
          us('s1', 'S', [0.6, 14.4]),
          us('s2', 'S', [-9.6, 7]),
        ],
        puck: [12, 15.8],
        moves: [{ kind: 'pass', path: [[12, 15.8], [1.6, 14.6]], trim: 0.6 }],
      },
    ],
  },

  /* split-d: a 2-on-2 just after the zone entry. S skates between the two defenders to the
     net; one defender follows, and K's bubble grows. */
  'split-d': {
    zone: 'attack',
    frames: [
      {
        areas: [danger, bubble([8.6, 20.6], 3, '≈ 1 s', [3.6, 21])],
        players: [them('o1', [5, 15]), them('o2', [-4, 15]), us('k', 'K', [8.6, 20.6]), us('s', 'S', [0, 23.4])],
        puck: [8.2, 19.4],
        moves: [
          { kind: 'skate', path: [[0, 23.4], [0.8, 15], [0.2, 9.2]], trim: 0.4 },
          { kind: 'carry', path: [[8.2, 19.4], [9.6, 14.6]], trim: 0.2 },
          { kind: 'skate', team: 'them', path: [[5, 15], [3.2, 12.2]], trim: 0.2 },
        ],
      },
      {
        areas: [danger, bubble([9.6, 15.6], 4, '≈ 2 s', [9.6, 20.6])],
        players: [them('o1', [2.8, 11.6]), them('o2', [-3.6, 11.6]), us('k', 'K', [9.6, 15.6]), us('s', 'S', [0.2, 9.2])],
        puck: [9, 14.8],
        moves: [{ kind: 'carry', path: [[9, 14.8], [7.4, 12.4]], trim: 0.4 }],
      },
      {
        areas: [danger, bubble([7.8, 13], 2.8, '≈ 1 s', [7.8, 17])],
        players: [them('o1', [2.8, 11.6]), them('o2', [-3.6, 11.6]), us('k', 'K', [7.8, 13]), us('s', 'S', [0.2, 9.2])],
        puck: [7, 12.2],
        moves: [{ kind: 'shot', path: [[7, 12.2], [0.8, 4.4]], trim: 0.2 }],
      },
    ],
  },
  'dump-change': {
    zone: 'full',
    view: 'full',
    frames: [
      {
        areas: dumpBench,
        players: [
          ...goalies,
          them('o1', [-1, 9]),
          them('o2', [6, 11]),
          them('o3', [-8, 18]),
          them('o4', [-9, 26]),
          them('o5', [8, 25]),
          us('ld', 'LD', [-6, 7]),
          us('rd', 'RD', [5, 6.5]),
          us('c', 'C', [-4, 13]),
          us('lw', 'LW', [-11, 15]),
          us('rw', 'RW', [10, 14]),
          us('lw2', 'LW', benchSpots[0]),
          us('c2', 'C', benchSpots[1]),
          us('rw2', 'RW', benchSpots[2]),
        ],
        puck: [-3.4, 14.2],
        moves: [{ kind: 'carry', path: [[-3.4, 14.2], [-1, 22], [-2, 30.6]], trim: 0.2 }],
      },
      {
        areas: dumpBench,
        players: [
          ...goalies,
          them('o1', [-1, 22]),
          them('o2', [5, 24]),
          them('o3', [-7, 27]),
          them('o4', [-5, 38]),
          them('o5', [6, 40]),
          us('ld', 'LD', [-5, 20]),
          us('rd', 'RD', [5, 19]),
          us('c', 'C', [-2.4, 31.4]),
          us('lw', 'LW', [-10, 27]),
          us('rw', 'RW', [9.5, 28]),
          us('lw2', 'LW', benchSpots[0]),
          us('c2', 'C', benchSpots[1]),
          us('rw2', 'RW', benchSpots[2]),
        ],
        puck: [-1.8, 32.6],
        moves: [{ kind: 'shot', path: [[-1.8, 32.6], [11.6, 57]], trim: 0.2 }],
      },
      {
        areas: dumpBench,
        players: [
          ...goalies,
          them('o1', [-1, 30]),
          them('o2', [6, 32]),
          them('o3', [-4, 28]),
          them('o4', [-3, 46]),
          them('o5', [7, 50]),
          us('ld', 'LD', [-5, 24]),
          us('rd', 'RD', [5, 24]),
          us('c', 'C', [-3, 35.5]),
          us('lw', 'LW', [-9, 29]),
          us('rw', 'RW', [8, 35]),
          us('lw2', 'LW', benchSpots[0]),
          us('c2', 'C', benchSpots[1]),
          us('rw2', 'RW', benchSpots[2]),
        ],
        puck: [11.6, 57],
        moves: [
          { kind: 'skate', team: 'them', path: [[7, 50], [10.4, 55.2]], trim: 1 },
          { kind: 'skate', path: [[-9, 29], [-12.2, 31.4]], trim: 1.6 },
          { kind: 'skate', path: [[-3, 35.5], [-12.2, 34]], trim: 1.6 },
          { kind: 'skate', path: [[8, 35], [-3, 39.5], [-12.2, 36.6]], trim: 1.6 },
        ],
      },
      {
        areas: dumpBench,
        players: [
          ...goalies,
          them('o1', [-1, 34]),
          them('o2', [6, 36]),
          them('o3', [-4, 31]),
          them('o4', [-4, 50]),
          them('o5', [8, 56.6]),
          us('ld', 'LD', [-5, 28]),
          us('rd', 'RD', [5, 28]),
          us('lw', 'LW', benchSpots[0]),
          us('c', 'C', benchSpots[1]),
          us('rw', 'RW', benchSpots[2]),
          us('lw2', 'LW', [-10.4, 39]),
          us('c2', 'C', [-7.8, 36]),
          us('rw2', 'RW', [-4.6, 40]),
        ],
        puck: [7.4, 57.2],
        moves: [
          { kind: 'skate', path: [[-10.4, 39], [-9, 46]], trim: 0.2 },
          { kind: 'skate', path: [[-7.8, 36], [-1, 44]], trim: 0.2 },
          { kind: 'skate', path: [[-4.6, 40], [6, 47]], trim: 0.2 },
        ],
      },
    ],
  },
} satisfies Record<string, Sequence>;

export type SequenceId = keyof typeof geometry;

export const sequences: Record<SequenceId, Sequence> = geometry;

interface StepText {
  title: string;
  text: string;
}

interface SequenceText {
  caption: string;
  /** One per frame, in the same order. */
  steps: StepText[];
  /** Describes each frame for screen readers. */
  labels: string[];
  note?: string;
}

const de: Record<SequenceId, SequenceText> = {
  'role-switch': {
    caption: 'Puck verloren: die Rollen wechseln',
    steps: [
      {
        title: 'Wir haben den Puck',
        text: 'K ist König und passt zum Satelliten tief an der Bande. Aber eins von den anderen steht im Passweg.',
      },
      {
        title: 'Puck verloren – neue Rollen',
        text: 'Die anderen fangen den Pass ab. Sofort haben alle eine neue Rolle: Der frühere König ist am nächsten und schon zwischen Puck und unserem Tor und wird Jäger (J). Alle anderen werden Wächter (W).',
      },
      {
        title: 'Alle auf der Abwehrseite',
        text: 'Der Jäger macht Druck, der Schläger zeigt zum Puck. Die Wächter stehen jeweils zwischen einem Gegenüber und unserem Tor. Unser Tor liegt unten, hinter der blauen Linie.',
      },
    ],
    labels: [
      'Angriffsdrittel. Der König hat den Puck an der linken Bande und passt tief zur Bande. Eins von den anderen steht im Passweg.',
      'Die anderen haben den Pass abgefangen. Bei uns heissen jetzt alle J oder W. Pfeile zeigen, wie alle zwischen ein Gegenüber und unser Tor fahren.',
      'Der Jäger steht vor dem Gegenüber mit dem Puck, Schläger zum Puck. Die vier Wächter stehen jeweils zwischen einem Gegenüber und der blauen Linie.',
    ],
  },
  scan: {
    caption: 'Scannen: schauen, bevor der Puck kommt',
    steps: [
      {
        title: 'Über die Schulter',
        text: 'Der Verteidiger hat den Puck hinter dem Tor. Die Flügelspielerin an der Bande schaut zuerst über die Schulter zur Mitte und sieht: Eins von den anderen kommt direkt auf sie zu. Der Center in der Mitte ist frei.',
      },
      {
        title: 'Zum Puck',
        text: 'Dann schaut sie zum Puck und nimmt den Pass an. Jetzt weiss sie schon, wo ihr Gegenüber ist und wer frei ist.',
      },
      {
        title: 'Sofort spielen',
        text: 'Die Flügelspielerin ist jetzt König und muss nicht mehr suchen: Der Puck geht sofort zum freien Center, bevor das Gegenüber da ist.',
      },
      {
        title: 'Weiter geht’s',
        text: 'Der Center ist der neue König und fährt mit Tempo aus der Zone. Das Gegenüber kommt zu spät.',
      },
    ],
    labels: [
      'Eigenes Drittel. Der Verteidiger hat den Puck hinter dem Tor. Ein blauer Fächer zeigt, dass die Flügelspielerin an der linken Bande über die Schulter zur Mitte schaut. Eins von den anderen fährt auf sie zu, der Center ist frei.',
      'Der blaue Fächer zeigt jetzt von der Flügelspielerin zum Puck. Der Verteidiger passt zu ihr.',
      'Die Flügelspielerin hat den Puck, schaut zum Center und passt sofort. Das Gegenüber ist noch ein paar Meter weg.',
      'Der Center hat den Puck und fährt Richtung blaue Linie.',
    ],
    note: 'Der blaue Fächer zeigt, wohin die Flügelspielerin gerade schaut.',
  },
  'pass-shadow': {
    caption: 'Raus aus dem Passschatten',
    steps: [
      {
        title: 'Versteckt',
        text: 'Der Satellit steht hinter einem von den anderen. Die graue Fläche ist der Passschatten: Jeder Pass dorthin trifft das Gegenüber. Für den König ist der Satellit unsichtbar.',
      },
      {
        title: 'Zwei Schritte',
        text: 'Der Satellit fährt ein paar Meter zur Seite, bis die Kelle des Königs zu sehen ist.',
      },
      {
        title: 'Frei',
        text: 'Jetzt ist der Passweg frei. Der König kann passen, und der Satellit steht im Slot bereit zum Schuss.',
      },
    ],
    labels: [
      'Angriffsdrittel. Der König hat den Puck an der linken Bande. Eins von den anderen steht im Slot. Direkt dahinter, in einer grauen Fläche, steht ein Satellit.',
      'Der Satellit fährt aus der grauen Fläche nach oben in den hohen Slot.',
      'Der Satellit steht frei im hohen Slot. Der König passt zum Satelliten, am Gegenüber vorbei.',
    ],
  },
  'net-drive': {
    caption: 'Zum Tor fahren macht Platz',
    steps: [
      {
        title: 'Der Satellit fährt los',
        text: 'Der König hat den Puck an der Bande. Im Slot steht unser Satellit, das Gegenüber dicht dabei. Der Satellit fährt zum Tor, das Gegenüber muss mit.',
      },
      {
        title: 'Platz im Slot',
        text: 'Das Gegenüber steht jetzt vor dem Tor. Im Slot ist freies Eis (grün). Der König fährt mit dem Puck hinein.',
      },
      {
        title: 'Schuss',
        text: 'Der König schiesst aus dem Slot. Der Satellit vor dem Tor nimmt der Torhüterin die Sicht und ist bereit für den Abpraller.',
      },
    ],
    labels: [
      'Angriffsdrittel. Der König hat den Puck an der linken Bande. Ein Satellit im Slot fährt zum Tor, das Gegenüber folgt.',
      'Der Satellit und das Gegenüber stehen vor dem Tor. Im Slot ist eine grüne Fläche frei. Der König fährt mit dem Puck hinein.',
      'Der König schiesst aus dem Slot aufs Tor. Der Satellit steht vor der Torhüterin.',
    ],
  },
  'guard-tight': {
    caption: 'Wächter: je näher am Tor, desto enger',
    steps: [
      {
        title: 'Weit vom Tor: etwas Abstand',
        text: 'Das Gegenüber ohne Puck ist hoch im Slot. Der Wächter steht zwischen Gegenüber und Tor, mit etwas Abstand, und sieht Gegenüber und Puck. Jetzt fährt das Gegenüber zum Tor.',
      },
      {
        title: 'Vor dem Tor: ganz nah',
        text: 'Vor dem Tor ist das Gegenüber gefährlich. Der Wächter bleibt ganz nah dran, auf der Abwehrseite. Der Schläger liegt im Passweg. An der Bande versuchen die anderen den Pass.',
      },
      {
        title: 'Pass abgefangen',
        text: 'Der Pass landet beim Schläger des Wächters. Jetzt haben wir den Puck – und der Wächter ist König.',
      },
    ],
    labels: [
      'Eigenes Drittel. Eins von den anderen hat den Puck an der rechten Bande, der Jäger steht davor. Ein zweites fährt ohne Puck aus dem hohen Slot zum Tor. Der Wächter fährt mit, ein blauer Fächer zeigt, dass der Wächter Gegenüber und Puck im Blick hat.',
      'Das Gegenüber steht vor dem Tor, der Wächter direkt daneben auf der Torseite, Schläger im Passweg. Von der Bande kommt der Pass zum Tor.',
      'Der Puck liegt beim Schläger des Wächters vor dem Tor.',
    ],
  },
  'goalie-rebound': {
    caption: 'Rüberschieben, abwehren, dem Puck folgen',
    steps: [
      {
        title: 'Der Pass quer',
        text: 'Der Torhüter steht auf der Linie zum Puck. Die anderen passen quer auf die andere Seite.',
      },
      {
        title: 'T-Push',
        text: 'Der Torhüter schaut dem Puck nach und stösst sich mit einem T-Push hinüber. So steht er wieder auf der Linie zum Puck, bevor der Schuss kommt.',
      },
      {
        title: 'Abpraller',
        text: 'Der Puck prallt vom Torhüter ab und liegt vor dem Tor. Der Torhüter schaut ihm nach. LD fährt hin.',
      },
      {
        title: 'Wieder bereit',
        text: 'Der Torhüter hat sich zum Puck gedreht und ist wieder bereit. LD spielt den Puck aus der Gefahrenzone in die Ecke.',
      },
    ],
    labels: [
      'Eigene Zone. Eins von den anderen hat den Puck links vor dem Bullykreis, ein zweites steht rechts. Unsere linke Verteidigerin steht zwischen ihrem Gegenüber und dem Tor. Der Puck geht quer nach rechts.',
      'Rechts haben jetzt die anderen den Puck. Unser Torhüter ist zur rechten Seite des Tores gerutscht. Von dort kommt der Schuss aufs Tor.',
      'Der Puck liegt nach dem Schuss links vor dem Tor. Unser Torhüter schaut zum Puck, unsere linke Verteidigerin fährt hin.',
      'Unsere linke Verteidigerin ist beim Puck und spielt ihn in die linke Ecke. Unser Torhüter steht wieder auf der Linie zum Puck.',
    ],
  },
  greeting: {
    caption: 'Vom Aufstellen bis zum ersten Bully',
    steps: [
      { title: 'Aufstellen und warten', text: 'Beide Mannschaften stehen auf ihrer blauen Linie, mit dem Gesicht zur anderen Mannschaft. Der Torhüter steht mit in der Reihe. Alle warten, bis die Schiedsrichter in ihrem Halbkreis an der Bande stehen.' },
      { title: 'Stock hoch, dann klopfen', text: 'Wenn die Schiedsrichter bereit sind, heben alle den Stock in Richtung der anderen Mannschaft. So grüsst man die andere Mannschaft. Danach klopfen alle mit dem Stock aufs Eis. Wann, zeigt der Kapitän: Die beiden Kapitäne haben es vorher abgemacht.' },
      { title: 'Die Kapitäne fahren los', text: 'Nur die beiden Kapitäne (C) fahren zur Mitte. Alle anderen bleiben ruhig auf der blauen Linie stehen.' },
      { title: 'Handschlag in der Mitte', text: 'Die Kapitäne geben sich die Hand. Dann fahren sie zusammen zu den Schiedsrichtern.' },
      { title: 'Handschlag mit den Schiedsrichtern', text: 'Die Kapitäne geben beiden Schiedsrichtern die Hand. Dann fahren beide Kapitäne zur Bank der anderen Mannschaft.' },
      { title: 'Handschlag mit dem Trainerteam', text: 'Beide Kapitäne geben dem Trainerteam der anderen Mannschaft die Hand und sagen: „Gutes Spiel!“ Dann fahren sie zurück zur eigenen Mannschaft.' },
      { title: 'Faust an Faust', text: 'Der Kapitän fährt an der Reihe entlang und gibt allen aus dem Team einen Fist Bump: Faust an Faust, mit Handschuh.' },
      { title: 'Ab zum eigenen Tor', text: 'Jetzt fährt die ganze Mannschaft zum eigenen Tor.' },
      { title: 'Der Kreis am Tor', text: 'Alle stehen eng im Kreis um den Torhüter. Es gibt ein paar letzte Worte, dann kommt der Teamruf. Danach bleiben die erste Reihe und der erste Torhüter auf dem Eis. Alle anderen fahren auf die Bank.' },
      { title: 'Türen zu, Spiel los', text: 'Die erste Reihe stellt sich zum Bully in der Mitte auf. Sind alle Türen der Spielerbänke zu, wirft der Schiedsrichter den Puck ein. Das Spiel beginnt.' },
    ],
    labels: [
      'Das ganze Eis. Unsere Mannschaft steht unten auf der blauen Linie, die andere Mannschaft oben auf ihrer blauen Linie. Beide Kapitäne stehen in der Mitte ihrer Reihe. Zwei Schiedsrichter fahren zu ihrem Halbkreis an der rechten Bande. Beide Spielerbänke liegen an der linken Bande.',
      'Die Schiedsrichter stehen in ihrem Halbkreis. Alle halten den Stock in Richtung der anderen Mannschaft.',
      'Die beiden Kapitäne fahren von ihrer blauen Linie zum Mittelkreis.',
      'Die Kapitäne stehen im Mittelkreis nebeneinander und fahren zu den Schiedsrichtern an der rechten Bande.',
      'Die Kapitäne stehen bei den Schiedsrichtern. Pfeile zeigen, wie beide Kapitäne zur Bank der anderen Mannschaft fahren.',
      'Unser Kapitän steht beim Trainerteam der anderen Mannschaft, der andere Kapitän bei unserem Trainerteam.',
      'Beide Kapitäne fahren vor der eigenen Reihe von links nach rechts an allen aus dem Team vorbei.',
      'Pfeile zeigen, wie jede Mannschaft zu ihrem eigenen Tor fährt.',
      'Jede Mannschaft steht im Kreis um ihren Torhüter vor dem eigenen Tor. Aus jeder Mannschaft fahren zwei zur Bank.',
      'Bully im Mittelkreis: Die beiden Center stehen sich gegenüber, der Schiedsrichter steht daneben. Pro Mannschaft sind sechs auf dem Eis, mit Torhüter; die anderen sind auf der Bank.',
    ],
  },
  'bubble-pass': {
    caption: 'Zeit und Raum gewinnen: Der Pass ist schneller',
    steps: [
      {
        title: 'Eingeklemmt',
        text: 'K hat den Puck an der Bande, zwei von den anderen sind nah. Die Blase ist winzig. Auf der anderen Seite steht S ganz frei. K passt.',
      },
      {
        title: 'Die Blase wandert mit',
        text: 'Jetzt hat S den Puck – und eine grosse Blase. Die anderen müssen quer über das Eis. Der Pass war viel schneller, als jemand fahren kann.',
      },
      {
        title: 'Freie Bahn',
        text: 'S nutzt die Zeit, fährt in den Slot und schiesst, bevor jemand da ist.',
      },
    ],
    labels: [
      'Angriffszone. K hat den Puck an der linken Bande, zwei von den anderen stehen nah bei K. Der Kreis um K ist klein. Ein gestrichelter Pfeil zeigt den Pass quer übers Eis zu S auf der rechten Seite.',
      'S hat den Puck, der Kreis ist jetzt gross und um S. Eins von den anderen fährt von links herüber, S fährt Richtung Tor.',
      'S steht mit dem Puck vor dem Tor und schiesst. Die anderen sind noch ein paar Meter weg.',
    ],
  },
  'bubble-shrink': {
    caption: 'Zeit und Raum wegnehmen: Lücke schliessen',
    steps: [
      {
        title: 'Grosse Blase',
        text: 'Eine Stürmerin von den anderen kommt mit dem Puck über die blaue Linie. Der Jäger ist weit weg: Sie hat etwa 2 Sekunden zum Schauen und für den Weg zum Tor. Der Jäger fährt schnell auf den Puck zu.',
      },
      {
        title: 'Die Blase schrumpft',
        text: 'Der Jäger ist nah dran, auf der Abwehrseite und etwas innen. Der Schläger zeigt zum Puck. Jetzt bleibt ihr weniger als eine Sekunde – und nur der Weg nach aussen.',
      },
      {
        title: 'Die Bande hilft',
        text: 'Der Puck ist an der Bande. Die Bande ist wie eine Wand: Auf dieser Seite ist gar kein Platz. Von hier droht kaum Gefahr.',
      },
    ],
    labels: [
      'Eigenes Drittel. Eine gegnerische Stürmerin hat den Puck an der linken blauen Linie, mit einem grossen Kreis drumherum. Der Jäger fährt entgegen.',
      'Der Jäger steht nah vor dem Puck, etwas zur Mitte hin, Schläger zum Puck. Der Kreis ist klein. Die Stürmerin weicht nach aussen zur Bande aus.',
      'Der Puck ist an der linken Bande neben dem Bullykreis, mit einem kleinen Kreis. Der Jäger steht innen daneben, Schläger zum Puck.',
    ],
    note: 'Der Jäger bremst kurz vorher ab. Wer mit vollem Tempo hineinfährt, wird leicht umfahren – und lässt hinter sich viel Platz.',
  },
  'close-lane': {
    caption: 'Zeit und Raum wegnehmen: Passweg zumachen',
    steps: [
      {
        title: 'Der Passweg ist offen',
        text: 'Der Jäger macht Druck auf die Stürmerin mit dem Puck. Ihre Blase ist klein. Aber auf der anderen Seite steht ein zweiter Stürmer frei. Ein Pass zu ihm, und er hätte viel Zeit. Der Wächter (W) sieht das.',
      },
      {
        title: 'Schläger in den Passweg',
        text: 'Der Wächter fährt in den Passweg, bleibt aber zwischen dem Stürmer und dem Tor. Der Schläger liegt auf dem Eis, genau dort, wo der Pass durch müsste. Dahinter ist der Passschatten: Dort kommt kein Pass an.',
      },
      {
        title: 'Kein Ausweg',
        text: 'Die Stürmerin findet keinen Pass mehr. Der Jäger drängt sie an die Bande. Ihre Blase ist fast weg.',
      },
    ],
    labels: [
      'Eigenes Drittel. Eine gegnerische Stürmerin hat den Puck an der linken Bande, der Jäger steht nah davor. Eine gepunktete Linie zeigt den freien Passweg zu einem zweiten Stürmer beim rechten Bullypunkt. Der Wächter fährt vom Tor nach oben.',
      'Der Wächter steht rechts vor dem Stürmer, Schläger in den Passweg. Hinter dem Schläger ist ein grauer Passschatten, der Stürmer steht darin.',
      'Der Puck ist an der linken Bande, der Jäger daneben, Schläger zum Puck. Der Kreis um den Puck ist sehr klein. Der Passweg nach rechts bleibt zu.',
    ],
  },
  'dump-change': {
    caption: 'Tief spielen und wechseln',
    steps: [
      {
        title: 'Endlich der Puck',
        text: 'Wir waren lange in der eigenen Zone. Alle sind müde. Jetzt hat C den Puck und fährt los, aber nicht weit: nur bis über die rote Linie.',
      },
      {
        title: 'Über Rot, in die Ecke',
        text: 'C ist über der roten Mittellinie. Von hier ist ein weiter Puck kein Icing. C schiesst ihn tief in die Ecke, an der Torhüterin vorbei.',
      },
      {
        title: 'Ab zur Bank',
        text: 'Die anderen müssen den Puck erst hinter ihrem Tor holen. Diese Zeit nutzen wir: Die drei müden Stürmer fahren mit Tempo zur Bank. LD und RD bleiben hinten.',
      },
      {
        title: 'Frische Beine',
        text: 'Kaum ist ein müder Stürmer an der Bande, springt ein frischer aufs Eis. Die neue Reihe hat volle Kraft und kann sofort Druck machen.',
      },
    ],
    labels: [
      'Das ganze Eis im 2. Drittel, unsere Bank an der linken Bande in der gegnerischen Hälfte. Drei frische Stürmer warten auf der Bank. In unserer Zone hat C den Puck, um ihn herum drei von den anderen. Ein Pfeil zeigt: C fährt mit dem Puck bis zur roten Mittellinie.',
      'C steht knapp hinter der roten Mittellinie. Ein gestrichelter Pfeil zeigt den Schuss tief in die rechte Ecke der gegnerischen Zone. Die anderen Stürmer von uns sind in der neutralen Zone, LD und RD an unserer blauen Linie.',
      'Der Puck liegt in der rechten Ecke hinter dem gegnerischen Tor, ein Verteidiger der anderen fährt hin. Pfeile zeigen: Unsere drei Stürmer fahren zur Bank, gleich neben ihnen.',
      'Die drei müden Stürmer sitzen auf der Bank. Drei frische Stürmer sind auf dem Eis und fahren in die gegnerische Zone. LD und RD stehen an der roten Mittellinie.',
    ],
    note: 'Nach einem tiefen Puck dürfen auch beide Verteidiger wechseln: Bis die anderen wieder vor unserem Tor sind, dauert es lange.',
  },
  delay: {
    caption: 'Verzögern: Zeit für das Team',
    steps: [
      {
        title: 'Allein vorne',
        text: 'K kommt mit dem Puck allein in die Angriffszone. Drei von den anderen warten, der Rest von uns ist noch an der blauen Linie. K fährt nicht allein in die Abwehr, sondern dreht an der Bande ab.',
      },
      {
        title: 'Puck behalten',
        text: 'K hat abgedreht und schaut wieder zum Spiel. Der Puck ist noch da. Das Team hat jetzt Zeit, nachzukommen und freies Eis zu suchen.',
      },
      {
        title: 'Jetzt der Pass',
        text: 'Beide Satelliten sind da: einer oben im Slot, einer am langen Pfosten. Die Blase von K wird klein, aber jetzt braucht K sie nicht mehr: Der Pass geht in den Slot.',
      },
    ],
    labels: [
      'Angriffszone. K fährt mit dem Puck an der linken Seite in die Zone. Drei von den anderen sind vor dem Tor, eins fährt auf K zu. Zwei von uns sind noch an der blauen Linie. Pfeile zeigen: K fährt zur Bande und dreht nach oben ab, die beiden fahren nach.',
      'K steht an der linken Bande mit dem Gesicht zum Spiel und wird verfolgt. Die beiden Satelliten sind in der Zone und fahren weiter: einer in den Slot, einer zum rechten Pfosten.',
      'Ein Satellit steht oben im Slot, einer rechts am Tor. Das Gegenüber ist nah bei K. K passt quer in den Slot.',
    ],
  },
  'split-d': {
    caption: 'Ohne Puck Platz machen: zwischen der Verteidigung durch',
    steps: [
      {
        title: 'Zwei gegen zwei',
        text: 'K kommt mit dem Puck über die blaue Linie, S fährt in der Mitte mit. Bei den anderen verteidigen eine Verteidigerin und ein Verteidiger. S fährt ohne Puck zwischen den beiden hindurch, direkt zum Tor.',
      },
      {
        title: 'Die Abwehr muss entscheiden',
        text: 'Wer nimmt S? Die Verteidigerin fährt mit S zum Tor, der Verteidiger bleibt in der Mitte. Bei K ist niemand mehr. Die Blase von K ist gross.',
      },
      {
        title: 'Platz für den Schuss',
        text: 'K fährt in den freien Platz und schiesst. S steht vor dem Tor: Im Tor ist der Puck schlecht zu sehen, und ein Abpraller landet bei S.',
      },
    ],
    labels: [
      'Angriffszone. K kommt mit dem Puck an der linken Seite über die blaue Linie, S in der Mitte. Verteidigerin und Verteidiger der anderen stehen vor den Bullykreisen. Ein Pfeil zeigt, wie S zwischen den beiden hindurch zum Tor fährt.',
      'S steht vor dem Tor, die Verteidigerin ist mitgefahren, der Verteidiger steht rechts davon. K ist links allein, mit einem grossen Kreis.',
      'K steht links neben dem Bullykreis und schiesst aufs Tor. S steht vor dem Tor.',
    ],
    note: 'Bleiben beide bei K, ist S vor dem Tor frei. Dann kommt der Pass zu S.',
  },
};

const en: typeof de = {
  'role-switch': {
    caption: 'Puck lost: the roles switch',
    steps: [
      {
        title: 'We have the puck',
        text: 'K is the König and passes to the Satellit low on the boards. But an opponent is in the passing lane.',
      },
      {
        title: 'Puck lost – new roles',
        text: 'The opponent picks off the pass. Straight away everyone has a new role: the former König is closest and already between the puck and our goal, and becomes the Jäger (J). Everyone else becomes a Wächter (W).',
      },
      {
        title: 'Everyone on the defensive side',
        text: 'The Jäger puts on pressure, stick pointing at the puck. Each Wächter stands between an opponent and our goal. Our goal is at the bottom, beyond the blue line.',
      },
    ],
    labels: [
      'Attacking zone. The König has the puck on the left boards and passes low along the boards. An opponent is in the passing lane.',
      'The opponent has picked off the pass. Our players are now called J and W. Arrows show each one skating between an opponent and our goal.',
      'The Jäger is in front of the opponent with the puck, stick on the puck. The four Wächter each stand between an opponent and the blue line.',
    ],
  },
  scan: {
    caption: 'Scanning: look before the puck arrives',
    steps: [
      {
        title: 'Over the shoulder',
        text: 'The defender has the puck behind the goal. The winger on the boards first looks over their shoulder towards the middle and sees: an opponent is coming straight at them. The centre in the middle is open.',
      },
      {
        title: 'To the puck',
        text: 'Then the winger looks at the puck and takes the pass, already knowing where the opponent is and who is open.',
      },
      {
        title: 'Play it straight away',
        text: 'Now the winger is the König and doesn’t need to search: the puck goes straight to the open centre, before the opponent gets there.',
      },
      {
        title: 'On we go',
        text: 'The centre is the new König and skates out of the zone with speed. The opponent is too late.',
      },
    ],
    labels: [
      'Our zone. The defender has the puck behind the goal. A blue fan shows the winger on the left boards looking over their shoulder towards the middle. An opponent is skating at them, the centre is open.',
      'The blue fan now points from the winger to the puck. The defender passes to the winger.',
      'The winger has the puck, looks at the centre and passes straight away. The opponent is still a few metres away.',
      'The centre has the puck and skates towards the blue line.',
    ],
    note: 'The blue fan shows where the player is looking.',
  },
  'pass-shadow': {
    caption: 'Get out of the passing shadow',
    steps: [
      {
        title: 'Hidden',
        text: 'The Satellit is standing behind an opponent. The grey area is the passing shadow: every pass there hits the opponent. For the König, the Satellit is invisible.',
      },
      {
        title: 'A couple of strides',
        text: 'The Satellit skates a few metres to the side, until the König’s blade comes into view.',
      },
      {
        title: 'Open',
        text: 'Now the passing lane is open. The König can pass, and the Satellit is in the slot, ready to shoot.',
      },
    ],
    labels: [
      'Attacking zone. The König has the puck on the left boards. An opponent stands in the slot. Right behind that opponent, in a grey area, stands a Satellit.',
      'The Satellit skates out of the grey area up into the high slot.',
      'The Satellit is open in the high slot. The König passes to the Satellit, past the opponent.',
    ],
  },
  'net-drive': {
    caption: 'Driving to the net makes space',
    steps: [
      {
        title: 'The Satellit goes',
        text: 'The König has the puck on the boards. In the slot an opponent is marking our Satellit. The Satellit drives to the net, and the opponent has to follow.',
      },
      {
        title: 'Space in the slot',
        text: 'The opponent is now in front of the goal. The slot is open ice (green). The König skates into it with the puck.',
      },
      {
        title: 'Shot',
        text: 'The König shoots from the slot. The Satellit in front of the goal blocks the goalie’s view and is ready for the rebound.',
      },
    ],
    labels: [
      'Attacking zone. The König has the puck on the left boards. A Satellit in the slot drives to the net, and the opponent follows.',
      'The Satellit and the opponent are in front of the goal. A green area in the slot is open. The König skates into it with the puck.',
      'The König shoots from the slot. The Satellit stands in front of the goalie.',
    ],
  },
  'guard-tight': {
    caption: 'Wächter: the closer to the goal, the tighter',
    steps: [
      {
        title: 'Far from the goal: some space',
        text: 'The opponent without the puck is high in the slot. The Wächter stands between the opponent and the goal, with some space, and can see both the opponent and the puck. Now the opponent skates to the goal.',
      },
      {
        title: 'In front of the goal: very close',
        text: 'In front of the goal the opponent is dangerous. The Wächter stays very close, on the defensive side, stick in the passing lane. The opponent on the boards tries the pass.',
      },
      {
        title: 'Pass picked off',
        text: 'The pass ends up on the Wächter’s stick. Now we have the puck – and the Wächter is the König.',
      },
    ],
    labels: [
      'Our zone. An opponent with the puck on the right boards, the Jäger in front. Another opponent without the puck skates from the high slot to the goal. The Wächter goes along; a blue fan shows the Wächter can see both the opponent and the puck.',
      'The opponent is in front of the goal, the Wächter right next to them on the goal side, stick in the passing lane. The opponent on the boards passes towards the goal.',
      'The puck lies at the Wächter’s stick in front of the goal.',
    ],
  },
  'goalie-rebound': {
    caption: 'Push across, save, follow the puck',
    steps: [
      {
        title: 'The pass across',
        text: 'The goalie stands on the line to the puck. The opponent passes across to the other side.',
      },
      {
        title: 'T-push',
        text: 'The goalie follows the puck with their eyes and pushes across with a T-push. They are back on the line to the puck before the shot comes.',
      },
      {
        title: 'Rebound',
        text: 'The puck bounces off the goalie and lies in front of the goal. The goalie keeps watching it. LD skates to it.',
      },
      {
        title: 'Ready again',
        text: 'The goalie has turned to the puck and is ready again. LD plays the puck out of the danger zone into the corner.',
      },
    ],
    labels: [
      'Own zone. An opponent with the puck on the left in front of the faceoff circle, a second opponent on the right. Our left defender stands between the left opponent and the goal. The puck carrier passes across to the right.',
      'The right opponent has the puck. Our goalie has moved to the right side of the goal. The opponent shoots at them.',
      'After the shot the puck lies on the left in front of the goal. Our goalie looks at the puck, our left defender skates to it.',
      'Our left defender has the puck and plays it into the left corner. Our goalie is back on the line to the puck.',
    ],
  },
  greeting: {
    caption: 'From the line-up to the first face-off',
    steps: [
      { title: 'Line up and wait', text: 'Both teams stand on their blue line, facing the other team. The goalie stands in the line too. Everyone waits until the referees are standing in their half circle on the boards.' },
      { title: 'Sticks up, then tap', text: 'When the referees are ready, everyone raises their stick towards the other team. That is how you greet them. Then everyone taps their stick on the ice. The captain shows when: the two captains agreed on it beforehand.' },
      { title: 'The captains set off', text: 'Only the two captains (C) skate to the middle. Everyone else stays still on the blue line.' },
      { title: 'Handshake in the middle', text: 'The captains shake hands. Then they skate together to the referees.' },
      { title: 'Handshake with the referees', text: 'The captains shake hands with both referees. Then each captain skates to the other team’s bench.' },
      { title: 'Handshake with the coaches', text: 'Each captain shakes hands with the other team’s coaches and says: “Have a good game!” Then they skate back to their own team.' },
      { title: 'Fist bumps', text: 'The captain skates along the line and gives every teammate a fist bump: fist to fist, gloves on.' },
      { title: 'Off to our net', text: 'Now the whole team skates to its own net.' },
      { title: 'The huddle at the net', text: 'Everyone stands close in a circle around the goalie. There are a few last words, then the team chant. After that the first line and the first goalie stay on the ice. Everyone else goes to the bench.' },
      { title: 'Doors shut, game on', text: 'The first line sets up for the face-off in the middle. When all the bench doors are shut, the referee drops the puck. The game begins.' },
    ],
    labels: [
      'The whole rink. Our team stands on the blue line at the bottom, the opponents on their blue line at the top. Both captains stand in the middle of their line. Two referees skate to their half circle on the right boards. Both benches are on the left boards.',
      'The referees stand in their half circle. Every player holds their stick out towards the other team.',
      'The two captains skate from their blue line to the centre circle.',
      'The captains stand side by side in the centre circle and skate to the referees on the right boards.',
      'The captains stand with the referees. Arrows show each captain skating to the other team’s bench.',
      'Our captain stands with the opponents’ coaches, their captain with our coaches.',
      'Each captain skates along the front of their line from left to right, past every teammate.',
      'Arrows show each team skating to its own net.',
      'Each team stands in a circle around its goalie in front of its own net. Two players from each team skate to the bench.',
      'Face-off in the centre circle: the two centres face each other, the referee stands next to them. Five players and a goalie per team are on the ice, the rest on the bench.',
    ],
  },
  'bubble-pass': {
    caption: 'Gaining time and space: the pass is faster',
    steps: [
      {
        title: 'Hemmed in',
        text: 'K has the puck on the boards, with two opponents close by. The bubble is tiny. On the other side, S is completely free. K passes.',
      },
      {
        title: 'The bubble travels with the puck',
        text: 'Now S has the puck – and a big bubble. The opponents have to cross the whole ice. The pass was much faster than they can skate.',
      },
      {
        title: 'A clear path',
        text: 'S uses the time, skates into the slot and shoots before an opponent arrives.',
      },
    ],
    labels: [
      'Attacking zone. K has the puck on the left boards, two opponents are close to K. The circle around K is small. A dashed arrow shows the pass across the ice to S on the right.',
      'S has the puck, and the circle is now big and around S. An opponent skates across from the left, S skates towards the goal.',
      'S is in front of the goal with the puck and shoots. The opponents are still a few metres away.',
    ],
  },
  'bubble-shrink': {
    caption: 'Taking time and space away: closing the gap',
    steps: [
      {
        title: 'Big bubble',
        text: 'An opponent brings the puck over the blue line. The Jäger is far away: the opponent has about 2 seconds to look and head for the goal. The Jäger skates towards them quickly.',
      },
      {
        title: 'The bubble shrinks',
        text: 'The Jäger is close, on the defensive side and a little inside. The stick points at the puck. The opponent has less than a second left – and only the way wide.',
      },
      {
        title: 'The boards help',
        text: 'The opponent is on the boards. The boards are like a wall: on that side they have no room at all. From here they are hardly dangerous.',
      },
    ],
    labels: [
      'Our zone. An opponent with the puck at the left blue line has a big circle around them. The Jäger skates towards them.',
      'The Jäger is close in front of the opponent, a little towards the middle, stick to the puck. The circle around the opponent is small. The opponent goes wide towards the boards.',
      'The opponent is on the left boards next to the faceoff circle, with a small circle. The Jäger is inside next to them, stick to the puck.',
    ],
    note: 'The Jäger slows down just before reaching the opponent. Anyone who charges in at full speed is easy to skate around – and leaves lots of room behind them.',
  },
  'close-lane': {
    caption: 'Taking time and space away: closing the passing lane',
    steps: [
      {
        title: 'The lane is open',
        text: 'The Jäger presses the opponent with the puck. Their bubble is small. But on the other side an opponent is free. One pass there and they would have lots of time. The Wächter (W) sees it.',
      },
      {
        title: 'Stick in the lane',
        text: 'The Wächter moves into the passing lane but stays between their opponent and the goal. Their stick is on the ice, exactly where the pass would have to go. Behind it is the passing shadow: no pass gets there.',
      },
      {
        title: 'No way out',
        text: 'The opponent with the puck finds no pass. The Jäger pushes them to the boards. Their bubble is almost gone.',
      },
    ],
    labels: [
      'Our zone. An opponent has the puck on the left boards, the Jäger is close in front of them. A dotted line shows the open passing lane to an opponent at the right faceoff dot. The Wächter skates up from the goal.',
      'The Wächter stands in front of the opponent on the right, stick in the passing lane. Behind the stick is a grey passing shadow, and the opponent stands in it.',
      'The opponent with the puck is on the left boards, the Jäger next to them, stick to the puck. The circle around the opponent is very small. The lane to the right stays closed.',
    ],
  },
  'dump-change': {
    caption: 'Dump and change',
    steps: [
      {
        title: 'Finally the puck',
        text: 'We have been stuck in our own zone for a long time. Everyone is tired. Now C has the puck and sets off, but not far: just over the red line.',
      },
      {
        title: 'Over the red line, into the corner',
        text: 'C is past the centre red line. From here a long puck is not icing. C shoots it deep into the corner, away from the goalie.',
      },
      {
        title: 'Off to the bench',
        text: 'The opponents first have to fetch the puck from behind their goal. We use that time: the three tired forwards skate hard to the bench. LD and RD stay back.',
      },
      {
        title: 'Fresh legs',
        text: 'As soon as a tired forward reaches the boards, a fresh one jumps on. The new line has full energy and can put on pressure straight away.',
      },
    ],
    labels: [
      'The whole rink in period 2, our bench on the left boards in the opponents’ half. Three fresh forwards wait on the bench. In our zone C has the puck, with three opponents around. An arrow shows C carrying the puck up to the centre red line.',
      'C is just past the centre red line. A dashed arrow shows the shot deep into the right corner of the opponents’ zone. Our other forwards are in the neutral zone, LD and RD at our blue line.',
      'The puck is in the right corner behind the opponents’ goal, one of their defenders skates over. Arrows show our three forwards skating to the bench, right next to them.',
      'The three tired forwards sit on the bench. Three fresh forwards are on the ice, skating into the opponents’ zone. LD and RD stand at the centre red line.',
    ],
    note: 'After a deep puck, both defenders may change too: it takes a long time before the opponents are back at our goal.',
  },
  delay: {
    caption: 'Slowing down: time for the teammates',
    steps: [
      {
        title: 'Alone up front',
        text: 'K brings the puck into the attacking zone alone. Three opponents are waiting, the teammates are still at the blue line. K doesn’t skate into the opponents alone but turns away on the boards.',
      },
      {
        title: 'Keep the puck',
        text: 'K has turned and faces the play again. The puck is still there. The teammates now have time to catch up and find open ice.',
      },
      {
        title: 'Now the pass',
        text: 'Both teammates have arrived, one high in the slot, one at the far post. K’s bubble gets small, but K doesn’t need it any more: K passes into the slot.',
      },
    ],
    labels: [
      'Attacking zone. K skates into the zone on the left with the puck. Three opponents are in front of the goal, one skates towards K. Two teammates are still at the blue line. Arrows show K skating to the boards and turning back up, and the teammates following.',
      'K stands on the left boards facing the play. An opponent follows. The teammates are in the zone and keep going: one to the slot, one to the right post.',
      'One teammate is high in the slot, one on the right at the goal. The opponent is close to K. K passes across into the slot.',
    ],
  },
  'split-d': {
    caption: 'Making space without the puck: between the defenders',
    steps: [
      {
        title: 'Two on two',
        text: 'K brings the puck over the blue line, S comes along in the middle. Two opponents defend. S skates between them without the puck, straight to the net.',
      },
      {
        title: 'The opponents have to decide',
        text: 'Who takes S? One opponent follows S to the net, the other stays in the middle. Nobody is with K any more. K’s bubble is big.',
      },
      {
        title: 'Room to shoot',
        text: 'K skates into the free space and shoots. S is in front of the net: the goalie can hardly see the puck, and a rebound lands with S.',
      },
    ],
    labels: [
      'Attacking zone. K brings the puck over the blue line on the left, S is in the middle. Two opponents stand in front of the faceoff circles. An arrow shows S skating between the two opponents to the net.',
      'S is in front of the net, one opponent has followed, the other stands to the right. K is alone on the left, with a big circle.',
      'K stands to the left of the faceoff circle and shoots at the goal. S is in front of the net.',
    ],
    note: 'If both opponents stay with K, S is free in front of the net. Then the pass goes to S.',
  },
};

export const sequenceText = { de, en };
