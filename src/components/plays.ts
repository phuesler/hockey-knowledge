/**
 * The static game situations drawn by RinkPlay.svelte: where everyone stands (in rink
 * metres, see rink.ts) and the words around each drawing, in German and English.
 *
 * A play has one or more panels. Each panel is one zone; `zone` says whose goal is at
 * the bottom, and `verdict` marks a "do this" / "not like this" comparison.
 */
import { DANGER_ZONE, POST_X, GOAL_LINE, viewCone, type Pt, type Scene, type View } from './rink';
import { animals } from './stories';

export interface PlayPanel {
  /**
   * own: our goal at the bottom; attack: the opponents' goal, drawn turned so it is at
   * the top; full: both; neutral: the neutral zone, our goal below the drawing.
   */
  zone: 'own' | 'attack' | 'full' | 'neutral';
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
        text: 'Der Verteidiger ist weiter vom Tor weg als der Gegner. Der Weg zum Tor ist frei, er kann nur noch hinterherfahren.',
      },
      {
        title: 'Auf der Abwehrseite',
        text: 'Der Verteidiger steht auf der gepunkteten Linie zwischen Gegner und Tor, leicht zur Mitte hin. Dem Gegner bleibt nur der Weg nach aussen.',
      },
    ],
    labels: [
      'Ein Gegner mit Puck fährt frei aufs Tor. Der linke Verteidiger ist weiter vom Tor entfernt und fährt hinterher.',
      'Der linke Verteidiger steht zwischen dem Gegner mit Puck und dem Tor. Der Gegner weicht nach aussen in die Ecke aus.',
    ],
  },
  'shot-angle': {
    caption: 'Was der Schütze vom Tor sieht',
    panels: [
      {
        title: 'Aus der Mitte: gefährlich',
        text: 'Im Slot, zwischen den Bullypunkten, sieht der Schütze das ganze Tor. Der blaue Keil ist der Raum, in den er schiessen kann.',
      },
      {
        title: 'Von aussen: harmlos',
        text: 'Ausserhalb der Bullypunkte bleibt nur ein schmaler Streifen. Den deckt der Torhüter fast allein ab.',
      },
    ],
    labels: [
      'Ein Gegner schiesst aus der Mitte vor dem Tor. Ein breiter Keil zeigt, wie viel vom Tor er sieht.',
      'Ein Gegner schiesst von der Seite, ausserhalb der Bullypunkte. Ein schmaler Keil zeigt, wie wenig vom Tor er sieht.',
    ],
    note: 'Die gelbe Fläche ist die Gefahrenzone: von den Torpfosten zu den Bullypunkten und hinauf bis zum oberen Rand der Bullykreise.',
  },
  'force-outside': {
    caption: 'Ausserhalb der Punkte halten',
    panels: [
      {
        title: 'Innen fahren, nach aussen drängen',
        text: 'Der Verteidiger fährt innen, zwischen Gegner und Gefahrenzone. Der Gegner bleibt ausserhalb der gepunkteten Linien durch die Bullypunkte und landet in der Ecke.',
      },
    ],
    labels: [
      'Ein Gegner mit Puck fährt an der linken Bande in die Zone. Der linke Verteidiger fährt innen neben ihm mit, bis der Gegner in der Ecke hinter der Torlinie ist.',
    ],
  },
  backcheck: {
    caption: 'Abwehrseite ohne Puck',
    panels: [
      {
        title: 'Innen zurückfahren',
        text: 'Ein Gegner ohne Puck fährt Richtung Tor. Der RW fährt innen zurück, zwischen ihn und das Tor, mit dem Stock auf dem Eis im Passweg.',
      },
    ],
    labels: [
      'Ein Gegner mit Puck an der linken Bande, ein zweiter Gegner fährt von rechts Richtung Tor. Der rechte Flügel fährt durch die Mitte zurück und kommt zwischen diesen Gegner und das Tor.',
    ],
  },
  'free-area': {
    caption: 'Welcher Bereich ist frei?',
    panels: [
      {
        title: 'Die Lücke füllen',
        text: 'Drei Spieler sind beim Puck in der Ecke. Vor dem Tor steht ein Gegner allein. Der RW kommt in die Zone, sieht die Lücke und füllt sie – statt als Vierter zum Puck zu fahren.',
      },
    ],
    labels: [
      'Puck in der linken Ecke. LD und RD sind in der Ecke, der Center an der Bande. Vor dem Tor steht ein Gegner frei. Der rechte Flügel fährt aus der Mitte vor das Tor.',
    ],
  },
  overload: {
    caption: 'Overload: einer greift an, einer hilft',
    panels: [
      {
        title: '2 gegen 1 am Puck',
        text: 'Der Gegner hat den Puck an der Bande. LD greift von unten an. C kommt von oben dazu und bleibt ein paar Meter weg, bereit zu helfen. Die anderen bleiben in der Mitte: RD vor dem Tor, RW im hohen Slot, LW zwischen Puck und blauer Linie.',
      },
    ],
    labels: [
      'Ein Gegner mit Puck an der linken Bande. Der linke Verteidiger greift ihn von unten an, der Center steht ein paar Meter darüber, bereit zu helfen. Der rechte Verteidiger steht vor dem Tor, die Flügel weiter oben.',
    ],
    note: 'Die gestrichelten Kreise zeigen, wo die Spieler vorher waren.',
  },
  pin: {
    caption: 'Pinnen und den Puck holen',
    panels: [
      {
        title: 'In zwei Schritten',
        text: '① LD drückt den Gegner an die Bande und hält ihn dort. ② C kommt von unten und holt den freien Puck. Jetzt haben wir ihn.',
      },
    ],
    labels: [
      'Der linke Verteidiger drückt einen Gegner an die linke Bande. Der Center kommt von unten und holt den Puck, der darunter frei liegt.',
    ],
  },
  'near-far': {
    caption: 'Nahe und weite Unterstützung',
    panels: [
      {
        title: 'Vier Anspielstationen',
        text: 'LD hat den Puck in der Ecke, ein Gegner kommt. Nah (grün): LW an der Bande und C tief in der Mitte. Weit (blau): RD auf der anderen Seite des Tores und RW hoch auf der anderen Seite.',
      },
    ],
    labels: [
      'Der linke Verteidiger hat den Puck in der linken Ecke, ein Gegner fährt auf ihn zu. Pässe sind zum linken Flügel an der Bande, zum Center vor dem Tor und zum rechten Verteidiger hinter dem Tor möglich. Der rechte Flügel steht hoch an der rechten Bande.',
    ],
  },
  'pressure-support': {
    caption: 'Unterstützung unter Druck',
    panels: [
      {
        title: 'Vor dem Tor warten',
        text: 'C hat den Puck in der Ecke, zwei Gegner drücken ihn an die Bande. LW und RW warten vor dem Tor. Jeder Pass dorthin geht durch einen Gegner.',
      },
      {
        title: 'Hinfahren',
        text: 'LW fährt in die Ecke, ein paar Meter neben C, in die freie Lücke. C kann den Puck kurz an der Bande zu ihm schieben. RW sucht sich einen freien Platz im Slot.',
      },
    ],
    labels: [
      'In der Angriffszone wird der Center mit Puck in der Ecke von zwei Gegnern bedrängt. Die beiden Flügel stehen vor dem Tor zwischen den gegnerischen Verteidigern.',
      'Der linke Flügel fährt vom Tor in die Ecke neben den Center und bekommt einen kurzen Pass. Der rechte Flügel fährt in den Slot.',
    ],
  },
  'neutral-zone': {
    caption: 'Abwehrseite in der neutralen Zone',
    panels: [
      {
        title: 'Innen bleiben, schon vor der blauen Linie',
        text: 'Die Verteidiger fahren rückwärts innerhalb der gepunkteten Linien durch die Bullypunkte zurück. Der Stock zeigt nach aussen zum Gegner. Die Gegner bleiben aussen und kommen an der Bande in die Zone.',
      },
    ],
    labels: [
      'Zwei Gegner fahren in der neutralen Zone aussen auf unser Drittel zu, einer davon mit Puck. LD und RD fahren innen rückwärts zurück, den Stock nach aussen gerichtet. Der Center fährt durch die Mitte zurück.',
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
        text: 'LW wartet vor der Linie. Erst wenn der Puck ganz drüben ist, fährt er hinterher.',
      },
    ],
    labels: [
      'Der Center führt den Puck in der neutralen Zone auf die blaue Linie zu. Der linke Flügel steht schon in der Angriffszone.',
      'Der Puck ist gerade über die blaue Linie. Der linke Flügel stand noch vor der Linie und fährt jetzt hinterher in die Zone.',
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
      'Halbes Eis, wir greifen nach oben an. Der linke Verteidiger hat den Puck knapp vor der blauen Linie in der neutralen Zone. Die drei Stürmer fahren aus der Angriffszone zur blauen Linie, der rechte Verteidiger fährt aus der Zone zurück. Der linke Verteidiger passt quer zum rechten Verteidiger.',
      'Die Stürmer stehen auf der blauen Linie. Der rechte Verteidiger fährt mit dem Puck auf der rechten Seite in die Angriffszone, die Stürmer fahren hinter dem Puck mit hinein.',
    ],
  },
  'delayed-offside': {
    caption: 'Verzögertes Abseits: alle raus',
    panels: [
      {
        title: 'Zurück an die blaue Linie',
        text: 'Der Linienrichter hat den Arm oben, der Gegner hat den Puck. Alle drei Stürmer fahren so schnell wie möglich aus der Zone. Keiner spielt den Puck. Sobald keiner mehr drin ist, dürfen sie wieder hinein.',
      },
    ],
    labels: [
      'Ein Gegner hat den Puck tief in seiner Zone. Unsere drei Stürmer stehen noch in der Zone und fahren alle zur blauen Linie zurück. Die Verteidiger warten draussen in der neutralen Zone.',
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
        text: 'Der Puck ist über die Torlinie gerutscht. Der Linienrichter entscheidet, wenn der erste Spieler auf Höhe der Bullypunkte (gepunktete Linie) ist: Wäre der Gegner zuerst am Puck, gibt es Icing. Wäre unser Spieler zuerst dort, geht das Spiel weiter.',
      },
    ],
    labels: [
      'Der Puck liegt hinter der gegnerischen Torlinie in der Ecke. Ein gegnerischer Verteidiger und unser Center fahren darauf zu. Der Gegner ist näher und zuerst an der Linie durch die Bullypunkte.',
    ],
    note: 'So läuft es nach dem IIHF-Regelbuch (Hybrid-Icing). In manchen Ligen wird Icing ohne Rennen sofort abgepfiffen.',
  },
  'delayed-penalty': {
    caption: 'Angezeigte Strafe: Torhüter raus',
    panels: [
      {
        title: 'Der sechste Feldspieler',
        text: 'Der Schiedsrichter hat den Arm oben. Wir haben den Puck vorne. Unser Torhüter fährt zur Bank, kurz bevor er dort ist, springt der sechste Feldspieler (+1) aufs Eis. Unser Tor ist leer.',
      },
    ],
    labels: [
      'Das ganze Eis. Unser Team hat den Puck in der gegnerischen Zone. Unser Torhüter fährt aus dem Tor zur Spielerbank an der linken Bande, ein zusätzlicher Feldspieler fährt von dort aufs Eis. Unser Tor ist leer.',
    ],
    note: 'Die gestrichelte Markierung zeigt, wo der Torhüter vorher stand.',
  },
  'faceoff-own': {
    caption: 'Bully in der eigenen Zone',
    panels: [
      {
        title: 'Bully verloren',
        text: 'Der gegnerische Center zieht den Puck zu seinem Verteidiger an der blauen Linie (1). LW und RW fahren sofort zu den beiden Verteidigern an der blauen Linie und stören Schuss und Pass. LD, RD und C bleiben unten vor dem Tor. Die gepunktete Linie ist der Blick des Torhüters zum Puck: Ausser C steht dort niemand.',
      },
      {
        title: 'Bully gewonnen',
        text: 'C zieht den Puck nach hinten zu LD (1). LD passt ihn hinter dem Tor herum auf die andere Seite (2), an der Bande entlang oder mit einem Bandenpass. Dort holt ihn RW. LW fährt aussen hoch und in die Mitte, C fährt durch die Mitte mit. RD bleibt vor dem Tor.',
      },
    ],
    labels: [
      'Bully am linken Kreis vor unserem Tor. Zwischen unserem Torhüter und dem Puck steht ausser dem Center niemand. Der gegnerische Center gewinnt und zieht den Puck zu einem Verteidiger an der blauen Linie. Unser linker Flügel fährt zu diesem Verteidiger, unser rechter Flügel zum anderen.',
      'Bully am linken Kreis vor unserem Tor. Unser Center zieht den Puck zum linken Verteidiger in die Ecke. Der passt ihn hinter dem Tor herum zum rechten Flügel. Linker Flügel und Center fahren nach vorne.',
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
      'Bully am Kreis vor dem gegnerischen Tor. Unser Center zieht den Puck zum rechten Verteidiger an der blauen Linie. Der linke Flügel fährt Richtung anderer Bullypunkt, der linke Verteidiger an der blauen Linie auf die andere Seite, der rechte Flügel an der Bande Richtung Ecke, der Center vors Tor.',
      'Der rechte Verteidiger hat den Puck an der blauen Linie. Vier Möglichkeiten: Schuss aufs Tor, Pass zum linken Verteidiger an der blauen Linie, Pass an der Bande entlang zum rechten Flügel, Pass quer über die Mitte zum linken Flügel.',
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
        text: 'C zieht den Puck zurück zu RD (1). Die gegnerischen Flügel fahren auf unsere Verteidiger zu. RD passt quer zu LD (2), bevor der Gegner da ist.',
      },
    ],
    labels: [
      'Bully am Mittelpunkt. Unser Center zieht den Puck zum rechten Verteidiger. Die gegnerischen Flügel fahren auf unsere beiden Verteidiger zu, die gegnerischen Verteidiger rücken nach.',
      'Bully am Punkt in der neutralen Zone vor der gegnerischen blauen Linie. Unser Center zieht den Puck zum rechten Verteidiger, der quer zum linken Verteidiger passt. Die gegnerischen Flügel fahren auf unsere Verteidiger zu.',
    ],
    note: 'Wir greifen nach oben an. Am Punkt auf der anderen Seite ist alles gespiegelt.',
  },
  'four-roles': {
    caption: 'Vier Rollen, zwei Momente',
    panels: [
      {
        title: 'Wir haben den Puck',
        text: 'K ist der König: Er hat den Puck und fährt ins freie Eis. Alle anderen sind Satelliten (S): tief an der Bande, vor dem Tor und an der blauen Linie. Jeder ist anspielbar.',
      },
      {
        title: 'Der Gegner hat den Puck',
        text: 'J ist der Jäger: Er steht zwischen Puckführer und Tor, der Schläger zeigt zum Puck. Alle anderen sind Wächter (W): Jeder steht zwischen seinem Gegner und unserem Tor.',
      },
    ],
    labels: [
      'Angriffsdrittel. Ein Spieler mit Puck, markiert mit K, fährt von der linken Bande in die Mitte. Gepunktete Passwege führen zu drei Mitspielern, markiert mit S: tief an der Bande und zu beiden Verteidigern an der blauen Linie. Ein vierter S steht vor dem Tor.',
      'Eigenes Drittel. Ein Gegner hat den Puck links an der Bande. Der Spieler J steht zwischen ihm und dem Tor, der Schläger zeigt zum Puck. Vier Spieler, markiert mit W, stehen jeweils zwischen einem Gegner ohne Puck und unserem Tor.',
    ],
    note: 'K = König, S = Satellit, J = Jäger, W = Wächter. Die gepunkteten Linien sind Passwege.',
  },
  'open-ice': {
    caption: 'Freies Eis finden',
    panels: [
      {
        title: 'Rein ins Drittel',
        text: 'Links stehen zwei Gegner. Der König fährt nicht in den Verkehr, sondern nach innen ins freie Eis (grün), zwischen die Gegner.',
      },
      {
        title: 'Unter Druck in der Ecke',
        text: 'Zwei Gegner kommen von oben. Hinter dem Tor ist frei. Der König fährt hinters Tor und hat auf der anderen Seite einen Satelliten.',
      },
    ],
    labels: [
      'Angriffsdrittel. Der König fährt mit dem Puck links über die blaue Linie. Zwei Gegner stehen an der linken Seite. Eine grüne Fläche im hohen Slot ist frei, der König fährt hinein.',
      'Der König hat den Puck in der linken Ecke, zwei Gegner kommen auf ihn zu. Hinter dem Tor ist eine grüne Fläche frei. Der König fährt hinter dem Tor durch auf die rechte Seite, wo ein Satellit wartet.',
    ],
    note: 'Grün ist freies Eis: Dort steht kein Gegner. Wer dorthin fährt, hat Zeit.',
  },
  'skate-to-pass': {
    caption: 'Gegenlaufen: dem Pass entgegenfahren',
    panels: [
      {
        title: 'Stehen und warten',
        text: 'Der Satellit wartet an der blauen Linie. Der Pass ist lang. Der Gegner hat Zeit und kommt gleichzeitig an.',
      },
      {
        title: 'Entgegenfahren',
        text: 'Der Satellit fährt dem Pass entgegen. Der Pass ist kurz und schnell da. Der Gegner ist noch weit weg.',
      },
    ],
    labels: [
      'Eigenes Drittel. Der König passt von der linken Torseite weit zur blauen Linie. Ein Gegner aus der Mitte fährt zur gleichen Stelle wie der Pass.',
      'Gleiche Situation. Der Satellit fährt an der Bande nach unten, dem Puck entgegen. Der Pass ist kurz. Der Gegner ist weit weg.',
    ],
  },
  'read-opponent': {
    caption: 'Wohin schaut der Gegner?',
    panels: [
      {
        title: 'Er schaut zum Spiel',
        text: 'Er sieht alles. Der Jäger fährt ruhig heran, bleibt auf der Abwehrseite und bringt den Schläger zum Puck.',
      },
      {
        title: 'Er schaut zur Bande',
        text: 'Er sieht nichts. Jetzt greift der Jäger entschlossen an und trennt ihn vom Puck – mit Körperkontakt, aber ohne Check.',
      },
    ],
    labels: [
      'Eigenes Drittel. Ein Gegner mit Puck an der linken Bande schaut zur Mitte, ein blauer Fächer zeigt seinen Blick. Der Jäger fährt nur ein kleines Stück heran, Schläger zum Puck.',
      'Gleiche Stelle. Der Gegner schaut zur Bande, mit dem Rücken zum Jäger. Der Jäger fährt direkt auf ihn zu.',
    ],
    note: 'Der blaue Fächer zeigt, wohin der Gegner schaut.',
  },
  forecheck: {
    caption: 'Forecheck: Hund, Fuchs und Falke',
    panels: [
      {
        title: 'Alle zum Puck',
        text: 'Alle drei Stürmer fahren zum Puckführer. Der Pass an der Bande hoch zum freien Flügel ist offen, und drei Spieler sind ausgespielt.',
      },
      {
        title: 'Jeder eine Rolle',
        text: 'Der LW ist der Hund und greift den Puckführer an. Der C ist der Fuchs und macht die Bande zu. Der RW ist der Falke und bleibt hoch in der Mitte.',
      },
    ],
    labels: [
      'In der Angriffszone hat ein gegnerischer Verteidiger den Puck in der linken Ecke. LW, C und RW fahren alle zu ihm. Er passt an der Bande entlang zum freien Flügel an der blauen Linie.',
      'Gleiche Lage. Der linke Flügel fährt zum Puckführer. Der Center fährt an die linke Bande zwischen Puck und gegnerischen Flügel. Der rechte Flügel fährt in die Mitte vor die blaue Linie. Die Verteidiger bleiben an der blauen Linie.',
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
        text: 'K is the König: he has the puck and skates into open ice. Everyone else is a Satellit (S): low on the boards, in front of the goal and at the blue line. Each one is available for a pass.',
      },
      {
        title: 'The opponents have the puck',
        text: 'J is the Jäger: he stands between the puck carrier and the goal, stick pointing at the puck. Everyone else is a Wächter (W): each one stands between his opponent and our goal.',
      },
    ],
    labels: [
      'Attacking zone. A player with the puck, marked K, skates from the left boards towards the middle. Dotted passing lanes lead to three teammates marked S: low on the boards and both defenders at the blue line. A fourth S stands in front of the goal.',
      'Our own zone. An opponent has the puck on the left boards. Player J stands between him and the goal, stick pointing at the puck. Four players marked W each stand between an opponent without the puck and our goal.',
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
      'The König has the puck in the left corner, two opponents are coming at him. A green area behind the goal is open. The König skates behind the goal to the right side, where a Satellit is waiting.',
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
        title: 'He faces the play',
        text: 'He can see everything. The Jäger comes in calmly, stays on the defensive side and gets his stick on the puck.',
      },
      {
        title: 'He faces the boards',
        text: 'He can’t see anything. Now the Jäger attacks firmly and separates him from the puck – with body contact, but no check.',
      },
    ],
    labels: [
      'Our zone. An opponent with the puck on the left boards looks towards the middle; a blue fan shows where he is looking. The Jäger moves in only a little, stick on the puck.',
      'Same spot. The opponent faces the boards, his back to the Jäger. The Jäger skates straight at him.',
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
};

export const playText = { de, en };
