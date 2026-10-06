/**
 * Quizzes at the end of the articles, drawn by Quiz.svelte. Every wrong option is a
 * mistake kids or parents really make, and its feedback explains why it is wrong:
 * feedback that explains teaches far more than right/wrong alone (Van der Kleij et al.
 * 2015), and recalling an answer beats rereading (the testing effect).
 *
 * Geometry (rink pictures, which option is right) is shared; the words live in `de` and
 * `en`, typed against each other, so a missing translation fails `astro check`.
 *
 * Positions are rink metres, see rink.ts. In the attacking zone our left is at positive x.
 */
import { COVERAGE_AREAS, DANGER_ZONE, GOAL_LINE, POST_X, passShadow, type Player, type Pt, type Scene, type View } from './rink';
import type { Locale } from '../lib/i18n';

export interface QuizFigure {
  zone: 'own' | 'attack' | 'full' | 'neutral';
  view?: View;
  scene: Scene;
  /** Spots to choose from, drawn as dashed circles A, B, C … (see candidates()). */
  candidates?: readonly Pt[];
  /** How it should look: shown with the explanation once the question is answered. */
  after?: Scene;
}

export interface QuestionGeometry {
  figure?: QuizFigure;
  /** Index of the right option. */
  correct: number;
}

export interface QuestionText {
  prompt: string;
  options: { text: string; feedback: string }[];
  /** Screen-reader description of the picture, and of the picture after answering. */
  label?: string;
  afterLabel?: string;
  /** Where the article explains it: the heading's anchor and a short name for the link. */
  section: string;
  topic: string;
}

interface QuizText {
  title: string;
  /** The article's short name and slug in this language, for links from the mixed quiz. */
  name: string;
  article: string;
  questions: QuestionText[];
}

/** Candidate spots as ghost players labelled A, B, C (ids `cand-A` …). */
export function candidates(spots: readonly Pt[]): Player[] {
  return spots.map((at, i) => {
    const label = String.fromCharCode(65 + i);
    return { id: `cand-${label}`, team: 'us', label, ghost: true, at };
  });
}

const us = (label: string, at: Pt): Player => ({ id: label, team: 'us', label, at });

/* Left and right swapped: the other faceoff circle. LD and RD trade places, so do LW
   and RW (see "Der andere Kreis" in the Bully article). */
const swapSide = (label?: string) =>
  label?.replace(/^([LR])([DW])$/, (_, side: string, pos: string) => (side === 'L' ? 'R' : 'L') + pos);
const mirror = (players: Player[]): Player[] =>
  players.map((p) => ({ ...p, id: swapSide(p.id), label: swapSide(p.label), at: [-p.at[0], p.at[1]] }));
const them = (id: string, at: Pt): Player => ({ id, team: 'them', at });

/* Delayed offside: the opponents have the puck deep in their zone, our three forwards
   are still inside. Same spots as the 'delayed-offside' play. */
const offsideThem = [them('o1', [-4, 7]), them('o2', [4.5, 9]), them('o3', [-10, 11]), them('o4', [5, 18])];
const offsideDefence = [us('LD', [8, 26.5]), us('RD', [-8, 26.5])];

/* Delayed penalty: we attack with five, their five defend. Same spots as the
   'delayed-penalty' play. */
const penaltyThem = [
  them('o1', [2, 53]),
  them('o2', [-5, 51.5]),
  them('o3', [9, 45]),
  them('o4', [-8, 43]),
  them('o5', [3, 44]),
];
const penaltyUs = [
  us('C', [5.5, 49.5]),
  us('LW', [-10, 47.5]),
  us('RW', [10, 52]),
  us('LD', [-7, 38.5]),
  us('RD', [7, 39.5]),
];
const bench = { kind: 'bench', poly: [[-15, 22], [-14, 22], [-14, 30], [-15, 30]] } as const;
const danger = { kind: 'danger', poly: DANGER_ZONE } as const;
const posts: [Pt, Pt] = [
  [-POST_X, GOAL_LINE],
  [POST_X, GOAL_LINE],
];

/* Our zone, puck in the right corner: the 'cornerRight' layout of CoverageExplorer. */
const rightCornerThem = [
  them('o1', [11.5, 2.9]),
  them('o2', [12.5, 12.5]),
  them('o3', [2.2, 8]),
  them('o4', [-8, 21]),
  them('o5', [9, 21]),
];

/* LD has the puck in the left corner of our zone, an opponent comes at them (near-far). */
const breakoutPuck: Pt = [-8.4, 2.4];
const breakoutChaser: Pt = [-6.8, 7.4];

/* Attacking zone: C is stuck in the corner against two opponents (pressure-support). */
const stuckThem = [
  them('o1', [10.2, 5.9]),
  them('o2', [12.6, 7.8]),
  them('o3', [1.3, 5.8]),
  them('o4', [-2.2, 6]),
  them('o5', [7, 16]),
];

/* Faceoff on our left circle in our own zone, as in the 'faceoff-own' play. */
const faceoffThem = [
  them('o1', [-12.6, 12.8]),
  them('o2', [-7, 11.7]),
  them('o3', [-1.8, 12.6]),
  them('o4', [-12.5, 20.5]),
  them('o5', [-1.5, 20.5]),
];
const faceoffUs = [us('G', [0, 5]), us('LD', [-12.2, 7.5]), us('C', [-7, 8.3]), us('RD', [-2.2, 9.6]), us('RW', [1.8, 7.6])];
const faceoffLW = us('LW', [-5.8, 5.2]);
const faceoffPuck: Pt = [-7, 10];

const geometry = {
  regeln: [
    /* 1. Skates on the blue line, stick in the zone. */
    { correct: 2 },

    /* 2. Delayed offside: everyone out at the same time. */
    {
      correct: 1,
      figure: {
        zone: 'attack',
        view: 'half',
        scene: {
          players: [...offsideThem, us('LW', [9.5, 13]), us('C', [1, 15.5]), us('RW', [-8, 17]), ...offsideDefence],
          puck: [-3.2, 5.8],
        },
        after: {
          players: [
            ...offsideThem,
            us('LW', [9.5, 22.5]),
            us('C', [1.5, 22.5]),
            us('RW', [-8, 22.5]),
            ...offsideDefence,
          ],
          puck: [-3.2, 5.8],
        },
      },
    },

    /* 3. Icing: from which spot? A is in our half, B past the centre line. */
    {
      correct: 0,
      figure: {
        zone: 'full',
        view: 'full',
        candidates: [[-5, 13], [-4, 36]],
        scene: {
          players: [them('o1', [3, 20]), them('o2', [6, 31]), them('o3', [0, 49])],
          moves: [
            { kind: 'shot', path: [[-5, 13], [6, 58.6]], trim: 0.8 },
            { kind: 'shot', path: [[-4, 36], [-7, 58.6]], trim: 0.8 },
          ],
        },
      },
    },

    /* 4. Puck carrier crosses ahead of the puck. */
    { correct: 1 },

    /* 5. Linesperson's arm up while the puck slides towards their goal line. */
    {
      correct: 1,
      figure: {
        zone: 'attack',
        scene: {
          players: [them('o1', [4, 14]), us('C', [-2, 19])],
          puck: [9, 1.8],
          moves: [{ kind: 'lane', path: [[-15, 10], [15, 10]] }],
        },
      },
    },

    /* 6. Shorthanded, the puck goes the length of the ice. */
    { correct: 1 },

    /* 7. Referee's arm up for a penalty against them: goalie to the bench. */
    {
      correct: 1,
      figure: {
        zone: 'full',
        view: 'full',
        scene: {
          areas: [bench],
          players: [...penaltyThem, ...penaltyUs, us('G', [0, 5.5])],
          puck: [5, 51],
        },
        after: {
          areas: [bench],
          players: [...penaltyThem, ...penaltyUs, us('G', [-12.8, 25.5]), us('+1', [-1.5, 43])],
          puck: [5, 51],
          moves: [{ kind: 'skate', path: [[-13, 29.5], [-1.5, 43]], trim: 1.6 }],
        },
      },
    },

    /* 8. Our own pass into our empty net during the delayed penalty. */
    { correct: 1 },
  ],

  abwehrseite: [
    /* 1. Where does LD stand against the puck carrier? B: goal side, a step inside. */
    {
      correct: 1,
      figure: {
        zone: 'own',
        candidates: [[-9.5, 17.5], [-2.8, 11.6], [-7.2, 11.2]],
        scene: { areas: [danger], players: [them('o1', [-6, 15])], puck: [-5.4, 13.9] },
        after: {
          areas: [danger],
          players: [them('o1', [-6, 15]), us('LD', [-2.8, 11.6])],
          puck: [-5.4, 13.9],
          moves: [
            { kind: 'lane', path: [[-6, 15], [0, 4.6]] },
            { kind: 'skate', team: 'them', path: [[-6, 15], [-11, 12.5], [-11.8, 6.8]] },
          ],
        },
      },
    },

    /* 2. Shot from the slot (A) or from beside the dots (B)? */
    {
      correct: 0,
      figure: {
        zone: 'own',
        candidates: [[0.4, 9.4], [-11, 8.2]],
        scene: { areas: [danger], players: [] },
        after: {
          areas: [danger, { kind: 'shot', poly: [[0.4, 9.4], ...posts] }, { kind: 'shot', poly: [[-11, 8.2], ...posts] }],
          players: [them('a', [0.4, 9.4]), them('b', [-11, 8.2])],
        },
      },
    },

    /* 3. Carrier on the boards, facing you, puck under control: slow down. */
    { correct: 1 },

    /* 4. Where the stick goes. */
    { correct: 0 },

    /* 5. Backcheck: inside (A) or along the boards (B)? */
    {
      correct: 0,
      figure: {
        zone: 'own',
        candidates: [[1, 14], [12.5, 14]],
        scene: {
          areas: [danger],
          players: [them('o1', [-10.5, 15.5]), them('o2', [7, 18]), us('LD', [-7.6, 12.4]), us('RW', [4, 23.2])],
          puck: [-9.6, 14.6],
          moves: [{ kind: 'skate', team: 'them', path: [[7, 18], [3.6, 9.8]] }],
        },
        after: {
          areas: [danger],
          players: [them('o1', [-10.5, 15.5]), them('o2', [7, 18]), us('LD', [-7.6, 12.4]), us('RW', [1.9, 8.4])],
          puck: [-9.6, 14.6],
          moves: [
            { kind: 'lane', path: [[-9.6, 14.6], [3.6, 9.8]] },
            { kind: 'skate', team: 'them', path: [[7, 18], [3.6, 9.8]] },
            { kind: 'skate', path: [[4, 23.2], [0.6, 14], [1.9, 8.4]], trim: 1.5 },
          ],
        },
      },
    },

    /* 6. Carrier with their back to you, puck not under control: attack quickly. */
    { correct: 0 },
  ],

  zuordnung: [
    /* 1. Three of ours are in the corner. RW comes in: where to? B: in front of the goal. */
    {
      correct: 1,
      figure: {
        zone: 'own',
        candidates: [[-6.4, 3.4], [0.4, 6.6], [8, 15]],
        scene: {
          players: [
            them('o1', [-11.5, 2.9]),
            them('o2', [-12.5, 12]),
            them('o3', [3, 9]),
            them('o4', [-9, 21]),
            them('o5', [8, 21]),
            us('LD', [-9, 4.8]),
            us('RD', [-8.8, 1.6]),
            us('C', [-10.2, 10.4]),
            us('LW', [-8.5, 17.2]),
            us('RW', [11.5, 23.2]),
          ],
          puck: [-10.6, 1.5],
        },
        after: {
          players: [
            them('o1', [-11.5, 2.9]),
            them('o2', [-12.5, 12]),
            them('o3', [3, 9]),
            them('o4', [-9, 21]),
            them('o5', [8, 21]),
            us('LD', [-9, 4.8]),
            us('RD', [-8.8, 1.6]),
            us('C', [-10.2, 10.4]),
            us('LW', [-8.5, 17.2]),
            us('RW', [0.4, 6.6]),
          ],
          puck: [-10.6, 1.5],
          moves: [{ kind: 'skate', path: [[11.5, 23.2], [6, 12], [0.4, 6.6]], trim: 1.5 }],
        },
      },
    },

    /* 2. Puck in the right corner: who puts on pressure? */
    {
      correct: 0,
      figure: {
        zone: 'own',
        scene: { areas: COVERAGE_AREAS, players: rightCornerThem, puck: [10.3, 1.9] },
      },
    },

    /* 3. When does the C go to the front of the goal? */
    { correct: 1 },

    /* 4. RD pressures in the right corner, C supports. Where is LD? B: in front of the goal. */
    {
      correct: 1,
      figure: {
        zone: 'own',
        candidates: [[-9, 3.6], [-1.9, 5.2], [5.2, 1.6]],
        scene: {
          areas: COVERAGE_AREAS,
          players: [...rightCornerThem, us('RD', [8.8, 3.9]), us('C', [6.4, 7])],
          puck: [10.3, 1.9],
        },
        after: {
          areas: COVERAGE_AREAS,
          players: [
            ...rightCornerThem,
            us('RD', [8.8, 3.9]),
            us('C', [6.4, 7]),
            us('LD', [-1.9, 5.2]),
            us('RW', [10, 15]),
            us('LW', [-4, 15]),
          ],
          puck: [10.3, 1.9],
        },
      },
    },

    /* 5. C and LD have swapped places in the scramble. */
    { correct: 1 },

    /* 6. Two of ours are already at the puck. */
    { correct: 1 },
  ],

  support: [
    /* 1. LD has the puck in the corner. Where is LW open as near support? A: on the boards. */
    {
      correct: 0,
      figure: {
        zone: 'own',
        candidates: [[-13.4, 11.5], [-5.7, 10.9], [-12.4, 19.6]],
        scene: {
          players: [them('o1', breakoutChaser), them('o2', [4, 12.5]), them('o3', [-8, 22.4]), us('LD', [-9.6, 3])],
          puck: breakoutPuck,
          moves: [{ kind: 'skate', team: 'them', path: [breakoutChaser, [-8.4, 5]] }],
        },
        after: {
          areas: [{ kind: 'shadow', poly: passShadow(breakoutPuck, breakoutChaser) }],
          players: [
            them('o1', breakoutChaser),
            them('o2', [4, 12.5]),
            them('o3', [-8, 22.4]),
            us('LD', [-9.6, 3]),
            us('LW', [-13.4, 11.5]),
          ],
          puck: breakoutPuck,
          moves: [{ kind: 'pass', path: [[-9.8, 4.2], [-13.4, 11.5]], trim: 1.5 }],
        },
      },
    },

    /* 2. In defence: how many go to the puck? */
    { correct: 0 },

    /* 3. LD pins an opponent on the boards: who takes the puck? */
    { correct: 1 },

    /* 4. Attacking zone: C stuck in the corner, LW and RW wait in front of the goal. */
    {
      correct: 1,
      figure: {
        zone: 'attack',
        scene: {
          players: [
            ...stuckThem,
            us('C', [12.8, 4.6]),
            us('LW', [1.6, 8.8]),
            us('RW', [-2.4, 9]),
            us('LD', [9, 20.5]),
            us('RD', [-9, 20.5]),
          ],
          puck: [13, 3.4],
        },
        after: {
          areas: [
            { kind: 'near', ellipse: { at: [9.5, 1.8], rx: 2.4, ry: 2 } },
            { kind: 'far', ellipse: { at: [3, 11.5], rx: 2.4, ry: 2.4 } },
          ],
          players: [
            ...stuckThem,
            us('C', [12.8, 4.6]),
            us('LW', [9.5, 1.8]),
            us('RW', [3, 11.5]),
            us('LD', [9, 20.5]),
            us('RD', [-9, 20.5]),
          ],
          puck: [13, 3.4],
          moves: [{ kind: 'pass', path: [[12.4, 3.2], [9.5, 1.8]], trim: 1.4 }],
        },
      },
    },

    /* 5. The risk of the overload. */
    { correct: 1 },

    /* 6. Why the triangle. */
    { correct: 0 },
  ],

  bully: [
    /* 1. Faceoff on our left circle in our zone: where does LW stand? A: behind the C. */
    {
      correct: 0,
      figure: {
        zone: 'own',
        view: 'half',
        candidates: [[-5.8, 5.2], [-4.5, 15.8], [-2.4, 6.7]],
        scene: { players: [...faceoffThem, ...faceoffUs], puck: faceoffPuck },
        after: {
          players: [...faceoffThem, ...faceoffUs, faceoffLW],
          puck: faceoffPuck,
          moves: [{ kind: 'sight', path: [[0, 5], faceoffPuck] }],
        },
      },
    },

    /* 2. Faceoff in our zone lost: what does RW do? */
    { correct: 0 },

    /* 3. Faceoff in the attacking zone won back to RD: where does C go? */
    { correct: 1 },

    /* 4. The same faceoff at the right circle: now where does LW stand? B: in the slot. */
    {
      correct: 1,
      figure: {
        zone: 'own',
        view: 'half',
        candidates: [[5.8, 5.2], [-1.8, 7.6], [12.2, 7.5]],
        scene: { players: mirror([...faceoffThem, us('G', [0, 5]), us('C', [-7, 8.3])]), puck: [7, 10] },
        after: { players: mirror([...faceoffThem, ...faceoffUs, faceoffLW]), puck: [7, 10] },
      },
    },

    /* 5. Why a pass across the royal road is dangerous. */
    { correct: 0 },

    /* 6. Neutral zone: our D gets the puck, their winger comes fast. */
    { correct: 0 },
  ],
} satisfies Record<string, QuestionGeometry[]>;

export type QuizId = keyof typeof geometry;
export const quizzes: Record<QuizId, QuestionGeometry[]> = geometry;

const de: Record<QuizId, QuizText> = {
  regeln: {
    title: 'Quiz: Abseits, Icing und Strafen',
    name: 'Regeln',
    article: 'regeln',
    questions: [
      {
        prompt:
          'Der Puck rutscht gerade ganz über die blaue Linie. LW hat einen Schlittschuh schon in der Zone, der andere berührt noch die Linie. Sein Schläger ist weit in der Zone. Ist LW im Abseits?',
        options: [
          {
            text: 'Ja, der Schläger ist schon in der Zone.',
            feedback: 'Der Schläger zählt beim Abseits nie. Es kommt nur auf die Schlittschuhe an.',
          },
          {
            text: 'Ja, ein Schlittschuh ist schon in der Zone.',
            feedback:
              'Einer reicht nicht. Abseits ist erst, wenn beide Schlittschuhe ganz über der Linie sind.',
          },
          {
            text: 'Nein, ein Schlittschuh berührt noch die Linie.',
            feedback:
              'Solange ein Schlittschuh die blaue Linie berührt, ist LW nicht im Abseits. Der Schläger spielt keine Rolle.',
          },
        ],
        section: 'abseits',
        topic: 'Abseits',
      },
      {
        prompt:
          'Der Linienrichter hebt den Arm. Der Gegner hat den Puck tief in seiner Zone. Du bist LW und noch in der Zone, genau wie C und RW. Was machst du?',
        label:
          'Angriffszone. Der Gegner hat den Puck tief in seiner Zone. LW, C und RW sind noch in der Zone, LD und RD stehen vor der blauen Linie.',
        afterLabel: 'LW, C und RW sind zurück an der blauen Linie und berühren sie gleichzeitig.',
        options: [
          {
            text: 'Den Gegner mit dem Puck angreifen, bevor er wegkommt.',
            feedback:
              'Dann pfeift der Linienrichter. Solange der Arm oben ist, darfst du weder den Puck spielen noch den Gegner mit dem Puck angreifen.',
          },
          {
            text: 'Zurückfahren, bis wir alle gleichzeitig die blaue Linie berühren.',
            feedback:
              'Alle, die in der Zone sind, fahren zurück, bis sie gleichzeitig die blaue Linie berühren. Dann geht der Arm herunter, und ihr dürft sofort wieder hinein.',
          },
          {
            text: 'Allein schnell raus und gleich wieder rein.',
            feedback:
              'Einer allein reicht nicht. Der Arm geht erst herunter, wenn alle Angreifer gleichzeitig draussen sind.',
          },
        ],
        section: 'verzögertes-abseits-alle-raus',
        topic: 'Verzögertes Abseits',
      },
      {
        prompt:
          'Wir spielen fünf gegen fünf. Zwei Schüsse, von A und von B. Beide Pucks rutschen über die gegnerische Torlinie, niemand berührt sie. Welcher ist Icing?',
        label:
          'Das ganze Eis, unser Tor unten. A steht in unserer Hälfte vor der roten Mittellinie, B steht schon in der gegnerischen Hälfte. Von beiden geht ein Schuss über die gegnerische Torlinie.',
        options: [
          {
            text: 'Der Schuss von A',
            feedback: 'A schiesst aus unserer eigenen Hälfte, also vor der roten Mittellinie. Das ist Icing.',
          },
          {
            text: 'Der Schuss von B',
            feedback:
              'B steht schon hinter der roten Mittellinie, in der Hälfte des Gegners. Von dort ist es nie Icing.',
          },
          {
            text: 'Beide',
            feedback:
              'Es kommt darauf an, von wo geschossen wird. Icing ist es nur aus der eigenen Hälfte, vor der roten Mittellinie. B steht schon dahinter.',
          },
        ],
        section: 'icing',
        topic: 'Icing',
      },
      {
        prompt:
          'C fährt rückwärts mit dem Puck über die blaue Linie in die Angriffszone. Seine Schlittschuhe sind vor dem Puck drin. Den Puck hat er die ganze Zeit am Schläger. Ist das Abseits?',
        options: [
          {
            text: 'Ja, die Schlittschuhe waren vor dem Puck in der Zone.',
            feedback:
              'Für Mitspieler ohne Puck stimmt das. Wer den Puck selbst führt und kontrolliert, darf aber vor ihm über die Linie.',
          },
          {
            text: 'Nein, wer den Puck kontrolliert, darf vor ihm über die Linie.',
            feedback:
              'C führt den Puck selbst. Dann ist es kein Abseits. Abseits geht es fast immer um die Mitspieler ohne Puck.',
          },
        ],
        section: 'abseits',
        topic: 'Abseits',
      },
      {
        prompt:
          'Der Puck kommt aus unserer Hälfte und rutscht Richtung gegnerische Torlinie. Der Linienrichter hebt den Arm. Du bist C und ein Stück schneller als der Verteidiger. Was machst du?',
        label:
          'Angriffszone, oben das gegnerische Tor. Der Puck rutscht in die linke Ecke. C und ein gegnerischer Verteidiger fahren auf den Puck zu. Eine gepunktete Linie zeigt die Höhe der Bullypunkte.',
        options: [
          {
            text: 'Austrudeln lassen. Der Arm ist oben, also ist es sowieso Icing.',
            feedback:
              'Der Arm zeigt nur ein mögliches Icing. Entschieden wird erst, wenn der erste Spieler auf Höhe der Bullypunkte ist.',
          },
          {
            text: 'Zum Puck sprinten. Wäre ich zuerst dort, gibt es kein Icing.',
            feedback:
              'Das ist das Rennen beim Hybrid-Icing. Wäre ein Angreifer zuerst am Puck, nimmt der Linienrichter den Arm herunter, und es geht weiter.',
          },
          {
            text: 'Zurück an die blaue Linie, der Arm heisst Abseits.',
            feedback:
              'Der erhobene Arm hat mehrere Bedeutungen. Rutscht der Puck Richtung Torlinie, zeigt er ein mögliches Icing. Abseits wäre es, wenn der Puck gerade in die Zone gekommen ist.',
          },
        ],
        section: 'das-rennen-zum-puck',
        topic: 'Das Rennen zum Puck',
      },
      {
        prompt:
          'Wir spielen in Unterzahl, vier gegen fünf. LD schiesst den Puck aus unserer Zone über die gegnerische Torlinie. Niemand berührt ihn. Was passiert?',
        options: [
          {
            text: 'Icing, Bully vor unserem Tor.',
            feedback:
              'Bei gleich vielen Spielern wäre das Icing. In Unterzahl darf ein Team den Puck aber weit nach vorn schiessen.',
          },
          {
            text: 'Kein Icing, das Spiel läuft weiter.',
            feedback:
              'Ein Team in Unterzahl darf den Puck befreien. Das ist beim Penalty Kill eine grosse Hilfe.',
          },
          {
            text: 'Icing, aber wir dürfen wechseln.',
            feedback:
              'Es ist gar kein Icing. In Unterzahl darf ein Team den Puck befreien. Und nach einem echten Icing darf das Team nicht wechseln.',
          },
        ],
        section: 'wann-es-kein-icing-ist',
        topic: 'Wann es kein Icing ist',
      },
      {
        prompt:
          'Ein Gegner foult, und der Schiedsrichter hebt den Arm. Wir haben den Puck in der Angriffszone. Was macht unser Torhüter?',
        label:
          'Das ganze Eis, unser Tor unten. Wir haben den Puck in der Angriffszone. Unser Torhüter G steht im Tor, die Spielerbank ist links an der Bande.',
        afterLabel:
          'Der Torhüter ist an der Bank. Ein sechster Feldspieler, +1, fährt aufs Eis. Unser Tor ist leer.',
        options: [
          {
            text: 'Er bleibt im Tor. Ohne Torhüter ist es zu gefährlich.',
            feedback:
              'Solange der Arm oben ist, kann der Gegner kein Tor schiessen: Sobald er den Puck kontrolliert, wird gepfiffen. Darum kann der Torhüter raus.',
          },
          {
            text: 'Er fährt zur Bank. Ein sechster Feldspieler springt aufs Eis, wenn er fast da ist.',
            feedback:
              'So spielen wir sechs gegen fünf. Der sechste Feldspieler springt erst, wenn der Torhüter ganz nah an der Bank ist, etwa 1.5 Meter.',
          },
          {
            text: 'Er fährt zur Bank, und sofort springt ein Feldspieler aufs Eis.',
            feedback:
              'Fast. Springt der sechste Feldspieler zu früh, sind zu viele Spieler auf dem Eis. Das ist selbst eine Strafe.',
          },
        ],
        section: 'torhüter-raus-sechster-feldspieler-rein',
        topic: 'Torhüter raus, sechster Feldspieler rein',
      },
      {
        prompt:
          'Der Arm ist noch oben, unser Tor ist leer. LD spielt den Puck zurück, und er rutscht in unser leeres Tor. Zählt das Tor?',
        options: [
          {
            text: 'Nein, während der angezeigten Strafe zählt kein Tor gegen uns.',
            feedback:
              'Der Gegner kann kein Tor schiessen. Spielen wir den Puck aber selbst ins eigene Tor, zählt es.',
          },
          {
            text: 'Ja, ein Eigentor zählt.',
            feedback: 'Leider ja. Darum spielen wir nie zurück zum eigenen Tor, solange es leer ist.',
          },
          {
            text: 'Nur wenn ein Gegner den Puck vorher berührt hat.',
            feedback:
              'Umgekehrt: Lenkt ein Gegner den Puck in unser Tor, zählt es nicht. Spielen wir ihn selbst hinein, zählt es.',
          },
        ],
        section: 'torhüter-raus-sechster-feldspieler-rein',
        topic: 'Torhüter raus, sechster Feldspieler rein',
      },
    ],
  },
  abwehrseite: {
    title: 'Quiz: Abwehrseite',
    name: 'Abwehrseite',
    article: 'abwehrseite',
    questions: [
      {
        prompt: 'Ein Gegner kommt mit dem Puck auf unser Tor zu. Du bist LD. Wo stehst du am besten: A, B oder C?',
        label:
          'Eigene Zone, unser Tor unten, die Gefahrenzone ist markiert. Ein Gegner mit Puck links oberhalb des Bullykreises. A ist weiter weg vom Tor als er. B steht zwischen ihm und dem Tor, ein Stück nach innen. C steht zwischen ihm und dem Tor, aber weiter aussen.',
        afterLabel:
          'LD steht auf B, zwischen Gegner und Tor und etwas innen. Der Weg zum Tor ist zu, der Gegner muss aussen an der Bande entlang.',
        options: [
          {
            text: 'A',
            feedback:
              'A ist weiter weg vom Tor als der Gegner. Das ist die falsche Seite: Er hat freie Bahn zum Tor.',
          },
          {
            text: 'B',
            feedback:
              'B steht zwischen Gegner und Tor und einen kleinen Schritt innen. Offen bleibt nur der Weg nach aussen, an die Bande.',
          },
          {
            text: 'C',
            feedback:
              'C steht zwischen Gegner und Tor, aber zu weit aussen. Dann ist der Weg durch die Mitte offen. Ein kleiner Schritt nach innen, und es passt.',
          },
        ],
        section: 'nicht-genau-dazwischen-sondern-etwas-nach-innen',
        topic: 'Etwas nach innen',
      },
      {
        prompt: 'Von wo ist ein Schuss gefährlicher: von A oder von B?',
        label:
          'Eigene Zone, unser Tor unten. A liegt direkt vor dem Tor im Slot. B liegt aussen, neben dem linken Bullypunkt.',
        afterLabel:
          'Von A sieht der Schütze das ganze Tor. Von B sieht er nur einen schmalen Streifen, den der Torhüter fast allein abdeckt.',
        options: [
          {
            text: 'Von A, aus dem Slot',
            feedback:
              'Aus dem Slot sieht der Schütze das ganze Tor. Von dort fallen die meisten Tore.',
          },
          {
            text: 'Von B, neben dem Bullypunkt',
            feedback:
              'Von aussen sieht der Schütze nur einen schmalen Streifen vom Tor. Den deckt der Torhüter fast allein ab.',
          },
          {
            text: 'Beide sind gleich gefährlich',
            feedback:
              'Je weiter aussen, desto kleiner wird das Tor für den Schützen. Darum halten wir den Gegner ausserhalb der Bullypunkte.',
          },
        ],
        section: 'den-gegner-ausserhalb-der-bullypunkte-halten',
        topic: 'Ausserhalb der Bullypunkte',
      },
      {
        prompt:
          'Ein Gegner fährt mit dem Puck an der Bande, ausserhalb der Bullypunkte. Er schaut dich an und hat den Puck unter Kontrolle. Was machst du?',
        options: [
          {
            text: 'Mit vollem Tempo auf ihn los und ihm den Puck abnehmen.',
            feedback:
              'Wer wild auf ihn losfährt, wird leicht umfahren. Und dann ist der Weg in die Mitte offen.',
          },
          {
            text: 'Langsamer auf ihn zufahren, innen bleiben und ihn aussen lassen.',
            feedback:
              'Aussen an der Bande ist er weniger gefährlich. Bleib innen, etwa eine Schlägerlänge weg, und lass ihn nicht in die Mitte.',
          },
          {
            text: 'Schnell vor das Tor fahren und dort warten.',
            feedback:
              'Dann hat er Zeit und Platz, nach innen zu ziehen oder in Ruhe zu passen. Bleib nah genug an ihm dran.',
          },
        ],
        section: 'den-gegner-ausserhalb-der-bullypunkte-halten',
        topic: 'Aussen ist erlaubt',
      },
      {
        prompt: 'Du stehst auf der Abwehrseite deines Gegners. Wo ist dein Schläger?',
        options: [
          {
            text: 'Auf dem Eis, die Kelle zeigt zum Puck.',
            feedback: 'So sind Pässe durch die Mitte schwierig. Mit dem Körper bleibst du zwischen Gegner und Tor.',
          },
          {
            text: 'Hoch in der Luft, bereit zum Zuschlagen.',
            feedback:
              'Ein hoher Schläger stoppt keinen Pass. Und wer nach dem Gegner schlägt, riskiert eine Strafe. Der Schläger gehört aufs Eis.',
          },
          {
            text: 'Egal, es zählt nur der Körper.',
            feedback:
              'Der Körper hält den Gegner aussen. Der Schläger auf dem Eis macht zusätzlich den Passweg zu. Beides zählt.',
          },
        ],
        section: 'nicht-genau-dazwischen-sondern-etwas-nach-innen',
        topic: 'Schläger zum Puck, Körper zum Körper',
      },
      {
        prompt:
          'Wir haben den Puck verloren. Du bist RW und fährst zurück. Ein Gegner ohne Puck fährt Richtung Tor. Welchen Weg nimmst du: A oder B?',
        label:
          'Eigene Zone. Ein Gegner hat den Puck links an der Bande, LD steht vor ihm. RW kommt oben rechts zurück. Ein zweiter Gegner ohne Puck fährt Richtung Tor. A liegt innen, in der Mitte, B aussen an der rechten Bande.',
        afterLabel:
          'RW ist innen zurückgefahren und steht zwischen dem Gegner ohne Puck und dem Tor, im Weg des Passes.',
        options: [
          {
            text: 'A, innen durch die Mitte',
            feedback:
              'Innen zurück, über die Schulter schauen und vor dem Gegner zwischen ihn und das Tor kommen. Der Pass zu ihm geht dann nicht mehr durch.',
          },
          {
            text: 'B, aussen an der Bande',
            feedback:
              'Wer aussen zurückfährt, lässt dem Gegner innen freie Bahn zum Tor. Ein Pass, und er steht allein vor dem Torhüter.',
          },
        ],
        section: 'abwehrseite-ohne-puck',
        topic: 'Abwehrseite ohne Puck',
      },
      {
        prompt:
          'Ein Gegner holt den Puck in der Ecke. Er steht mit dem Rücken zu dir und hat den Puck noch nicht unter Kontrolle. Was machst du?',
        options: [
          {
            text: 'Schnell angreifen.',
            feedback:
              'Mit dem Rücken zu dir und ohne Kontrolle kann er dich nicht umfahren. Jetzt schnell Druck machen, auf der Abwehrseite.',
          },
          {
            text: 'Langsam auf ihn zufahren und abwarten.',
            feedback:
              'Langsam fährt man auf einen Gegner zu, der dich anschaut und den Puck kontrolliert. Hier hat er beides nicht. Das ist deine Chance.',
          },
          {
            text: 'Vor dem Tor auf ihn warten.',
            feedback:
              'Dann hat er Zeit, sich umzudrehen und den Puck zu kontrollieren. Greif lieber an, solange er mit dem Rücken zu dir steht.',
          },
        ],
        section: 'den-gegner-ausserhalb-der-bullypunkte-halten',
        topic: 'Wann schnell angreifen',
      },
    ],
  },
  zuordnung: {
    title: 'Quiz: Zuordnung',
    name: 'Zuordnung',
    article: 'zuordnung',
    questions: [
      {
        prompt:
          'Drei von uns sind beim Puck in der linken Ecke. Du bist RW und kommst gerade in die Zone. Wohin fährst du: A, B oder C?',
        label:
          'Eigene Zone, unser Tor unten. LD, RD und C sind in der linken Ecke beim Puck, LW steht oben links. Vor dem Tor steht ein Gegner frei. RW kommt oben rechts in die Zone. A liegt neben der Ecke, B vor dem Tor, C oben rechts.',
        afterLabel: 'RW ist vor das Tor gefahren und steht beim freien Gegner.',
        options: [
          {
            text: 'A, in die Ecke helfen',
            feedback:
              'Dort sind schon drei von uns. Ein weiterer Spieler am Puck hilft fast nie, aber er fehlt vor dem Tor.',
          },
          {
            text: 'B, vor das Tor',
            feedback:
              'Vor dem Tor steht ein Gegner frei, und von dort fallen die meisten Tore. Ist mehr als ein Bereich frei: zuerst vor das Tor.',
          },
          {
            text: 'C, in meinen Bereich oben rechts',
            feedback:
              'Dein Bereich ist wichtig. Aber der Bereich zählt, nicht die Person: Vor dem Tor ist niemand, und das ist gefährlicher. Zuerst dorthin.',
          },
        ],
        section: 'die-freie-lücke-finden',
        topic: 'Die freie Lücke finden',
      },
      {
        prompt: 'Der Puck ist in der rechten Ecke unserer Zone. Wer macht Druck auf den Puck?',
        label:
          'Eigene Zone in fünf farbigen Bereichen. Der Puck ist in der rechten Ecke, im Bereich von RD. Ein Gegner hat ihn.',
        options: [
          {
            text: 'RD',
            feedback: 'Der Puck ist im Bereich von RD, unten rechts. Darum macht RD Druck, auf der Abwehrseite.',
          },
          {
            text: 'C',
            feedback:
              'Der Center ist die nahe Unterstützung und hilft. Druck macht aber der Spieler, in dessen Bereich der Puck ist: RD.',
          },
          {
            text: 'Wer gerade am nächsten ist',
            feedback:
              'Dann fahren schnell alle zum Puck: der Bienenschwarm. Druck macht, wer den Bereich hat. Unten rechts ist das RD.',
          },
        ],
        section: 'die-fünf-bereiche',
        topic: 'Die fünf Bereiche',
      },
      {
        prompt: 'Wann geht der Center vor das Tor?',
        options: [
          {
            text: 'Immer. Die Mitte vor dem Tor ist sein Platz.',
            feedback:
              'Die Mitte ist sein Ausgangspunkt, aber dort bleibt er nicht stehen. Meistens ist er die nahe Unterstützung beim Puck.',
          },
          {
            text: 'Wenn dort ein Gegner frei steht, den der Verteidiger der anderen Seite nicht decken kann.',
            feedback:
              'Ein freier Gegner vor dem Tor ist gefährlicher als ein Zweikampf in der Ecke. Sonst hilft der Center beim Puck.',
          },
          {
            text: 'Nie. Er bleibt immer beim Puck.',
            feedback:
              'Meistens ist er beim Puck, ja. Steht aber vor dem Tor ein Gegner frei, den niemand deckt, geht der Center dorthin.',
          },
        ],
        section: 'der-center-unterstützung-zuerst',
        topic: 'Der Center',
      },
      {
        prompt: 'RD macht Druck in der rechten Ecke, C hilft. Du bist LD. Wo stehst du: A, B oder C?',
        label:
          'Eigene Zone in fünf farbigen Bereichen. Der Puck ist in der rechten Ecke, RD und C sind dort. Vor dem Tor steht ein Gegner. A liegt in der linken Ecke, B vor dem Tor, C neben RD in der rechten Ecke.',
        afterLabel:
          'LD steht vor dem Tor beim Gegner. LW und RW stehen oben in ihren Bereichen, nah an der Mitte.',
        options: [
          {
            text: 'A, unten links in meinem Bereich',
            feedback:
              'Ist der Puck auf der anderen Seite, rückst du an den Rand deines Bereichs, Richtung Puck und Mitte. In der linken Ecke ist gerade niemand, den du decken müsstest.',
          },
          {
            text: 'B, vor dem Tor',
            feedback:
              'Der Verteidiger der anderen Seite geht vor das Tor. Dort deckst du den Gegner, mit dem Schläger auf dem Eis.',
          },
          {
            text: 'C, neben RD in der Ecke',
            feedback:
              'Bei RD sind schon zwei: RD und C. Als Dritter in der Ecke fehlst du vor dem Tor.',
          },
        ],
        section: 'die-fünf-bereiche',
        topic: 'Die fünf Bereiche',
      },
      {
        prompt:
          'Nach einem Zweikampf steckst du als C tief in der linken Ecke. LD steht deshalb oben in der Mitte. Was macht ihr, bis der Puck aus der Zone ist?',
        options: [
          {
            text: 'Ich fahre schnell quer übers Eis zurück in die Mitte, damit LD in seine Ecke kann.',
            feedback:
              'Wer quer übers Eis zur eigenen Position fährt, öffnet eine Lücke, die der Gegner nutzt.',
          },
          {
            text: 'Wir tauschen: Ich spiele LD, LD spielt C. Zurück getauscht wird, wenn es ruhig ist.',
            feedback:
              'Der Bereich zählt, nicht die Person. Zurück getauscht wird, wenn der Puck aus der Zone ist oder bei einer Unterbrechung.',
          },
          {
            text: 'Ich warte in der Ecke, bis LD zurückkommt.',
            feedback:
              'Dann ist ein Bereich leer. Übernimm den Bereich, in dem du gerade bist. Darum lernen alle alle Positionen.',
          },
        ],
        section: 'der-bereich-zählt-nicht-die-person',
        topic: 'Der Bereich zählt, nicht die Person',
      },
      {
        prompt: 'Zwei von uns sind schon beim Puck. Du kommst nach dem Wechsel in die Zone. Was machst du?',
        options: [
          {
            text: 'Als Dritter zum Puck. Zu dritt gewinnen wir ihn sicher.',
            feedback:
              'Ein dritter Spieler am Puck hilft fast nie. Er fehlt aber immer woanders, meistens vor dem Tor.',
          },
          {
            text: 'Kopf hoch, zählen, und in den Bereich fahren, der noch frei ist.',
            feedback:
              'Genau so: übers Eis schauen, zählen, in den freien Bereich. Und kurz sagen, was du machst: „Ich hab vors Tor!“',
          },
          {
            text: 'Gleich an die blaue Linie, damit ich anspielbar bin.',
            feedback:
              'Zu früh raus. Erst den Puck gewinnen, dann los. Bis dahin fehlst du in der Zone.',
          },
        ],
        section: 'die-freie-lücke-finden',
        topic: 'Die freie Lücke finden',
      },
    ],
  },
  support: {
    title: 'Quiz: Support',
    name: 'Support',
    article: 'support',
    questions: [
      {
        prompt:
          'LD hat den Puck in der Ecke, ein Gegner kommt auf ihn zu. Du bist LW. Wo bist du die beste nahe Unterstützung: A, B oder C?',
        label:
          'Eigene Zone, unser Tor unten. LD hat den Puck in der linken Ecke, ein Gegner fährt auf ihn zu. A liegt an der linken Bande auf Höhe der Hashmarks. B liegt in der Mitte, direkt hinter dem Gegner. C liegt oben an der blauen Linie.',
        afterLabel:
          'LW steht auf A an der Bande. Der Pass von LD kommt frei an. Hinter dem Gegner ist ein grauer Passschatten, dorthin kommt kein Pass.',
        options: [
          {
            text: 'A, an der Bande',
            feedback:
              'Frei, nah und an der Bande, etwa auf Höhe der Hashmarks. Ein kurzer Pass, und der Druck ist weg.',
          },
          {
            text: 'B, in der Mitte',
            feedback:
              'Zwischen dir und LD steht ein Gegner. Den Pass bringt LD nicht durch. Siehst du die Kelle des Puckführers nicht, geh ein, zwei Schritte zur Seite.',
          },
          {
            text: 'C, an der blauen Linie',
            feedback:
              'Zu weit weg. Ein kurzer, sicherer Pass muss reichen, solange der Gegner drückt. Und so weit oben bist du zu früh raus.',
          },
        ],
        section: 'nahe-unterstützung',
        topic: 'Nahe Unterstützung',
      },
      {
        prompt: 'Der Gegner hat den Puck in unserer Zone. Wie viele von uns gehen zum Puck?',
        options: [
          {
            text: 'Zwei',
            feedback:
              'Einer drückt, der zweite hilft. Die anderen bleiben in der Mitte: vor dem Tor, im hohen Slot und zwischen Puck und blauer Linie.',
          },
          {
            text: 'Drei, dann ist es sicher',
            feedback: 'Ein dritter Spieler am Puck fehlt vor dem Tor. Support heisst helfen, nicht alle hinfahren.',
          },
          {
            text: 'Einer, die anderen bleiben weg',
            feedback:
              'Allein gegen den Puckführer verliert man oft. Zwei gegen einen gewinnen den Puck fast immer.',
          },
        ],
        section: 'overload-zu-zweit-an-den-puck',
        topic: 'Overload',
      },
      {
        prompt: 'LD drückt einen Gegner an der Bande fest. Das heisst Pinnen. Wer holt den Puck?',
        options: [
          {
            text: 'LD selbst, sobald es geht.',
            feedback:
              'Wer pinnt, kann den Puck nicht spielen. Lässt LD los, um ihn zu holen, ist der Gegner wieder frei.',
          },
          {
            text: 'Ein zweiter Spieler, zum Beispiel C.',
            feedback:
              'Pinnen funktioniert nur mit Support. LD hält den Gegner fest, der zweite Spieler holt den Puck.',
          },
          {
            text: 'Niemand. Man wartet, bis der Schiedsrichter pfeift.',
            feedback:
              'Der Schiedsrichter pfeift nicht. Ein zweiter Spieler holt den Puck, solange LD den Gegner festhält.',
          },
        ],
        section: 'pinnen-festhalten-und-den-puck-holen-lassen',
        topic: 'Pinnen',
      },
      {
        prompt:
          'C steckt in der Ecke fest, zwei Gegner drücken ihn an die Bande. Du bist LW und stehst vor dem Tor. Was machst du?',
        label:
          'Angriffszone, oben das gegnerische Tor. C hat den Puck in der linken Ecke, zwei Gegner drücken ihn an die Bande. LW und RW stehen vor dem Tor und warten.',
        afterLabel:
          'LW ist zum Zweikampf gefahren und steht ein paar Meter neben C, nahe Unterstützung. RW steht weiter weg im Slot, weite Unterstützung.',
        options: [
          {
            text: 'Vor dem Tor bleiben und auf den Pass warten.',
            feedback:
              'Solange C allein gegen zwei kämpft, kommt kein Pass. Einen weiten Pass vor das Tor bringt er fast nie durch.',
          },
          {
            text: 'Hinfahren, in die freie Lücke ein paar Meter neben C.',
            feedback:
              'Jetzt kann C den Puck zu dir schieben, oder du holst den freien Puck. Aus 1-gegen-2 wird 2-gegen-2. Das Tor kommt danach.',
          },
          {
            text: 'Ganz dicht zu C an die Bande.',
            feedback:
              'Zu nah. Stehst du direkt daneben, stört ein Gegner euch beide. Ein paar Meter Abstand, in die freie Lücke.',
          },
        ],
        section: 'wenn-der-puckführer-festsitzt',
        topic: 'Wenn der Puckführer festsitzt',
      },
      {
        prompt: 'LD und C gehen zu zweit an den Puck, ein Overload. Was ist dabei die Gefahr?',
        options: [
          {
            text: 'Keine. Zwei gegen einen gewinnen immer.',
            feedback:
              'Meistens ja, aber nicht immer. Darum setzt man den Overload mit Bedacht ein.',
          },
          {
            text: 'Spielt der Gegner den Puck an der Bande entlang zum freien Mitspieler, hat er ein 2-gegen-1.',
            feedback:
              'Das ist die Kehrseite: Zwei von uns sind beim Puck. Klappt es nicht, fehlen sie woanders.',
          },
          {
            text: 'Der Schiedsrichter pfeift Behinderung.',
            feedback:
              'Zu zweit an den Puck zu gehen ist erlaubt. Die Gefahr ist eine andere: Fehlt der Overload, hat der Gegner woanders ein 2-gegen-1.',
          },
        ],
        section: 'overload-zu-zweit-an-den-puck',
        topic: 'Gefahr beim Overload',
      },
      {
        prompt: 'Puckführer, nahe und weite Unterstützung bilden ein Dreieck. Warum ist das gut?',
        options: [
          {
            text: 'Der Puckführer hat immer zwei Möglichkeiten zum Abspielen.',
            feedback: 'Und wer den Puck bekommt, hat sofort wieder zwei. Darum bewegt sich das Dreieck mit dem Puck mit.',
          },
          {
            text: 'Dann stehen alle schön nah beieinander.',
            feedback: 'Zu nah ist schlecht: Zwei eigene Spieler auf einem Fleck stören sich gegenseitig.',
          },
          {
            text: 'Dann muss niemand mehr fahren.',
            feedback: 'Im Gegenteil: Das Dreieck bewegt sich mit dem Puck. Wer steht, ist leicht zu decken.',
          },
        ],
        section: 'das-dreieck',
        topic: 'Das Dreieck',
      },
    ],
  },
  bully: {
    title: 'Quiz: Bully',
    name: 'Bully',
    article: 'bully',
    questions: [
      {
        prompt: 'Bully in unserer Zone am linken Kreis. Du bist LW. Wo stehst du: A, B oder C?',
        label:
          'Eigene Zone, unser Tor unten. Bully am linken Kreis. C steht am Punkt, LD an der Bande, RD an den inneren Strichen, RW im Slot, G im Tor. A liegt hinter dem C Richtung Torlinie, B oben über dem Kreis, C zwischen Torhüter und Puck.',
        afterLabel:
          'LW steht hinter dem C Richtung Torlinie. Eine gepunktete Linie zeigt: Zwischen Torhüter und Puck steht niemand ausser dem C.',
        options: [
          {
            text: 'A, hinter dem C Richtung Torlinie',
            feedback: 'LW steht hinter dem C, Richtung Torlinie. Verliert C das Bully, ist LW schnell beim gegnerischen Verteidiger.',
          },
          {
            text: 'B, oben über dem Kreis',
            feedback:
              'Dort steht keiner von uns. LW steht hinter dem C, Richtung Torlinie.',
          },
          {
            text: 'C, zwischen Torhüter und Puck',
            feedback:
              'Dort nimmst du dem Torhüter die Sicht. Ausser dem C steht niemand zwischen Torhüter und Puck.',
          },
        ],
        section: 'bully-in-der-eigenen-zone',
        topic: 'Bully in der eigenen Zone',
      },
      {
        prompt: 'Wir verlieren das Bully in unserer Zone. Du bist RW. Was machst du sofort?',
        options: [
          {
            text: 'Zum gegnerischen Verteidiger an der blauen Linie.',
            feedback:
              'Der Gegner will den Puck schnell zum Verteidiger an der blauen Linie bringen und schiessen. LW und RW fahren sofort hin, dann hat der Schütze keine Zeit.',
          },
          {
            text: 'Vor dem Tor stehen bleiben und den Slot decken.',
            feedback:
              'Dann hat der Verteidiger an der blauen Linie Zeit und Platz für einen Schuss. Die Flügel fahren sofort zu den beiden Verteidigern.',
          },
          {
            text: 'Zum Puck fahren.',
            feedback:
              'Um den Puck kämpft schon der C. Deine Aufgabe ist der Verteidiger an der blauen Linie, bevor er schiesst.',
          },
        ],
        section: 'bully-in-der-eigenen-zone',
        topic: 'Bully verloren',
      },
      {
        prompt: 'Bully in der Angriffszone: C zieht den Puck zurück zu RD. Wohin fährt C?',
        options: [
          {
            text: 'Zurück an die blaue Linie.',
            feedback: 'An der blauen Linie sind schon RD und LD. C fährt vors Tor.',
          },
          {
            text: 'Vor das Tor.',
            feedback:
              'Vor dem Tor nimmt C dem Torhüter die Sicht, fälscht den Schuss ab oder holt den Nachschuss.',
          },
          {
            text: 'In die Ecke.',
            feedback:
              'In die Ecke rutscht RW an der Bande. C fährt vors Tor, damit RD schiessen kann.',
          },
        ],
        section: 'bully-in-der-angriffszone',
        topic: 'Bully in der Angriffszone',
      },
      {
        prompt: 'Jetzt ist das Bully am rechten Kreis in unserer Zone. Du bist wieder LW. Wo stehst du: A, B oder C?',
        label:
          'Eigene Zone, unser Tor unten. Bully am rechten Kreis, C steht am Punkt, G im Tor. A liegt hinter dem C Richtung Torlinie, B links vom Tor im Slot, C rechts an der Bande.',
        afterLabel:
          'Die ganze Aufstellung am rechten Kreis: hinter dem C steht RW, an der Bande RD, an den inneren Strichen LD, im Slot LW.',
        options: [
          {
            text: 'A, hinter dem C',
            feedback:
              'Das war dein Platz am linken Kreis. Am rechten Kreis ist alles gespiegelt: Hinter dem C steht jetzt RW.',
          },
          {
            text: 'B, im Slot',
            feedback:
              'Gespiegelt tauschen die Flügel die Plätze. Wo am linken Kreis RW stand, im Slot, steht jetzt LW.',
          },
          {
            text: 'C, an der Bande',
            feedback:
              'An der Bande steht ein Verteidiger: am linken Kreis LD, am rechten Kreis RD.',
          },
        ],
        section: 'der-andere-kreis',
        topic: 'Der andere Kreis',
      },
      {
        prompt: 'RD passt quer über die Mitte zu LW, über die Royal Road. Warum ist ein Schuss danach so gefährlich?',
        options: [
          {
            text: 'Der Torhüter muss quer durch sein Tor rutschen.',
            feedback:
              'Die Royal Road ist die gedachte Linie von Tor zu Tor durch die Mitte. Geht der Puck darüber, muss der Torhüter quer rutschen. Das ist schwer.',
          },
          {
            text: 'Ein Pass über die Mitte ist schneller als jeder Schuss.',
            feedback:
              'Es geht nicht um das Tempo des Passes. Der Torhüter muss quer durch sein Tor rutschen, und das ist schwer.',
          },
          {
            text: 'Weil der Pass dann nicht Abseits sein kann.',
            feedback:
              'Mit Abseits hat das nichts zu tun. Gefährlich ist es, weil der Torhüter quer durch sein Tor rutschen muss.',
          },
        ],
        section: 'bully-in-der-angriffszone',
        topic: 'Die Royal Road',
      },
      {
        prompt:
          'Bully in der neutralen Zone gewonnen. Du bist Verteidiger und bekommst den Puck. Ein gegnerischer Flügel kommt schnell auf dich zu. Was machst du?',
        options: [
          {
            text: 'Querpass zum anderen Verteidiger.',
            feedback: 'Der andere Verteidiger hat dann mehr Zeit und Platz. Schnell entscheiden: weiterpassen oder losfahren.',
          },
          {
            text: 'Den Puck stoppen und abwarten, was passiert.',
            feedback:
              'Der Gegner weiss, dass der Puck zu dir kommt. Wer wartet, wird gestört. Schnell entscheiden: passen oder losfahren.',
          },
          {
            text: 'Den Puck weit nach vorn schiessen.',
            feedback:
              'Den Puck blind wegschlagen schenkt ihn meistens dem Gegner. Der Querpass zum anderen Verteidiger ist sicherer.',
          },
        ],
        section: 'bully-in-der-neutralen-zone',
        topic: 'Bully in der neutralen Zone',
      },
    ],
  },
};

const en: typeof de = {
  regeln: {
    title: 'Quiz: offside, icing and penalties',
    name: 'Rules',
    article: 'rules',
    questions: [
      {
        prompt:
          'The puck has just slid completely over the blue line. LW has one skate in the zone already, the other one is still touching the line. Their stick is far into the zone. Is LW offside?',
        options: [
          {
            text: 'Yes, the stick is already in the zone.',
            feedback: 'The stick never counts for offside. Only the skates matter.',
          },
          {
            text: 'Yes, one skate is already in the zone.',
            feedback: 'One isn’t enough. It is only offside once both skates are completely over the line.',
          },
          {
            text: 'No, one skate is still touching the line.',
            feedback:
              'As long as one skate touches the blue line, LW is not offside. The stick doesn’t matter.',
          },
        ],
        section: 'offside',
        topic: 'Offside',
      },
      {
        prompt:
          'The linesperson raises their arm. The opponents have the puck deep in their zone. You are LW and still in the zone, and so are C and RW. What do you do?',
        label:
          'Attacking zone. The opponents have the puck deep in their zone. LW, C and RW are still in the zone, LD and RD are outside the blue line.',
        afterLabel: 'LW, C and RW are back at the blue line and touch it at the same time.',
        options: [
          {
            text: 'Go after the opponent with the puck before they get away.',
            feedback:
              'Then the linesperson blows the whistle. While the arm is up, you may neither play the puck nor go after the opponent who has it.',
          },
          {
            text: 'Skate back until we all touch the blue line at the same time.',
            feedback:
              'Everyone in the zone skates back until they all touch the blue line at the same time. Then the arm comes down and you can go straight back in.',
          },
          {
            text: 'Quickly get out on my own and come straight back in.',
            feedback:
              'One player alone isn’t enough. The arm only comes down once all the attackers are out at the same time.',
          },
        ],
        section: 'delayed-offside-everyone-out',
        topic: 'Delayed offside',
      },
      {
        prompt:
          'We are playing five against five. Two shots, from A and from B. Both pucks slide over the opponents’ goal line and nobody touches them. Which one is icing?',
        label:
          'The whole rink, our goal at the bottom. A is in our half, before the red centre line; B is already in the opponents’ half. A shot goes from each over the opponents’ goal line.',
        options: [
          {
            text: 'The shot from A',
            feedback: 'A shoots from our own half, before the red centre line. That is icing.',
          },
          {
            text: 'The shot from B',
            feedback:
              'B is already past the red centre line, in the opponents’ half. From there it is never icing.',
          },
          {
            text: 'Both',
            feedback:
              'It depends on where the shot comes from. It is only icing from your own half, before the red centre line. B is already past it.',
          },
        ],
        section: 'icing',
        topic: 'Icing',
      },
      {
        prompt:
          'C skates backwards with the puck over the blue line into the attacking zone. Their skates are in before the puck. They have the puck on their stick the whole time. Is that offside?',
        options: [
          {
            text: 'Yes, the skates were in the zone before the puck.',
            feedback:
              'That is true for teammates without the puck. But a player who carries and controls the puck may cross the line ahead of it.',
          },
          {
            text: 'No, a player who controls the puck may cross the line ahead of it.',
            feedback:
              'C is carrying the puck, so it isn’t offside. Offside is almost always about the teammates without the puck.',
          },
        ],
        section: 'offside',
        topic: 'Offside',
      },
      {
        prompt:
          'The puck comes from our half and slides towards the opponents’ goal line. The linesperson raises their arm. You are C and a bit faster than the defender. What do you do?',
        label:
          'Attacking zone, the opponents’ goal at the top. The puck slides into the left corner. C and an opposing defender skate towards it. A dotted line marks the level of the faceoff dots.',
        options: [
          {
            text: 'Ease off. The arm is up, so it’s icing anyway.',
            feedback:
              'The arm only shows possible icing. The decision comes when the first player reaches the level of the faceoff dots.',
          },
          {
            text: 'Sprint to the puck. If I would get there first, it isn’t icing.',
            feedback:
              'That is the race in hybrid icing. If an attacker would be first to the puck, the linesperson lowers the arm and play goes on.',
          },
          {
            text: 'Back to the blue line, the arm means offside.',
            feedback:
              'The raised arm means different things. If the puck is sliding towards the goal line, it shows possible icing. It would be offside if the puck had just come into the zone.',
          },
        ],
        section: 'the-race-to-the-puck',
        topic: 'The race to the puck',
      },
      {
        prompt:
          'We are shorthanded, four against five. LD shoots the puck out of our zone over the opponents’ goal line. Nobody touches it. What happens?',
        options: [
          {
            text: 'Icing, faceoff in front of our goal.',
            feedback:
              'With equal numbers it would be icing. But a shorthanded team may shoot the puck far up the ice.',
          },
          {
            text: 'No icing, play goes on.',
            feedback: 'A shorthanded team may clear the puck. That is a big help on the penalty kill.',
          },
          {
            text: 'Icing, but we may change players.',
            feedback:
              'It isn’t icing at all. A shorthanded team may clear the puck. And after a real icing, the team may not change.',
          },
        ],
        section: 'when-it-isnt-icing',
        topic: 'When it isn’t icing',
      },
      {
        prompt:
          'An opponent commits a foul and the referee raises their arm. We have the puck in the attacking zone. What does our goalie do?',
        label:
          'The whole rink, our goal at the bottom. We have the puck in the attacking zone. Our goalie G is in goal, the bench is on the left boards.',
        afterLabel: 'The goalie is at the bench. An extra skater, +1, comes onto the ice. Our goal is empty.',
        options: [
          {
            text: 'They stay in goal. Without a goalie it’s too dangerous.',
            feedback:
              'While the arm is up, the opponents can’t score: as soon as they control the puck, the whistle goes. That is why the goalie can come off.',
          },
          {
            text: 'They skate to the bench. An extra skater jumps on when the goalie is almost there.',
            feedback:
              'Now we play six against five. The extra skater only jumps on when the goalie is very close to the bench, about 1.5 metres.',
          },
          {
            text: 'They skate to the bench, and a skater jumps on straight away.',
            feedback:
              'Almost. If the extra skater jumps on too early, there are too many players on the ice. That is a penalty in itself.',
          },
        ],
        section: 'goalie-off-extra-skater-on',
        topic: 'Goalie off, extra skater on',
      },
      {
        prompt:
          'The arm is still up and our goal is empty. LD passes the puck back, and it slides into our empty net. Does the goal count?',
        options: [
          {
            text: 'No, no goal against us counts during a delayed penalty.',
            feedback:
              'The opponents can’t score. But if we put the puck into our own net ourselves, it counts.',
          },
          {
            text: 'Yes, an own goal counts.',
            feedback: 'Sadly, yes. That is why we never pass back towards our own goal while it is empty.',
          },
          {
            text: 'Only if an opponent touched the puck first.',
            feedback:
              'The other way round: if an opponent deflects the puck into our goal, it doesn’t count. If we put it in ourselves, it counts.',
          },
        ],
        section: 'goalie-off-extra-skater-on',
        topic: 'Goalie off, extra skater on',
      },
    ],
  },
  abwehrseite: {
    title: 'Quiz: Abwehrseite',
    name: 'Abwehrseite',
    article: 'defensive-side',
    questions: [
      {
        prompt: 'An opponent is coming towards our goal with the puck. You are LD. Where is the best place to stand: A, B or C?',
        label:
          'Our zone, our goal at the bottom, the danger zone marked. An opponent with the puck to the left, above the faceoff circle. A is further from the goal than they are. B is between them and the goal, a little to the inside. C is between them and the goal, but further out.',
        afterLabel:
          'LD stands on B, between the opponent and the goal and a little inside. The way to the goal is closed, the opponent has to go wide along the boards.',
        options: [
          {
            text: 'A',
            feedback: 'A is further from the goal than the opponent. That is the wrong side: they have a free run at goal.',
          },
          {
            text: 'B',
            feedback:
              'B is between the opponent and the goal, and a small step to the inside. The only way left open is wide, towards the boards.',
          },
          {
            text: 'C',
            feedback:
              'C is between the opponent and the goal, but too far out. That leaves the way through the middle open. One small step inside, and it’s right.',
          },
        ],
        section: 'not-exactly-in-between-a-bit-to-the-inside',
        topic: 'A bit to the inside',
      },
      {
        prompt: 'Where is a shot more dangerous from: A or B?',
        label: 'Our zone, our goal at the bottom. A is right in front of the goal in the slot. B is out wide, next to the left faceoff dot.',
        afterLabel:
          'From A the shooter sees the whole goal. From B they see only a narrow strip, which the goalie covers almost alone.',
        options: [
          {
            text: 'From A, in the slot',
            feedback: 'From the slot the shooter sees the whole goal. Most goals are scored from there.',
          },
          {
            text: 'From B, next to the faceoff dot',
            feedback: 'From out wide the shooter sees only a narrow strip of the goal. The goalie covers that almost alone.',
          },
          {
            text: 'Both are equally dangerous',
            feedback:
              'The further out, the smaller the goal looks to the shooter. That is why we keep the opponent outside the faceoff dots.',
          },
        ],
        section: 'keeping-the-opponent-outside-the-dots',
        topic: 'Outside the dots',
      },
      {
        prompt:
          'An opponent is skating with the puck along the boards, outside the faceoff dots. They are facing you and have the puck under control. What do you do?',
        options: [
          {
            text: 'Charge at them full speed and take the puck.',
            feedback: 'Whoever charges in is easy to skate around. And then the way to the middle is open.',
          },
          {
            text: 'Skate towards them more slowly, stay inside and keep them wide.',
            feedback:
              'Out wide on the boards they are less dangerous. Stay inside, about a stick’s length away, and don’t let them into the middle.',
          },
          {
            text: 'Skate quickly to the front of the goal and wait there.',
            feedback:
              'Then they have time and space to cut inside or pass in peace. Stay close enough to them.',
          },
        ],
        section: 'keeping-the-opponent-outside-the-dots',
        topic: 'Out wide is allowed',
      },
      {
        prompt: 'You are on your opponent’s defensive side. Where is your stick?',
        options: [
          {
            text: 'On the ice, blade pointing at the puck.',
            feedback: 'That makes passes through the middle difficult. Your body keeps you between the opponent and the goal.',
          },
          {
            text: 'Up in the air, ready to hit.',
            feedback:
              'A stick in the air stops no pass. And hitting the opponent with it risks a penalty. The stick belongs on the ice.',
          },
          {
            text: 'It doesn’t matter, only the body counts.',
            feedback:
              'The body keeps the opponent wide. The stick on the ice closes the passing lane as well. Both count.',
          },
        ],
        section: 'not-exactly-in-between-a-bit-to-the-inside',
        topic: 'Stick to the puck, body to the body',
      },
      {
        prompt:
          'We have lost the puck. You are RW and skating back. An opponent without the puck is heading for the goal. Which way do you take: A or B?',
        label:
          'Our zone. An opponent has the puck on the left boards, LD is in front of them. RW is coming back at the top right. A second opponent without the puck is skating towards the goal. A is inside, in the middle; B is wide, on the right boards.',
        afterLabel:
          'RW came back on the inside and is between the opponent without the puck and the goal, in the way of the pass.',
        options: [
          {
            text: 'A, inside through the middle',
            feedback:
              'Come back inside, look over your shoulder and get between the opponent and the goal before they do. Then the pass to them won’t get through.',
          },
          {
            text: 'B, wide along the boards',
            feedback:
              'Coming back wide leaves the opponent a free path to the goal on the inside. One pass, and they are alone in front of the goalie.',
          },
        ],
        section: 'defensive-side-without-the-puck',
        topic: 'Defensive side without the puck',
      },
      {
        prompt:
          'An opponent picks up the puck in the corner. They have their back to you and don’t have the puck under control yet. What do you do?',
        options: [
          {
            text: 'Attack quickly.',
            feedback:
              'With their back to you and no control, they can’t skate around you. Now put on pressure quickly, on the defensive side.',
          },
          {
            text: 'Skate towards them slowly and wait.',
            feedback:
              'You approach slowly when an opponent is facing you and has control of the puck. Here they have neither. That is your chance.',
          },
          {
            text: 'Wait for them in front of the goal.',
            feedback:
              'Then they have time to turn and get control of the puck. Better attack while their back is turned to you.',
          },
        ],
        section: 'keeping-the-opponent-outside-the-dots',
        topic: 'When to attack quickly',
      },
    ],
  },
  zuordnung: {
    title: 'Quiz: Zuordnung',
    name: 'Zuordnung',
    article: 'coverage',
    questions: [
      {
        prompt:
          'Three of our players are at the puck in the left corner. You are RW and just coming into the zone. Where do you go: A, B or C?',
        label:
          'Our zone, our goal at the bottom. LD, RD and C are in the left corner at the puck, LW is high on the left. An opponent stands open in front of the goal. RW is coming into the zone at the top right. A is next to the corner, B in front of the goal, C high on the right.',
        afterLabel: 'RW has skated to the front of the goal and is with the open opponent.',
        options: [
          {
            text: 'A, help in the corner',
            feedback:
              'Three of ours are already there. Another player at the puck hardly ever helps, but they are missing in front of the goal.',
          },
          {
            text: 'B, in front of the goal',
            feedback:
              'An opponent is open in front of the goal, and most goals are scored from there. If more than one area is free: the front of the goal first.',
          },
          {
            text: 'C, my own area high on the right',
            feedback:
              'Your area matters. But the area counts, not the person: nobody is in front of the goal, and that is more dangerous. Go there first.',
          },
        ],
        section: 'finding-the-open-gap',
        topic: 'Finding the open gap',
      },
      {
        prompt: 'The puck is in the right corner of our zone. Who puts pressure on the puck?',
        label: 'Our zone in five coloured areas. The puck is in the right corner, in RD’s area. An opponent has it.',
        options: [
          {
            text: 'RD',
            feedback: 'The puck is in RD’s area, low on the right. So RD puts on pressure, on the defensive side.',
          },
          {
            text: 'C',
            feedback:
              'The centre is the near support and helps. But the player whose area holds the puck puts on pressure: RD.',
          },
          {
            text: 'Whoever is closest',
            feedback:
              'Then everyone soon skates to the puck: the beehive. The player whose area it is puts on pressure. Low on the right, that is RD.',
          },
        ],
        section: 'the-five-areas',
        topic: 'The five areas',
      },
      {
        prompt: 'When does the centre go to the front of the goal?',
        options: [
          {
            text: 'Always. The middle in front of the goal is their spot.',
            feedback:
              'The middle is their starting point, but they don’t stay there. Most of the time they are near support at the puck.',
          },
          {
            text: 'When an opponent is open there that the far-side defender can’t cover.',
            feedback:
              'An open opponent in front of the goal is more dangerous than a battle in the corner. Otherwise the centre helps at the puck.',
          },
          {
            text: 'Never. They always stay at the puck.',
            feedback:
              'Most of the time they are at the puck, yes. But if an opponent stands open in front of the goal and nobody covers them, the centre goes there.',
          },
        ],
        section: 'the-centre-support-first',
        topic: 'The centre',
      },
      {
        prompt: 'RD puts pressure on in the right corner, C helps. You are LD. Where do you stand: A, B or C?',
        label:
          'Our zone in five coloured areas. The puck is in the right corner, RD and C are there. An opponent stands in front of the goal. A is in the left corner, B in front of the goal, C next to RD in the right corner.',
        afterLabel: 'LD is in front of the goal with the opponent. LW and RW are high in their areas, close to the middle.',
        options: [
          {
            text: 'A, low on the left in my area',
            feedback:
              'If the puck is on the other side, you move to the edge of your area, towards the puck and the middle. There is nobody in the left corner for you to cover right now.',
          },
          {
            text: 'B, in front of the goal',
            feedback: 'The far-side defender goes to the front of the goal. There you cover the opponent, stick on the ice.',
          },
          {
            text: 'C, next to RD in the corner',
            feedback: 'Two are already with RD: RD and C. As a third player in the corner you are missing in front of the goal.',
          },
        ],
        section: 'the-five-areas',
        topic: 'The five areas',
      },
      {
        prompt:
          'After a battle you, the centre, are stuck deep in the left corner. So LD is standing high in the middle. What do you both do until the puck is out of the zone?',
        options: [
          {
            text: 'I skate back across the ice to the middle quickly, so LD can go to their corner.',
            feedback: 'Skating across the ice to your own position opens a gap that the opponents will use.',
          },
          {
            text: 'We swap: I play LD, LD plays centre. We swap back when things are calm.',
            feedback:
              'The area counts, not the person. You swap back when the puck is out of the zone or at a stoppage.',
          },
          {
            text: 'I wait in the corner until LD comes back.',
            feedback: 'Then an area is empty. Take over the area you are in right now. That is why everyone learns every position.',
          },
        ],
        section: 'the-area-counts-not-the-person',
        topic: 'The area counts, not the person',
      },
      {
        prompt: 'Two of ours are already at the puck. You come into the zone after a line change. What do you do?',
        options: [
          {
            text: 'Go to the puck as the third player. Three of us will surely win it.',
            feedback: 'A third player at the puck hardly ever helps. But they are always missing somewhere else, usually in front of the goal.',
          },
          {
            text: 'Head up, count, and skate into the area that is still free.',
            feedback:
              'Exactly: look across the ice, count, go to the free area. And say briefly what you are doing: “I’ve got the front!”',
          },
          {
            text: 'Straight to the blue line, so I’m open for a pass.',
            feedback: 'Out too early. Win the puck first, then go. Until then you are missing in the zone.',
          },
        ],
        section: 'finding-the-open-gap',
        topic: 'Finding the open gap',
      },
    ],
  },
  support: {
    title: 'Quiz: support',
    name: 'Support',
    article: 'support',
    questions: [
      {
        prompt:
          'LD has the puck in the corner, an opponent is coming at them. You are LW. Where are you the best near support: A, B or C?',
        label:
          'Our zone, our goal at the bottom. LD has the puck in the left corner, an opponent is skating at them. A is on the left boards, roughly level with the faceoff dots. B is in the middle, right behind the opponent. C is high up at the blue line.',
        afterLabel:
          'LW is on A on the boards. LD’s pass gets there freely. Behind the opponent is a grey passing shadow, where no pass gets through.',
        options: [
          {
            text: 'A, on the boards',
            feedback: 'Open, near and on the boards, roughly level with the faceoff dots. One short pass, and the pressure is gone.',
          },
          {
            text: 'B, in the middle',
            feedback:
              'An opponent is between you and LD. LD can’t get the pass through. If you can’t see the puck carrier’s blade, take a step or two to the side.',
          },
          {
            text: 'C, at the blue line',
            feedback:
              'Too far away. A short, safe pass has to be enough while the opponent is pressing. And that high up you are out too early.',
          },
        ],
        section: 'near-support',
        topic: 'Near support',
      },
      {
        prompt: 'The opponents have the puck in our zone. How many of us go to the puck?',
        options: [
          {
            text: 'Two',
            feedback:
              'One puts on pressure, the second helps. The others stay in the middle: in front of the goal, in the high slot, and between the puck and the blue line.',
          },
          {
            text: 'Three, to be safe',
            feedback: 'A third player at the puck is missing in front of the goal. Support means helping, not everyone going.',
          },
          {
            text: 'One, the others stay away',
            feedback: 'Alone against the puck carrier you often lose. Two against one win the puck almost every time.',
          },
        ],
        section: 'overload-two-to-the-puck',
        topic: 'Overload',
      },
      {
        prompt: 'LD holds an opponent against the boards. That is called pinning. Who takes the puck?',
        options: [
          {
            text: 'LD, as soon as they can.',
            feedback: 'Whoever pins can’t play the puck. If LD lets go to get it, the opponent is free again.',
          },
          {
            text: 'A second player, for example C.',
            feedback: 'Pinning only works with support. LD holds the opponent, the second player takes the puck.',
          },
          {
            text: 'Nobody. You wait for the referee’s whistle.',
            feedback: 'The referee doesn’t whistle. A second player takes the puck while LD holds the opponent.',
          },
        ],
        section: 'pinning-hold-them-and-let-a-teammate-take-the-puck',
        topic: 'Pinning',
      },
      {
        prompt:
          'C is stuck in the corner, two opponents are pressing them against the boards. You are LW, in front of the goal. What do you do?',
        label:
          'Attacking zone, the opponents’ goal at the top. C has the puck in the left corner, two opponents press them against the boards. LW and RW stand in front of the goal, waiting.',
        afterLabel:
          'LW has skated over to the battle and is a few metres from C, as near support. RW is further away in the slot, as far support.',
        options: [
          {
            text: 'Stay in front of the goal and wait for the pass.',
            feedback:
              'As long as C is fighting alone against two, no pass will come. They will hardly ever get a long pass through to the front of the goal.',
          },
          {
            text: 'Go over, into the open gap a few metres from C.',
            feedback:
              'Now C can push the puck to you, or you pick up the loose puck. 1 against 2 becomes 2 against 2. The goal comes after that.',
          },
          {
            text: 'Right up close to C on the boards.',
            feedback: 'Too close. Right next to each other, one opponent can bother you both. A few metres away, in the open gap.',
          },
        ],
        section: 'when-the-puck-carrier-is-stuck',
        topic: 'When the puck carrier is stuck',
      },
      {
        prompt: 'LD and C go to the puck together, an overload. What is the risk?',
        options: [
          {
            text: 'None. Two against one always wins.',
            feedback: 'Usually, but not always. That is why the overload is used with care.',
          },
          {
            text: 'If the opponents pass the puck along the boards to their open teammate, they have a 2 against 1.',
            feedback: 'That is the downside: two of ours are at the puck. If it doesn’t work, they are missing elsewhere.',
          },
          {
            text: 'The referee calls interference.',
            feedback:
              'Going to the puck in pairs is allowed. The risk is a different one: if the overload fails, the opponents have a 2 against 1 somewhere else.',
          },
        ],
        section: 'overload-two-to-the-puck',
        topic: 'The risk of the overload',
      },
      {
        prompt: 'The puck carrier, near support and far support form a triangle. Why is that good?',
        options: [
          {
            text: 'The puck carrier always has two options to pass.',
            feedback: 'And whoever gets the puck immediately has two again. That is why the triangle moves with the puck.',
          },
          {
            text: 'Then everyone stands nice and close together.',
            feedback: 'Too close is bad: two of our players on one spot get in each other’s way.',
          },
          {
            text: 'Then nobody has to skate any more.',
            feedback: 'The opposite: the triangle moves with the puck. Whoever stands still is easy to cover.',
          },
        ],
        section: 'the-triangle',
        topic: 'The triangle',
      },
    ],
  },
  bully: {
    title: 'Quiz: face-offs',
    name: 'Face-offs',
    article: 'faceoffs',
    questions: [
      {
        prompt: 'Face-off in our zone on the left circle. You are LW. Where do you stand: A, B or C?',
        label:
          'Our zone, our goal at the bottom. Face-off on the left circle. C is on the dot, LD on the boards, RD on the inner hash marks, RW in the slot, G in goal. A is behind C towards the goal line, B high above the circle, C between the goalie and the puck.',
        afterLabel:
          'LW stands behind C towards the goal line. A dotted line shows: apart from C, nobody stands between the goalie and the puck.',
        options: [
          {
            text: 'A, behind C towards the goal line',
            feedback: 'LW stands behind C, towards the goal line. If C loses the draw, LW is quickly at the opposing defender.',
          },
          {
            text: 'B, high above the circle',
            feedback: 'None of ours stands there. LW stands behind C, towards the goal line.',
          },
          {
            text: 'C, between the goalie and the puck',
            feedback: 'There you block the goalie’s view. Apart from C, nobody stands between the goalie and the puck.',
          },
        ],
        section: 'face-off-in-our-own-zone',
        topic: 'Face-off in our own zone',
      },
      {
        prompt: 'We lose the face-off in our zone. You are RW. What do you do straight away?',
        options: [
          {
            text: 'Go to the opposing defender at the blue line.',
            feedback:
              'The opponents want to get the puck to a defender at the blue line quickly and shoot. LW and RW go straight there, so the shooter has no time.',
          },
          {
            text: 'Stay in front of the goal and cover the slot.',
            feedback:
              'Then the defender at the blue line has time and space for a shot. The wingers go straight to the two defenders.',
          },
          {
            text: 'Go to the puck.',
            feedback: 'C is already battling for the puck. Your job is the defender at the blue line, before they shoot.',
          },
        ],
        section: 'face-off-in-our-own-zone',
        topic: 'Face-off lost',
      },
      {
        prompt: 'Face-off in the attacking zone: C draws the puck back to RD. Where does C go?',
        options: [
          {
            text: 'Back to the blue line.',
            feedback: 'RD and LD are already at the blue line. C goes to the front of the net.',
          },
          {
            text: 'To the front of the net.',
            feedback: 'In front of the net C blocks the goalie’s view, deflects the shot or takes the rebound.',
          },
          {
            text: 'Into the corner.',
            feedback: 'RW slides down the boards towards the corner. C goes to the front of the net, so RD can shoot.',
          },
        ],
        section: 'face-off-in-the-attacking-zone',
        topic: 'Face-off in the attacking zone',
      },
      {
        prompt: 'Now the face-off is on the right circle in our zone. You are LW again. Where do you stand: A, B or C?',
        label:
          'Our zone, our goal at the bottom. Face-off on the right circle, C on the dot, G in goal. A is behind C towards the goal line, B to the left of the goal in the slot, C on the right boards.',
        afterLabel:
          'The whole line-up on the right circle: RW behind C, RD on the boards, LD on the inner hash marks, LW in the slot.',
        options: [
          {
            text: 'A, behind C',
            feedback: 'That was your spot on the left circle. On the right circle everything is mirrored: now RW stands behind C.',
          },
          {
            text: 'B, in the slot',
            feedback: 'Mirrored, the wingers swap places. Where RW stood on the left circle, in the slot, LW now stands.',
          },
          {
            text: 'C, on the boards',
            feedback: 'A defender stands on the boards: LD on the left circle, RD on the right circle.',
          },
        ],
        section: 'the-other-circle',
        topic: 'The other circle',
      },
      {
        prompt: 'RD passes across the middle to LW, over the royal road. Why is a shot after that so dangerous?',
        options: [
          {
            text: 'The goalie has to slide across the goal.',
            feedback:
              'The royal road is the imaginary line from goal to goal through the middle. When the puck crosses it, the goalie has to slide across. That is hard.',
          },
          {
            text: 'A pass across the middle is faster than any shot.',
            feedback: 'It isn’t about the speed of the pass. The goalie has to slide across the goal, and that is hard.',
          },
          {
            text: 'Because then the pass can’t be offside.',
            feedback: 'It has nothing to do with offside. It is dangerous because the goalie has to slide across the goal.',
          },
        ],
        section: 'face-off-in-the-attacking-zone',
        topic: 'The royal road',
      },
      {
        prompt:
          'Face-off won in the neutral zone. You are a defender and get the puck. An opposing winger is coming at you fast. What do you do?',
        options: [
          {
            text: 'Pass across to the other defender.',
            feedback: 'The other defender then has more time and space. Decide quickly: pass on or skate.',
          },
          {
            text: 'Stop the puck and wait to see what happens.',
            feedback:
              'The opponents know the puck is coming to you. Whoever waits gets pressured. Decide quickly: pass or skate.',
          },
          {
            text: 'Shoot the puck far up the ice.',
            feedback: 'Clearing the puck blindly usually gives it to the opponents. The pass across to the other defender is safer.',
          },
        ],
        section: 'face-off-in-the-neutral-zone',
        topic: 'Face-off in the neutral zone',
      },
    ],
  },
};

export const quizText: Record<Locale, Record<QuizId, QuizText>> = { de, en };

/* Types can't count array items: check that every language has the same questions and
   options, and that the right answer is one of them. Fails the build otherwise. */
for (const id of Object.keys(geometry) as QuizId[]) {
  for (const [locale, text] of Object.entries(quizText)) {
    const questions = text[id].questions;
    if (questions.length !== geometry[id].length) throw new Error(`quiz ${id} (${locale}): question count`);
    questions.forEach((q, i) => {
      const where = `quiz ${id} #${i + 1} (${locale})`;
      if (q.options.length !== de[id].questions[i].options.length) throw new Error(`${where}: option count`);
      if (geometry[id][i].correct >= q.options.length) throw new Error(`${where}: no right answer`);
    });
  }
}

/**
 * A quiz as plain Markdown for the llms-full.txt files: question, a description of the
 * picture if there is one, options, right answer.
 */
export function quizMarkdown(id: QuizId, locale: Locale): string {
  const answer = { de: 'Richtig:', en: 'Right answer:' }[locale];
  return quizText[locale][id].questions
    .map((q, i) => {
      const right = q.options[geometry[id][i].correct];
      const options = q.options.map((o) => `- ${o.text}`).join('\n');
      const picture = q.label ? `_${q.label}_\n\n` : '';
      return `**${q.prompt}**\n\n${picture}${options}\n\n${answer} ${right.text} ${right.feedback}`;
    })
    .join('\n\n');
}
