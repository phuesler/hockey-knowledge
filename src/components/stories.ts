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
  badge?: Animal;
}

export interface StoryStep {
  players: StoryPlayer[];
  puck: Pt;
  /** The opponent who skates with the puck: their arrow is wavy. */
  carrier?: string;
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
const them = (id: string, at: Pt): StoryPlayer => ({ id, team: 'them', at });

/* Forecheck in the attacking zone. We face the goal, so our LW is at positive x
   (see rink.ts). o1 and o2 are the opponents' defenders, o3–o5 their forwards. */
const doors = {
  boards: [[10.6, 3.2], [14.4, 7.5], [13.6, 14.5]],
  middle: [[9.2, 3.6], [1.5, 10.5]],
  behind: [[9.6, 2], [4, 0.9], [-6.5, 2.8]],
} as const;

const forecheckStart = [them('o1', [10, 2.4]), them('o2', [-6.5, 2.8]), them('o3', [13.6, 14.5]), them('o4', [1.5, 10.5]), them('o5', [-12.5, 14])];

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
};

export const storyText = { de, en };
