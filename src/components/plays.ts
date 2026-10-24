/**
 * The static game situations drawn by RinkPlay.svelte: where everyone stands (in rink
 * metres, see rink.ts) and the words around each drawing, in German and English.
 *
 * A play has one or more panels. Each panel is one zone; `zone` says whose goal is at
 * the bottom, and `verdict` marks a "do this" / "not like this" comparison.
 */
import { DANGER_ZONE, POST_X, GOAL_LINE, benches, bubble, secondPeriod, passShadow, viewCone, type Pt, type Scene, type View } from './rink';
import { animals } from './stories';

export interface PlayPanel {
  /**
   * own: our goal at the bottom; attack: the opponents' goal, drawn turned so it is at
   * the top; full: both; neutral: the neutral zone, our goal below the drawing; turned:
   * the full rink in period 2, drawn turned so our goal is at the top and the benches stay
   * where they are in period 1 (write the scene with secondPeriod()).
   */
  zone: 'own' | 'attack' | 'full' | 'neutral' | 'turned';
  /** How much of the rink to draw; one zone if left out. */
  view?: View;
  verdict?: 'good' | 'bad';
  scene: Scene;
}

const danger = { kind: 'danger', poly: DANGER_ZONE } as const;
const posts: [Pt, Pt] = [
  [-POST_X, GOAL_LINE],
  [POST_X, GOAL_LINE],
];

/* Our team at a faceoff on the left circle in our own zone (both panels of faceoff-own).
   Apart from C, nobody stands on the line from the goalie to the puck. */
const faceoffOwn: Scene['players'] = [
  { team: 'us', label: 'G', at: [0, 5] },
  { team: 'us', label: 'LD', at: [-12.2, 7.5] },
  { team: 'us', label: 'C', at: [-7, 8.3] },
  { team: 'us', label: 'LW', at: [-5.8, 5.2] },
  { team: 'us', label: 'RD', at: [-2.2, 9.6] },
  { team: 'us', label: 'RW', at: [1.8, 7.6] },
];

/* The opponents around the half-wall cross (halfwall-read), apart from the one next to LW. */
const halfwallReadThem: Scene['players'] = [
  { team: 'them', at: [4.5, 6] },
  { team: 'them', at: [-3, 6] },
  { team: 'them', at: [1.6, 11.6] },
];

/* Five defenders in their own zone, one goal-side on the puck carrier on our left boards
   (soft-areas). His passing shadow points at the low slot. */
const softAreaPuck: Pt = [11.3, 16.8];
const softAreaChecker: Pt = [8.6, 14.4];
const softAreaThem: Scene['players'] = [
  { team: 'them', at: softAreaChecker },
  { team: 'them', at: [1.8, 6.6] },
  { team: 'them', at: [-5.6, 9.4] },
  { team: 'them', at: [4.6, 18.8] },
  { team: 'them', at: [-6.4, 18.4] },
];
const softAreaShadow = { kind: 'shadow', poly: passShadow(softAreaPuck, softAreaChecker) } as const;

const geometry = {
  /* Abwehrseite: the defender on the wrong side, then between the puck carrier and the goal. */
  'goal-side': [
    {
      zone: 'own',
      verdict: 'bad',
      scene: {
        areas: [danger],
        players: [
          { team: 'them', at: [-5, 15] },
          { team: 'us', label: 'LD', at: [-8.5, 17.5] },
        ],
        puck: [-4.4, 13.9],
        moves: [
          { kind: 'skate', team: 'them', path: [[-5, 15], [-1.6, 8.2]] },
          { kind: 'skate', path: [[-8.5, 17.5], [-7.5, 14.5], [-6, 12.2]] },
        ],
      },
    },
    {
      zone: 'own',
      verdict: 'good',
      scene: {
        areas: [danger],
        players: [
          { team: 'them', at: [-6, 15] },
          { team: 'us', label: 'LD', at: [-3.6, 11.4] },
        ],
        puck: [-5.4, 13.9],
        moves: [
          { kind: 'lane', path: [[-6, 15], [0, 4.6]] },
          { kind: 'skate', team: 'them', path: [[-6, 15], [-11, 12.5], [-11.8, 6.8]] },
        ],
      },
    },
  ],

  /* What a shooter sees of the goal from the slot and from outside the dots. */
  'shot-angle': [
    {
      zone: 'own',
      scene: {
        areas: [danger, { kind: 'shot', poly: [[0.4, 8], ...posts] }],
        players: [{ team: 'them', at: [0.4, 9.6] }],
        puck: [0.4, 8],
      },
    },
    {
      zone: 'own',
      scene: {
        areas: [danger, { kind: 'shot', poly: [[-10.4, 8.1], ...posts] }],
        players: [{ team: 'them', at: [-11.6, 8.5] }],
        puck: [-10.4, 8.1],
      },
    },
  ],

  /* Keep the puck carrier outside the dots: the defender skates inside, the attacker
     ends up in the corner. The dotted lines run up from the dots. */
  'force-outside': [
    {
      zone: 'own',
      scene: {
        areas: [danger],
        players: [
          { team: 'them', at: [-11.5, 19.5] },
          { team: 'us', label: 'LD', at: [-7.8, 15.5] },
        ],
        puck: [-11, 18.3],
        moves: [
          { kind: 'lane', path: [[-7, 10], [-7, 22]] },
          { kind: 'lane', path: [[7, 10], [7, 22]] },
          { kind: 'skate', team: 'them', path: [[-11.5, 19.5], [-13.2, 10], [-10.8, 2.6]] },
          { kind: 'skate', path: [[-7.8, 15.5], [-9.2, 10.5], [-8.4, 6.2]] },
        ],
      },
    },
  ],

  /* Abwehrseite without the puck: the backchecking winger takes the inside lane. */
  backcheck: [
    {
      zone: 'own',
      scene: {
        areas: [danger],
        players: [
          { team: 'them', at: [-10.5, 15.5] },
          { team: 'them', at: [7, 18] },
          { team: 'us', label: 'LD', at: [-7.6, 12.4] },
          { team: 'us', label: 'RW', at: [3, 21.5] },
        ],
        puck: [-9.6, 14.6],
        moves: [
          { kind: 'lane', path: [[-9.6, 14.6], [3.6, 9.8]] },
          { kind: 'skate', team: 'them', path: [[7, 18], [3.6, 9.8]] },
          { kind: 'skate', path: [[3, 21.5], [0.6, 14], [1.9, 8.4]] },
        ],
      },
    },
  ],

  /* Zuordnung: three players went to the corner, nobody is in front of the goal.
     The RW coming into the zone fills the gap instead of joining them. */
  'free-area': [
    {
      zone: 'own',
      scene: {
        areas: [{ kind: 'gap', ellipse: { at: [0.6, 6.4], rx: 3.4, ry: 2.6 }, label: '?', labelAt: [-2.1, 7.4] }],
        players: [
          { team: 'them', at: [-11.5, 2.9] },
          { team: 'them', at: [-12.5, 12] },
          { team: 'them', at: [2.2, 8] },
          { team: 'them', at: [-9, 21] },
          { team: 'them', at: [8, 21] },
          { team: 'us', label: 'LD', at: [-9, 4.8] },
          { team: 'us', label: 'RD', at: [-8.8, 1.6] },
          { team: 'us', label: 'C', at: [-10.2, 10.4] },
          { team: 'us', label: 'LW', at: [-8.5, 17.2] },
          { team: 'us', label: 'RW', at: [5, 20.5] },
        ],
        puck: [-10.6, 1.5],
        moves: [{ kind: 'skate', path: [[5, 20.5], [4.5, 11], [0.5, 5.6]] }],
      },
    },
  ],

  /* Defensive support, overload: LD attacks the puck carrier, C stays a few metres away
     as the helper, ready to take the puck or step in. */
  overload: [
    {
      zone: 'own',
      scene: {
        areas: [{ kind: 'zone', ellipse: { at: [-11.4, 11.6], rx: 3.8, ry: 5.2 }, label: '2:1', labelAt: [-12.6, 17.6] }],
        players: [
          { team: 'them', at: [-13, 11] },
          { team: 'them', at: [-10, 3.2] },
          { team: 'them', at: [2.2, 8] },
          { team: 'them', at: [-9, 21] },
          { team: 'them', at: [8, 21] },
          { team: 'us', label: 'LD', at: [-8.6, 4.8], ghost: true },
          { team: 'us', label: 'C', at: [-4.8, 12.6], ghost: true },
          { team: 'us', label: 'LD', at: [-11.2, 8.6] },
          { team: 'us', label: 'C', at: [-9.2, 14.6] },
          { team: 'us', label: 'RD', at: [0.6, 5.5] },
          { team: 'us', label: 'LW', at: [-7.6, 18] },
          { team: 'us', label: 'RW', at: [2.4, 13.6] },
        ],
        puck: [-12.4, 9.9],
        moves: [
          { kind: 'skate', path: [[-8.6, 4.8], [-11.2, 8.6]], trim: 1.5 },
          { kind: 'skate', path: [[-4.8, 12.6], [-9.2, 14.6]], trim: 1.5 },
        ],
      },
    },
  ],

  /* Pin and pick up: LD pins the opponent against the side boards, C takes the loose
     puck from below. */
  pin: [
    {
      zone: 'own',
      scene: {
        players: [
          { team: 'them', at: [-13.5, 8] },
          { team: 'them', at: [2.2, 8] },
          { team: 'them', at: [-3, 14.5] },
          { team: 'them', at: [-9, 21] },
          { team: 'them', at: [8, 21] },
          { team: 'us', label: 'LD', at: [-11, 7.2] },
          { team: 'us', label: 'C', at: [-11.6, 4.4] },
          { team: 'us', label: 'RD', at: [0.6, 5.5] },
          { team: 'us', label: 'LW', at: [-12.8, 16] },
          { team: 'us', label: 'RW', at: [3, 14] },
        ],
        puck: [-13.3, 5.2],
        moves: [
          { kind: 'skate', step: 1, path: [[-6, 12], [-11, 7.2]], trim: 1.6 },
          { kind: 'skate', step: 2, path: [[-4.4, 2.6], [-11.6, 4.4]], trim: 1.6 },
        ],
      },
    },
  ],

  /* Offensive support out of the own zone: LD has the puck in the corner. Near support
     on the boards and low in the middle, far support behind the net and up the far side. */
  'near-far': [
    {
      zone: 'own',
      scene: {
        areas: [
          { kind: 'near', ellipse: { at: [-13.1, 11.5], rx: 2.4, ry: 3 } },
          { kind: 'near', ellipse: { at: [-3.8, 5.2], rx: 2.4, ry: 2.4 } },
          { kind: 'far', ellipse: { at: [5.6, 2.3], rx: 2.4, ry: 2.2 } },
          { kind: 'far', ellipse: { at: [12.4, 17], rx: 2.4, ry: 3 } },
        ],
        players: [
          { team: 'them', at: [-6.8, 7.4] },
          { team: 'them', at: [4, 12.5] },
          { team: 'them', at: [-9, 21] },
          { team: 'us', label: 'LD', at: [-9.6, 3] },
          { team: 'us', label: 'LW', at: [-13.4, 11.5] },
          { team: 'us', label: 'C', at: [-3.8, 5.2] },
          { team: 'us', label: 'RD', at: [5.6, 2.3] },
          { team: 'us', label: 'RW', at: [12.4, 17] },
        ],
        puck: [-8.4, 2.4],
        moves: [
          { kind: 'skate', team: 'them', path: [[-6.8, 7.4], [-8.4, 5]] },
          { kind: 'pass', path: [[-9.8, 4.2], [-13.4, 11.5]], trim: 1.5 },
          { kind: 'pass', path: [[-8.4, 2.6], [-3.8, 5.2]], trim: 1.5 },
          { kind: 'pass', path: [[-8.4, 2.2], [0, 1.9], [5.6, 2.3]], trim: 1.5 },
        ],
      },
    },
  ],

  /* Attacking zone, puck carrier pressed by two opponents in the corner. We face the
     goal, so our left side is at positive x (see rink.ts). */
  'pressure-support': [
    {
      zone: 'attack',
      verdict: 'bad',
      scene: {
        players: [
          { team: 'them', at: [10.2, 5.9] },
          { team: 'them', at: [12.6, 7.8] },
          { team: 'them', at: [1.3, 5.8] },
          { team: 'them', at: [-2.2, 6] },
          { team: 'them', at: [7, 16] },
          { team: 'us', label: 'C', at: [12.8, 4.6] },
          { team: 'us', label: 'LW', at: [1.6, 8.8] },
          { team: 'us', label: 'RW', at: [-2.4, 9] },
          { team: 'us', label: 'LD', at: [9, 20.5] },
          { team: 'us', label: 'RD', at: [-9, 20.5] },
        ],
        puck: [13, 3.4],
        moves: [
          { kind: 'lane', path: [[12.8, 4.6], [1.6, 8.8]] },
          { kind: 'lane', path: [[12.8, 4.6], [-2.4, 9]] },
        ],
      },
    },
    {
      zone: 'attack',
      verdict: 'good',
      scene: {
        areas: [
          { kind: 'near', ellipse: { at: [9.5, 1.8], rx: 2.4, ry: 2 } },
          { kind: 'far', ellipse: { at: [3, 11.5], rx: 2.4, ry: 2.4 } },
        ],
        players: [
          { team: 'them', at: [10.2, 5.9] },
          { team: 'them', at: [12.6, 7.8] },
          { team: 'them', at: [1.3, 5.8] },
          { team: 'them', at: [-2.2, 6] },
          { team: 'them', at: [7, 16] },
          { team: 'us', label: 'LW', at: [1.6, 8.8], ghost: true },
          { team: 'us', label: 'RW', at: [-2.4, 9], ghost: true },
          { team: 'us', label: 'C', at: [12.8, 4.6] },
          { team: 'us', label: 'LW', at: [9.5, 1.8] },
          { team: 'us', label: 'RW', at: [3, 11.5] },
          { team: 'us', label: 'LD', at: [9, 20.5] },
          { team: 'us', label: 'RD', at: [-9, 20.5] },
        ],
        puck: [13, 3.4],
        moves: [
          { kind: 'skate', path: [[1.6, 8.8], [4, 2], [9.5, 1.8]], trim: 1.5 },
          { kind: 'skate', path: [[-2.4, 9], [3, 11.5]], trim: 1.5 },
          { kind: 'pass', path: [[12.4, 3.2], [9.5, 1.8]], trim: 1.4 },
        ],
      },
    },
  ],
  /* Abwehrseite starts in the neutral zone: the defenders skate back inside the dot
     lines, sticks pointing outside, and the attackers stay on the outside lanes. */
  'neutral-zone': [
    {
      zone: 'own',
      view: 'half',
      scene: {
        areas: [danger],
        players: [
          { team: 'them', at: [-11, 29] },
          { team: 'them', at: [11, 27.5] },
          { team: 'us', label: 'LD', at: [-5.2, 25] },
          { team: 'us', label: 'RD', at: [5.2, 24.5] },
          { team: 'us', label: 'C', at: [0, 29.5] },
        ],
        puck: [-10.6, 27.6],
        moves: [
          { kind: 'lane', path: [[-7, 10], [-7, 31]] },
          { kind: 'lane', path: [[7, 10], [7, 31]] },
          { kind: 'skate', team: 'them', path: [[-11, 29], [-13, 22], [-12.2, 13]] },
          { kind: 'skate', team: 'them', path: [[11, 27.5], [12.8, 21], [12, 13]] },
          { kind: 'skate', path: [[-5.2, 25], [-6, 15.5]], trim: 0 },
          { kind: 'skate', path: [[5.2, 24.5], [5.9, 15.5]] },
          { kind: 'skate', path: [[0, 29.5], [0, 19]] },
          { kind: 'stick', path: [[-6.4, 25.6], [-8.4, 26.7]] },
          { kind: 'stick', path: [[6.4, 25.1], [8.4, 26.2]] },
        ],
      },
    },
  ],

  /* Offside: LW is in the zone before the puck. Then the same rush with LW waiting at
     the line. We face the goal, so our LW is at positive x (see rink.ts). */
  'offside-entry': [
    {
      zone: 'attack',
      view: 'half',
      scene: {
        areas: [{ kind: 'gap', ellipse: { at: [8, 17], rx: 2.4, ry: 2.4 }, label: '!', labelAt: [11.6, 19] }],
        players: [
          { team: 'them', at: [5, 13] },
          { team: 'them', at: [-5, 12.5] },
          { team: 'them', at: [-3, 26] },
          { team: 'us', label: 'C', at: [1, 27] },
          { team: 'us', label: 'LW', at: [8, 17] },
          { team: 'us', label: 'RW', at: [-9, 25.5] },
        ],
        puck: [1, 25.6],
        moves: [{ kind: 'skate', path: [[1, 27], [1, 20]] }],
      },
    },
    {
      zone: 'attack',
      view: 'half',
      scene: {
        players: [
          { team: 'them', at: [5, 13] },
          { team: 'them', at: [-5, 12.5] },
          { team: 'them', at: [-3, 26] },
          { team: 'us', label: 'C', at: [1, 22.6] },
          { team: 'us', label: 'LW', at: [8, 23.6] },
          { team: 'us', label: 'RW', at: [-9, 25.5] },
        ],
        puck: [1, 21.1],
        moves: [
          { kind: 'skate', path: [[1, 22.6], [1, 15]], trim: 1.5 },
          { kind: 'skate', path: [[8, 23.6], [8.5, 15]], trim: 1.5 },
        ],
      },
    },
  ],

  /* Delayed offside: the opponents have the puck in their zone. All three forwards
     skate back to the blue line before anyone plays the puck again. */
  /* The puck slides out over the blue line while our players are still in the zone.
     LD gets it and waits: everyone leaves the zone, RD skates back out as a passing
     option, LD passes across, then RD attacks on the other side. We face the goal, so
     our left side is at positive x (see rink.ts). */
  'puck-out': [
    {
      zone: 'attack',
      view: 'half',
      scene: {
        players: [
          { team: 'them', at: [4, 14] },
          { team: 'them', at: [-4, 10] },
          { team: 'them', at: [7, 18] },
          { team: 'them', at: [-3, 17] },
          { team: 'us', label: 'LW', at: [10, 9] },
          { team: 'us', label: 'C', at: [1, 11] },
          { team: 'us', label: 'RW', at: [-10, 12] },
          { team: 'us', label: 'RD', at: [-8, 20] },
          { team: 'us', label: 'LD', at: [9, 25] },
        ],
        puck: [8.6, 23.5],
        moves: [
          { kind: 'skate', path: [[10, 9], [12.5, 21.8]] },
          { kind: 'skate', path: [[1, 11], [1.5, 21.8]] },
          { kind: 'skate', path: [[-10, 12], [-11.5, 21.8]] },
          { kind: 'skate', path: [[-8, 20], [-7, 26.6]] },
          { kind: 'pass', path: [[8.6, 23.9], [-6.6, 26.4]], trim: 1.4, step: 1 },
        ],
      },
    },
    {
      zone: 'attack',
      view: 'half',
      scene: {
        players: [
          { team: 'them', at: [4, 16] },
          { team: 'them', at: [-3, 9] },
          { team: 'them', at: [8, 19] },
          { team: 'them', at: [-2, 16] },
          { team: 'us', label: 'LW', at: [12.3, 22.6] },
          { team: 'us', label: 'C', at: [1.5, 22.6] },
          { team: 'us', label: 'RW', at: [-11.5, 22.6] },
          { team: 'us', label: 'RD', at: [-7, 26.6] },
          { team: 'us', label: 'LD', at: [5, 27] },
        ],
        puck: [-6.6, 25.4],
        moves: [
          { kind: 'carry', path: [[-6.8, 25.2], [-8, 17.5]], step: 2 },
          { kind: 'skate', path: [[-11.5, 22.6], [-12, 18.5]] },
          { kind: 'skate', path: [[1.5, 22.6], [1.2, 18.5]] },
          { kind: 'skate', path: [[12.3, 22.6], [11.5, 18.5]] },
        ],
      },
    },
  ],

  'delayed-offside': [
    {
      zone: 'attack',
      view: 'half',
      scene: {
        players: [
          { team: 'them', at: [-4, 7] },
          { team: 'them', at: [4.5, 9] },
          { team: 'them', at: [-10, 11] },
          { team: 'them', at: [5, 18] },
          { team: 'us', label: 'LW', at: [9.5, 13] },
          { team: 'us', label: 'C', at: [1, 15.5] },
          { team: 'us', label: 'RW', at: [-8, 17] },
          { team: 'us', label: 'LD', at: [8, 26.5] },
          { team: 'us', label: 'RD', at: [-8, 26.5] },
        ],
        puck: [-3.2, 5.8],
        moves: [
          { kind: 'skate', path: [[9.5, 13], [9.5, 22]] },
          { kind: 'skate', path: [[1, 15.5], [1.5, 22]] },
          { kind: 'skate', path: [[-8, 17], [-8, 22]] },
        ],
      },
    },
  ],

  /* Icing: shot from our own half across the opponents' goal line. Then a shot from
     beyond the centre line, which is not icing. */
  icing: [
    {
      zone: 'full',
      view: 'full',
      scene: {
        players: [
          { team: 'them', at: [2, 15] },
          { team: 'them', at: [6, 30] },
          { team: 'them', at: [0, 49] },
          { team: 'us', label: 'LD', at: [-5, 11] },
          { team: 'us', label: 'C', at: [3, 20] },
          { team: 'us', label: 'LW', at: [-9, 28] },
        ],
        puck: [6, 58.6],
        moves: [{ kind: 'shot', path: [[-4.4, 12.4], [6, 58.6]], trim: 0.8 }],
      },
    },
    {
      zone: 'full',
      view: 'full',
      scene: {
        players: [
          { team: 'them', at: [-2, 26] },
          { team: 'them', at: [6, 40] },
          { team: 'them', at: [-2, 49] },
          { team: 'us', label: 'LD', at: [-5, 24] },
          { team: 'us', label: 'C', at: [-3, 34] },
          { team: 'us', label: 'LW', at: [-9, 38] },
        ],
        puck: [6, 58.6],
        moves: [{ kind: 'shot', path: [[-2.6, 35.3], [6, 58.6]], trim: 0.8 }],
      },
    },
  ],

  /* Hybrid icing: whoever leads the race when the first player reaches the dots. */
  'icing-race': [
    {
      zone: 'attack',
      scene: {
        players: [
          { team: 'them', at: [4, 14] },
          { team: 'us', label: 'C', at: [-2, 19] },
        ],
        puck: [9, 1.8],
        moves: [
          { kind: 'lane', path: [[-15, 10], [15, 10]] },
          { kind: 'skate', team: 'them', path: [[4, 14], [8.6, 3.4]], trim: 1.5 },
          { kind: 'skate', path: [[-2, 19], [3.5, 9], [8, 4]], trim: 1.5 },
        ],
      },
    },
  ],

  /* Delayed penalty: we keep the puck in their zone, our goalie skates to the bench and
     an extra skater (+1) comes on. Our goal is empty. */
  'delayed-penalty': [
    {
      zone: 'full',
      view: 'full',
      scene: {
        areas: [
          { kind: 'bench', poly: [[-15, 22], [-14, 22], [-14, 30], [-15, 30]] },
          { kind: 'gap', ellipse: { at: [0, 5], rx: 3.2, ry: 2.2 }, label: '!', labelAt: [4.6, 6.2] },
        ],
        players: [
          { team: 'them', at: [2, 53] },
          { team: 'them', at: [-5, 51.5] },
          { team: 'them', at: [9, 45] },
          { team: 'them', at: [-8, 43] },
          { team: 'them', at: [3, 44] },
          { team: 'us', label: 'G', at: [0, 5.5], ghost: true },
          { team: 'us', label: 'G', at: [-12.8, 25.5] },
          { team: 'us', label: '+1', at: [-3, 40.5] },
          { team: 'us', label: 'C', at: [5.5, 49.5] },
          { team: 'us', label: 'LW', at: [-10, 47.5] },
          { team: 'us', label: 'RW', at: [10, 52] },
          { team: 'us', label: 'LD', at: [-7, 38.5] },
          { team: 'us', label: 'RD', at: [7, 39.5] },
        ],
        puck: [5, 51],
        moves: [
          { kind: 'skate', path: [[0, 5.5], [-10, 9], [-12.8, 25.5]], trim: 1.6 },
          { kind: 'skate', path: [[-13, 29.5], [-3, 40.5]], trim: 1.6 },
        ],
      },
    },
  ],
  /* Line changes: the way to the bench from our zone and from the attacking zone, in
     periods 1 and 3 (bench in our half) and in period 2 (bench in their half). */
  'bench-distance': [
    {
      zone: 'full',
      view: 'full',
      scene: {
        areas: benches('odd'),
        players: [
          { team: 'us', label: 'G', at: [0, 5.5] },
          { team: 'us', label: 'LD', at: [-8, 9] },
          { team: 'us', label: 'LW', at: [-9, 51] },
        ],
        moves: [
          { kind: 'skate', path: [[-8, 9], [-12, 15], [-13, 24.5]], trim: 0.2 },
          { kind: 'skate', path: [[-9, 51], [-12.6, 42], [-13, 28.5]], trim: 0.2 },
        ],
      },
    },
    {
      zone: 'turned',
      view: 'full',
      scene: secondPeriod({
        areas: benches('even'),
        players: [
          { team: 'us', label: 'G', at: [0, 5.5] },
          { team: 'us', label: 'LD', at: [-8, 9] },
          { team: 'us', label: 'LW', at: [-9, 51] },
        ],
        moves: [
          { kind: 'skate', path: [[-8, 9], [-12.6, 18], [-13, 31.5]], trim: 0.2 },
          { kind: 'skate', path: [[-9, 51], [-12.4, 45], [-13, 36.5]], trim: 0.2 },
        ],
      }),
    },
  ],

  /* Period 2: changing a defender while the opponents come at our goal leaves LD alone
     against two; changing while we attack costs nothing, and RD stays back. */
  'long-change': [
    {
      zone: 'turned',
      view: 'full',
      verdict: 'bad',
      scene: secondPeriod({
        areas: [...benches('even'), { kind: 'gap', ellipse: { at: [-3, 12], rx: 4, ry: 3 }, label: '!', labelAt: [-8.4, 12] }],
        players: [
          { team: 'them', at: [4, 27] },
          { team: 'them', at: [-5, 29] },
          { team: 'them', at: [10, 35] },
          { team: 'them', at: [-2, 43] },
          { team: 'them', at: [6, 47] },
          { team: 'us', label: 'G', at: [0, 5.5] },
          { team: 'us', label: 'LD', at: [1.5, 16] },
          { team: 'us', label: 'RD', at: [-12.4, 28.5] },
          { team: 'us', label: 'RD', at: [-12.4, 36.4] },
          { team: 'us', label: 'C', at: [5, 38] },
          { team: 'us', label: 'LW', at: [-6, 41] },
          { team: 'us', label: 'RW', at: [11, 42] },
        ],
        puck: [3.4, 25.7],
        moves: [
          { kind: 'carry', team: 'them', path: [[3.4, 25.7], [2.6, 18.6]], trim: 0.2 },
          { kind: 'skate', team: 'them', path: [[-5, 29], [-4.6, 19]], trim: 0.2 },
          { kind: 'skate', path: [[-12.4, 28.5], [-13, 32.6]], trim: 0.2 },
          { kind: 'skate', path: [[-12.4, 36.4], [-9, 33], [-6, 26]], trim: 0.2 },
        ],
      }),
    },
    {
      zone: 'turned',
      view: 'full',
      verdict: 'good',
      scene: secondPeriod({
        areas: benches('even'),
        players: [
          { team: 'them', at: [-6, 52] },
          { team: 'them', at: [2, 53] },
          { team: 'them', at: [8, 48] },
          { team: 'them', at: [-3, 44] },
          { team: 'them', at: [5, 42.5] },
          { team: 'us', label: 'LW', at: [-10.5, 50] },
          { team: 'us', label: 'C', at: [1, 48] },
          { team: 'us', label: 'RW', at: [11, 51] },
          { team: 'us', label: 'LD', at: [-8, 39.5] },
          { team: 'us', label: 'LD', at: [-12.4, 32] },
          { team: 'us', label: 'RD', at: [6, 39] },
        ],
        puck: [-9.6, 48.8],
        moves: [
          { kind: 'skate', path: [[-8, 39.5], [-13, 37]], trim: 0.2 },
          { kind: 'skate', path: [[-12.4, 32], [-6.5, 36]], trim: 0.2 },
        ],
      }),
    },
  ],

  /* Periods 1 and 3: the opponents take the puck the other way, the bench is on our way
     back. The tired LW changes, the fresh LW comes on ahead of the puck. */
  'backcheck-change': [
    {
      zone: 'full',
      view: 'full',
      scene: {
        areas: benches('odd'),
        players: [
          { team: 'them', at: [4, 42] },
          { team: 'them', at: [-6, 45] },
          { team: 'them', at: [11, 47] },
          { team: 'them', at: [-3, 53] },
          { team: 'them', at: [6, 53] },
          { team: 'us', label: 'LW', at: [-11.5, 41] },
          { team: 'us', label: 'LW', at: [-12.4, 24] },
          { team: 'us', label: 'C', at: [1, 47.5] },
          { team: 'us', label: 'RW', at: [10, 43] },
          { team: 'us', label: 'LD', at: [-5, 21] },
          { team: 'us', label: 'RD', at: [5, 20] },
        ],
        puck: [3.4, 40.7],
        moves: [
          { kind: 'carry', team: 'them', path: [[3.4, 40.7], [3, 33]], trim: 0.2 },
          { kind: 'skate', team: 'them', path: [[-6, 45], [-6.6, 36]], trim: 0.2 },
          { kind: 'skate', path: [[-11.5, 41], [-13, 34], [-13, 28.2]], trim: 0.2 },
          { kind: 'skate', path: [[-12.4, 24], [-9, 26], [-7, 30]], trim: 0.2 },
          { kind: 'skate', path: [[1, 47.5], [1.2, 39]], trim: 0.2 },
        ],
      },
    },
  ],
  /* Faceoff on our left circle in our own zone, after the DEB's drawing: LD on the hash
     marks at the boards, LW behind the C, RD on the inner hash marks, RW in the slot. */
  'faceoff-own': [
    {
      zone: 'own',
      view: 'half',
      scene: {
        players: [
          { team: 'them', at: [-12.6, 12.8] },
          { team: 'them', at: [-7, 11.7] },
          { team: 'them', at: [-1.8, 12.6] },
          { team: 'them', at: [-12.5, 20.5] },
          { team: 'them', at: [-1.5, 20.5] },
          ...faceoffOwn,
        ],
        puck: [-7, 10],
        moves: [
          { kind: 'sight', path: [[0, 5], [-7, 10]] },
          { kind: 'pass', team: 'them', path: [[-7, 10], [-12.5, 20.5]], trim: 1.6, step: 1 },
          { kind: 'skate', path: [[-5.8, 5.2], [-2, 14], [-12.5, 20.5]], trim: 2.2 },
          { kind: 'skate', path: [[1.8, 7.6], [2.4, 14], [-1.5, 20.5]], trim: 2.2 },
        ],
      },
    },
    {
      zone: 'own',
      view: 'half',
      scene: {
        players: faceoffOwn,
        puck: [-7, 10],
        moves: [
          { kind: 'pass', path: [[-7, 10], [-10, 4.4]], step: 1 },
          { kind: 'skate', path: [[-12.2, 7.5], [-10.4, 4.8]] },
          { kind: 'pass', path: [[-10, 4.2], [1, -1.6], [13, 5.2]], trim: 0.6, step: 2 },
          { kind: 'skate', path: [[1.8, 7.6], [12.6, 5.4]] },
          { kind: 'skate', path: [[-5.8, 5.2], [-4, 30], [2, 29.5]] },
          { kind: 'skate', path: [[-7, 8.3], [-4, 15], [2.5, 18]] },
        ],
      },
    },
  ],

  /* Faceoff won on the right circle in the attacking zone. We face the goal, so our
     right side is at negative x (see rink.ts). First everyone moves into place, then RD
     at the blue line has four options. */
  'faceoff-attack': [
    {
      zone: 'attack',
      scene: {
        players: [
          { team: 'us', label: 'RW', at: [-12.1, 9.2] },
          { team: 'us', label: 'C', at: [-7, 11.6] },
          { team: 'us', label: 'LW', at: [-2, 9.3] },
          { team: 'us', label: 'RD', at: [-11.8, 21] },
          { team: 'us', label: 'LD', at: [-1.5, 21.2] },
        ],
        puck: [-7, 10],
        moves: [
          { kind: 'pass', path: [[-7, 10], [-11.8, 21]], trim: 1.6 },
          { kind: 'skate', path: [[-2, 9.3], [4.2, 11]] },
          { kind: 'skate', path: [[-1.5, 21.2], [6.5, 20.8]], trim: 0.2 },
          { kind: 'skate', path: [[-12.1, 9.2], [-12.9, 5.6]] },
          { kind: 'skate', path: [[-7, 11.6], [-5, 5], [0, 7.3]] },
        ],
      },
    },
    {
      zone: 'attack',
      scene: {
        players: [
          { team: 'us', label: 'RW', at: [-12.9, 5.6] },
          { team: 'us', label: 'C', at: [0, 7.3] },
          { team: 'us', label: 'LW', at: [4.2, 11] },
          { team: 'us', label: 'RD', at: [-11.8, 21] },
          { team: 'us', label: 'LD', at: [6.5, 20.8] },
        ],
        puck: [-10.9, 19.9],
        moves: [
          { kind: 'shot', path: [[-10.9, 19.9], [-0.2, 4.4]], step: 1 },
          { kind: 'pass', path: [[-10.4, 20.8], [6.5, 20.8]], trim: 1.6, step: 2 },
          { kind: 'pass', path: [[-12.4, 19.8], [-15.6, 12], [-12.9, 5.6]], trim: 1.6, step: 3, stepSide: -1 },
          { kind: 'pass', path: [[-10.6, 20.2], [4.2, 11]], trim: 1.6, step: 4 },
        ],
      },
    },
  ],
  /* Faceoffs in the neutral zone, after the DEB's drawings: at centre ice, and on the
     dot just outside the opponents' zone. We win the draw back to a defender, the
     opponents' wingers chase our defenders. */
  'faceoff-neutral': [
    {
      zone: 'neutral',
      view: 'neutral',
      scene: {
        players: [
          { team: 'them', at: [-4.8, 31.7] },
          { team: 'them', at: [0.4, 31.6] },
          { team: 'them', at: [4.9, 31.9] },
          { team: 'them', at: [-2.9, 37.7] },
          { team: 'them', at: [2.2, 37.8] },
          { team: 'us', label: 'LW', at: [-4.9, 28.7] },
          { team: 'us', label: 'C', at: [-0.4, 28.4] },
          { team: 'us', label: 'RW', at: [4.8, 29.1] },
          { team: 'us', label: 'LD', at: [-3.8, 23] },
          { team: 'us', label: 'RD', at: [2, 23] },
        ],
        puck: [0, 30],
        moves: [
          { kind: 'pass', path: [[0, 30], [2, 23]], trim: 1.6, step: 1 },
          { kind: 'skate', team: 'them', path: [[-4.8, 31.7], [-6.2, 27], [-3.8, 23]], trim: 2.2 },
          { kind: 'skate', team: 'them', path: [[4.9, 31.9], [5.6, 27], [2, 23]], trim: 2.2 },
          { kind: 'skate', team: 'them', path: [[-2.9, 37.7], [-3.6, 33.6]] },
          { kind: 'skate', team: 'them', path: [[2.2, 37.8], [4.2, 34]] },
        ],
      },
    },
    {
      zone: 'neutral',
      view: 'neutral',
      scene: {
        players: [
          { team: 'them', at: [2.4, 38.4] },
          { team: 'them', at: [7.2, 38] },
          { team: 'them', at: [11.2, 38.6] },
          { team: 'them', at: [4.2, 43.8] },
          { team: 'them', at: [9.2, 43.9] },
          { team: 'us', label: 'LW', at: [2.1, 35.4] },
          { team: 'us', label: 'C', at: [6.6, 35] },
          { team: 'us', label: 'RW', at: [12, 35.6] },
          { team: 'us', label: 'LD', at: [1.6, 29.6] },
          { team: 'us', label: 'RD', at: [9.4, 29.6] },
        ],
        puck: [7, 36.5],
        moves: [
          { kind: 'pass', path: [[7, 36.5], [9.4, 29.6]], trim: 1.6, step: 1 },
          { kind: 'pass', path: [[9.4, 29.6], [1.6, 29.6]], trim: 1.6, step: 2 },
          { kind: 'skate', team: 'them', path: [[2.4, 38.4], [0.2, 34], [1.6, 29.6]], trim: 2.2 },
          { kind: 'skate', team: 'them', path: [[11.2, 38.6], [12.4, 33.5], [9.4, 29.6]], trim: 2.2 },
          { kind: 'skate', team: 'them', path: [[4.2, 43.8], [3.4, 39.8]], trim: 0.6 },
          { kind: 'skate', team: 'them', path: [[9.2, 43.9], [11.2, 40.4]], trim: 0.6 },
        ],
      },
    },
  ],
  /* The four roles: in attack the puck carrier is König and everyone else Satellit; in
     defence the player at the puck carrier is Jäger and everyone else Wächter. */
  'four-roles': [
    {
      zone: 'attack',
      scene: {
        areas: [danger],
        players: [
          { team: 'them', at: [6.8, 10.8] },
          { team: 'them', at: [10, 6.8] },
          { team: 'them', at: [1.6, 5.6] },
          { team: 'them', at: [-3.2, 8.4] },
          { team: 'them', at: [-7.5, 15.5] },
          { team: 'us', label: 'K', at: [9, 13.5] },
          { team: 'us', label: 'S', at: [11.5, 4.5] },
          { team: 'us', label: 'S', at: [-0.6, 7.2] },
          { team: 'us', label: 'S', at: [8, 20.5] },
          { team: 'us', label: 'S', at: [-8, 20.5] },
        ],
        puck: [8.4, 12.2],
        moves: [
          { kind: 'carry', path: [[8.4, 12.2], [8.2, 15.6], [5, 17]], trim: 0.6 },
          { kind: 'lane', path: [[9, 13.5], [11.5, 4.5]] },
          { kind: 'lane', path: [[9, 13.5], [8, 20.5]] },
          { kind: 'lane', path: [[9, 13.5], [-8, 20.5]] },
        ],
      },
    },
    {
      zone: 'own',
      scene: {
        areas: [danger],
        players: [
          { team: 'them', at: [-9.6, 13.6] },
          { team: 'them', at: [2.6, 9] },
          { team: 'them', at: [-1, 15.4] },
          { team: 'them', at: [-9.5, 21.5] },
          { team: 'them', at: [8.5, 20.5] },
          { team: 'us', label: 'J', at: [-6.4, 11.2] },
          { team: 'us', label: 'W', at: [1.4, 7] },
          { team: 'us', label: 'W', at: [-1.2, 12.6] },
          { team: 'us', label: 'W', at: [-8.2, 18.8] },
          { team: 'us', label: 'W', at: [6.8, 17.6] },
        ],
        puck: [-9, 12.6],
        moves: [
          { kind: 'stick', path: [[-6.4, 11.2], [-7.9, 12.1]] },
          { kind: 'lane', path: [[-9, 12.6], [2.6, 9]] },
          { kind: 'lane', path: [[-9, 12.6], [-1, 15.4]] },
          { kind: 'lane', path: [[-9, 12.6], [8.5, 20.5]] },
        ],
      },
    },
  ],

  /* König: open ice at the zone entry and in the corner. Attacking zone, our left at +x. */
  'open-ice': [
    {
      zone: 'attack',
      scene: {
        areas: [danger, { kind: 'open', ellipse: { at: [0.5, 16.5], rx: 4, ry: 2.6 } }],
        players: [
          { team: 'them', at: [9.5, 16.5] },
          { team: 'them', at: [6, 13.6] },
          { team: 'them', at: [-6.5, 12.5] },
          { team: 'them', at: [1, 8] },
          { team: 'us', label: 'K', at: [10.5, 21.5] },
          { team: 'us', label: 'S', at: [-9, 19] },
        ],
        puck: [9.8, 20.4],
        moves: [{ kind: 'carry', path: [[9.8, 20.4], [5, 19.6], [1.6, 16.8]], trim: 0.4 }],
      },
    },
    {
      zone: 'attack',
      scene: {
        areas: [danger, { kind: 'open', ellipse: { at: [-1, 2], rx: 3.6, ry: 1.5 } }],
        players: [
          { team: 'them', at: [9.6, 7.6] },
          { team: 'them', at: [6.4, 5.4] },
          { team: 'them', at: [-2.5, 8] },
          { team: 'us', label: 'K', at: [11.6, 4.4] },
          { team: 'us', label: 'S', at: [-8.5, 8] },
        ],
        puck: [11.2, 3.2],
        moves: [
          { kind: 'carry', path: [[11.2, 3.2], [3, 1], [-4.6, 2.4]], trim: 0.4 },
          { kind: 'lane', path: [[-4.6, 2.4], [-8.5, 8]] },
        ],
      },
    },
  ],

  /* Satellit: wait for a long pass, or skate towards it. Our zone, our left at -x. */
  'skate-to-pass': [
    {
      zone: 'own',
      verdict: 'bad',
      scene: {
        players: [
          { team: 'them', at: [-6, 17.5] },
          { team: 'them', at: [-1, 4.6] },
          { team: 'us', label: 'K', at: [-4.5, 6.4] },
          { team: 'us', label: 'S', at: [-12.6, 19.6] },
        ],
        puck: [-5.4, 7.2],
        moves: [
          { kind: 'pass', path: [[-5.4, 7.2], [-12, 18.6]], trim: 1.6 },
          { kind: 'skate', team: 'them', path: [[-6, 17.5], [-10.4, 17]], trim: 0.4 },
        ],
      },
    },
    {
      zone: 'own',
      verdict: 'good',
      scene: {
        players: [
          { team: 'them', at: [-6, 17.5] },
          { team: 'them', at: [-1, 4.6] },
          { team: 'us', label: 'K', at: [-4.5, 6.4] },
          { team: 'us', label: 'S', at: [-12.6, 19.6], ghost: true },
          { team: 'us', label: 'S', at: [-12.2, 12.4] },
        ],
        puck: [-5.4, 7.2],
        moves: [
          { kind: 'skate', path: [[-12.6, 18.2], [-12.4, 13.8]], trim: 0.2 },
          { kind: 'pass', path: [[-5.4, 7.2], [-11.4, 11.8]], trim: 1.2 },
        ],
      },
    },
  ],

  /* Jäger: an opponent facing the play, then one facing the boards. Our zone. */
  'read-opponent': [
    {
      zone: 'own',
      scene: {
        areas: [{ kind: 'view', poly: viewCone([-11.2, 7], [-4, 12], 80, 8) }],
        players: [
          { team: 'them', at: [-11.2, 7] },
          { team: 'us', label: 'J', at: [-6.6, 6.4] },
        ],
        puck: [-10.4, 8],
        moves: [
          { kind: 'skate', path: [[-6.6, 6.4], [-8, 7]], trim: 0.2 },
          { kind: 'stick', path: [[-6.6, 6.4], [-8.4, 7.4]] },
        ],
      },
    },
    {
      zone: 'own',
      scene: {
        areas: [{ kind: 'view', poly: viewCone([-11.6, 7], [-15, 9], 80, 4) }],
        players: [
          { team: 'them', at: [-11.6, 7] },
          { team: 'us', label: 'J', at: [-6.6, 6.4] },
        ],
        puck: [-12.6, 7.8],
        moves: [{ kind: 'skate', path: [[-6.6, 6.4], [-10, 6.8]], trim: 1.4 }],
      },
    },
  ],

  /* Forecheck after the DEB's "allgemeiner Forecheck": the opponents' D has the puck in
     the corner. Three to the puck, then dog (LW), fox (C, closes the boards) and hawk
     (RW, stays high). We face the goal, so our LW is at positive x (see rink.ts). */
  forecheck: [
    {
      zone: 'attack',
      verdict: 'bad',
      scene: {
        players: [
          { team: 'them', at: [10, 2.4] },
          { team: 'them', at: [-6.5, 2.8] },
          { team: 'them', at: [13.6, 14.5] },
          { team: 'them', at: [1.5, 10.5] },
          { team: 'them', at: [-12.5, 14] },
          { team: 'us', label: 'LW', at: [7, 11] },
          { team: 'us', label: 'C', at: [1, 17] },
          { team: 'us', label: 'RW', at: [-6, 16] },
          { team: 'us', label: 'LD', at: [8, 21] },
          { team: 'us', label: 'RD', at: [-8, 21] },
        ],
        puck: [9.2, 3.6],
        moves: [
          { kind: 'skate', path: [[7, 11], [9.8, 5]] },
          { kind: 'skate', path: [[1, 17], [6, 9], [8, 5.4]] },
          { kind: 'skate', path: [[-6, 16], [2, 8], [6.6, 4.2]] },
          { kind: 'pass', team: 'them', path: [[10.6, 3.2], [14.4, 7.5], [13.6, 14.5]], trim: 1.6 },
        ],
      },
    },
    {
      zone: 'attack',
      verdict: 'good',
      scene: {
        players: [
          { team: 'them', at: [10, 2.4] },
          { team: 'them', at: [-6.5, 2.8] },
          { team: 'them', at: [13.6, 14.5] },
          { team: 'them', at: [1.5, 10.5] },
          { team: 'them', at: [-12.5, 14] },
          { team: 'us', label: 'LW', at: [7, 11], badge: animals.dog },
          { team: 'us', label: 'C', at: [1, 17], badge: animals.fox },
          { team: 'us', label: 'RW', at: [-6, 16], badge: animals.hawk },
          { team: 'us', label: 'LD', at: [8, 21] },
          { team: 'us', label: 'RD', at: [-8, 21] },
        ],
        puck: [9.2, 3.6],
        moves: [
          { kind: 'lane', path: [[10.6, 3.2], [14.4, 7.5], [13.6, 14.5]] },
          { kind: 'skate', path: [[7, 11], [9.8, 5]] },
          { kind: 'skate', path: [[1, 17], [10, 15], [12.8, 9]] },
          { kind: 'skate', path: [[-6, 16], [0, 14.6]] },
        ],
      },
    },
  ],
  /* The half-wall cross in the attacking zone (our left at positive x): who does the
     opponent next to LW follow? That decides between the drop and the cut to the slot. */
  'halfwall-read': [
    {
      zone: 'attack',
      scene: {
        areas: [danger],
        players: [
          ...halfwallReadThem,
          { team: 'them', at: [10.8, 16.4] },
          { team: 'us', label: 'LW', at: [13.5, 15.8] },
          { team: 'us', label: 'LD', at: [10, 12.6] },
        ],
        puck: [13.9, 14.4],
        moves: [
          { kind: 'pass', path: [[13.9, 13.6], [14.5, 11], [13.4, 8.8]], trim: 0.3 },
          { kind: 'skate', path: [[10, 11], [10.6, 8.6], [12.4, 8.4]], trim: 0.3 },
        ],
      },
    },
    {
      zone: 'attack',
      scene: {
        areas: [danger],
        players: [
          ...halfwallReadThem,
          { team: 'them', at: [8.6, 13.4] },
          { team: 'us', label: 'LW', at: [13.5, 15.8] },
          { team: 'us', label: 'LD', at: [11.2, 11.4] },
        ],
        puck: [13.4, 14.4],
        moves: [{ kind: 'carry', path: [[12.6, 16.8], [7.4, 18.4], [5, 13.4]] }],
      },
    },
  ],
  /* Gegenlaufen: skating away up the ice with the back to the puck carrier, all the way to
     the far blue line, against skating towards the puck and swinging to the outside. */
  'skate-away': [
    {
      zone: 'full',
      view: 'full',
      verdict: 'bad',
      scene: {
        areas: [{ kind: 'view', poly: viewCone([-7.4, 35.6], [-5, 6], 46, 9) }],
        players: [
          { team: 'them', at: [-1.2, 9.4] },
          { team: 'them', at: [3.6, 31] },
          { team: 'them', at: [-7, 41.6] },
          { team: 'us', label: 'LD', at: [-5, 5] },
          { team: 'us', label: 'LW', at: [-8.4, 16], ghost: true },
          { team: 'us', label: 'LW', at: [-7.4, 35.6] },
        ],
        puck: [-5.6, 6.2],
        moves: [
          { kind: 'skate', path: [[-8.3, 17.6], [-7.5, 34]], trim: 0.2 },
          { kind: 'lane', path: [[-5.6, 6.2], [-7.3, 34.2]] },
          { kind: 'skate', team: 'them', path: [[3.6, 31], [-4.8, 35]], trim: 1.6 },
          { kind: 'skate', team: 'them', path: [[-7, 40.2], [-7.3, 37.4]], trim: 0.2 },
        ],
      },
    },
    {
      zone: 'full',
      view: 'full',
      verdict: 'good',
      scene: {
        players: [
          { team: 'them', at: [-1.2, 9.4] },
          { team: 'them', at: [3.6, 31] },
          { team: 'us', label: 'LD', at: [-5, 5] },
          { team: 'us', label: 'LW', at: [-8.4, 16], ghost: true },
          { team: 'us', label: 'LW', at: [-12.6, 13.6] },
        ],
        puck: [-5.6, 6.2],
        moves: [
          { kind: 'skate', path: [[-8.6, 14.4], [-9.4, 6.6], [-12.4, 12]], trim: 0.2 },
          { kind: 'pass', path: [[-5.6, 6.2], [-11.4, 14.4]], trim: 0.6 },
        ],
      },
    },
  ],
  /* Torhüter: the angle. Good: the goalie stands on the line from the puck to the middle
     of the goal. Bad: in the middle of the net, the near post is open. */
  'goalie-angle': [
    {
      zone: 'own',
      verdict: 'bad',
      scene: {
        areas: [{ kind: 'shot', poly: [[-7.2, 12.2], ...posts] }],
        players: [
          { team: 'them', at: [-8, 13] },
          { team: 'us', label: 'G', at: [1.2, 5.2] },
        ],
        puck: [-7.2, 12.2],
        moves: [{ kind: 'shot', path: [[-7.2, 12.2], [-0.6, 4.2]] }],
      },
    },
    {
      zone: 'own',
      verdict: 'good',
      scene: {
        areas: [{ kind: 'shot', poly: [[-7.2, 12.2], ...posts] }],
        players: [
          { team: 'them', at: [-8, 13] },
          { team: 'us', label: 'G', at: [-1.06, 5.2] },
        ],
        puck: [-7.2, 12.2],
        moves: [{ kind: 'sight', path: [[-1.06, 5.2], [-7.2, 12.2]] }],
      },
    },
  ],

  /* Torhüter: depth on a rush. Alone against one: out to the edge of the crease. Two
     against one: deeper, so the push across to the pass is short. */
  'goalie-rush': [
    {
      zone: 'own',
      scene: {
        areas: [{ kind: 'shot', poly: [[0.2, 13.8], ...posts] }],
        players: [
          { team: 'them', at: [0.6, 15] },
          { team: 'us', label: 'G', at: [0, 5], ghost: true },
          { team: 'us', label: 'G', at: [0, 7] },
        ],
        puck: [0.2, 13.8],
        moves: [{ kind: 'sight', path: [[0, 7], [0.2, 13.8]] }],
      },
    },
    {
      zone: 'own',
      scene: {
        areas: [danger],
        players: [
          { team: 'them', at: [-5, 14] },
          { team: 'them', at: [5.4, 13] },
          { team: 'us', label: 'LD', at: [0.6, 11] },
          { team: 'us', label: 'G', at: [-0.66, 5.35] },
        ],
        puck: [-4.4, 13],
        moves: [
          { kind: 'sight', path: [[-0.66, 5.35], [-4.4, 13]] },
          { kind: 'lane', path: [[-4.4, 13], [5.4, 13]] },
        ],
      },
    },
  ],

  /* Torhüter: traffic. A shot from the point; our own LD stands in the goalie's line
     of sight, then beside it. */
  'goalie-traffic': [
    {
      zone: 'own',
      verdict: 'bad',
      scene: {
        players: [
          { team: 'them', at: [-7, 19.5] },
          { team: 'them', at: [3, 9.5] },
          { team: 'us', label: 'RD', at: [2.4, 6.6] },
          { team: 'us', label: 'LD', at: [-2.4, 9.5] },
          { team: 'us', label: 'G', at: [-0.56, 5.28] },
        ],
        puck: [-6.4, 18.6],
        moves: [{ kind: 'sight', path: [[-0.56, 5.28], [-6.4, 18.6]] }],
      },
    },
    {
      zone: 'own',
      verdict: 'good',
      scene: {
        players: [
          { team: 'them', at: [-7, 19.5] },
          { team: 'them', at: [3, 9.5] },
          { team: 'us', label: 'RD', at: [2.4, 6.6] },
          { team: 'us', label: 'LD', at: [-4.8, 9.4] },
          { team: 'us', label: 'G', at: [-0.56, 5.28] },
        ],
        puck: [-6.4, 18.6],
        moves: [{ kind: 'sight', path: [[-0.56, 5.28], [-6.4, 18.6]] }],
      },
    },
  ],
  /* Hockey-Sprache: "Gretzky's office", the carrier behind the opponents' net with passes
     to the slot, the far post and the point. Our left side is at positive x. */
  'gretzky-office': [
    {
      zone: 'attack',
      scene: {
        areas: [{ kind: 'open', ellipse: { at: [1.2, 1.9], rx: 3.4, ry: 1.6 } }],
        players: [
          { team: 'them', at: [0, 5] },
          { team: 'them', at: [5.4, 9.6] },
          { team: 'them', at: [-6, 9.5] },
          { team: 'them', at: [6.5, 15.5] },
          { team: 'them', at: [-6.5, 16] },
          { team: 'us', label: 'C', at: [1.6, 1.9] },
          { team: 'us', label: 'LW', at: [-0.8, 11] },
          { team: 'us', label: 'RW', at: [-3.8, 5.6] },
          { team: 'us', label: 'LD', at: [9, 20.5] },
          { team: 'us', label: 'RD', at: [-9, 20.5] },
        ],
        puck: [0.4, 1.5],
        moves: [
          { kind: 'pass', path: [[1.6, 1.9], [3.6, 6], [-0.8, 11]], trim: 1.6, step: 1 },
          { kind: 'pass', path: [[1.6, 1.9], [-3, 1.6], [-3.8, 5.6]], trim: 1.6, step: 2, stepSide: -1 },
        ],
      },
    },
  ],
  /* Zeit und Raum: the same König, an opponent far away and close by. Attacking zone,
     our left at positive x. */
  'bubble-size': [
    {
      zone: 'attack',
      scene: {
        areas: [bubble([8, 17], 5, '≈ 2 s', [8, 13.4])],
        players: [
          { team: 'them', at: [0, 9.5] },
          { team: 'us', label: 'K', at: [8, 17] },
        ],
        puck: [7, 16],
        moves: [{ kind: 'skate', team: 'them', path: [[0, 9.5], [3.4, 12.4]], trim: 0.2 }],
      },
    },
    {
      zone: 'attack',
      scene: {
        areas: [bubble([8, 17], 2.2, '< 1 s', [12, 19.6])],
        players: [
          { team: 'them', at: [5.6, 14] },
          { team: 'us', label: 'K', at: [8, 17] },
        ],
        puck: [7, 16],
        moves: [{ kind: 'skate', team: 'them', path: [[5.6, 14], [6.4, 15]], trim: 0 }],
      },
    },
  ],
  /* Zeit und Raum: soft areas in the attacking zone. The same five defenders; our two
     forwards without the puck stand next to opponents (bad) or in the gaps (good). Our
     left at positive x. */
  'soft-areas': [
    {
      zone: 'attack',
      verdict: 'bad',
      scene: {
        areas: [softAreaShadow],
        players: [
          ...softAreaThem,
          { team: 'us', label: 'K', at: [12, 17.4] },
          { team: 'us', label: 'S', at: [2.4, 16.8] },
          { team: 'us', label: 'S', at: [5.2, 11.2] },
          { team: 'us', label: 'S', at: [-3.4, 11.4] },
          { team: 'us', label: 'S', at: [-0.8, 8.4] },
        ],
        puck: softAreaPuck,
      },
    },
    {
      zone: 'attack',
      verdict: 'good',
      scene: {
        areas: [
          softAreaShadow,
          { kind: 'open', ellipse: { at: [0.4, 15.4], rx: 2.6, ry: 1.9 } },
          { kind: 'open', ellipse: { at: [10.6, 9.6], rx: 1.9, ry: 1.5 } },
          { kind: 'open', ellipse: { at: [10.6, 3.6], rx: 1.8, ry: 1.5 } },
        ],
        players: [
          ...softAreaThem,
          { team: 'us', label: 'K', at: [12, 17.4] },
          { team: 'us', label: 'S', at: [0.4, 15.4] },
          { team: 'us', label: 'S', at: [10.6, 9.6] },
          { team: 'us', label: 'S', at: [10.6, 3.6] },
          { team: 'us', label: 'S', at: [-2.6, 6.2] },
        ],
        puck: softAreaPuck,
        moves: [
          { kind: 'lane', path: [softAreaPuck, [1.9, 15.6]] },
          { kind: 'lane', path: [softAreaPuck, [10.8, 11.2]] },
          /* The bank pass: off the boards, past the checker, into the near corner. */
          { kind: 'lane', path: [softAreaPuck, [14.6, 10.6]] },
          { kind: 'lane', path: [[14.6, 10.6], [11.5, 5.1]] },
          /* The rim: along the boards, behind the corner satellite, to behind the net, where
             the satellite from the far post picks it up. */
          { kind: 'lane', path: [[14.6, 10.6], [15.4, 0.4], [6, 0.9]] },
          { kind: 'lane', path: [[6, 0.9], [-3, 0.9]] },
          { kind: 'skate', path: [[-2.6, 6.2], [-4, 1.5]], trim: 0.2 },
        ],
      },
    },
  ],
} satisfies Record<string, PlayPanel[]>;

export type PlayId = keyof typeof geometry;

export const plays: Record<PlayId, PlayPanel[]> = geometry;

interface PanelText {
  title: string;
  text: string;
}

interface PlayText {
  caption: string;
  /** One entry per panel, in the same order as the geometry. */
  panels: PanelText[];
  /** Describes the drawing for screen readers; one per panel. */
  labels: string[];
  note?: string;
}

const de: Record<PlayId, PlayText> = {
  'goal-side': {
    caption: 'Abwehrseite',
    panels: [
      {
        title: 'Auf der falschen Seite',
        text: 'Die Verteidigerin ist weiter vom Tor weg als das Gegenüber. Der Weg zum Tor ist frei, ihr bleibt nur das Hinterherfahren.',
      },
      {
        title: 'Auf der Abwehrseite',
        text: 'Die Verteidigerin steht auf der gepunkteten Linie zwischen Gegenüber und Tor, leicht zur Mitte hin. Dem Gegenüber bleibt nur der Weg nach aussen.',
      },
    ],
    labels: [
      'Eins von den anderen fährt mit dem Puck frei aufs Tor. Die linke Verteidigerin ist weiter vom Tor entfernt und fährt hinterher.',
      'Die linke Verteidigerin steht zwischen dem Gegenüber mit dem Puck und dem Tor. Das Gegenüber weicht nach aussen in die Ecke aus.',
    ],
  },
  'shot-angle': {
    caption: 'Was man beim Schuss vom Tor sieht',
    panels: [
      {
        title: 'Aus der Mitte: gefährlich',
        text: 'Im Slot, zwischen den Bullypunkten, sieht man beim Schuss das ganze Tor. Der blaue Keil ist der Raum, in den der Schuss gehen kann.',
      },
      {
        title: 'Von aussen: harmlos',
        text: 'Ausserhalb der Bullypunkte bleibt nur ein schmaler Streifen. Den deckt der Torhüter fast allein ab.',
      },
    ],
    labels: [
      'Eins von den anderen schiesst aus der Mitte vor dem Tor. Ein breiter Keil zeigt, wie viel vom Tor von dort zu sehen ist.',
      'Eins von den anderen schiesst von der Seite, ausserhalb der Bullypunkte. Ein schmaler Keil zeigt, wie wenig vom Tor von dort zu sehen ist.',
    ],
    note: 'Die gelbe Fläche ist die Gefahrenzone: von den Torpfosten zu den Bullypunkten und hinauf bis zum oberen Rand der Bullykreise.',
  },
  'force-outside': {
    caption: 'Ausserhalb der Punkte halten',
    panels: [
      {
        title: 'Innen fahren, nach aussen drängen',
        text: 'Der Verteidiger fährt innen, zwischen Gegenüber und Gefahrenzone. Das Gegenüber bleibt ausserhalb der gepunkteten Linien durch die Bullypunkte und landet in der Ecke.',
      },
    ],
    labels: [
      'Das Gegenüber fährt mit dem Puck an der linken Bande in die Zone. Der linke Verteidiger fährt innen daneben mit, bis der Puck in der Ecke hinter der Torlinie ist.',
    ],
  },
  backcheck: {
    caption: 'Abwehrseite ohne Puck',
    panels: [
      {
        title: 'Innen zurückfahren',
        text: 'Eins von den anderen fährt ohne Puck Richtung Tor. RW fährt innen zurück, zwischen dieses Gegenüber und das Tor, mit dem Stock auf dem Eis im Passweg.',
      },
    ],
    labels: [
      'Eins von den anderen hat den Puck an der linken Bande, ein zweites fährt von rechts Richtung Tor. Die rechte Flügelspielerin fährt durch die Mitte zurück und kommt zwischen dieses Gegenüber und das Tor.',
    ],
  },
  'free-area': {
    caption: 'Welcher Bereich ist frei?',
    panels: [
      {
        title: 'Die Lücke füllen',
        text: 'Drei aus unserem Team sind beim Puck in der Ecke. Vor dem Tor steht eins von den anderen allein. RW kommt in die Zone, sieht die Lücke und füllt sie – statt als Vierter zum Puck zu fahren.',
      },
    ],
    labels: [
      'Puck in der linken Ecke. LD und RD sind in der Ecke, der Center an der Bande. Vor dem Tor steht eins von den anderen frei. Der rechte Flügelspieler fährt aus der Mitte vor das Tor.',
    ],
  },
  overload: {
    caption: 'Overload: eine Person greift an, eine hilft',
    panels: [
      {
        title: '2 gegen 1 am Puck',
        text: 'Die anderen haben den Puck an der Bande. LD greift von unten an. C kommt von oben dazu und bleibt ein paar Meter weg, bereit zu helfen. Der Rest von uns bleibt in der Mitte: RD vor dem Tor, RW im hohen Slot, LW zwischen Puck und blauer Linie.',
      },
    ],
    labels: [
      'Eins von den anderen hat den Puck an der linken Bande. Die linke Verteidigerin greift von unten an, der Center steht ein paar Meter darüber, bereit zu helfen. Der rechte Verteidiger steht vor dem Tor, die Flügel weiter oben.',
    ],
    note: 'Die gestrichelten Kreise zeigen, wo alle vorher waren.',
  },
  pin: {
    caption: 'Pinnen und den Puck holen',
    panels: [
      {
        title: 'In zwei Schritten',
        text: '① LD drückt das Gegenüber an die Bande und hält es dort. ② C kommt von unten und holt den freien Puck. Jetzt haben wir ihn.',
      },
    ],
    labels: [
      'Der linke Verteidiger drückt das Gegenüber an die linke Bande. Der Center kommt von unten und holt den Puck, der darunter frei liegt.',
    ],
  },
  'near-far': {
    caption: 'Nahe und weite Unterstützung',
    panels: [
      {
        title: 'Vier Anspielstationen',
        text: 'LD hat den Puck in der Ecke, das Gegenüber kommt. Nah (grün): LW an der Bande und C tief in der Mitte. Weit (blau): RD auf der anderen Seite des Tores und RW hoch auf der anderen Seite.',
      },
    ],
    labels: [
      'Der linke Verteidiger hat den Puck in der linken Ecke, das Gegenüber fährt auf ihn zu. Pässe sind zur linken Flügelspielerin an der Bande, zum Center vor dem Tor und zum rechten Verteidiger hinter dem Tor möglich. Die rechte Flügelspielerin steht hoch an der rechten Bande.',
    ],
  },
  'pressure-support': {
    caption: 'Unterstützung unter Druck',
    panels: [
      {
        title: 'Vor dem Tor warten',
        text: 'C hat den Puck in der Ecke, zwei von den anderen drücken C an die Bande. LW und RW warten vor dem Tor. Jeder Pass dorthin muss durch die anderen hindurch.',
      },
      {
        title: 'Hinfahren',
        text: 'LW fährt in die Ecke, ein paar Meter neben C, in die freie Lücke. C kann den Puck kurz an der Bande zu LW schieben. RW sucht sich einen freien Platz im Slot.',
      },
    ],
    labels: [
      'Angriffszone. Der Center hat den Puck in der Ecke, zwei von den anderen bedrängen ihn. Die linke Flügelspielerin und der rechte Flügelspieler stehen vor dem Tor zwischen den gegnerischen Verteidigern.',
      'Die linke Flügelspielerin fährt vom Tor in die Ecke neben den Center und bekommt einen kurzen Pass. Der rechte Flügelspieler fährt in den Slot.',
    ],
  },
  'neutral-zone': {
    caption: 'Abwehrseite in der neutralen Zone',
    panels: [
      {
        title: 'Innen bleiben, schon vor der blauen Linie',
        text: 'Die Verteidiger fahren rückwärts innerhalb der gepunkteten Linien durch die Bullypunkte zurück. Der Stock zeigt nach aussen zum Gegenüber. Die anderen bleiben aussen und kommen an der Bande in die Zone.',
      },
    ],
    labels: [
      'Zwei von den anderen fahren in der neutralen Zone aussen auf unser Drittel zu, eins davon mit Puck. LD und RD fahren innen rückwärts zurück, den Stock nach aussen gerichtet. Der Center fährt durch die Mitte zurück.',
    ],
  },
  'offside-entry': {
    caption: 'Abseits beim Einfahren in die Zone',
    panels: [
      {
        title: 'Abseits',
        text: 'LW ist schon in der Zone, der Puck ist noch draussen. Sobald der Puck über die Linie kommt, ist es Abseits.',
      },
      {
        title: 'Kein Abseits',
        text: 'LW wartet vor der Linie. Erst wenn der Puck ganz drüben ist, fährt LW hinterher.',
      },
    ],
    labels: [
      'Der Center führt den Puck in der neutralen Zone auf die blaue Linie zu. Der linke Flügelspieler steht schon in der Angriffszone.',
      'Der Puck ist gerade über die blaue Linie. Der linke Flügelspieler stand noch vor der Linie und fährt jetzt hinterher in die Zone.',
    ],
  },
  'puck-out': {
    caption: 'Der Puck rutscht aus der Zone',
    panels: [
      {
        title: 'Warten und quer passen',
        text: 'Der Puck ist über die blaue Linie aus der Zone gerutscht, LD holt ihn. LW, C und RW sind noch in der Zone und fahren sofort zur blauen Linie. RD fährt aus der Zone zurück und wird anspielbar. LD passt quer zu RD (1).',
      },
      {
        title: 'Neu angreifen',
        text: 'Jetzt ist niemand mehr in der Zone: Alle stehen auf oder vor der blauen Linie. RD fährt mit dem Puck auf der anderen Seite wieder hinein (2). Die Stürmer fahren erst hinein, wenn der Puck drin ist.',
      },
    ],
    labels: [
      'Halbes Eis, wir greifen nach oben an. Die linke Verteidigerin hat den Puck knapp vor der blauen Linie in der neutralen Zone. Die drei Stürmer fahren aus der Angriffszone zur blauen Linie, der rechte Verteidiger fährt aus der Zone zurück. Die linke Verteidigerin passt quer zum rechten Verteidiger.',
      'Die Stürmer stehen auf der blauen Linie. Der rechte Verteidiger fährt mit dem Puck auf der rechten Seite in die Angriffszone, die Stürmer fahren hinter dem Puck mit hinein.',
    ],
  },
  'delayed-offside': {
    caption: 'Verzögertes Abseits: alle raus',
    panels: [
      {
        title: 'Zurück an die blaue Linie',
        text: 'Der Linienrichter hat den Arm oben, die anderen haben den Puck. Alle drei Stürmer fahren so schnell wie möglich aus der Zone. Niemand spielt den Puck. Sobald niemand mehr drin ist, dürfen sie wieder hinein.',
      },
    ],
    labels: [
      'Die anderen haben den Puck tief in ihrer Zone. Unsere drei Stürmer stehen noch in der Zone und fahren alle zur blauen Linie zurück. Die Verteidiger warten draussen in der neutralen Zone.',
    ],
  },
  icing: {
    caption: 'Icing',
    panels: [
      {
        title: 'Icing',
        text: 'LD schiesst den Puck aus unserer Hälfte, vor der roten Mittellinie, über die gegnerische Torlinie. Niemand berührt ihn.',
      },
      {
        title: 'Kein Icing',
        text: 'C spielt den Puck erst hinter der roten Mittellinie, in der gegnerischen Hälfte. Dann ist es kein Icing.',
      },
    ],
    labels: [
      'Das ganze Eis. Unser linker Verteidiger schiesst den Puck aus unserer Hälfte bis hinter das gegnerische Tor.',
      'Das ganze Eis. Unser Center schiesst den Puck kurz hinter der roten Mittellinie bis hinter das gegnerische Tor.',
    ],
  },
  'icing-race': {
    caption: 'Das Rennen zum Puck',
    panels: [
      {
        title: 'Wer zuerst am Puck wäre',
        text: 'Der Puck ist über die Torlinie gerutscht. Der Linienrichter entscheidet, sobald jemand die Höhe der Bullypunkte (gepunktete Linie) erreicht: Wären die anderen zuerst am Puck, gibt es Icing. Wären wir zuerst dort, geht das Spiel weiter.',
      },
    ],
    labels: [
      'Der Puck liegt hinter der gegnerischen Torlinie in der Ecke. Eine gegnerische Verteidigerin und unser Center fahren darauf zu. Die gegnerische Verteidigerin ist näher und zuerst an der Linie durch die Bullypunkte.',
    ],
    note: 'So läuft es nach dem IIHF-Regelbuch (Hybrid-Icing). In manchen Ligen wird Icing ohne Rennen sofort abgepfiffen.',
  },
  'delayed-penalty': {
    caption: 'Angezeigte Strafe: Torhüter raus',
    panels: [
      {
        title: 'Der sechste Feldspieler',
        text: 'Der Schiedsrichter hat den Arm oben. Wir haben den Puck vorne. Unsere Torhüterin fährt zur Bank. Kurz vor der Bank springt der sechste Feldspieler (+1) aufs Eis. Unser Tor ist leer.',
      },
    ],
    labels: [
      'Das ganze Eis. Unser Team hat den Puck in der gegnerischen Zone. Unsere Torhüterin fährt aus dem Tor zur Spielerbank an der linken Bande, ein zusätzlicher Feldspieler fährt von dort aufs Eis. Unser Tor ist leer.',
    ],
    note: 'Die gestrichelte Markierung zeigt, wo die Torhüterin vorher stand.',
  },
  'bench-distance': {
    caption: 'Der Weg zur Bank',
    panels: [
      {
        title: '1. und 3. Drittel: kurzer Wechsel',
        text: 'Unsere Bank liegt in unserer Hälfte. Aus der eigenen Zone ist der Weg kurz (LD), aus der Angriffszone lang (LW).',
      },
      {
        title: '2. Drittel: langer Wechsel',
        text: 'Die Teams haben die Tore getauscht, die Bänke nicht. Unser Tor ist jetzt oben, unsere Bank liegt in der gegnerischen Hälfte. Aus der eigenen Zone ist der Weg lang (RD), aus der Angriffszone kurz (RW).',
      },
    ],
    labels: [
      'Das ganze Eis, unser Tor mit unserer Torhüterin unten. Unsere Spielerbank liegt an der linken Bande zwischen unserer blauen Linie und der roten Mittellinie, die Bank der anderen gleich darüber. Ein Pfeil zeigt den kurzen Weg von LD in unserer Zone zur Bank, ein zweiter den langen Weg von LW in der Angriffszone.',
      'Das gleiche Eis im 2. Drittel, unser Tor mit unserer Torhüterin jetzt oben. Die Bänke stehen am selben Ort wie im 1. Drittel, unsere Bank liegt damit in der gegnerischen Hälfte. Der Pfeil von RD in unserer Zone zur Bank ist lang, der Pfeil von RW in der Angriffszone kurz.',
    ],
  },
  'long-change': {
    caption: '2. Drittel: wann die Verteidigung wechselt',
    panels: [
      {
        title: 'Wechsel, während die anderen kommen',
        text: 'Die anderen fahren mit dem Puck auf unser Tor zu. LD fährt jetzt zur Bank. Der frische LD springt weit hinter dem Puck aufs Eis. Vor unserem Tor steht RD allein gegen zwei.',
      },
      {
        title: 'Wechsel im Angriff',
        text: 'Wir haben den Puck vorne. RD steht an der blauen Linie, die Bank ist gleich daneben. RD wechselt, LD bleibt. Der frische RD ist sofort wieder an der blauen Linie.',
      },
    ],
    labels: [
      'Das ganze Eis im 2. Drittel, unser Tor oben, unsere Bank an der linken Bande in der gegnerischen Hälfte. Zwei von den anderen fahren mit dem Puck aus der Mitte auf unser Tor zu. Unser LD fährt zur Bank, ein frischer LD kommt von der Bank, weit hinter dem Puck. Vor unserem Tor stehen nur unsere Torhüterin und RD. Ein Ausrufezeichen markiert die Lücke.',
      'Das ganze Eis im 2. Drittel, unser Tor oben. Wir haben den Puck unten in der gegnerischen Zone, LD und RD stehen an der blauen Linie. RD fährt die paar Meter zur Bank, ein frischer RD fährt von dort an die blaue Linie. LD bleibt stehen.',
    ],
    note: 'Zwei LD und zwei RD: Wer zur Bank fährt, und wer frisch von der Bank kommt.',
  },
  'backcheck-change': {
    caption: '1. und 3. Drittel: Wechsel auf dem Rückweg',
    panels: [
      {
        title: 'Die Bank liegt auf dem Weg',
        text: 'Die anderen haben den Puck erobert und fahren auf unser Tor zu. LW ist müde und fährt auf dem Rückweg zur Bank. Der frische LW springt vor dem Puck aufs Eis und übernimmt das Gegenüber.',
      },
    ],
    labels: [
      'Das ganze Eis im 1. Drittel, unsere Bank an der linken Bande in unserer Hälfte. Die anderen fahren mit dem Puck aus ihrer Zone Richtung Mitte. Unser müder LW fährt an der linken Bande zurück zur Bank. Ein frischer LW kommt von der Bank aufs Eis, zwischen das Gegenüber und unser Tor. C fährt mit zurück, LD und RD warten an unserer blauen Linie.',
    ],
    note: 'Kommt der frische LW nicht mehr vor den Puck, gilt: erst zurückfahren, später wechseln.',
  },
  'faceoff-own': {
    caption: 'Bully in der eigenen Zone',
    panels: [
      {
        title: 'Bully verloren',
        text: 'Der gegnerische Center zieht den Puck nach hinten zu einer Verteidigerin an der blauen Linie (1). LW und RW fahren sofort zu den beiden an der blauen Linie und stören Schuss und Pass. LD, RD und C bleiben unten vor dem Tor. Die gepunktete Linie ist der Blick des Torhüters zum Puck: Ausser C steht dort niemand.',
      },
      {
        title: 'Bully gewonnen',
        text: 'C zieht den Puck nach hinten zu LD (1). LD passt ihn hinter dem Tor herum auf die andere Seite (2), an der Bande entlang oder mit einem Bandenpass. Dort holt ihn RW. LW fährt aussen hoch und in die Mitte, C fährt durch die Mitte mit. RD bleibt vor dem Tor.',
      },
    ],
    labels: [
      'Bully am linken Kreis vor unserem Tor. Zwischen unserem Torhüter und dem Puck steht ausser dem Center niemand. Der gegnerische Center gewinnt und zieht den Puck zu einer Verteidigerin an der blauen Linie. Unsere linke Flügelspielerin fährt zu ihr, unser rechter Flügelspieler zum anderen Verteidiger.',
      'Bully am linken Kreis vor unserem Tor. Unser Center zieht den Puck zur linken Verteidigerin in die Ecke. Von dort geht der Puck hinter dem Tor herum zum rechten Flügelspieler. Die linke Flügelspielerin und der Center fahren nach vorne.',
    ],
    note: 'Das Bully ist hier am linken Kreis. Am rechten Kreis ist alles gespiegelt: RD steht an der Bande, RW hinter dem C, LD innen und LW im Slot.',
  },
  'faceoff-attack': {
    caption: 'Bully in der Angriffszone',
    panels: [
      {
        title: 'Bully gewonnen',
        text: 'C zieht den Puck zurück zu RD. Sofort bewegen sich alle: LW gleitet Richtung anderer Bullypunkt, LD fährt rückwärts an der Linie auf die andere Seite, RW geht an der Bande Richtung Ecke, C fährt vors Tor.',
      },
      {
        title: 'Vier Möglichkeiten für RD',
        text: '1 Schiessen: C vor dem Tor nimmt dem Torhüter die Sicht, fälscht ab oder holt den Abpraller. 2 Quer zu LD an der blauen Linie. 3 An der Bande entlang zu RW. 4 Quer über die Mitte zu LW.',
      },
    ],
    labels: [
      'Bully am Kreis vor dem gegnerischen Tor. Unser Center zieht den Puck zum rechten Verteidiger an der blauen Linie. Der linke Flügelspieler fährt Richtung anderer Bullypunkt, die linke Verteidigerin an der blauen Linie auf die andere Seite, die rechte Flügelspielerin an der Bande Richtung Ecke, der Center vors Tor.',
      'Der rechte Verteidiger hat den Puck an der blauen Linie. Vier Möglichkeiten: Schuss aufs Tor, Pass zur linken Verteidigerin an der blauen Linie, Pass an der Bande entlang zur rechten Flügelspielerin, Pass quer über die Mitte zum linken Flügelspieler.',
    ],
    note: 'Das Bully ist hier am rechten Kreis. Am linken Kreis ist alles gespiegelt.',
  },
  'faceoff-neutral': {
    caption: 'Bully in der neutralen Zone',
    panels: [
      {
        title: 'Am Mittelpunkt',
        text: 'C zieht den Puck zurück zu RD (1). Die gegnerischen Flügel fahren sofort auf unsere Verteidiger zu, ihre Verteidiger rücken nach. RD hat wenig Zeit und spielt den Puck schnell weiter.',
      },
      {
        title: 'Vor der gegnerischen Zone',
        text: 'C zieht den Puck zurück zu RD (1). Die gegnerischen Flügel fahren auf unsere Verteidiger zu. RD passt quer zu LD (2), bevor die anderen da sind.',
      },
    ],
    labels: [
      'Bully am Mittelpunkt. Unser Center zieht den Puck zur rechten Verteidigerin. Die gegnerischen Flügel fahren auf sie und unseren linken Verteidiger zu, die gegnerischen Verteidiger rücken nach.',
      'Bully am Punkt in der neutralen Zone vor der gegnerischen blauen Linie. Unser Center zieht den Puck zur rechten Verteidigerin, die quer zum linken Verteidiger passt. Die gegnerischen Flügel fahren auf unsere Verteidiger zu.',
    ],
    note: 'Wir greifen nach oben an. Am Punkt auf der anderen Seite ist alles gespiegelt.',
  },
  'four-roles': {
    caption: 'Vier Rollen, zwei Momente',
    panels: [
      {
        title: 'Wir haben den Puck',
        text: 'K ist der König: K hat den Puck und fährt ins freie Eis. Alle anderen sind Satelliten (S): tief an der Bande, vor dem Tor und an der blauen Linie. Alle sind anspielbar.',
      },
      {
        title: 'Das andere Team hat den Puck',
        text: 'J ist der Jäger: J steht zwischen Puckführer und Tor, der Schläger zeigt zum Puck. Alle anderen sind Wächter (W): Sie stehen jeweils zwischen ihrem Gegenüber und unserem Tor.',
      },
    ],
    labels: [
      'Angriffsdrittel. Eins von uns hat den Puck, markiert mit K, und fährt von der linken Bande in die Mitte. Gepunktete Passwege führen zu drei weiteren von uns, markiert mit S: tief an der Bande und zu beiden Verteidigern an der blauen Linie. Ein vierter S steht vor dem Tor.',
      'Eigenes Drittel. Eins von den anderen hat den Puck links an der Bande. J steht zwischen diesem Gegenüber und dem Tor, der Schläger zeigt zum Puck. Vier von uns, markiert mit W, stehen jeweils zwischen einem Gegenüber ohne Puck und unserem Tor.',
    ],
    note: 'K = König, S = Satellit, J = Jäger, W = Wächter. Die gepunkteten Linien sind Passwege.',
  },
  'open-ice': {
    caption: 'Freies Eis finden',
    panels: [
      {
        title: 'Rein ins Drittel',
        text: 'Links stehen zwei von den anderen. Der König fährt nicht in den Verkehr, sondern nach innen ins freie Eis (grün), mitten in eine Lücke.',
      },
      {
        title: 'Unter Druck in der Ecke',
        text: 'Zwei von den anderen kommen von oben. Hinter dem Tor ist frei. Der König fährt hinters Tor und hat auf der anderen Seite einen Satelliten.',
      },
    ],
    labels: [
      'Angriffsdrittel. Der König fährt mit dem Puck links über die blaue Linie. Zwei von den anderen stehen an der linken Seite. Eine grüne Fläche im hohen Slot ist frei, der König fährt hinein.',
      'Der König hat den Puck in der linken Ecke, zwei von den anderen kommen auf ihn zu. Hinter dem Tor ist eine grüne Fläche frei. Der König fährt hinter dem Tor durch auf die rechte Seite, wo ein Satellit wartet.',
    ],
    note: 'Grün ist freies Eis: Dort steht niemand von den anderen. Wer dorthin fährt, hat Zeit.',
  },
  'skate-to-pass': {
    caption: 'Gegenlaufen: dem Pass entgegenfahren',
    panels: [
      {
        title: 'Stehen und warten',
        text: 'Der Satellit wartet an der blauen Linie. Der Pass ist lang. Das Gegenüber hat Zeit und kommt gleichzeitig an.',
      },
      {
        title: 'Entgegenfahren',
        text: 'Der Satellit fährt dem Pass entgegen. Der Pass ist kurz und schnell da. Das Gegenüber ist noch weit weg.',
      },
    ],
    labels: [
      'Eigenes Drittel. Der König passt von der linken Torseite weit zur blauen Linie. Das Gegenüber fährt aus der Mitte zur gleichen Stelle wie der Pass.',
      'Gleiche Situation. Der Satellit fährt an der Bande nach unten, dem Puck entgegen. Der Pass ist kurz. Das Gegenüber ist weit weg.',
    ],
  },
  'read-opponent': {
    caption: 'Wohin schaut dein Gegenüber?',
    panels: [
      {
        title: 'Blick zum Spiel',
        text: 'Das Gegenüber sieht alles. Der Jäger fährt ruhig heran, bleibt auf der Abwehrseite und bringt den Schläger zum Puck.',
      },
      {
        title: 'Blick zur Bande',
        text: 'Das Gegenüber sieht nichts. Jetzt greift der Jäger entschlossen an und trennt es vom Puck – mit Körperkontakt, aber ohne Check.',
      },
    ],
    labels: [
      'Eigenes Drittel. Das Gegenüber hat den Puck an der linken Bande und schaut zur Mitte, ein blauer Fächer zeigt den Blick. Der Jäger fährt nur ein kleines Stück heran, Schläger zum Puck.',
      'Gleiche Stelle. Das Gegenüber schaut zur Bande, mit dem Rücken zum Jäger. Der Jäger fährt direkt darauf zu.',
    ],
    note: 'Der blaue Fächer zeigt, wohin das Gegenüber schaut.',
  },
  forecheck: {
    caption: 'Forecheck: Hund, Fuchs und Falke',
    panels: [
      {
        title: 'Alle zum Puck',
        text: 'Alle drei Stürmer fahren zur Verteidigerin mit dem Puck. Der Pass an der Bande hoch zum freien Flügel ist offen, und drei aus unserem Team sind ausgespielt.',
      },
      {
        title: 'Für alle eine Rolle',
        text: 'LW ist der Hund und greift die Verteidigerin mit dem Puck an. C ist der Fuchs und macht die Bande zu. RW ist der Falke und bleibt hoch in der Mitte.',
      },
    ],
    labels: [
      'In der Angriffszone hat eine gegnerische Verteidigerin den Puck in der linken Ecke. LW, C und RW fahren alle dorthin. Sie passt an der Bande entlang zum freien Flügel an der blauen Linie.',
      'Gleiche Lage. Der linke Flügelspieler fährt zur Verteidigerin mit dem Puck. Der Center fährt an die linke Bande zwischen Puck und gegnerischen Flügel. Die rechte Flügelspielerin fährt in die Mitte vor die blaue Linie. Die Verteidiger bleiben an der blauen Linie.',
    ],
  },
  'halfwall-read': {
    caption: 'Der Verteidiger kreuzt: Wohin geht das Gegenüber?',
    panels: [
      {
        title: 'Das Gegenüber bleibt bei LW',
        text: 'LW spielt den Puck an der Bande entlang in den Weg von LD. LD nimmt ihn in der Fahrt mit und hat Platz.',
      },
      {
        title: 'Das Gegenüber geht mit LD',
        text: 'LW behält den Puck und zieht selbst in den Slot. Der Weg ist frei.',
      },
    ],
    labels: [
      'Angriffszone, oben das gegnerische Tor. LW ist mit dem Puck an der linken Bande, das Gegenüber direkt daneben. LD ist innen an LW vorbeigefahren. LW spielt den Puck an der Bande entlang Richtung Tor, LD fährt in einem Bogen dorthin.',
      'Gleiche Lage, aber das Gegenüber ist mit LD nach unten gefahren. LW ist frei und fährt mit dem Puck in einem Bogen in den Slot.',
    ],
  },
  'skate-away': {
    caption: 'Wegfahren oder entgegenfahren?',
    panels: [
      {
        title: 'Wegfahren und zurückschauen',
        text: 'LW fährt mit dem Rücken zu LD bis zur blauen Linie und schaut über die Schulter zurück. Der Pass ist lang und kommt steil von hinten. Die anderen vorne und an der Seite sieht LW nicht. Kommt der Pass, fährt LW blind in einen Check: ein Krankenhauspass.',
      },
      {
        title: 'Entgegenfahren',
        text: 'LW fährt LD entgegen und dreht nach aussen. Der Pass ist kurz und kommt schräg von der Seite. LW sieht das ganze Eis.',
      },
    ],
    labels: [
      'Das ganze Eis, unser Tor unten. LD hat den Puck neben unserem Tor. LW fährt mit dem Rücken zu LD nach oben bis kurz vor die gegnerische blaue Linie und schaut zurück. Eine gepunktete Linie zeigt den langen, steilen Passweg von hinten. Eins von den anderen wartet direkt vor LW und fährt auf LW zu, ein zweites kommt von der Seite. Beide sind ausserhalb von dem, was LW sieht.',
      'Gleiche Lage. LW fährt LD entgegen und dreht in einer Kurve nach aussen zur Bande. LD passt kurz und schräg zu LW.',
    ],
  },
  'goalie-angle': {
    caption: 'Winkel: auf der Linie zum Puck',
    panels: [
      {
        title: 'Zu weit in der Mitte',
        text: 'Der Puck ist links, die Torhüterin steht in der Mitte des Tores. Am nahen Pfosten bleibt eine Lücke. Dorthin geht der Schuss.',
      },
      {
        title: 'Nase und Bauchnabel zum Puck',
        text: 'Die Torhüterin steht auf der Linie vom Puck zur Mitte des Tores und schaut genau zum Puck. Der blaue Keil, in den ein Schuss gehen kann, ist fast ganz zu.',
      },
    ],
    labels: [
      'Eigene Zone. Eins von den anderen hat den Puck links vor dem Bullykreis. Unsere Torhüterin steht rechts von der Tormitte. Ein Schuss geht in die Lücke am linken Pfosten.',
      'Gleiche Lage. Unsere Torhüterin steht links vor dem Tor, auf der Linie zwischen Puck und Tormitte, und schaut zum Puck.',
    ],
    note: 'Der blaue Keil zeigt, was man beim Schuss vom Tor sieht.',
  },
  'goalie-rush': {
    caption: 'Tiefe: wie weit raus?',
    panels: [
      {
        title: '1 gegen 1',
        text: 'Eins von den anderen fährt allein aufs Tor. Der Torhüter kommt bis an den Rand des Torraums heraus. So ist beim Schuss weniger vom Tor zu sehen.',
      },
      {
        title: '2 gegen 1',
        text: 'Zwei von den anderen kommen, ein Querpass ist möglich. Der Torhüter bleibt tiefer im Torraum. So ist der Weg zur anderen Seite kurz, wenn der Pass kommt.',
      },
    ],
    labels: [
      'Eigene Zone. Eins von den anderen fährt mit dem Puck allein durch die Mitte aufs Tor. Unser Torhüter ist aus dem Tor an den Rand des Torraums gefahren. Eine gestrichelte Markierung zeigt, wo der Torhüter vorher stand.',
      'Eigene Zone. Zwei von den anderen fahren aufs Tor, links ist der Puck. Unsere linke Verteidigerin steht zwischen ihnen. Unser Torhüter steht tief im Torraum, leicht links, und schaut zum Puck.',
    ],
    note: 'Die gestrichelte Markierung zeigt, wo der Torhüter vorher stand.',
  },
  'goalie-traffic': {
    caption: 'Sichtlinie frei halten',
    panels: [
      {
        title: 'Das eigene Team im Weg',
        text: 'Eins von den anderen schiesst von der blauen Linie. LD steht genau zwischen Torhüterin und Puck. Die Torhüterin sieht den Schuss erst, wenn er schon da ist.',
      },
      {
        title: 'Daneben, nicht davor',
        text: 'LD steht neben der gepunkteten Linie. Die Torhüterin sieht den Puck vom Schläger an.',
      },
    ],
    labels: [
      'Eigene Zone. Eins von den anderen hat den Puck an der linken blauen Linie. Unser linker Verteidiger steht auf der Linie zwischen Torhüterin und Puck.',
      'Gleiche Lage. Unser linker Verteidiger steht weiter links, neben der Linie zwischen Torhüterin und Puck.',
    ],
    note: 'Die gepunktete Linie ist der Blick der Torhüterin zum Puck.',
  },
  'gretzky-office': {
    caption: 'Gretzkys Büro',
    panels: [
      {
        title: 'Hinter dem Tor hat man Zeit',
        text: 'C steht mit dem Puck hinter dem gegnerischen Tor. Der Torhüter muss sich umdrehen, die Verteidiger sehen Puck und Gegenüber nicht gleichzeitig. C passt in den Slot (1) oder an den langen Pfosten (2).',
      },
    ],
    labels: [
      'Die Angriffszone. Unser Center steht mit dem Puck hinter dem gegnerischen Tor. Pfeile zeigen Pässe zur linken Flügelspielerin im Slot und zum rechten Flügelspieler am langen Pfosten.',
    ],
  },
  'bubble-size': {
    caption: 'Die Blase: Wie viel Zeit und Raum hast du?',
    panels: [
      {
        title: 'Gegenüber weit weg: grosse Blase',
        text: 'K hat den Puck. Das nächste Gegenüber ist etwa 10 Meter weg. Bis es da ist, dauert es ungefähr 2 Sekunden. Genug Zeit zum Schauen, Passen oder Schiessen.',
      },
      {
        title: 'Gegenüber nah: kleine Blase',
        text: 'Das Gegenüber ist nur noch 3 bis 4 Meter weg. Jetzt bleibt weniger als eine Sekunde. K muss sofort etwas tun.',
      },
    ],
    labels: [
      'Die Angriffszone. K hat den Puck an der linken Seite, rundherum ist ein grosser Kreis: etwa 2 Sekunden. Die anderen sind weit weg in der Mitte.',
      'Derselbe Platz. Das Gegenüber steht nah vor K, der Kreis um K ist klein: weniger als eine Sekunde.',
    ],
    note: 'Die Sekunden sind grobe Richtwerte: Wer mit Tempo fährt, schafft etwa 5 Meter pro Sekunde.',
  },
  'soft-areas': {
    caption: 'Freies Eis erkennen',
    panels: [
      {
        title: 'Neben dem Gegenüber',
        text: 'Drei Satelliten stehen direkt bei einem Gegenüber, der vierte im Passschatten (grau) hinter dem Gegenüber, das K angreift. Ein Pass zu ihnen wird abgefangen oder sofort gestört. K hat niemanden zum Anspielen.',
      },
      {
        title: 'Im freien Eis',
        text: 'Ein Satellit steht oben im Slot, einer am Bullykreis neben dem Passschatten, einer in der Ecke. Die Ecke erreicht K mit einem Pass über die Bande. Der vierte steht vor dem Tor am langen Pfosten: Spielt K einen Pass ins Rund hinter dem Tor durch, holt der Satellit den Puck hinter dem Tor. Kein Gegenüber ist für sie zuständig. Mit dem Pass gibt es gleich eine grosse Blase.',
      },
    ],
    labels: [
      'Angriffszone. K hat den Puck an der linken Bande, ein Gegenüber steht zwischen K und dem Tor. Dahinter liegt ein grauer Passschatten. Unsere vier Satelliten stehen oben neben einem Gegenüber, im Passschatten, rechts neben einem Gegenüber und vor dem Tor neben einem Gegenüber.',
      'Dieselbe Situation. Drei grüne Flächen zeigen das freie Eis: oben im Slot, am linken Bullykreis neben dem Passschatten und in der linken Ecke. Dort stehen drei Satelliten. Gepunktete Linien zeigen die freien Passwege von K, in die Ecke über die Bande. Der vierte Satellit steht am rechten Pfosten. Eine gepunktete Linie zeigt den Pass ins Rund der Bande entlang bis hinter das Tor. Ein Pfeil zeigt, wie der Satellit dorthin fährt.',
    ],
  },
};

const en: typeof de = {
  'goal-side': {
    caption: 'Defensive side',
    panels: [
      {
        title: 'On the wrong side',
        text: 'The defender is further from the goal than the attacker. The way to the goal is open, and all the defender can do is chase.',
      },
      {
        title: 'On the defensive side',
        text: 'The defender is on the dotted line between the attacker and the goal, slightly towards the middle. The attacker can only go wide.',
      },
    ],
    labels: [
      'An attacker with the puck skates straight at the goal. The left defender is further from the goal and chases.',
      'The left defender is between the attacker with the puck and the goal. The attacker swerves wide into the corner.',
    ],
  },
  'shot-angle': {
    caption: 'What the shooter sees of the goal',
    panels: [
      {
        title: 'From the middle: dangerous',
        text: 'In the slot, between the dots, the shooter sees the whole goal. The blue wedge is the space they can shoot into.',
      },
      {
        title: 'From outside: harmless',
        text: 'Outside the dots only a thin strip is left. The goalie can cover it almost alone.',
      },
    ],
    labels: [
      'An attacker shoots from the middle in front of the goal. A wide wedge shows how much of the goal they see.',
      'An attacker shoots from the side, outside the dots. A thin wedge shows how little of the goal they see.',
    ],
    note: 'The yellow area is the danger zone: from the goal posts out to the faceoff dots and up to the top of the faceoff circles.',
  },
  'force-outside': {
    caption: 'Keeping them outside the dots',
    panels: [
      {
        title: 'Skate inside, push them wide',
        text: 'The defender skates on the inside, between the attacker and the danger zone. The attacker stays outside the dotted lines through the dots and ends up in the corner.',
      },
    ],
    labels: [
      'An attacker with the puck enters the zone along the left boards. The left defender skates alongside on the inside until the attacker is in the corner behind the goal line.',
    ],
  },
  backcheck: {
    caption: 'Defensive side without the puck',
    panels: [
      {
        title: 'Come back on the inside',
        text: 'An attacker without the puck heads for the goal. The RW comes back on the inside, between them and the goal, stick on the ice in the passing lane.',
      },
    ],
    labels: [
      'An attacker with the puck on the left boards, a second attacker skates from the right towards the goal. The right wing comes back through the middle and gets between that attacker and the goal.',
    ],
  },
  'free-area': {
    caption: 'Which area is free?',
    panels: [
      {
        title: 'Fill the gap',
        text: 'Three players are at the puck in the corner. An attacker stands alone in front of the goal. The RW comes into the zone, sees the gap and fills it – instead of joining the corner as the fourth player.',
      },
    ],
    labels: [
      'Puck in the left corner. LD and RD are in the corner, the centre on the boards. An attacker is open in front of the goal. The right wing skates from the middle to the front of the goal.',
    ],
  },
  overload: {
    caption: 'Overload: one attacks, one helps',
    panels: [
      {
        title: '2 against 1 at the puck',
        text: 'The attacker has the puck on the boards. LD attacks from below. C comes in from above and stays a few metres away, ready to help. The others stay in the middle: RD in front of the goal, RW in the high slot, LW between the puck and the blue line.',
      },
    ],
    labels: [
      'An attacker with the puck on the left boards. The left defender attacks from below, the centre is a few metres above, ready to help. The right defender is in front of the goal, the wingers higher up.',
    ],
    note: 'The dashed circles show where the players were before.',
  },
  pin: {
    caption: 'Pin and pick up the puck',
    panels: [
      {
        title: 'In two steps',
        text: '① LD presses the attacker against the boards and holds them there. ② C comes from below and picks up the loose puck. Now we have it.',
      },
    ],
    labels: [
      'The left defender pins an attacker against the left boards. The centre comes from below and picks up the loose puck underneath.',
    ],
  },
  'near-far': {
    caption: 'Near and far support',
    panels: [
      {
        title: 'Four passing options',
        text: 'LD has the puck in the corner, an attacker is coming. Near (green): LW on the boards and C low in the middle. Far (blue): RD on the other side of the goal and RW high on the far side.',
      },
    ],
    labels: [
      'The left defender has the puck in the left corner, an attacker skates at them. Passes are possible to the left wing on the boards, to the centre in front of the goal and to the right defender behind the goal. The right wing is high on the right boards.',
    ],
  },
  'pressure-support': {
    caption: 'Support under pressure',
    panels: [
      {
        title: 'Waiting at the net',
        text: 'C has the puck in the corner, two opponents press them against the boards. LW and RW wait in front of the goal. Every pass there goes through an opponent.',
      },
      {
        title: 'Go and help',
        text: 'LW skates into the corner, a few metres from C, into the open gap. C can push the puck along the boards to them. RW finds an open spot in the slot.',
      },
    ],
    labels: [
      'In the attacking zone the centre with the puck is pressed by two opponents in the corner. Both wingers stand in front of the goal between the opposing defenders.',
      'The left wing skates from the goal into the corner next to the centre and gets a short pass. The right wing moves into the slot.',
    ],
  },
  'neutral-zone': {
    caption: 'Defensive side in the neutral zone',
    panels: [
      {
        title: 'Stay inside, before the blue line already',
        text: 'The defenders skate backwards inside the dotted lines through the faceoff dots. The stick points outwards at the attacker. The attackers stay wide and enter the zone along the boards.',
      },
    ],
    labels: [
      'Two attackers skate wide through the neutral zone towards our zone, one with the puck. LD and RD skate backwards on the inside, sticks pointing outwards. The centre comes back through the middle.',
    ],
  },
  'offside-entry': {
    caption: 'Offside when entering the zone',
    panels: [
      {
        title: 'Offside',
        text: 'LW is already in the zone, the puck is still outside. As soon as the puck crosses the line, it is offside.',
      },
      {
        title: 'Not offside',
        text: 'LW waits in front of the line. Only when the puck is completely over it do they follow.',
      },
    ],
    labels: [
      'The centre carries the puck through the neutral zone towards the blue line. The left wing is already in the attacking zone.',
      'The puck has just crossed the blue line. The left wing was still in front of the line and now follows into the zone.',
    ],
  },
  'puck-out': {
    caption: 'The puck slides out of the zone',
    panels: [
      {
        title: 'Wait and pass across',
        text: 'The puck has slid out over the blue line and LD picks it up. LW, C and RW are still in the zone and skate straight to the blue line. RD skates back out of the zone to be a passing option. LD passes across to RD (1).',
      },
      {
        title: 'Attack again',
        text: 'Now nobody is in the zone any more: everyone is on or behind the blue line. RD carries the puck back in on the other side (2). The forwards only go in once the puck is in.',
      },
    ],
    labels: [
      'Half the rink, we attack upwards. The left defender has the puck just outside the blue line in the neutral zone. The three forwards skate out of the attacking zone to the blue line, the right defender skates back out of the zone. The left defender passes across to the right defender.',
      'The forwards are on the blue line. The right defender carries the puck into the attacking zone on the right side, and the forwards follow the puck in.',
    ],
  },
  'delayed-offside': {
    caption: 'Delayed offside: everyone out',
    panels: [
      {
        title: 'Back to the blue line',
        text: 'The linesperson has their arm up, the opponents have the puck. All three forwards leave the zone as fast as they can. Nobody plays the puck. As soon as none of them is left inside, they may go back in.',
      },
    ],
    labels: [
      'An opponent has the puck deep in their zone. Our three forwards are still in the zone and all skate back to the blue line. The defenders wait outside in the neutral zone.',
    ],
  },
  icing: {
    caption: 'Icing',
    panels: [
      {
        title: 'Icing',
        text: 'LD shoots the puck from our half, before the centre red line, across the opponents’ goal line. Nobody touches it.',
      },
      {
        title: 'Not icing',
        text: 'C only plays the puck after crossing the centre red line, in the opponents’ half. Then it is not icing.',
      },
    ],
    labels: [
      'The whole rink. Our left defender shoots the puck from our half to behind the opponents’ goal.',
      'The whole rink. Our centre shoots the puck just past the centre red line to behind the opponents’ goal.',
    ],
  },
  'icing-race': {
    caption: 'The race to the puck',
    panels: [
      {
        title: 'Who would get there first',
        text: 'The puck has slid across the goal line. The linesperson decides when the first player reaches the faceoff dots (dotted line): if the opponent would touch the puck first, it is icing. If our player would get there first, play goes on.',
      },
    ],
    labels: [
      'The puck is behind the opponents’ goal line in the corner. An opposing defender and our centre skate towards it. The opponent is closer and reaches the line through the dots first.',
    ],
    note: 'This is how the IIHF rule book does it (hybrid icing). Some leagues blow the whistle straight away, without a race.',
  },
  'delayed-penalty': {
    caption: 'Delayed penalty: pull the goalie',
    panels: [
      {
        title: 'The extra skater',
        text: 'The referee has an arm up. We have the puck up front. Our goalie skates to the bench, and just before they get there the extra skater (+1) jumps on. Our goal is empty.',
      },
    ],
    labels: [
      'The whole rink. Our team has the puck in the opponents’ zone. Our goalie skates out of the goal to the bench on the left boards, an extra skater comes on from there. Our goal is empty.',
    ],
    note: 'The dashed marker shows where the goalie stood before.',
  },
  'bench-distance': {
    caption: 'The way to the bench',
    panels: [
      {
        title: 'Periods 1 and 3: short change',
        text: 'Our bench is in our own half. From our zone the way is short (LD), from the attacking zone it is long (LW).',
      },
      {
        title: 'Period 2: long change',
        text: 'The teams have switched ends, the benches have not. Our goal is now at the top, our bench is in the opponents’ half. From our zone the way is long (RD), from the attacking zone it is short (RW).',
      },
    ],
    labels: [
      'The whole rink, our goal with our goalie at the bottom. Our bench is on the left boards between our blue line and the centre red line, the opponents’ bench just above. One arrow shows LD’s short way from our zone to the bench, another shows LW’s long way from the attacking zone.',
      'The same rink in period 2, our goal with our goalie now at the top. The benches are in the same place as in period 1, so our bench is in the opponents’ half. The arrow from RD in our zone to the bench is long, the arrow from RW in the attacking zone short.',
    ],
  },
  'long-change': {
    caption: 'Period 2: when the defence changes',
    panels: [
      {
        title: 'Changing while they come at us',
        text: 'The opponents carry the puck towards our goal. LD heads to the bench now. The fresh LD jumps on far behind the puck. In front of our goal RD is alone against two.',
      },
      {
        title: 'Changing while we attack',
        text: 'We have the puck up front. RD is on the blue line, right next to the bench. RD changes, LD stays. The fresh RD is back on the blue line straight away.',
      },
    ],
    labels: [
      'The whole rink in period 2, our goal at the top, our bench on the left boards in the opponents’ half. Two opponents carry the puck from the middle towards our goal. Our LD skates to the bench, a fresh LD comes off the bench far behind the puck. Only our goalie and RD are in front of our goal. An exclamation mark marks the gap.',
      'The whole rink in period 2, our goal at the top. We have the puck down in the opponents’ zone, LD and RD are on the blue line. RD skates the few metres to the bench, a fresh RD comes from there to the blue line. LD stays put.',
    ],
    note: 'Two LDs and two RDs: the one heading to the bench and the fresh one coming off it.',
  },
  'backcheck-change': {
    caption: 'Periods 1 and 3: changing on the way back',
    panels: [
      {
        title: 'The bench is on the way',
        text: 'The opponents have won the puck and head for our goal. LW is tired and goes to the bench on the way back. The fresh LW jumps on ahead of the puck and picks up the opponent.',
      },
    ],
    labels: [
      'The whole rink in period 1, our bench on the left boards in our own half. The opponents carry the puck out of their zone towards the middle. Our tired LW skates back along the left boards to the bench. A fresh LW comes off the bench, between the opponent and our goal. C skates back too, LD and RD wait at our blue line.',
    ],
    note: 'If the fresh LW can’t get ahead of the puck any more: skate back first, change later.',
  },
  'faceoff-own': {
    caption: 'Face-off in our own zone',
    panels: [
      {
        title: 'Face-off lost',
        text: 'The opposing centre draws the puck back to a defender at the blue line (1). LW and RW skate straight out to the two defenders at the blue line and get in the way of shots and passes. LD, RD and C stay low in front of the net. The dotted line is the goalie’s view of the puck: apart from C, nobody stands on it.',
      },
      {
        title: 'Face-off won',
        text: 'C draws the puck back to LD (1). LD passes it round behind the net to the other side (2), rimmed along the boards or as a bank pass. RW picks it up there. LW skates up the outside and into the middle, C goes up through the middle. RD stays in front of the net.',
      },
    ],
    labels: [
      'Face-off on the left circle in front of our goal. Apart from the centre, nobody stands between our goalie and the puck. The opposing centre wins it and draws the puck to a defender at the blue line. Our left wing skates out to that defender, our right wing to the other one.',
      'Face-off on the left circle in front of our goal. Our centre draws the puck to the left defender in the corner, who passes it round behind the net to the right wing. Left wing and centre skate up the ice.',
    ],
    note: 'Here the face-off is on the left circle. On the right circle everything is mirrored: RD stands at the boards, RW behind the C, LD on the inside and LW in the slot.',
  },
  'faceoff-attack': {
    caption: 'Face-off in the attacking zone',
    panels: [
      {
        title: 'Face-off won',
        text: 'C draws the puck back to RD. Straight away everyone moves: LW slides towards the far face-off spot, LD skates backwards along the line to the other side, RW moves down the boards towards the corner, C goes to the net.',
      },
      {
        title: 'Four options for RD',
        text: '1 Shoot: C in front of the net blocks the goalie’s view, tips the puck or takes the rebound. 2 Across to LD at the blue line. 3 Along the boards to RW. 4 Across the middle to LW.',
      },
    ],
    labels: [
      'Face-off on the circle in front of the opponents’ goal. Our centre draws the puck back to the right defender at the blue line. The left wing slides towards the far face-off spot, the left defender skates along the blue line to the other side, the right wing moves down the boards towards the corner, the centre goes to the net.',
      'The right defender has the puck at the blue line. Four options: a shot on goal, a pass to the left defender at the blue line, a pass along the boards to the right wing, a pass across the middle to the left wing.',
    ],
    note: 'Here the face-off is on the right circle. On the left circle everything is mirrored.',
  },
  'faceoff-neutral': {
    caption: 'Face-off in the neutral zone',
    panels: [
      {
        title: 'At centre ice',
        text: 'C draws the puck back to RD (1). The opposing wingers skate straight at our defenders, and their defenders step up behind them. RD has little time and moves the puck on quickly.',
      },
      {
        title: 'Outside the opponents’ zone',
        text: 'C draws the puck back to RD (1). The opposing wingers skate at our defenders. RD passes across to LD (2) before the opponent gets there.',
      },
    ],
    labels: [
      'Face-off at centre ice. Our centre draws the puck to the right defender. The opposing wingers skate at our two defenders, the opposing defenders step up.',
      'Face-off on the neutral-zone spot in front of the opponents’ blue line. Our centre draws the puck to the right defender, who passes across to the left defender. The opposing wingers skate at our defenders.',
    ],
    note: 'We attack upwards. On the spot on the other side everything is mirrored.',
  },
  'four-roles': {
    caption: 'Four roles, two moments',
    panels: [
      {
        title: 'We have the puck',
        text: 'K is the König: K has the puck and skates into open ice. Everyone else is a Satellit (S): low on the boards, in front of the goal and at the blue line. Each one is available for a pass.',
      },
      {
        title: 'The opponents have the puck',
        text: 'J is the Jäger: J stands between the puck carrier and the goal, stick pointing at the puck. Everyone else is a Wächter (W): each one stands between their opponent and our goal.',
      },
    ],
    labels: [
      'Attacking zone. A player with the puck, marked K, skates from the left boards towards the middle. Dotted passing lanes lead to three teammates marked S: low on the boards and both defenders at the blue line. A fourth S stands in front of the goal.',
      'Our own zone. An opponent has the puck on the left boards. J stands between that opponent and the goal, stick pointing at the puck. Four players marked W each stand between an opponent without the puck and our goal.',
    ],
    note: 'K = König, S = Satellit, J = Jäger, W = Wächter. The dotted lines are passing lanes.',
  },
  'open-ice': {
    caption: 'Finding open ice',
    panels: [
      {
        title: 'Into the zone',
        text: 'Two opponents are on the left. The König doesn’t skate into traffic but inside into the open ice (green), between the opponents.',
      },
      {
        title: 'Under pressure in the corner',
        text: 'Two opponents come from above. Behind the goal it is open. The König skates behind the goal and has a Satellit on the other side.',
      },
    ],
    labels: [
      'Attacking zone. The König carries the puck over the blue line on the left. Two opponents are on the left side. A green area in the high slot is open, and the König skates into it.',
      'The König has the puck in the left corner, two opponents are coming at the König. A green area behind the goal is open. The König skates behind the goal to the right side, where a Satellit is waiting.',
    ],
    note: 'Green is open ice: no opponent is there. Whoever skates there has time.',
  },
  'skate-to-pass': {
    caption: 'Skate towards the pass',
    panels: [
      {
        title: 'Stand and wait',
        text: 'The Satellit waits at the blue line. The pass is long. The opponent has time and arrives at the same moment.',
      },
      {
        title: 'Skate towards it',
        text: 'The Satellit skates towards the pass. The pass is short and arrives quickly. The opponent is still far away.',
      },
    ],
    labels: [
      'Our zone. The König passes from the left side of the goal all the way to the blue line. An opponent from the middle skates to the same spot as the pass.',
      'Same situation. The Satellit skates down the boards towards the puck. The pass is short. The opponent is far away.',
    ],
  },
  'read-opponent': {
    caption: 'Where is the opponent looking?',
    panels: [
      {
        title: 'Facing the play',
        text: 'The opponent can see everything. The Jäger comes in calmly, stays on the defensive side and gets the stick on the puck.',
      },
      {
        title: 'Facing the boards',
        text: 'The opponent can’t see anything. Now the Jäger attacks firmly and separates them from the puck – with body contact, but no check.',
      },
    ],
    labels: [
      'Our zone. An opponent with the puck on the left boards looks towards the middle; a blue fan shows where they are looking. The Jäger moves in only a little, stick on the puck.',
      'Same spot. The opponent faces the boards, back to the Jäger. The Jäger skates straight at them.',
    ],
    note: 'The blue fan shows where the opponent is looking.',
  },
  forecheck: {
    caption: 'Forecheck: dog, fox and hawk',
    panels: [
      {
        title: 'Everyone to the puck',
        text: 'All three forwards skate at the puck carrier. The pass up the boards to the free winger is open, and three players are beaten.',
      },
      {
        title: 'One role each',
        text: 'LW is the dog and attacks the puck carrier. C is the fox and closes the boards. RW is the hawk and stays high in the middle.',
      },
    ],
    labels: [
      'In the attacking zone an opposing defender has the puck in the left corner. LW, C and RW all skate at the puck carrier, who passes along the boards to the free winger at the blue line.',
      'Same situation. The left winger skates at the puck carrier. The centre skates to the left boards, between the puck and the opposing winger. The right winger skates to the middle below the blue line. The defenders stay at the blue line.',
    ],
  },
  'halfwall-read': {
    caption: 'The defender crosses: where does the opponent go?',
    panels: [
      {
        title: 'The opponent stays with LW',
        text: 'LW plays the puck along the boards into LD’s path. LD takes it in their stride and has space.',
      },
      {
        title: 'The opponent goes with LD',
        text: 'LW keeps the puck and cuts into the slot. The way is open.',
      },
    ],
    labels: [
      'Attacking zone, the opponents’ goal at the top. LW has the puck on the left boards, an opponent right next to them. LD has skated past LW on the inside. LW plays the puck along the boards towards the goal, and LD curves over to it.',
      'Same situation, but the opponent has gone down with LD. LW is open and carries the puck in a curve into the slot.',
    ],
  },
  'skate-away': {
    caption: 'Skate away or skate towards the puck?',
    panels: [
      {
        title: 'Skating away and looking back',
        text: 'LW skates with their back to LD all the way to the blue line and looks back over their shoulder. The pass is long and comes steeply from behind. LW can’t see the opponents in front and at the side. When the pass comes, LW skates blind into a check: a hospital pass.',
      },
      {
        title: 'Skating towards it',
        text: 'LW skates towards LD and turns to the outside. The pass is short and comes at an angle from the side. LW can see the whole ice.',
      },
    ],
    labels: [
      'The whole rink, our goal at the bottom. LD has the puck next to our goal. LW skates up with their back to LD to just short of the opponents’ blue line and looks back. A dotted line shows the long, steep passing lane from behind. An opponent waits right in front of LW and skates at them, a second one comes from the side. Both are outside what LW can see.',
      'Same situation. LW skates towards LD and turns in a curve to the outside, towards the boards. LD passes short and at an angle to LW.',
    ],
  },
  'goalie-angle': {
    caption: 'Angle: on the line to the puck',
    panels: [
      {
        title: 'Too far in the middle',
        text: 'The puck is on the left, the goalie stands in the middle of the net. A gap opens at the near post. That is where the shot goes.',
      },
      {
        title: 'Nose and belly button to the puck',
        text: 'The goalie stands on the line from the puck to the middle of the goal and looks straight at the puck. The blue wedge the shooter can aim at is almost closed.',
      },
    ],
    labels: [
      'Own zone. An opponent with the puck on the left, in front of the faceoff circle. Our goalie stands right of the middle of the goal. A shot goes into the gap at the left post.',
      'Same situation. Our goalie stands left in front of the goal, on the line between the puck and the middle of the goal, and looks at the puck.',
    ],
    note: 'The blue wedge shows what the shooter sees of the goal.',
  },
  'goalie-rush': {
    caption: 'Depth: how far out?',
    panels: [
      {
        title: 'Alone against one',
        text: 'One opponent skates in alone. The goalie comes out to the edge of the crease. The shooter sees less of the goal.',
      },
      {
        title: 'Two against one',
        text: 'Two opponents come, the puck carrier can pass across. The goalie stays deeper in the crease, so the way to the other side is short when the pass comes.',
      },
    ],
    labels: [
      'Own zone. An opponent with the puck skates alone through the middle towards the goal. Our goalie has come out to the edge of the crease. A dashed outline shows where they stood before.',
      'Own zone. Two opponents skate towards the goal, the left one has the puck. Our left defender stands between them. Our goalie stays deep in the crease, slightly left, looking at the puck.',
    ],
    note: 'The dashed outline shows where the goalie stood before.',
  },
  'goalie-traffic': {
    caption: 'Keep the line of sight clear',
    panels: [
      {
        title: 'Our own player in the way',
        text: 'The opponent shoots from the blue line. Our LD stands right between the goalie and the puck. The goalie only sees the shot when it is already there.',
      },
      {
        title: 'Beside it, not in front',
        text: 'LD stands beside the dotted line. The goalie sees the puck from the moment it leaves the stick.',
      },
    ],
    labels: [
      'Own zone. An opponent with the puck at the left blue line. Our left defender stands on the line between the goalie and the puck.',
      'Same situation. Our left defender stands further left, beside the line between the goalie and the puck.',
    ],
    note: 'The dotted line is the goalie’s view of the puck.',
  },
  'gretzky-office': {
    caption: 'Gretzky’s office',
    panels: [
      {
        title: 'Behind the net you have time',
        text: 'C has the puck behind the opponents’ net. The goalie has to turn round, and the defenders can’t watch the puck and their player at the same time. C passes into the slot (1) or to the far post (2).',
      },
    ],
    labels: [
      'The attacking zone. Our centre has the puck behind the opponents’ net. Arrows show passes to the left wing in the slot and to the right wing at the far post.',
    ],
  },
  'bubble-size': {
    caption: 'The bubble: how much time and space do you have?',
    panels: [
      {
        title: 'Opponent far away: big bubble',
        text: 'K has the puck. The nearest opponent is about 10 metres away. It takes them roughly 2 seconds to get there. Enough time to look, pass or shoot.',
      },
      {
        title: 'Opponent close: small bubble',
        text: 'The opponent is only 3 to 4 metres away. That leaves less than a second. K has to act straight away.',
      },
    ],
    labels: [
      'The attacking zone. K has the puck on the left, with a big circle around them: about 2 seconds. One opponent is far away in the middle.',
      'The same spot. The opponent is close in front of K, and the circle around K is small: less than a second.',
    ],
    note: 'The seconds are rough guide values: an opponent at speed covers about 5 metres a second.',
  },
  'soft-areas': {
    caption: 'Spotting open ice',
    panels: [
      {
        title: 'Next to an opponent',
        text: 'Three teammates stand right next to an opponent, the fourth in the passing shadow (grey) of the opponent attacking K. A pass to them is picked off or disrupted at once. K has nobody to pass to.',
      },
      {
        title: 'In open ice',
        text: 'One is high in the slot, one at the faceoff circle next to the passing shadow, one in the corner. K reaches the corner with a pass off the boards. The fourth stands in front of the goal at the far post: if K plays a rim behind the net, they skate behind the net and pick up the puck. No opponent is responsible for any of them. With the pass they get a big bubble straight away.',
      },
    ],
    labels: [
      'Attacking zone. K has the puck on the left boards, with an opponent between them and the goal. Behind that opponent is a grey passing shadow. Our four teammates stand next to an opponent up high, in the passing shadow, next to an opponent on the right, and next to an opponent in front of the goal.',
      'The same situation. Three green areas show the open ice: high in the slot, at the left faceoff circle next to the passing shadow, and in the left-hand corner. Three teammates stand there. Dotted lines show K’s open passing lanes, the one to the corner off the boards. The fourth teammate stands at the right-hand post. A dotted line shows the rim along the boards to behind the net. An arrow shows that teammate skating there.',
    ],
  },
};

export const playText = { de, en };
