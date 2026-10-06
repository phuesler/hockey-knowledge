/**
 * Game situations told in steps, played by RinkStory.svelte. Each step says where
 * everyone stands (rink metres, see rink.ts); RinkStory slides the players from one
 * step to the next and draws an arrow along the way each of them came.
 *
 * Players keep their `id` across steps so they can slide. A `badge` is the animal
 * role of a player (see `animals`); it may change from one step to the next.
 */
import { DANGER_ZONE, type Area, type Move, type Pt, type View } from './rink';

export const animals = { dog: '🐕', fox: '🦊', hawk: '🦅', cheetah: '🐆' } as const;
export type Animal = keyof typeof animals;

interface StoryPlayer {
  id: string;
  team: 'us' | 'them';
  label?: string;
  at: Pt;
  /** A point the player curves past on the way into this step, e.g. a swing. */
  via?: Pt;
  badge?: Animal;
}

export interface StoryStep {
  players: StoryPlayer[];
  puck: Pt;
  /** The player who skates with the puck into this step: their arrow is wavy. */
  carrier?: string;
  /** A point the puck curves past on the way into this step; by default it follows a curving carrier. */
  puckVia?: Pt;
  /** Arrows and lines on top of the ones RinkStory draws from the previous step. */
  moves?: Move[];
  areas?: Area[];
}

export interface Story {
  /** own: our goal at the bottom; attack: the opponents' goal at the top (flipped). */
  zone: 'own' | 'attack';
  view?: View;
  steps: StoryStep[];
}

const house: Area = { kind: 'danger', poly: DANGER_ZONE };

const us = (id: string, at: Pt, badge?: Animal): StoryPlayer => ({ id, team: 'us', label: id, at, badge });
/** One of ours who curves past `via` on the way to `at`. */
const curving = (id: string, via: Pt, at: Pt): StoryPlayer => ({ id, team: 'us', label: id, at, via });
const them = (id: string, at: Pt): StoryPlayer => ({ id, team: 'them', at });

/* Forecheck in the attacking zone. We face the goal, so our LW is at positive x
   (see rink.ts). o1 and o2 are the opponents' defenders, o3–o5 their forwards. */
const doors = {
  boards: [[10.6, 3.2], [14.4, 7.5], [13.6, 14.5]],
  middle: [[9.2, 3.6], [1.5, 10.5]],
  behind: [[9.6, 2], [4, 0.9], [-6.5, 2.8]],
} as const;

const forecheckStart = [them('o1', [10, 2.4]), them('o2', [-6.5, 2.8]), them('o3', [13.6, 14.5]), them('o4', [1.5, 10.5]), them('o5', [-12.5, 14])];

/* Attacking zone, our left at positive x: the opponents for the half-wall stories.
   o1/o2 their defenders, o3 the winger on our LD, o4 their centre, o5 the other winger. */
const halfwallThem = [them('o1', [4.5, 6]), them('o2', [-3.5, 6]), them('o3', [7.4, 17.6]), them('o4', [1, 12]), them('o5', [-7, 16])];
const crossThem = [them('o1', [4.5, 5.4]), them('o2', [-3, 6]), them('o4', [2, 12]), them('o5', [-7, 16])];
/* The cycle: o1 (their defender on our side) moves, the others stay put. */
const cycleThem = [them('o2', [-2, 6.6]), them('o3', [8.5, 17.5]), them('o4', [-1, 9.6]), them('o5', [-8, 16])];

/* Gegenlaufen: the scene shared by the stories where LD has the puck behind our goal.
   o1 chases LD round the back of the goal, o2 stands high near LW. */
const gegenStart = [them('o1', [2.4, 1.2]), them('o2', [-9, 23.6]), them('o3', [3, 17]), us('C', [0, 13]), us('RD', [5, 3])];
const gegenThem = (late = false) => [them('o1', late ? [-6.8, 3] : [-3.6, 1.8]), them('o2', [-9, 23.6]), them('o3', [3, 17])];
const gegenUs = [us('C', [0, 13]), us('RD', [5, 3])];
const gegenUsLate = [us('C', [-2, 20]), us('RD', [5, 3])];
const gegenLane: Move = { kind: 'lane', path: [[-7.3, 2.3], [-9.9, 18.8]] };
/* LD passes while LW is still skating towards them. */
const gegenPass: StoryStep = {
  players: [...gegenThem(true), us('LD', [-9.5, 4.6]), us('LW', [-10.3, 12.2]), ...gegenUs],
  puck: [-10.4, 10.9],
  moves: [{ kind: 'pass', path: [[-10, 5.8], [-10.4, 10.9]], trim: 0.7 }],
};
/* Give-and-go: the opponents apart from the forechecker. */
const giveThem = [them('o2', [-6.4, 25.6]), them('o3', [4, 18])];
/* Drop pass: everyone apart from LD, C and the opponent coming at LD. */
const dropThem = [them('o2', [10, 28.4])];
const dropUs = [us('LW', [-13.2, 26.4]), us('RW', [12.5, 17]), us('RD', [7.4, 3.6])];

/* Opponents who have collapsed in front of their own goal ("eingeigelt"). */
const turtleThem = [them('o1', [3.6, 8.2]), them('o2', [-4, 6]), them('o3', [5.6, 11.4]), them('o4', [0.6, 10.8]), them('o5', [-6.4, 10])];
const turtleOpenHigh: Area[] = [
  { kind: 'open', ellipse: { at: [8.6, 18.6], rx: 3.4, ry: 2.4 } },
  { kind: 'open', ellipse: { at: [-8.6, 18.6], rx: 3.4, ry: 2.4 } },
];

/* collapse-expand: the opponents after both wingers came out to the points. */
const expandThem = [them('o1', [3.6, 8.2]), them('o2', [-4, 6]), them('o3', [10.4, 16.6]), them('o4', [-3.4, 11.6]), them('o5', [-8.6, 16.6])];
const expandUs = () => [us('LW', [13.2, 12]), us('RW', [-1.4, 7]), us('LD', [9.5, 20.5]), us('RD', [-9, 20.5])];

const geometry = {
  'forecheck-roles': {
    zone: 'attack',
    steps: [
      {
        players: [...forecheckStart, us('LW', [7, 11]), us('C', [1, 17]), us('RW', [-6, 16]), us('LD', [8, 21]), us('RD', [-8, 21])],
        puck: [9.2, 3.6],
        areas: [
          { kind: 'gap', ellipse: { at: [13.6, 9.4], rx: 1.2, ry: 1.2 }, label: '1' },
          { kind: 'gap', ellipse: { at: [5.3, 7.1], rx: 1.2, ry: 1.2 }, label: '2' },
          { kind: 'gap', ellipse: { at: [4.2, 1.7], rx: 1.2, ry: 1.2 }, label: '3' },
        ],
        moves: [
          { kind: 'lane', path: doors.boards },
          { kind: 'lane', path: doors.middle },
          { kind: 'lane', path: doors.behind },
        ],
      },
      {
        players: [...forecheckStart, us('LW', [9.8, 5], 'dog'), us('C', [12.8, 9], 'fox'), us('RW', [0, 14.6], 'hawk'), us('LD', [8, 21]), us('RD', [-8, 21])],
        puck: [9.2, 3.6],
        areas: [{ kind: 'gap', ellipse: { at: [4.2, 1.7], rx: 1.2, ry: 1.2 }, label: '3' }],
        moves: [{ kind: 'lane', path: doors.behind }],
      },
      {
        players: [...forecheckStart, us('LW', [9.8, 5], 'dog'), us('C', [12.8, 9], 'fox'), us('RW', [0, 14.6], 'hawk'), us('LD', [8, 21]), us('RD', [-8, 21])],
        puck: [-6.2, 4.1],
        moves: [{ kind: 'pass', team: 'them', path: [[9.6, 2], [3, 0.4], [-6.2, 4.1]], trim: 0.7 }],
      },
      {
        players: [
          them('o1', [10, 2.4]), them('o2', [-9.8, 2.6]), them('o3', [13.6, 14.5]), them('o4', [1.5, 10.5]), them('o5', [-12.5, 14]),
          us('LW', [-12.6, 9.4], 'fox'), us('C', [0, 14.6], 'hawk'), us('RW', [-8.8, 5.4], 'dog'), us('LD', [8, 21]), us('RD', [-8, 21]),
        ],
        puck: [-9, 3.8],
        carrier: 'o2',
      },
      {
        players: [
          them('o1', [10, 2.4]), them('o2', [-9.8, 2.6]), them('o3', [13.6, 14.5]), them('o4', [1.5, 10.5]), them('o5', [-12.5, 14]),
          us('LW', [-12.6, 9.4], 'fox'), us('C', [-2, 7.2], 'hawk'), us('RW', [-8.8, 5.4], 'dog'), us('LD', [8, 21]), us('RD', [-8, 21]),
        ],
        puck: [-11.6, 10.7],
        moves: [
          { kind: 'pass', team: 'them', path: [[-9.4, 3.6], [-14, 6], [-11.8, 10.3]], trim: 0.6 },
          { kind: 'pass', path: [[-11.4, 10.6], [-2, 7.2]], trim: 1.6 },
        ],
      },
    ],
  },

  /* Backcheck on the full rink, our goal at the bottom, after the DEB's drawing. The
     opponents won the puck in our attacking zone. */
  backcheck: {
    zone: 'own',
    view: 'full',
    steps: [
      {
        players: [
          them('o1', [6, 50]), them('o2', [-11, 47]), them('o3', [11.5, 44]),
          us('LW', [-9, 54], 'dog'), us('C', [-1, 55], 'fox'), us('RW', [3, 45], 'hawk'), us('LD', [-7, 38]), us('RD', [7, 38]),
        ],
        puck: [6.4, 48.6],
        areas: [house],
      },
      {
        players: [
          them('o1', [6.8, 41]), them('o2', [-11.5, 38]), them('o3', [12, 36]),
          us('LW', [-3, 44], 'cheetah'), us('C', [1, 45.5], 'cheetah'), us('RW', [4, 37.5], 'hawk'), us('LD', [-6.6, 31]), us('RD', [7.2, 31]),
        ],
        puck: [7.2, 39.6],
        carrier: 'o1',
        areas: [house],
      },
      {
        players: [
          them('o1', [8.6, 30]), them('o2', [-12, 28]), them('o3', [12.5, 26.5]),
          us('LW', [-3.2, 29], 'cheetah'), us('C', [0.6, 32.5], 'cheetah'), us('RW', [4.2, 27], 'hawk'), us('LD', [-6.4, 22.5]), us('RD', [7.4, 22.5]),
        ],
        puck: [8.4, 28.6],
        carrier: 'o1',
        areas: [house],
      },
      {
        players: [
          them('o1', [9, 18]), them('o2', [-11, 17]), them('o3', [6.5, 24]),
          us('LW', [-2.5, 8], 'cheetah'), us('C', [1.8, 11.5], 'cheetah'), us('RW', [5, 19.5], 'hawk'), us('LD', [-8, 13]), us('RD', [6.8, 13.5]),
        ],
        puck: [8.6, 16.6],
        carrier: 'o1',
        areas: [house],
      },
    ],
  },
  /* Gegenlaufen in our zone, our left at negative x. LD has the puck behind our goal, LW
     comes down from the blue line. The receiver never stops: they swing to the outside
     (towards the boards) or to the inside, before or after the pass. */
  'swing-out-pass': {
    zone: 'own',
    view: 'half',
    steps: [
      { players: [...gegenStart, us('LD', [-6, 2.6]), us('LW', [-10.2, 20.4])], puck: [-7.3, 2.3], moves: [gegenLane] },
      { players: [...gegenThem(), us('LD', [-9.5, 4.6]), us('LW', [-9.8, 14]), ...gegenUs], puck: [-10, 5.8], carrier: 'LD' },
      { players: [...gegenThem(true), us('LD', [-9.5, 4.6]), curving('LW', [-10.2, 6.4], [-13.4, 12.4]), ...gegenUs], puck: [-10, 5.8] },
      {
        players: [...gegenThem(true), us('LD', [-9.5, 4.6]), us('LW', [-13.3, 16.8]), ...gegenUs],
        puck: [-11.8, 17.4],
        moves: [{ kind: 'pass', path: [[-10, 5.8], [-11.8, 17.4]], trim: 0.7 }],
      },
      { players: [...gegenThem(true), us('LD', [-9.5, 4.6]), us('LW', [-12.6, 26]), ...gegenUsLate], puck: [-12.4, 27.3], carrier: 'LW' },
    ],
  },

  'pass-swing-out': {
    zone: 'own',
    view: 'half',
    steps: [
      { players: [...gegenStart, us('LD', [-6, 2.6]), us('LW', [-10.2, 20.4])], puck: [-7.3, 2.3], moves: [gegenLane] },
      { players: [...gegenThem(), us('LD', [-9.5, 4.6]), us('LW', [-10, 15.4]), ...gegenUs], puck: [-10, 5.8], carrier: 'LD' },
      gegenPass,
      { players: [...gegenThem(true), us('LD', [-9.5, 4.6]), curving('LW', [-11.2, 5.6], [-13.4, 13.6]), ...gegenUs], puck: [-13.2, 14.9], carrier: 'LW' },
      { players: [...gegenThem(true), us('LD', [-9.5, 4.6]), us('LW', [-12.6, 25]), ...gegenUsLate], puck: [-12.4, 26.3], carrier: 'LW' },
    ],
  },

  'pass-swing-in': {
    zone: 'own',
    view: 'half',
    steps: [
      { players: [...gegenStart, us('LD', [-6, 2.6]), us('LW', [-10.2, 20.4])], puck: [-7.3, 2.3], moves: [gegenLane] },
      { players: [...gegenThem(), us('LD', [-9.5, 4.6]), us('LW', [-10, 15.4]), ...gegenUs], puck: [-10, 5.8], carrier: 'LD' },
      gegenPass,
      { players: [...gegenThem(true), us('LD', [-9.5, 4.6]), curving('LW', [-9.2, 5.6], [-5.8, 13.6]), ...gegenUs], puck: [-5.6, 14.9], carrier: 'LW' },
      { players: [...gegenThem(true), us('LD', [-9.5, 4.6]), us('LW', [-5, 24.4]), us('C', [2, 20]), us('RD', [5, 3])], puck: [-4.9, 25.7], carrier: 'LW' },
    ],
  },

  /* Swing to the inside, then the pass: RW comes down towards RD, curls towards the
     middle and takes the pass in the curve, already facing up the ice. */
  'swing-in-pass': {
    zone: 'own',
    view: 'half',
    steps: [
      {
        players: [them('o1', [-1, 15]), them('o2', [9, 28.5]), them('o3', [-6, 24]), us('RD', [4.6, 10]), us('RW', [11.5, 26.6]), us('C', [-3, 20]), us('LD', [-5, 6])],
        puck: [4.8, 11.3],
      },
      {
        players: [them('o1', [-1, 15]), them('o2', [10, 24]), them('o3', [-6, 24]), us('RD', [4.6, 10]), us('RW', [11.6, 19.4]), us('C', [-3, 20]), us('LD', [-5, 6])],
        puck: [4.8, 11.3],
      },
      {
        players: [them('o1', [-1, 15]), them('o2', [10.6, 22.6]), them('o3', [-6, 24]), us('RD', [4.6, 10]), curving('RW', [11.2, 11.6], [7.4, 17.6]), us('C', [-3, 20]), us('LD', [-5, 6])],
        puck: [7, 18.9],
        moves: [{ kind: 'pass', path: [[4.8, 11.3], [7, 18.9]], trim: 0.6 }],
      },
      {
        players: [them('o1', [-1, 15]), them('o2', [10.6, 22.6]), them('o3', [-6, 24]), us('RD', [4.6, 10]), us('RW', [5.5, 27.2]), us('C', [-3, 20]), us('LD', [-5, 6])],
        puck: [5.4, 28.5],
        carrier: 'RW',
      },
    ],
  },

  /* Swing across in front of the puck carrier: LD carries out of the corner, an
     opponent sticks to LW on the boards. LW swings in front of LD to the far side and
     takes the pass there, away from the opponent. */
  'swing-across': {
    zone: 'own',
    view: 'half',
    steps: [
      {
        players: [them('o1', [-6, 2]), them('o2', [-10.4, 23.6]), them('o3', [5, 19]), us('LD', [-10, 3.6]), us('LW', [-12.4, 20]), us('C', [3.4, 10.6]), us('RD', [5, 3])],
        puck: [-10.6, 4.6],
      },
      {
        players: [them('o1', [-8.6, 4.4]), them('o2', [-11, 21]), them('o3', [5, 19]), us('LD', [-10.4, 8]), us('LW', [-11.8, 15.6]), us('C', [3.4, 10.6]), us('RD', [5, 3])],
        puck: [-10.2, 9.3],
        carrier: 'LD',
      },
      {
        players: [them('o1', [-9, 7]), them('o2', [-11, 21]), them('o3', [5, 19]), us('LD', [-10.2, 10.4]), curving('LW', [-6.4, 10.4], [0.6, 15.6]), us('C', [3.4, 10.6]), us('RD', [5, 3])],
        puck: [-10, 11.7],
        carrier: 'LD',
      },
      {
        players: [them('o1', [-9, 7]), them('o2', [-11, 21]), them('o3', [5, 19]), us('LD', [-10.2, 10.4]), us('LW', [1.4, 18.6]), us('C', [3.4, 10.6]), us('RD', [5, 3])],
        puck: [0.6, 20],
        moves: [{ kind: 'pass', path: [[-10, 11.7], [0.6, 20]], trim: 0.7 }],
      },
      {
        players: [them('o1', [-9, 7]), them('o2', [-11, 21]), them('o3', [5, 19]), us('LD', [-10.2, 10.4]), us('LW', [1.8, 27]), us('C', [3.4, 10.6]), us('RD', [5, 3])],
        puck: [1.9, 28.3],
        carrier: 'LW',
      },
    ],
  },

  /* Give-and-go: LD passes to LW, who swings to the inside with the puck and draws the
     forechecker. LD skates out to the boards and gets the puck back there. */
  'give-and-go': {
    zone: 'own',
    view: 'half',
    steps: [
      { players: [them('o1', [-3, 1.6]), ...giveThem, us('LD', [-7, 4.4]), us('LW', [-10.2, 20.4]), ...gegenUs], puck: [-7.2, 5.7] },
      { players: [them('o1', [-5.2, 3.2]), ...giveThem, us('LD', [-7.6, 6.2]), us('LW', [-10, 15.4]), ...gegenUs], puck: [-7.8, 7.5], carrier: 'LD' },
      {
        players: [them('o1', [-5.6, 4.4]), ...giveThem, us('LD', [-7.6, 6.4]), us('LW', [-10.3, 12.4]), ...gegenUs],
        puck: [-10.4, 11.1],
        moves: [{ kind: 'pass', path: [[-7.8, 7.5], [-10.4, 11.1]], trim: 0.7 }],
      },
      {
        players: [them('o1', [-3.4, 9.6]), ...giveThem, us('LD', [-13.4, 9.6]), curving('LW', [-9, 6], [-5.4, 12.6]), ...gegenUs],
        puck: [-5.2, 13.9],
        carrier: 'LW',
      },
      {
        players: [them('o1', [-2.8, 12.2]), ...giveThem, us('LD', [-13.3, 14]), us('LW', [-4.6, 15.6]), ...gegenUs],
        puck: [-12.8, 15.3],
        moves: [{ kind: 'pass', path: [[-5, 14.4], [-12.8, 15.3]], trim: 0.7 }],
      },
      { players: [them('o1', [-2.8, 12.2]), ...giveThem, us('LD', [-12.6, 23]), us('LW', [-4, 22.4]), us('C', [1.4, 20.4]), us('RD', [5, 3])], puck: [-12.4, 24.3], carrier: 'LD' },
    ],
  },

  /* Drop pass: LD carries towards 10 o'clock (forwards and to the left) for a long way.
     The forechecker follows on their defensive side, the up-ice side of LD, towards the
     boards. C comes towards 4 o'clock, passes LD on the inside (between LD and our goal)
     and takes the puck LD plays back; LD's body is between puck and forechecker. */
  'drop-behind': {
    zone: 'own',
    view: 'half',
    steps: [
      { players: [them('o1', [2, 24]), ...dropThem, us('LD', [6, 10]), us('C', [-12.4, 19.4]), ...dropUs], puck: [5.3, 11] },
      { players: [them('o1', [0.4, 18]), ...dropThem, us('LD', [1, 12.9]), us('C', [-11, 18]), ...dropUs], puck: [0.3, 13.9], carrier: 'LD' },
      { players: [them('o1', [-3.4, 18.8]), ...dropThem, us('LD', [-4, 15.8]), us('C', [-9.4, 16.6]), ...dropUs], puck: [-4.7, 16.8], carrier: 'LD' },
      {
        players: [them('o1', [-6, 19.8]), ...dropThem, us('LD', [-6.4, 17]), us('C', [-6.4, 14.2]), ...dropUs],
        puck: [-5.2, 13.4],
        moves: [{ kind: 'pass', path: [[-6, 16], [-5.2, 13.4]], trim: 0.5 }],
      },
      {
        players: [them('o1', [-10, 22.6]), ...dropThem, us('LD', [-11, 19.6]), curving('C', [-1.4, 10.8], [1.6, 16.6]), ...dropUs],
        puck: [1.8, 17.9],
        carrier: 'C',
      },
      { players: [them('o1', [-10, 22.6]), ...dropThem, us('LD', [-11, 19.6]), us('C', [2.4, 26]), ...dropUs], puck: [2.5, 27.3], carrier: 'C' },
    ],
  },

  /* Kreuzen in the neutral zone: LW carries towards the middle, C crosses behind them
     and takes the puck LW leaves. The defender who followed LW is on the wrong side. */
  'cross-drop': {
    zone: 'own',
    view: 'neutral',
    steps: [
      {
        players: [them('o1', [-6, 39]), them('o2', [6, 38.5]), us('LW', [-10, 22]), us('C', [4, 22]), us('RW', [12, 26])],
        puck: [-9.8, 23.3],
      },
      {
        players: [them('o1', [-5.5, 35.5]), them('o2', [6, 38.5]), us('LW', [-6, 29.5]), us('C', [2, 26.6]), us('RW', [12, 33])],
        puck: [-5.4, 30.7],
        carrier: 'LW',
      },
      {
        players: [them('o1', [-1.6, 36.6]), them('o2', [6, 38.5]), us('LW', [0, 33.5]), us('C', [-0.6, 28.4]), us('RW', [12, 33])],
        puck: [-2.9, 31.6],
      },
      {
        players: [them('o1', [-1.6, 36.6]), them('o2', [6, 38.5]), us('LW', [2.2, 35.2]), us('C', [-3.6, 30.6]), us('RW', [12, 33])],
        puck: [-2.9, 31.6],
      },
      {
        players: [them('o1', [-1.6, 36.6]), them('o2', [6, 38.5]), us('LW', [2.6, 36.8]), us('C', [-8, 39.4]), us('RW', [11.5, 36.8])],
        puck: [-8.2, 40.7],
        carrier: 'C',
      },
    ],
  },

  /* Attacking zone, our left at positive x. LW carries up the half-wall with space,
     turns towards the middle, LD drops down the boards: three options. */
  'halfwall-space': {
    zone: 'attack',
    steps: [
      {
        players: [...halfwallThem, us('LW', [13.4, 8]), us('C', [2.4, 8]), us('RW', [-6, 9]), us('LD', [9.5, 20.5]), us('RD', [-9, 20.5])],
        puck: [13.2, 9.3],
        areas: [house],
      },
      {
        players: [...halfwallThem, us('LW', [13.2, 12.6]), us('C', [2.4, 8]), us('RW', [-6, 9]), us('LD', [9.5, 20.5]), us('RD', [-9, 20.5])],
        puck: [12.9, 13.9],
        carrier: 'LW',
        areas: [house],
      },
      {
        players: [...halfwallThem, us('LW', [7.6, 14]), us('C', [2.4, 8]), us('RW', [-6, 9]), us('LD', [13.6, 17]), us('RD', [-9, 20.5])],
        puck: [6.4, 13.6],
        carrier: 'LW',
        areas: [house],
      },
      {
        players: [...halfwallThem, us('LW', [7.6, 14]), us('C', [2.4, 8]), us('RW', [-6, 9]), us('LD', [13.6, 17]), us('RD', [-9, 20.5])],
        puck: [6.4, 13.6],
        areas: [house],
        moves: [
          { kind: 'pass', path: [[7, 15], [13.6, 17]], trim: 1.6, step: 1, stepSide: -1 },
          { kind: 'carry', path: [[6, 12.6], [3.6, 10]], step: 2, stepSide: -1 },
          { kind: 'pass', path: [[6, 14.2], [-9, 20.5]], trim: 1.6, step: 3, stepSide: -1 },
        ],
      },
    ],
  },

  /* Attacking zone: an opponent sticks to LW on the half-wall. LD skates down on the
     inside, LW leaves the puck on the boards for them. */
  'halfwall-cross': {
    zone: 'attack',
    steps: [
      {
        players: [...crossThem, them('o3', [10.6, 7.6]), us('LW', [13.5, 6.6]), us('C', [2.4, 8]), us('RW', [-5, 9]), us('LD', [9, 20.5]), us('RD', [-9, 20.5])],
        puck: [13.8, 7.9],
        areas: [house],
      },
      {
        players: [...crossThem, them('o3', [10.8, 11.2]), us('LW', [13.6, 10.4]), us('C', [2.4, 8]), us('RW', [-5, 9]), us('LD', [8.4, 16.6]), us('RD', [-9, 20.5])],
        puck: [13.9, 11.7],
        carrier: 'LW',
        areas: [house],
      },
      {
        players: [...crossThem, them('o3', [10.8, 15.8]), us('LW', [13.6, 15]), us('C', [2.4, 8]), us('RW', [-5, 9]), curving('LD', [8.6, 10.6], [11.8, 8.4]), us('RD', [-9, 20.5])],
        puck: [13, 7.6],
        moves: [{ kind: 'pass', path: [[13.9, 12.4], [14.6, 9.8], [13, 7.6]], trim: 0.5 }],
        areas: [house],
      },
      {
        players: [...crossThem, them('o3', [10.2, 19]), us('LW', [13, 19.4]), us('C', [2.4, 8]), us('RW', [-5, 9]), curving('LD', [11.2, 5.6], [8.4, 6.8]), us('RD', [-9, 20.5])],
        puck: [7.4, 6],
        carrier: 'LD',
        areas: [house],
      },
    ],
  },

  /* The classic cycle on the left boards of the attacking zone (our left at positive x).
     The puck goes up the boards with one player and back down to the next. */
  cycle: {
    zone: 'attack',
    steps: [
      {
        players: [them('o1', [9.6, 5.4]), ...cycleThem, us('LW', [11.8, 4]), us('C', [4, 7.4]), us('RW', [-5, 8.5]), us('LD', [10, 20.5]), us('RD', [-9, 20.5])],
        puck: [12.6, 3],
        areas: [house],
        moves: [
          { kind: 'lane', path: [[13.4, 6.2], [13.8, 13]] },
          { kind: 'lane', path: [[13.8, 13], [10, 16.4], [7, 11]] },
          { kind: 'lane', path: [[7, 11], [5.4, 4.4], [9.6, 2]] },
        ],
      },
      {
        players: [them('o1', [11.2, 8.6]), ...cycleThem, us('LW', [13.6, 9.5]), us('C', [8.4, 2.6]), us('RW', [-5, 8.5]), us('LD', [10, 20.5]), us('RD', [-9, 20.5])],
        puck: [14, 10.8],
        carrier: 'LW',
        areas: [house],
      },
      {
        players: [them('o1', [11, 12.2]), ...cycleThem, us('LW', [13.4, 13.8]), us('C', [10.8, 2.6]), us('RW', [-5, 8.5]), us('LD', [10, 20.5]), us('RD', [-9, 20.5])],
        puck: [12.4, 3.5],
        areas: [house],
        moves: [{ kind: 'pass', path: [[14, 10.8], [14.9, 6.6], [12.4, 3.5]], trim: 0.7 }],
      },
      {
        players: [them('o1', [11.6, 7]), ...cycleThem, us('LW', [8.4, 13.6]), us('C', [13.6, 9]), us('RW', [-5, 8.5]), us('LD', [10, 20.5]), us('RD', [-9, 20.5])],
        puck: [14, 10.3],
        carrier: 'C',
        areas: [house],
      },
      {
        players: [them('o1', [11.6, 7.4]), ...cycleThem, us('LW', [6.2, 10.6]), us('C', [13.6, 9.4]), us('RW', [-5, 8.5]), us('LD', [10, 20.5]), us('RD', [-9, 20.5])],
        puck: [6.6, 9.3],
        areas: [house],
        moves: [{ kind: 'pass', path: [[14, 10.3], [6.6, 9.3]], trim: 0.7 }],
      },
      {
        players: [them('o1', [11.6, 7.4]), ...cycleThem, us('LW', [6.2, 10.6]), us('C', [13.6, 9.4]), us('RW', [-5, 8.5]), us('LD', [10, 20.5]), us('RD', [-9, 20.5])],
        puck: [0.4, 4.5],
        areas: [house],
        moves: [{ kind: 'shot', path: [[6.4, 9.1], [0.4, 4.5]], trim: 0.7 }],
      },
    ],
  },
  /* The opponents have collapsed in front of their goal (attacking zone, our left at
     positive x). Open ice is up at the blue line: up to LD, across to RD, shot, with RW
     screening the goalie and C and LW ready for the rebound. */
  'collapse-point': {
    zone: 'attack',
    steps: [
      {
        players: [...turtleThem, us('LW', [13.4, 12]), us('C', [11, 3.6]), us('RW', [-7.4, 4.4]), us('LD', [9.5, 20.5]), us('RD', [-9, 20.5])],
        puck: [13.2, 13.3],
        areas: [house, ...turtleOpenHigh],
      },
      {
        players: [...turtleThem, us('LW', [13.4, 12]), us('C', [11, 3.6]), us('RW', [-7.4, 4.4]), us('LD', [9.5, 20.5]), us('RD', [-9, 20.5])],
        puck: [9.4, 19.2],
        areas: [house, ...turtleOpenHigh],
        moves: [{ kind: 'pass', path: [[13.2, 13.3], [9.4, 19.2]], trim: 0.6 }],
      },
      {
        players: [...turtleThem, us('LW', [7.8, 6.6]), us('C', [3.6, 4.2]), us('RW', [0.8, 6.4]), us('LD', [9.5, 20.5]), us('RD', [-9, 20.5])],
        puck: [-8.6, 19.2],
        areas: [house],
        moves: [{ kind: 'pass', path: [[9.4, 19.2], [-8.6, 19.2]], trim: 0.6 }],
      },
      {
        players: [...turtleThem, us('LW', [7.8, 6.6]), us('C', [3.6, 4.2]), us('RW', [0.8, 6.4]), us('LD', [9.5, 20.5]), us('RD', [-9, 20.5])],
        puck: [-0.6, 4.4],
        areas: [house],
        moves: [{ kind: 'shot', path: [[-8.6, 19.2], [-0.6, 4.4]], trim: 0.6 }],
      },
    ],
  },

  /* Collapsed opponents, switch behind the goal: C rims the puck along the end boards to RW
     waiting low on the weak side, and a low cycle starts there. */
  'collapse-switch': {
    zone: 'attack',
    steps: [
      {
        players: [...turtleThem, us('C', [11.4, 3.6]), us('LW', [13.4, 12]), us('RW', [-11.6, 4]), us('LD', [9.5, 20.5]), us('RD', [-9, 20.5])],
        puck: [12, 2.6],
        areas: [house, { kind: 'open', ellipse: { at: [-9.4, 4], rx: 2.6, ry: 2.2 } }],
      },
      {
        players: [...turtleThem, us('C', [11.4, 3.6]), us('LW', [13.4, 12]), us('RW', [-11.6, 4]), us('LD', [9.5, 20.5]), us('RD', [-9, 20.5])],
        puck: [-10.6, 2.8],
        areas: [house],
        moves: [{ kind: 'pass', path: [[12, 2.4], [0, -2], [-10.6, 2.8]], trim: 0.6 }],
      },
      {
        players: [them('o1', [3.6, 8.2]), them('o2', [-4, 6]), them('o3', [5.6, 11.4]), them('o4', [0.6, 10.8]), them('o5', [-10.6, 9.2]), curving('C', [0, 0.6], [-7.6, 2.4]), us('LW', [4.8, 5.4]), us('RW', [-13.6, 9.6]), us('LD', [9.5, 20.5]), us('RD', [-9, 20.5])],
        puck: [-14, 10.9],
        carrier: 'RW',
        areas: [house],
      },
      {
        players: [them('o1', [3.6, 8.2]), them('o2', [-4, 6]), them('o3', [5.6, 11.4]), them('o4', [0.6, 10.8]), them('o5', [-11, 13]), us('C', [-10.6, 2.8]), us('LW', [4.8, 5.4]), us('RW', [-13.4, 13.8]), us('LD', [9.5, 20.5]), us('RD', [-9, 20.5])],
        puck: [-11.8, 3.6],
        areas: [house],
        moves: [{ kind: 'pass', path: [[-14, 10.9], [-14.8, 6.6], [-11.8, 3.6]], trim: 0.6 }],
      },
    ],
  },
  /* Collapsed opponents: the defenders pass back and forth along the blue line until the
     opposing wingers come out to block the shot. The slot opens, LD finds C there. */
  'collapse-expand': {
    zone: 'attack',
    steps: [
      {
        players: [...turtleThem, ...expandUs(), us('C', [10, 4])],
        puck: [9.4, 19.2],
        areas: [house],
      },
      {
        players: [them('o1', [3.6, 8.2]), them('o2', [-4, 6]), them('o3', [5.6, 11.4]), them('o4', [-2.8, 11.4]), them('o5', [-8.2, 15.2]), ...expandUs(), us('C', [10, 4])],
        puck: [-8.6, 19.2],
        areas: [house],
        moves: [{ kind: 'pass', path: [[9.4, 19.2], [-8.6, 19.2]], trim: 0.6 }],
      },
      {
        players: [...expandThem, ...expandUs(), us('C', [10, 4])],
        puck: [9.4, 19.2],
        areas: [house],
        moves: [{ kind: 'pass', path: [[-8.6, 19.2], [9.4, 19.2]], trim: 0.6 }],
      },
      {
        players: [...expandThem, ...expandUs(), us('C', [3.2, 13.6])],
        puck: [9.4, 19.2],
        areas: [house, { kind: 'open', ellipse: { at: [3.4, 13.6], rx: 2.6, ry: 2.2 } }],
      },
      {
        players: [...expandThem, ...expandUs(), us('C', [3.2, 13.6])],
        puck: [3.8, 14.8],
        areas: [house],
        moves: [{ kind: 'pass', path: [[9.2, 19.4], [3.8, 14.8]], trim: 0.6 }],
      },
      {
        players: [...expandThem, ...expandUs(), us('C', [3.2, 13.6])],
        puck: [-0.4, 4.4],
        areas: [house],
        moves: [{ kind: 'shot', path: [[3.4, 12.6], [-0.4, 4.4]], trim: 0.6 }],
      },
    ],
  },
} satisfies Record<string, Story>;

export type StoryId = keyof typeof geometry;

export const stories: Record<StoryId, Story> = geometry;

interface StepText {
  title: string;
  text: string;
  /** Describes the drawing for screen readers. */
  label: string;
}

interface StoryText {
  caption: string;
  steps: StepText[];
}

const de: Record<StoryId, StoryText> = {
  'forecheck-roles': {
    caption: 'Forecheck: Die Tiere wandern mit dem Puck',
    steps: [
      {
        title: 'Drei Türen',
        text: 'Der Gegner hat den Puck in der Ecke. Er hat drei Türen nach draussen: 1 an der Bande hoch, 2 in die Mitte, 3 hinter dem Tor durch.',
        label: 'Angriffszone. Ein gegnerischer Verteidiger hat den Puck in der linken Ecke. Drei gepunktete Wege führen von ihm weg: an der Bande hoch, in die Mitte und hinter dem Tor durch zum anderen Verteidiger.',
      },
      {
        title: 'Jeder ein Tier',
        text: 'Der LW ist am nächsten: Er ist der Hund und jagt. Der C ist der Fuchs und macht Tür 1 zu. Der RW ist der Falke und bewacht Tür 2. Offen ist nur noch Tür 3.',
        label: 'Der linke Flügel fährt zum Puckführer, der Center an die linke Bande, der rechte Flügel hoch in die Mitte. Nur der Weg hinter dem Tor ist noch offen.',
      },
      {
        title: 'Der Puck wechselt die Seite',
        text: 'Der Gegner spielt den Puck hinter dem Tor durch zum anderen Verteidiger. Wer ist jetzt am nächsten?',
        label: 'Der gegnerische Verteidiger passt den Puck hinter dem Tor durch zum anderen Verteidiger auf der rechten Seite.',
      },
      {
        title: 'Die Tiere tauschen',
        text: 'Jetzt ist der RW am nächsten: Er wird zum Hund. Der LW fährt durch den Slot an die andere Bande und wird zum Fuchs. Der C rückt in die Mitte und wird zum Falken.',
        label: 'Der rechte Flügel fährt zum neuen Puckführer in der rechten Ecke. Der linke Flügel fährt quer an die rechte Bande, der Center hoch in die Mitte.',
      },
      {
        title: 'Der Fuchs schnappt zu',
        text: 'Der Puckführer spielt an der Bande hoch – genau zum Fuchs. Puck gewonnen! Jetzt greifen wir an: Der Falke fährt vor das Tor.',
        label: 'Der gegnerische Verteidiger passt an der rechten Bande hoch. Der linke Flügel fängt den Puck ab. Der Center fährt vor das Tor und ist anspielbar.',
      },
    ],
  },
  backcheck: {
    caption: 'Backcheck: Die Geparden sprinten heim',
    steps: [
      {
        title: 'Puck verloren',
        text: 'Der Gegner erobert den Puck in unserer Angriffszone. Hund und Fuchs sind tief in der Ecke, der Falke ist hoch. Die gelbe Fläche vor unserem Tor ist das Haus.',
        label: 'Das ganze Eis, unser Tor unten. Der Gegner hat den Puck oben in unserer Angriffszone. Linker Flügel und Center sind tief, der rechte Flügel ist hoch, die Verteidiger an der blauen Linie.',
      },
      {
        title: 'Umdrehen!',
        text: 'Hund und Fuchs werden zu Geparden und sprinten los, durch die Mitte. Der Falke ist am nächsten an unserem Tor: Er bleibt innen neben dem Puckführer.',
        label: 'Linker Flügel und Center sprinten durch die Mitte zurück. Der rechte Flügel fährt innen neben dem Puckführer. Die Verteidiger fahren rückwärts.',
      },
      {
        title: 'Durch die Mitte',
        text: 'Die Geparden nehmen den kürzesten Weg: durch die Mitte, nicht an der Bande. Sie holen auf.',
        label: 'Alle fahren Richtung eigenes Tor. Die beiden Sprinter sind in der Mitte, auf Höhe der Mittellinie.',
      },
      {
        title: 'Im Haus bremsen',
        text: 'Die Geparden sind im Haus vor unserem Tor und bremsen. Mit dem Schulterblick sehen sie, wer frei ist, und übernehmen ihn. Jetzt gilt die Zuordnung.',
        label: 'Der Puckführer ist in unserer Zone an der rechten Seite, der rechte Verteidiger vor ihm. Der linke Verteidiger deckt den Gegner auf der linken Seite. Linker Flügel und Center stehen im Haus vor unserem Tor.',
      },
    ],
  },
  'swing-out-pass': {
    caption: 'Swing nach aussen, dann der Pass',
    steps: [
      {
        title: 'Weit weg',
        text: 'LD hat den Puck hinter unserem Tor. LW steht oben an der blauen Linie, ein Gegner ist in der Nähe. Der Pass dorthin wäre lang.',
        label: 'Eigene Zone, unser Tor unten. LD hat den Puck links hinter dem Tor, ein Gegner fährt hinter dem Tor auf LD zu. LW steht oben links bei der blauen Linie, ein Gegner nah bei ihm. Eine gepunktete Linie zeigt den langen Passweg.',
      },
      {
        title: 'Entgegenfahren',
        text: 'LW fährt dem Puck entgegen, ein paar Meter innen von der Bande. So bleibt Platz für die Kurve.',
        label: 'LD fährt mit dem Puck zur linken Bande. LW fährt nach unten, ein paar Meter innen von der Bande.',
      },
      {
        title: 'Swing nach aussen',
        text: 'LW dreht in einer Kurve nach aussen, zur Bande hin. Jetzt schaut LW schon nach vorne.',
        label: 'LW fährt eine Kurve nach aussen zur Bande und wieder nach oben. LD hat den Puck noch.',
      },
      {
        title: 'Der Pass',
        text: 'Jetzt kommt der Pass, kurz und genau in die Fahrt.',
        label: 'LW fährt an der Bande nach oben. LD passt schräg nach vorne zu LW.',
      },
      {
        title: 'Mit Schwung',
        text: 'LW fährt mit dem Puck an der Bande nach vorne. Kein Anhalten, kein neues Anfahren.',
        label: 'LW fährt mit dem Puck an der linken Bande über die blaue Linie.',
      },
    ],
  },
  'pass-swing-out': {
    caption: 'Erst der Pass, dann Swing nach aussen',
    steps: [
      {
        title: 'Weit weg',
        text: 'LD hat den Puck hinter unserem Tor. LW steht oben an der blauen Linie, ein Gegner ist in der Nähe. Der Pass dorthin wäre lang.',
        label: 'Eigene Zone, unser Tor unten. LD hat den Puck links hinter dem Tor, ein Gegner fährt hinter dem Tor auf LD zu. LW steht oben links bei der blauen Linie, ein Gegner nah bei ihm. Eine gepunktete Linie zeigt den langen Passweg.',
      },
      {
        title: 'Entgegenfahren',
        text: 'LW fährt LD entgegen, ein paar Meter innen von der Bande.',
        label: 'LD fährt mit dem Puck zur linken Bande. LW fährt nach unten, ein paar Meter innen von der Bande.',
      },
      {
        title: 'Pass in die Fahrt',
        text: 'LD passt, solange LW noch auf LD zufährt. Der Pass ist kurz.',
        label: 'LW fährt weiter nach unten. LD passt kurz nach oben zu LW.',
      },
      {
        title: 'Swing nach aussen',
        text: 'Mit dem Puck dreht LW in einer Kurve nach aussen, zur Bande hin.',
        label: 'LW fährt mit dem Puck eine Kurve nach aussen zur Bande und wieder nach oben.',
      },
      {
        title: 'Mit Schwung',
        text: 'LW fährt mit dem Puck an der Bande nach vorne.',
        label: 'LW fährt mit dem Puck an der linken Bande über die blaue Linie.',
      },
    ],
  },
  'pass-swing-in': {
    caption: 'Erst der Pass, dann Swing nach innen',
    steps: [
      {
        title: 'Weit weg',
        text: 'LD hat den Puck hinter unserem Tor. LW steht oben an der blauen Linie, ein Gegner ist in der Nähe. Der Pass dorthin wäre lang.',
        label: 'Eigene Zone, unser Tor unten. LD hat den Puck links hinter dem Tor, ein Gegner fährt hinter dem Tor auf LD zu. LW steht oben links bei der blauen Linie, ein Gegner nah bei ihm. Eine gepunktete Linie zeigt den langen Passweg.',
      },
      {
        title: 'Entgegenfahren',
        text: 'LW fährt LD entgegen, ein paar Meter innen von der Bande.',
        label: 'LD fährt mit dem Puck zur linken Bande. LW fährt nach unten, ein paar Meter innen von der Bande.',
      },
      {
        title: 'Pass in die Fahrt',
        text: 'LD passt, solange LW noch auf LD zufährt. Der Pass ist kurz.',
        label: 'LW fährt weiter nach unten. LD passt kurz nach oben zu LW.',
      },
      {
        title: 'Swing nach innen',
        text: 'Mit dem Puck dreht LW in einer Kurve nach innen, Richtung Mitte.',
        label: 'LW fährt mit dem Puck eine Kurve nach innen Richtung Mitte und wieder nach oben.',
      },
      {
        title: 'Mit Schwung',
        text: 'LW fährt mit dem Puck durch die Mitte nach vorne.',
        label: 'LW fährt mit dem Puck links von der Mitte über die blaue Linie.',
      },
    ],
  },
  'swing-in-pass': {
    caption: 'Swing nach innen, dann der Pass',
    steps: [
      {
        title: 'Gedeckt',
        text: 'RD hat den Puck. RW steht weit oben an der Bande, ein Gegner ganz nah bei ihm. So ist RW gedeckt.',
        label: 'Eigene Zone und neutrale Zone, unser Tor unten. RD hat den Puck rechts vor dem Tor. RW steht oben an der rechten Bande bei der Mittellinie, ein Gegner direkt bei ihm.',
      },
      {
        title: 'Entgegenfahren',
        text: 'RW fährt an der Bande nach unten, RD entgegen. Der Gegner folgt, aber er ist schon ein paar Meter weg.',
        label: 'RW fährt an der rechten Bande nach unten bis zur blauen Linie. Der Gegner folgt mit Abstand.',
      },
      {
        title: 'Swing nach innen',
        text: 'RW fährt eine Kurve in die Mitte und wieder nach vorne. Am Ende der Kurve kommt der Pass.',
        label: 'RW fährt eine Kurve nach unten und in die Mitte und wieder nach oben. RD passt zu RW, der Puck kommt am Ende der Kurve an.',
      },
      {
        title: 'Mit Schwung',
        text: 'RW hat den Puck und schon Tempo. Der Gegner steht noch und kommt nicht mehr mit.',
        label: 'RW fährt mit dem Puck schnell nach oben über die Mittellinie. Der Gegner bleibt zurück.',
      },
    ],
  },
  'swing-across': {
    caption: 'Swing vor dem Puckführer durch, auf die andere Seite',
    steps: [
      {
        title: 'Gedeckt',
        text: 'LD holt den Puck in der Ecke. LW steht oben an der Bande, ein Gegner direkt bei ihm.',
        label: 'Eigene Zone, unser Tor unten. LD hat den Puck in der linken Ecke, ein Gegner hinter LD. LW steht oben an der linken Bande, ein Gegner direkt bei ihm.',
      },
      {
        title: 'Entgegenfahren',
        text: 'LD fährt an der Bande hoch. LW fährt LD entgegen, der Gegner folgt LW.',
        label: 'LD fährt mit dem Puck an der linken Bande nach oben. LW fährt nach unten, der Gegner folgt ihm.',
      },
      {
        title: 'Vor LD durch',
        text: 'LW fährt einen weiten Swing vor LD durch, bis auf die andere Seite. An der Bande ist der Gegner, in der Mitte ist Platz.',
        label: 'LW fährt einen weiten Bogen vor LD durch nach rechts, über die Mitte, und wieder nach oben. LD fährt mit dem Puck weiter.',
      },
      {
        title: 'Der Pass',
        text: 'LD passt schräg nach vorne. LW bekommt den Puck in der Fahrt.',
        label: 'LD passt weit schräg nach rechts oben zu LW auf der anderen Seite.',
      },
      {
        title: 'Weg vom Gegner',
        text: 'LW fährt mit dem Puck durch die Mitte. Der Gegner an der Bande ist weit weg.',
        label: 'LW fährt mit dem Puck durch die Mitte über die blaue Linie. Der Gegner steht noch an der linken Bande.',
      },
    ],
  },
  'give-and-go': {
    caption: 'Der Doppelpass',
    steps: [
      {
        title: 'LD hat den Puck',
        text: 'LD hat den Puck neben unserem Tor, ein Gegner kommt von hinten. LW fährt LD entgegen.',
        label: 'Eigene Zone, unser Tor unten. LD hat den Puck links neben dem Tor, ein Gegner kommt hinter dem Tor auf LD zu. LW steht oben links bei der blauen Linie.',
      },
      {
        title: 'Entgegenfahren',
        text: 'LD fährt mit dem Puck los, der Gegner folgt. LW fährt LD entgegen.',
        label: 'LD fährt mit dem Puck ein Stück nach oben, der Gegner folgt. LW fährt nach unten, ein paar Meter innen von der Bande.',
      },
      {
        title: 'Der erste Pass',
        text: 'LD passt kurz zu LW.',
        label: 'LD passt kurz nach oben zu LW.',
      },
      {
        title: 'Swing und Bande',
        text: 'LW fährt mit dem Puck einen Swing nach innen. Der Gegner fährt zum Puck, also zu LW. LD fährt nach aussen an die Bande.',
        label: 'LW fährt mit dem Puck eine Kurve nach innen Richtung Mitte. Der Gegner folgt LW. LD fährt nach links an die Bande.',
      },
      {
        title: 'Der zweite Pass',
        text: 'LW passt den Puck zurück zu LD an der Bande. Dort ist niemand: Der Gegner ist bei LW.',
        label: 'LW passt quer nach links zu LD an der Bande. LD fährt an der Bande nach oben.',
      },
      {
        title: 'Beide in Fahrt',
        text: 'LD fährt mit dem Puck an der Bande nach vorne, LW in der Mitte mit. Zwei Pässe, darum heisst das Doppelpass.',
        label: 'LD fährt mit dem Puck an der linken Bande über die blaue Linie. LW fährt links von der Mitte mit.',
      },
    ],
  },
  'drop-behind': {
    caption: 'Drop-Pass: lange Richtung 10 Uhr, dann innen vorbei',
    steps: [
      {
        title: '10 Uhr',
        text: 'Stell dir eine Uhr vor, 12 Uhr ist nach vorne. LD fährt mit dem Puck Richtung 10 Uhr, nach links vorne. Von vorne kommt ein Gegner. C ist oben links.',
        label: 'Eigene Zone, unser Tor unten. LD hat den Puck rechts vor dem Tor und fährt schräg nach links oben. Oben kommt ein Gegner. C ist oben links.',
      },
      {
        title: 'Der Gegner kommt',
        text: 'Der Gegner fährt auf LD zu. LD fährt weiter Richtung 10 Uhr. C fährt schräg auf LD zu, Richtung 4 Uhr.',
        label: 'LD fährt mit dem Puck weiter schräg nach links oben. Der Gegner kommt von oben auf LD zu. C fährt schräg nach rechts unten.',
      },
      {
        title: 'Den Gegner auf sich ziehen',
        text: 'LD fährt weiter Richtung Bande und zieht den Gegner auf sich. Der Gegner kommt ganz nah, auf der oberen Seite, und schaut nur noch auf LD und den Puck. Erst jetzt ist der Drop-Pass sicher.',
        label: 'LD fährt mit dem Puck weiter Richtung linke Bande. Der Gegner ist jetzt ganz nah, direkt oberhalb von LD. C kommt von links oben näher.',
      },
      {
        title: 'Der Drop-Pass',
        text: 'C fährt innen an LD vorbei, auf der Abwehrseite: zwischen LD und unserem Tor. Genau jetzt spielt LD den Puck kurz zurück. LD ist zwischen Puck und Gegner.',
        label: 'C fährt unterhalb von LD vorbei. LD spielt den Puck kurz nach unten zu C. Der Gegner ist oberhalb von LD, auf der anderen Seite.',
      },
      {
        title: 'Swing nach vorne',
        text: 'C dreht mit dem Puck einen Swing nach vorne. LD fährt weiter zur Bande, der Gegner geht mit LD mit.',
        label: 'C fährt mit dem Puck eine Kurve nach rechts und wieder nach oben. LD fährt weiter zur linken Bande, der Gegner folgt LD.',
      },
      {
        title: 'C ist weg',
        text: 'C fährt mit dem Puck nach vorne. Der Gegner ist an der Bande bei LD, weit weg vom Puck.',
        label: 'C fährt mit dem Puck in der Mitte über die blaue Linie. Der Gegner und LD sind an der linken Bande.',
      },
    ],
  },
  'cross-drop': {
    caption: 'Kreuzen mit Drop-Pass',
    steps: [
      {
        title: 'Zu zweit nach vorne',
        text: 'LW fährt mit dem Puck an der linken Seite nach vorne. C fährt rechts von der Mitte mit.',
        label: 'Neutrale Zone, wir greifen nach oben an. LW hat den Puck links, C ist rechts von der Mitte. Oben warten zwei gegnerische Verteidiger.',
      },
      {
        title: 'Die Wege kreuzen sich',
        text: 'LW zieht schräg in die Mitte. C fährt schräg nach links, hinter LW durch. Der linke Verteidiger schaut auf LW.',
        label: 'LW fährt mit dem Puck schräg zur Mitte. C fährt schräg nach links. Der linke gegnerische Verteidiger fährt LW entgegen.',
      },
      {
        title: 'Liegen lassen',
        text: 'LW lässt den Puck liegen und fährt weiter. Der Verteidiger geht mit LW mit.',
        label: 'LW fährt weiter nach rechts, der Puck bleibt in der Mitte liegen. Der gegnerische Verteidiger folgt LW. C kommt von rechts unten zum Puck.',
      },
      {
        title: 'C übernimmt',
        text: 'C fährt hinter LW durch und ist genau beim Puck. Das ist der Drop-Pass.',
        label: 'C ist beim liegenden Puck. LW und der gegnerische Verteidiger sind rechts davon.',
      },
      {
        title: 'Falsche Seite',
        text: 'C fährt mit dem Puck links in die Zone. Der Verteidiger ist mit LW mitgefahren und steht jetzt auf der falschen Seite. LW und RW fahren erst nach dem Puck über die blaue Linie, sonst ist es Abseits.',
        label: 'C fährt mit dem Puck links über die blaue Linie. Der linke gegnerische Verteidiger steht in der Mitte bei LW. LW und RW sind noch knapp vor der blauen Linie.',
      },
    ],
  },
  'halfwall-space': {
    caption: 'An der Bande hoch, wenn Platz ist',
    steps: [
      {
        title: 'Puck an der Bande',
        text: 'LW hat den Puck an der linken Bande. Der nächste Gegner ist ein paar Meter weg. LW hat Platz.',
        label: 'Angriffszone, oben das gegnerische Tor. LW hat den Puck an der linken Bande auf Höhe des Bullykreises. Die Gegner stehen vor dem Tor und in der Mitte. LD und RD stehen an der blauen Linie.',
      },
      {
        title: 'Hochfahren',
        text: 'LW fährt mit dem Puck an der Bande hoch.',
        label: 'LW fährt mit dem Puck an der linken Bande hoch, Richtung blaue Linie, bis zum Rand des Bullykreises.',
      },
      {
        title: 'Nach innen ziehen',
        text: 'LW zieht in die Mitte. LD lässt sich an der Bande ein Stück tiefer fallen, in den Platz, den LW frei gemacht hat.',
        label: 'LW fährt mit dem Puck nach innen, am Rand des linken Bullykreises entlang. LD fährt an der linken Bande ein Stück Richtung Tor.',
      },
      {
        title: 'Drei Möglichkeiten',
        text: '1: Pass zu LD an der Bande. 2: Selbst in den Slot fahren und schiessen. 3: Pass hoch zu RD auf der schwachen Seite.',
        label: 'Drei Pfeile gehen von LW aus: 1, ein Pass zu LD an der Bande. 2, mit dem Puck schräg in den Slot. 3, ein langer Pass zu RD an der rechten blauen Linie.',
      },
    ],
  },
  'halfwall-cross': {
    caption: 'Der Verteidiger kreuzt innen',
    steps: [
      {
        title: 'Ein Gegner klebt',
        text: 'LW hat den Puck an der linken Bande. Ein Gegner ist ganz nah, innen neben LW. Nach innen ziehen geht nicht.',
        label: 'Angriffszone, oben das gegnerische Tor. LW hat den Puck an der linken Bande, ein Gegner direkt daneben auf der Innenseite. LD steht an der blauen Linie.',
      },
      {
        title: 'LD fährt tief',
        text: 'LW fährt an der Bande hoch. LD fährt von der blauen Linie tief in die Zone, innen an LW und dem Gegner vorbei.',
        label: 'LW fährt mit dem Puck an der Bande hoch, der Gegner bleibt neben ihm. LD fährt von der blauen Linie Richtung Tor, auf der Innenseite.',
      },
      {
        title: 'Pass an der Bande entlang',
        text: 'LW spielt den Puck an der Bande entlang tiefer in die Zone, genau in den Weg von LD, und fährt weiter hoch. Der Gegner geht mit LW mit. LD nimmt den Puck in der Fahrt mit.',
        label: 'LW fährt weiter Richtung blaue Linie und spielt den Puck an der Bande entlang Richtung Tor. Der Gegner folgt LW. LD fährt in einem Bogen zur Bande und nimmt den Puck mit.',
      },
      {
        title: 'LD hat Platz',
        text: 'LD fährt mit dem Puck ohne zu bremsen weiter Richtung Tor. Der Gegner steht oben bei LW. LD kann schiessen oder vor das Tor passen. LW übernimmt an der blauen Linie den Platz von LD.',
        label: 'LD fährt mit dem Puck in einem Bogen von der Bande nach innen Richtung Tor. Der Gegner und LW sind oben an der blauen Linie.',
      },
    ],
  },
  cycle: {
    caption: 'Der Cycle: das Karussell an der Bande',
    steps: [
      {
        title: 'Der Weg im Kreis',
        text: 'LW hat den Puck in der Ecke, ein Gegner drückt. Die gepunktete Linie ist das Karussell: an der Bande hoch, innen zum Tor, tief zurück in die Ecke.',
        label: 'Angriffszone, oben das gegnerische Tor. LW hat den Puck in der linken Ecke, ein Gegner direkt bei ihm. C steht links vor dem Tor. Eine gepunktete Linie läuft im Kreis: an der linken Bande Richtung blaue Linie, nach innen Richtung Tor und zurück in die Ecke.',
      },
      {
        title: 'Hoch an der Bande',
        text: 'LW fährt mit dem Puck an der Bande hoch und schützt ihn mit dem Körper. C fährt tief in die Ecke.',
        label: 'LW fährt mit dem Puck an der linken Bande hoch, der Gegner folgt innen. C fährt in die linke Ecke.',
      },
      {
        title: 'Zurück an die Bande',
        text: 'LW spielt den Puck an der Bande zurück in die Ecke, hinter dem Gegner durch. Dort ist C. LW fährt weiter hoch, der Gegner geht mit.',
        label: 'LW spielt den Puck an der Bande entlang zurück in die Ecke zu C. LW fährt weiter hoch, der Gegner folgt LW.',
      },
      {
        title: 'Das Karussell dreht',
        text: 'Jetzt fährt C mit dem Puck an der Bande hoch. LW dreht nach innen ab, Richtung Tor.',
        label: 'C fährt mit dem Puck an der linken Bande hoch. Der Gegner dreht um und fährt zu C. LW fährt nach innen in den hohen Slot.',
      },
      {
        title: 'Frei vor dem Tor',
        text: 'Der Gegner ist bei C. Niemand passt auf LW auf. C passt in den Slot.',
        label: 'C passt von der Bande in den Slot zu LW. Kein Gegner steht bei LW.',
      },
      {
        title: 'Schuss',
        text: 'LW schiesst. Der Cycle hat einen Spieler frei gemacht.',
        label: 'LW schiesst aus dem Slot aufs Tor.',
      },
    ],
  },
  'collapse-point': {
    caption: 'Der Gegner igelt sich ein: hoch, quer, Schuss',
    steps: [
      {
        title: 'Alle vor dem Tor',
        text: 'Alle fünf Gegner stehen vor ihrem Tor. Dort ist kein Platz. Frei ist es oben an der blauen Linie.',
        label: 'Angriffszone, oben das gegnerische Tor. Alle fünf Gegner stehen eng vor ihrem Tor. LW hat den Puck an der linken Bande. Grüne Flächen zeigen freies Eis vor beiden Verteidigern an der blauen Linie.',
      },
      {
        title: 'Hoch zu LD',
        text: 'LW spielt den Puck hoch zu LD an der blauen Linie.',
        label: 'LW passt schräg nach unten zu LD an der blauen Linie.',
      },
      {
        title: 'Quer zu RD',
        text: 'LD passt quer an der blauen Linie zu RD. RW stellt sich vor den Torhüter und nimmt ihm die Sicht. C und LW machen sich bereit für den Abpraller.',
        label: 'LD passt quer zu RD. RW steht direkt vor dem Tor. C fährt an den linken Pfosten, LW in den linken Slot.',
      },
      {
        title: 'Schuss',
        text: 'RD schiesst. Der Torhüter sieht den Puck wegen RW kaum. Prallt er ab, sind C und LW da.',
        label: 'RD schiesst von der blauen Linie aufs Tor, an RW vorbei.',
      },
    ],
  },
  'collapse-switch': {
    caption: 'Der Gegner igelt sich ein: Seitenwechsel hinter dem Tor',
    steps: [
      {
        title: 'Platz auf der anderen Seite',
        text: 'C hat den Puck in der linken Ecke. Die Gegner stehen alle vor ihrem Tor. In der rechten Ecke wartet RW, dort ist frei.',
        label: 'Angriffszone, oben das gegnerische Tor. C hat den Puck in der linken Ecke. Alle Gegner stehen vor dem Tor. RW wartet tief in der rechten Ecke, dort zeigt eine grüne Fläche freies Eis.',
      },
      {
        title: 'Hinter dem Tor durch',
        text: 'C spielt den Puck an der Bande entlang hinter dem Tor durch zu RW.',
        label: 'C spielt den Puck an der Bande entlang hinter dem Tor durch in die rechte Ecke zu RW.',
      },
      {
        title: 'Der neue Cycle',
        text: 'RW fährt mit dem Puck an der rechten Bande hoch. Ein Gegner kommt. C fährt hinter dem Tor nach, LW geht vor das Tor.',
        label: 'RW fährt mit dem Puck an der rechten Bande Richtung blaue Linie, ein Gegner kommt auf RW zu. C fährt hinter dem Tor nach rechts, LW stellt sich links vor das Tor.',
      },
      {
        title: 'Das Karussell dreht',
        text: 'RW spielt den Puck an der Bande zurück in die Ecke zu C. Jetzt dreht das Karussell auf der anderen Seite, wie beim klassischen Cycle.',
        label: 'RW spielt den Puck an der rechten Bande zurück in die Ecke zu C. RW fährt weiter Richtung blaue Linie, der Gegner folgt RW.',
      },
    ],
  },
  'collapse-expand': {
    caption: 'Hin und her, bis sich der Igel öffnet',
    steps: [
      {
        title: 'Puck oben',
        text: 'Der Puck ist bei LD an der blauen Linie. Die Gegner stehen eng vor ihrem Tor.',
        label: 'Angriffszone, oben das gegnerische Tor. LD hat den Puck an der blauen Linie. Alle Gegner stehen eng vor dem Tor. RW steht vor dem Tor, C tief in der linken Ecke, LW an der linken Bande.',
      },
      {
        title: 'Quer zu RD',
        text: 'LD passt quer zu RD. Ein gegnerischer Stürmer kommt heraus, auf RD zu.',
        label: 'LD passt quer zu RD. Ein Gegner fährt aus dem Slot heraus Richtung RD, ein zweiter rückt nach rechts.',
      },
      {
        title: 'Und zurück',
        text: 'RD passt zurück zu LD. Jetzt kommt auch auf der anderen Seite ein Stürmer heraus. Der Igel öffnet sich.',
        label: 'RD passt zurück zu LD. Ein Gegner fährt aus dem Slot heraus Richtung LD.',
      },
      {
        title: 'Platz im Slot',
        text: 'Die Gegner sind auseinandergezogen. Im Slot ist wieder Platz. C fährt hinein.',
        label: 'C fährt aus der linken Ecke in den Slot, wo eine grüne Fläche freies Eis zeigt.',
      },
      {
        title: 'Der Pass',
        text: 'LD sieht die Lücke und passt zu C.',
        label: 'LD passt schräg in den Slot zu C, am herausgekommenen Gegner vorbei.',
      },
      {
        title: 'Schuss',
        text: 'C schiesst aus dem Slot. RW steht vor dem Torhüter und nimmt ihm die Sicht.',
        label: 'C schiesst aus dem Slot aufs Tor. RW steht vor dem Tor.',
      },
    ],
  },
};

const en: typeof de = {
  'forecheck-roles': {
    caption: 'Forecheck: the animals move with the puck',
    steps: [
      {
        title: 'Three doors',
        text: 'The opponent has the puck in the corner. There are three doors out: 1 up the boards, 2 into the middle, 3 behind the goal.',
        label: 'Attacking zone. An opposing defender has the puck in the left corner. Three dotted paths lead away from them: up the boards, into the middle and behind the goal to the other defender.',
      },
      {
        title: 'Everyone an animal',
        text: 'LW is closest: they are the dog and hunt. C is the fox and closes door 1. RW is the hawk and guards door 2. Only door 3 is still open.',
        label: 'The left winger skates at the puck carrier, the centre to the left boards, the right winger high into the middle. Only the way behind the goal is still open.',
      },
      {
        title: 'The puck changes sides',
        text: 'The opponent passes the puck behind the goal to the other defender. Who is closest now?',
        label: 'The opposing defender passes the puck behind the goal to the other defender on the right side.',
      },
      {
        title: 'The animals swap',
        text: 'Now RW is closest: they become the dog. LW skates through the slot to the other boards and becomes the fox. C moves into the middle and becomes the hawk.',
        label: 'The right winger skates at the new puck carrier in the right corner. The left winger skates across to the right boards, the centre high into the middle.',
      },
      {
        title: 'The fox pounces',
        text: 'The puck carrier plays it up the boards – straight to the fox. Puck won! Now we attack: the hawk goes to the front of the goal.',
        label: 'The opposing defender passes up the right boards. The left winger intercepts the puck. The centre skates to the front of the goal and is open for a pass.',
      },
    ],
  },
  backcheck: {
    caption: 'Backcheck: the cheetahs sprint home',
    steps: [
      {
        title: 'Puck lost',
        text: 'The opponents win the puck in our attacking zone. Dog and fox are deep in the corner, the hawk is high. The yellow area in front of our goal is the house.',
        label: 'The whole rink, our goal at the bottom. The opponents have the puck at the top, in our attacking zone. The left winger and the centre are deep, the right winger is high, the defenders are at the blue line.',
      },
      {
        title: 'Turn around!',
        text: 'Dog and fox become cheetahs and sprint off, through the middle. The hawk is closest to our goal: they stay inside the puck carrier.',
        label: 'The left winger and the centre sprint back through the middle. The right winger skates inside the puck carrier. The defenders skate backwards.',
      },
      {
        title: 'Through the middle',
        text: 'The cheetahs take the shortest way: through the middle, not along the boards. They catch up.',
        label: 'Everyone skates towards our own goal. The two sprinters are in the middle, level with the centre line.',
      },
      {
        title: 'Stop in the house',
        text: 'The cheetahs are in the house in front of our goal and stop. A shoulder check shows them who is open, and they pick that player up. Now coverage takes over.',
        label: 'The puck carrier is in our zone on the right side, the right defender in front of them. The left defender covers the opponent on the left side. The left winger and the centre are in the house in front of our goal.',
      },
    ],
  },
  'swing-out-pass': {
    caption: 'Swing to the outside, then the pass',
    steps: [
      {
        title: 'Far away',
        text: 'LD has the puck behind our goal. LW stands up at the blue line, an opponent nearby. The pass there would be long.',
        label: 'Our zone, our goal at the bottom. LD has the puck behind the goal on the left, an opponent skates at LD round the back of the goal. LW stands up on the left at the blue line, an opponent close to them. A dotted line shows the long passing lane.',
      },
      {
        title: 'Skate towards it',
        text: 'LW skates towards the puck, a few metres in from the boards. That leaves room for the curve.',
        label: 'LD skates with the puck towards the left boards. LW skates down, a few metres in from the boards.',
      },
      {
        title: 'Swing to the outside',
        text: 'LW turns in a curve to the outside, towards the boards. Now LW is already facing up the ice.',
        label: 'LW skates a curve to the outside towards the boards and back up. LD still has the puck.',
      },
      {
        title: 'The pass',
        text: 'Now the pass comes, short and right into LW’s stride.',
        label: 'LW skates up the boards. LD passes diagonally forwards to LW.',
      },
      {
        title: 'With speed',
        text: 'LW skates up the boards with the puck. No stopping, no starting again.',
        label: 'LW skates with the puck up the left boards over the blue line.',
      },
    ],
  },
  'pass-swing-out': {
    caption: 'Pass first, then swing to the outside',
    steps: [
      {
        title: 'Far away',
        text: 'LD has the puck behind our goal. LW stands up at the blue line, an opponent nearby. The pass there would be long.',
        label: 'Our zone, our goal at the bottom. LD has the puck behind the goal on the left, an opponent skates at LD round the back of the goal. LW stands up on the left at the blue line, an opponent close to them. A dotted line shows the long passing lane.',
      },
      {
        title: 'Skate towards it',
        text: 'LW skates towards LD, a few metres in from the boards.',
        label: 'LD skates with the puck towards the left boards. LW skates down, a few metres in from the boards.',
      },
      {
        title: 'Pass into the stride',
        text: 'LD passes while LW is still skating towards them. The pass is short.',
        label: 'LW keeps skating down. LD passes short up to LW.',
      },
      {
        title: 'Swing to the outside',
        text: 'With the puck, LW turns in a curve to the outside, towards the boards.',
        label: 'LW skates with the puck in a curve to the outside towards the boards and back up.',
      },
      {
        title: 'With speed',
        text: 'LW skates up the boards with the puck.',
        label: 'LW skates with the puck up the left boards over the blue line.',
      },
    ],
  },
  'pass-swing-in': {
    caption: 'Pass first, then swing to the inside',
    steps: [
      {
        title: 'Far away',
        text: 'LD has the puck behind our goal. LW stands up at the blue line, an opponent nearby. The pass there would be long.',
        label: 'Our zone, our goal at the bottom. LD has the puck behind the goal on the left, an opponent skates at LD round the back of the goal. LW stands up on the left at the blue line, an opponent close to them. A dotted line shows the long passing lane.',
      },
      {
        title: 'Skate towards it',
        text: 'LW skates towards LD, a few metres in from the boards.',
        label: 'LD skates with the puck towards the left boards. LW skates down, a few metres in from the boards.',
      },
      {
        title: 'Pass into the stride',
        text: 'LD passes while LW is still skating towards them. The pass is short.',
        label: 'LW keeps skating down. LD passes short up to LW.',
      },
      {
        title: 'Swing to the inside',
        text: 'With the puck, LW turns in a curve to the inside, towards the middle.',
        label: 'LW skates with the puck in a curve inwards towards the middle and back up.',
      },
      {
        title: 'With speed',
        text: 'LW skates up through the middle with the puck.',
        label: 'LW skates with the puck left of the middle over the blue line.',
      },
    ],
  },
  'swing-in-pass': {
    caption: 'Swing to the inside, then the pass',
    steps: [
      {
        title: 'Covered',
        text: 'RD has the puck. RW stands far up the boards, an opponent right next to them. That way RW is covered.',
        label: 'Our zone and the neutral zone, our goal at the bottom. RD has the puck to the right of our goal. RW stands up on the right boards near the centre line, an opponent right next to them.',
      },
      {
        title: 'Skate towards it',
        text: 'RW skates down the boards, towards RD. The opponent follows, but is already a few metres away.',
        label: 'RW skates down the right boards to the blue line. The opponent follows at a distance.',
      },
      {
        title: 'Swing to the inside',
        text: 'RW skates a curve into the middle and forwards again. The pass comes at the end of the curve.',
        label: 'RW skates a curve down and into the middle and back up. RD passes to RW, the puck arrives at the end of the curve.',
      },
      {
        title: 'With speed',
        text: 'RW has the puck and already has speed. The opponent is standing still and can’t keep up.',
        label: 'RW skates fast with the puck up over the centre line. The opponent is left behind.',
      },
    ],
  },
  'swing-across': {
    caption: 'Swing across in front of the puck carrier, to the other side',
    steps: [
      {
        title: 'Covered',
        text: 'LD picks up the puck in the corner. LW stands up on the boards, an opponent right next to them.',
        label: 'Our zone, our goal at the bottom. LD has the puck in the left corner, an opponent behind LD. LW stands up on the left boards, an opponent right next to them.',
      },
      {
        title: 'Skate towards it',
        text: 'LD skates up the boards. LW skates towards LD, the opponent follows LW.',
        label: 'LD skates with the puck up the left boards. LW skates down, the opponent follows.',
      },
      {
        title: 'In front of LD',
        text: 'LW skates a wide swing in front of LD, right over to the other side. The opponent is on the boards, there is space in the middle.',
        label: 'LW skates a wide curve in front of LD to the right, across the middle, and back up. LD keeps skating with the puck.',
      },
      {
        title: 'The pass',
        text: 'LD passes diagonally forwards. LW takes the puck in their stride.',
        label: 'LD passes a long way diagonally up and to the right to LW on the other side.',
      },
      {
        title: 'Away from the opponent',
        text: 'LW skates up the middle with the puck. The opponent on the boards is far away.',
        label: 'LW skates with the puck up the middle over the blue line. The opponent is still on the left boards.',
      },
    ],
  },
  'give-and-go': {
    caption: 'The give-and-go',
    steps: [
      {
        title: 'LD has the puck',
        text: 'LD has the puck next to our goal, an opponent comes from behind. LW skates towards LD.',
        label: 'Our zone, our goal at the bottom. LD has the puck to the left of the goal, an opponent skates at LD round the back of the goal. LW stands up on the left at the blue line.',
      },
      {
        title: 'Skate towards it',
        text: 'LD sets off with the puck, the opponent follows. LW skates towards LD.',
        label: 'LD skates up a little with the puck, the opponent follows. LW skates down, a few metres in from the boards.',
      },
      {
        title: 'The first pass',
        text: 'LD passes short to LW.',
        label: 'LD passes short up to LW.',
      },
      {
        title: 'Swing and boards',
        text: 'LW skates a swing to the inside with the puck. The opponent goes to the puck, so to LW. LD skates out to the boards.',
        label: 'LW skates with the puck in a curve inwards towards the middle. The opponent follows LW. LD skates left to the boards.',
      },
      {
        title: 'The second pass',
        text: 'LW passes the puck back to LD on the boards. Nobody is there: the opponent is at LW.',
        label: 'LW passes across to the left to LD on the boards. LD skates up the boards.',
      },
      {
        title: 'Both moving',
        text: 'LD skates up the boards with the puck, LW follows in the middle. The puck goes there and straight back again: a give-and-go.',
        label: 'LD skates with the puck up the left boards over the blue line. LW follows left of the middle.',
      },
    ],
  },
  'drop-behind': {
    caption: 'Drop pass: a long way towards 10 o’clock, then past on the inside',
    steps: [
      {
        title: '10 o’clock',
        text: 'Imagine a clock, 12 o’clock is straight up the ice. LD skates with the puck towards 10 o’clock, forwards and to the left. An opponent comes from the front. C is high on the left.',
        label: 'Our zone, our goal at the bottom. LD has the puck to the right of the goal and skates diagonally up to the left. An opponent comes from the top. C is high on the left.',
      },
      {
        title: 'The opponent comes',
        text: 'The opponent skates at LD. LD keeps going towards 10 o’clock. C skates towards LD at an angle, towards 4 o’clock.',
        label: 'LD keeps skating with the puck diagonally up to the left. The opponent comes down at LD. C skates diagonally down to the right.',
      },
      {
        title: 'Draw the opponent in',
        text: 'LD keeps skating towards the boards and draws the opponent in. The opponent comes very close, on the upper side, and only watches LD and the puck. Only now is the drop pass safe.',
        label: 'LD keeps skating with the puck towards the left boards. The opponent is now very close, right above LD. C comes closer from the top left.',
      },
      {
        title: 'The drop pass',
        text: 'C passes LD on the inside, on the defensive side: between LD and our goal. Right now LD plays the puck back short. LD is between the puck and the opponent.',
        label: 'C skates past below LD. LD plays the puck short down to C. The opponent is above LD, on the other side.',
      },
      {
        title: 'Swing forwards',
        text: 'C turns with the puck in a swing forwards. LD skates on to the boards, and the opponent goes with LD.',
        label: 'C skates with the puck in a curve to the right and back up. LD skates on to the left boards, the opponent follows LD.',
      },
      {
        title: 'C is off',
        text: 'C skates up the ice with the puck. The opponent is on the boards with LD, far from the puck.',
        label: 'C skates with the puck up the middle over the blue line. The opponent and LD are on the left boards.',
      },
    ],
  },
  'cross-drop': {
    caption: 'Crossing with a drop pass',
    steps: [
      {
        title: 'Two going forward',
        text: 'LW skates up the left side with the puck. C skates along right of the middle.',
        label: 'Neutral zone, we attack upwards. LW has the puck on the left, C is right of the middle. Two opposing defenders wait at the top.',
      },
      {
        title: 'The paths cross',
        text: 'LW cuts diagonally towards the middle. C skates diagonally to the left, behind LW. The left defender watches LW.',
        label: 'LW skates diagonally to the middle with the puck. C skates diagonally to the left. The opposing left defender steps up towards LW.',
      },
      {
        title: 'Leave it',
        text: 'LW leaves the puck and skates on. The defender goes with LW.',
        label: 'LW skates on to the right, the puck stays in the middle. The opposing defender follows LW. C comes to the puck from the bottom right.',
      },
      {
        title: 'C takes over',
        text: 'C skates behind LW and arrives right at the puck. That is the drop pass.',
        label: 'C is at the puck. LW and the opposing defender are to the right of it.',
      },
      {
        title: 'Wrong side',
        text: 'C skates into the zone on the left with the puck. The defender went with LW and is now on the wrong side. LW and RW only cross the blue line after the puck, or it is offside.',
        label: 'C skates with the puck over the blue line on the left. The opposing left defender is in the middle, at LW. LW and RW are just outside the blue line.',
      },
    ],
  },
  'halfwall-space': {
    caption: 'Up the boards when there is space',
    steps: [
      {
        title: 'Puck on the boards',
        text: 'LW has the puck on the left boards. The nearest opponent is a few metres away. LW has space.',
        label: 'Attacking zone, the opponents’ goal at the top. LW has the puck on the left boards level with the faceoff circle. The opponents stand in front of the goal and in the middle. LD and RD are at the blue line.',
      },
      {
        title: 'Skate up',
        text: 'LW skates up the boards with the puck.',
        label: 'LW skates up the left boards with the puck, towards the blue line, to the edge of the faceoff circle.',
      },
      {
        title: 'Cut inside',
        text: 'LW cuts towards the middle. LD drops a little deeper on the boards, into the space LW has left.',
        label: 'LW skates inwards with the puck, along the edge of the left faceoff circle. LD skates a little way along the left boards towards the goal.',
      },
      {
        title: 'Three options',
        text: '1: pass to LD on the boards. 2: skate into the slot and shoot. 3: pass up to RD on the weak side.',
        label: 'Three arrows start at LW: 1, a pass to LD on the boards. 2, carrying the puck diagonally into the slot. 3, a long pass to RD at the right blue line.',
      },
    ],
  },
  'halfwall-cross': {
    caption: 'The defender crosses inside',
    steps: [
      {
        title: 'An opponent sticks close',
        text: 'LW has the puck on the left boards. An opponent is very close, on the inside of LW. Cutting inside won’t work.',
        label: 'Attacking zone, the opponents’ goal at the top. LW has the puck on the left boards, an opponent right next to them on the inside. LD stands at the blue line.',
      },
      {
        title: 'LD goes deep',
        text: 'LW skates up the boards. LD skates from the blue line deep into the zone, past LW on the inside.',
        label: 'LW skates up the boards with the puck, the opponent stays next to them. LD skates from the blue line towards the goal on the inside.',
      },
      {
        title: 'Pass along the boards',
        text: 'LW plays the puck along the boards deeper into the zone, right into LD’s path, and keeps skating up. The opponent goes with LW. LD takes the puck in their stride.',
        label: 'LW keeps skating towards the blue line and plays the puck along the boards towards the goal. The opponent follows LW. LD skates in a curve to the boards and takes the puck.',
      },
      {
        title: 'LD has space',
        text: 'LD keeps going towards the goal with the puck without slowing down. The opponent is up at LW. LD can shoot or pass to the front of the goal. LW takes over LD’s spot at the blue line.',
        label: 'LD skates with the puck in a curve from the boards inwards towards the goal. The opponent and LW are up at the blue line.',
      },
    ],
  },
  cycle: {
    caption: 'The cycle: a merry-go-round on the boards',
    steps: [
      {
        title: 'The way round',
        text: 'LW has the puck in the corner, an opponent pushes. The dotted line is the merry-go-round: up the boards, inside towards the goal, low back into the corner.',
        label: 'Attacking zone, the opponents’ goal at the top. LW has the puck in the left corner, an opponent right at them. C stands to the left in front of the goal. A dotted line runs in a circle: up the left boards, inside towards the goal and low back into the corner.',
      },
      {
        title: 'Up the boards',
        text: 'LW skates up the boards with the puck and protects it with their body. C skates deep into the corner.',
        label: 'LW skates up the left boards with the puck, the opponent follows on the inside. C skates into the left corner.',
      },
      {
        title: 'Back down the boards',
        text: 'LW plays the puck back along the boards into the corner, behind the opponent. C is there. LW keeps skating up, the opponent goes with them.',
        label: 'LW plays the puck along the boards back into the corner to C. LW keeps skating up, the opponent follows LW.',
      },
      {
        title: 'The merry-go-round turns',
        text: 'Now C skates up the boards with the puck. LW turns inside, towards the goal.',
        label: 'C skates up the left boards with the puck. The opponent turns and skates to C. LW skates inside into the high slot.',
      },
      {
        title: 'Open in front of the goal',
        text: 'The opponent is at C. Nobody is watching LW. C passes into the slot.',
        label: 'C passes from the boards into the slot to LW. No opponent is near LW.',
      },
      {
        title: 'Shot',
        text: 'LW shoots. The cycle has set a player free.',
        label: 'LW shoots from the slot at the goal.',
      },
    ],
  },
  'collapse-point': {
    caption: 'The opponents collapse: up, across, shot',
    steps: [
      {
        title: 'Everyone in front of the goal',
        text: 'All five opponents are in front of their goal. There is no space there. Up at the blue line it is open.',
        label: 'Attacking zone, the opponents’ goal at the top. All five opponents stand close together in front of their goal. LW has the puck on the left boards. Green areas show open ice in front of both defenders at the blue line.',
      },
      {
        title: 'Up to LD',
        text: 'LW plays the puck up to LD at the blue line.',
        label: 'LW passes diagonally down to LD at the blue line.',
      },
      {
        title: 'Across to RD',
        text: 'LD passes across the blue line to RD. RW stands in front of the goalie and blocks their view. C and LW get ready for the rebound.',
        label: 'LD passes across to RD. RW stands right in front of the goal. C goes to the left post, LW into the left slot.',
      },
      {
        title: 'Shot',
        text: 'RD shoots. Because of RW the goalie can hardly see the puck. If it bounces off, C and LW are there.',
        label: 'RD shoots from the blue line at the goal, past RW.',
      },
    ],
  },
  'collapse-switch': {
    caption: 'The opponents collapse: switch sides behind the goal',
    steps: [
      {
        title: 'Space on the other side',
        text: 'C has the puck in the left corner. The opponents are all in front of their goal. RW waits in the right corner, where it is open.',
        label: 'Attacking zone, the opponents’ goal at the top. C has the puck in the left corner. All opponents stand in front of the goal. RW waits low in the right corner, where a green area shows open ice.',
      },
      {
        title: 'Behind the goal',
        text: 'C plays the puck along the boards behind the goal to RW.',
        label: 'C plays the puck along the boards behind the goal into the right corner to RW.',
      },
      {
        title: 'The new cycle',
        text: 'RW skates up the right boards with the puck. An opponent comes. C follows behind the goal, LW goes to the front of the goal.',
        label: 'RW skates with the puck up the right boards towards the blue line, an opponent comes at RW. C skates behind the goal to the right, LW stands on the left in front of the goal.',
      },
      {
        title: 'The merry-go-round turns',
        text: 'RW plays the puck back along the boards into the corner to C. Now the merry-go-round turns on the other side, just like the classic cycle.',
        label: 'RW plays the puck back along the right boards into the corner to C. RW keeps skating towards the blue line, the opponent follows RW.',
      },
    ],
  },
  'collapse-expand': {
    caption: 'Back and forth until the hedgehog opens up',
    steps: [
      {
        title: 'Puck up high',
        text: 'The puck is with LD at the blue line. The opponents stand tight in front of their goal.',
        label: 'Attacking zone, the opponents’ goal at the top. LD has the puck at the blue line. All opponents stand tight in front of the goal. RW is in front of the goal, C low in the left corner, LW on the left boards.',
      },
      {
        title: 'Across to RD',
        text: 'LD passes across to RD. An opposing forward comes out towards RD.',
        label: 'LD passes across to RD. One opponent skates out of the slot towards RD, a second shifts to the right.',
      },
      {
        title: 'And back',
        text: 'RD passes back to LD. Now a forward comes out on the other side too. The hedgehog opens up.',
        label: 'RD passes back to LD. An opponent skates out of the slot towards LD.',
      },
      {
        title: 'Space in the slot',
        text: 'The opponents are spread out. There is space in the slot again. C skates into it.',
        label: 'C skates from the left corner into the slot, where a green area shows open ice.',
      },
      {
        title: 'The pass',
        text: 'LD sees the gap and passes to C.',
        label: 'LD passes diagonally into the slot to C, past the opponent who came out.',
      },
      {
        title: 'Shot',
        text: 'C shoots from the slot. RW stands in front of the goalie and blocks their view.',
        label: 'C shoots from the slot at the goal. RW is in front of the goal.',
      },
    ],
  },
};

export const storyText = { de, en };
