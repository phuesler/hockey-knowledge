/**
 * Game situations told in steps, drawn by RinkSequence.svelte. Each frame is one moment;
 * players keep their `id` from frame to frame, so they slide to their new spot when the
 * reader steps on. Arrows in a frame show what happens next.
 *
 * Positions are rink metres, see rink.ts. In the attacking zone our left is at positive x.
 */
import { DANGER_ZONE, passShadow, viewCone, type Player, type Pt, type Scene, type View } from './rink';
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

/* scan: the winger on the left half-boards in our zone, before the breakout pass. */
const scanWinger: Pt = [-12.5, 12];

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

  'close-gap': {
    zone: 'own',
    frames: [
      {
        areas: [danger],
        players: [them('o1', [-9, 20]), us('j', 'J', [-3.6, 11])],
        puck: [-8.4, 18.9],
        moves: [
          { kind: 'carry', team: 'them', path: [[-8.4, 18.9], [-5, 13]], trim: 0.4 },
          { kind: 'skate', path: [[-3.6, 11], [-6.4, 15.6]], trim: 0.4 },
        ],
      },
      {
        areas: [danger],
        players: [them('o1', [-9, 17.4]), us('j', 'J', [-6.6, 15.4])],
        puck: [-8.6, 16.2],
        moves: [
          { kind: 'stick', path: [[-6.6, 15.4], [-7.8, 15.8]] },
          { kind: 'carry', team: 'them', path: [[-8.6, 16.2], [-11.6, 13], [-12.4, 9]], trim: 0.4 },
          { kind: 'skate', path: [[-6.6, 15.4], [-9.2, 12.4], [-10, 8.4]], trim: 0.4 },
        ],
      },
      {
        areas: [danger],
        players: [them('o1', [-12.8, 9.6]), us('j', 'J', [-10, 8.4])],
        puck: [-12.6, 8.2],
        moves: [{ kind: 'stick', path: [[-10, 8.4], [-11.6, 8]] }],
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
        text: 'K ist König. Er passt zum Satelliten tief an der Bande. Aber ein Gegner steht im Passweg.',
      },
      {
        title: 'Puck verloren – neue Rollen',
        text: 'Der Gegner fängt den Pass ab. Sofort hat jeder eine neue Rolle: Der frühere König ist am nächsten und schon zwischen Puck und unserem Tor. Er wird Jäger (J). Alle anderen werden Wächter (W).',
      },
      {
        title: 'Alle auf der Abwehrseite',
        text: 'Der Jäger macht Druck, der Schläger zeigt zum Puck. Jeder Wächter steht zwischen einem Gegner und unserem Tor. Unser Tor liegt unten, hinter der blauen Linie.',
      },
    ],
    labels: [
      'Angriffsdrittel. Der König hat den Puck an der linken Bande und passt tief zur Bande. Ein Gegner steht im Passweg.',
      'Der Gegner hat den Pass abgefangen. Unsere Spieler heissen jetzt J und W. Pfeile zeigen, wie jeder zwischen einen Gegner und unser Tor fährt.',
      'Der Jäger steht vor dem Gegner mit Puck, Schläger zum Puck. Die vier Wächter stehen jeweils zwischen einem Gegner und der blauen Linie.',
    ],
  },
  scan: {
    caption: 'Scannen: schauen, bevor der Puck kommt',
    steps: [
      {
        title: 'Über die Schulter',
        text: 'Der Verteidiger hat den Puck hinter dem Tor. Der Flügel an der Bande schaut zuerst über die Schulter zur Mitte. Er sieht: Ein Gegner kommt auf ihn zu. Der Center in der Mitte ist frei.',
      },
      {
        title: 'Zum Puck',
        text: 'Dann schaut er zum Puck und nimmt den Pass an. Er weiss jetzt schon, wo der Gegner ist und wer frei ist.',
      },
      {
        title: 'Sofort spielen',
        text: 'Er ist jetzt König. Er muss nicht mehr suchen: Er spielt den Puck sofort zum freien Center, bevor der Gegner da ist.',
      },
      {
        title: 'Weiter geht’s',
        text: 'Der Center ist der neue König und fährt mit Tempo aus der Zone. Der Gegner kommt zu spät.',
      },
    ],
    labels: [
      'Eigenes Drittel. Der Verteidiger hat den Puck hinter dem Tor. Ein blauer Fächer zeigt, dass der Flügel an der linken Bande über die Schulter zur Mitte schaut. Ein Gegner fährt auf ihn zu, der Center ist frei.',
      'Der blaue Fächer zeigt jetzt vom Flügel zum Puck. Der Verteidiger passt zu ihm.',
      'Der Flügel hat den Puck und schaut zum Center. Er passt sofort zum Center. Der Gegner ist noch ein paar Meter weg.',
      'Der Center hat den Puck und fährt Richtung blaue Linie.',
    ],
    note: 'Der blaue Fächer zeigt, wohin der Spieler gerade schaut.',
  },
  'pass-shadow': {
    caption: 'Raus aus dem Passschatten',
    steps: [
      {
        title: 'Versteckt',
        text: 'Der Satellit steht hinter einem Gegner. Die graue Fläche ist der Passschatten: Jeder Pass dorthin trifft den Gegner. Für den König ist der Satellit unsichtbar.',
      },
      {
        title: 'Zwei Schritte',
        text: 'Der Satellit fährt ein paar Meter zur Seite, bis er die Kelle des Königs sieht.',
      },
      {
        title: 'Frei',
        text: 'Jetzt ist der Passweg frei. Der König kann passen, und der Satellit steht im Slot bereit zum Schuss.',
      },
    ],
    labels: [
      'Angriffsdrittel. Der König hat den Puck an der linken Bande. Ein Gegner steht im Slot. Direkt dahinter, in einer grauen Fläche, steht ein Satellit.',
      'Der Satellit fährt aus der grauen Fläche nach oben in den hohen Slot.',
      'Der Satellit steht frei im hohen Slot. Der König passt zu ihm, am Gegner vorbei.',
    ],
  },
  'net-drive': {
    caption: 'Zum Tor fahren macht Platz',
    steps: [
      {
        title: 'Der Satellit fährt los',
        text: 'Der König hat den Puck an der Bande. Im Slot steht ein Gegner bei unserem Satelliten. Der Satellit fährt zum Tor, der Gegner muss mit.',
      },
      {
        title: 'Platz im Slot',
        text: 'Der Gegner steht jetzt vor dem Tor. Im Slot ist freies Eis (grün). Der König fährt mit dem Puck hinein.',
      },
      {
        title: 'Schuss',
        text: 'Der König schiesst aus dem Slot. Der Satellit vor dem Tor nimmt dem Torhüter die Sicht und ist bereit für den Abpraller.',
      },
    ],
    labels: [
      'Angriffsdrittel. Der König hat den Puck an der linken Bande. Ein Satellit im Slot fährt zum Tor, sein Gegner folgt ihm.',
      'Der Satellit und sein Gegner stehen vor dem Tor. Im Slot ist eine grüne Fläche frei. Der König fährt mit dem Puck hinein.',
      'Der König schiesst aus dem Slot aufs Tor. Der Satellit steht vor dem Torhüter.',
    ],
  },
  'close-gap': {
    caption: 'Jäger: Lücke schliessen und nach aussen drängen',
    steps: [
      {
        title: 'Grosse Lücke',
        text: 'Ein Gegner kommt mit dem Puck über die blaue Linie. Der Jäger ist weit weg: Der Gegner hätte Zeit und Platz für den Weg zum Tor. Der Jäger schliesst die Lücke mit ein paar schnellen Schritten.',
      },
      {
        title: 'Schläger zum Puck',
        text: 'Der Jäger ist nah dran, auf der Abwehrseite und etwas innen. Der Schläger zeigt zum Puck. Dem Gegner bleibt nur der Weg nach aussen.',
      },
      {
        title: 'Aussen an der Bande',
        text: 'Der Gegner ist an der Bande, ausserhalb der Bullypunkte. Von dort ist er kaum gefährlich. Der Jäger bleibt innen, Schläger zum Puck.',
      },
    ],
    labels: [
      'Eigenes Drittel. Ein Gegner mit Puck an der linken blauen Linie fährt Richtung Tor. Der Jäger fährt ihm entgegen.',
      'Der Jäger steht nah vor dem Gegner, etwas zur Mitte hin, Schläger zum Puck. Der Gegner weicht nach aussen zur Bande aus.',
      'Der Gegner ist an der linken Bande neben dem Bullykreis. Der Jäger steht innen neben ihm, Schläger zum Puck.',
    ],
  },
  'guard-tight': {
    caption: 'Wächter: je näher am Tor, desto enger',
    steps: [
      {
        title: 'Weit vom Tor: etwas Abstand',
        text: 'Der Gegner ohne Puck ist hoch im Slot. Der Wächter steht zwischen ihm und dem Tor, mit etwas Abstand. Er sieht den Gegner und den Puck. Jetzt fährt der Gegner zum Tor.',
      },
      {
        title: 'Vor dem Tor: ganz nah',
        text: 'Vor dem Tor ist der Gegner gefährlich. Der Wächter bleibt ganz nah bei ihm, auf der Abwehrseite. Der Schläger liegt im Passweg. Der Gegner an der Bande versucht den Pass.',
      },
      {
        title: 'Pass abgefangen',
        text: 'Der Pass landet beim Schläger des Wächters. Jetzt haben wir den Puck – und der Wächter ist König.',
      },
    ],
    labels: [
      'Eigenes Drittel. Ein Gegner mit Puck an der rechten Bande, der Jäger vor ihm. Ein Gegner ohne Puck im hohen Slot fährt zum Tor. Der Wächter fährt mit, ein blauer Fächer zeigt, dass er Gegner und Puck im Blick hat.',
      'Der Gegner steht vor dem Tor, der Wächter direkt daneben auf der Torseite, Schläger im Passweg. Der Gegner an der Bande passt zum Tor.',
      'Der Puck liegt beim Schläger des Wächters vor dem Tor.',
    ],
  },
};

const en: typeof de = {
  'role-switch': {
    caption: 'Puck lost: the roles switch',
    steps: [
      {
        title: 'We have the puck',
        text: 'K is the König. He passes to the Satellit low on the boards. But an opponent is in the passing lane.',
      },
      {
        title: 'Puck lost – new roles',
        text: 'The opponent picks off the pass. Straight away everyone has a new role: the former König is closest and already between the puck and our goal. He becomes the Jäger (J). Everyone else becomes a Wächter (W).',
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
        text: 'The defender has the puck behind the goal. The winger on the boards first looks over his shoulder towards the middle. He sees: an opponent is coming at him. The centre in the middle is open.',
      },
      {
        title: 'To the puck',
        text: 'Then he looks at the puck and takes the pass. He already knows where the opponent is and who is open.',
      },
      {
        title: 'Play it straight away',
        text: 'Now he is the König. He doesn’t need to search: he plays the puck straight to the open centre, before the opponent gets there.',
      },
      {
        title: 'On we go',
        text: 'The centre is the new König and skates out of the zone with speed. The opponent is too late.',
      },
    ],
    labels: [
      'Our zone. The defender has the puck behind the goal. A blue fan shows the winger on the left boards looking over his shoulder towards the middle. An opponent is skating at him, the centre is open.',
      'The blue fan now points from the winger to the puck. The defender passes to him.',
      'The winger has the puck and looks at the centre. He passes to the centre straight away. The opponent is still a few metres away.',
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
        text: 'The Satellit skates a few metres to the side, until he can see the König’s blade.',
      },
      {
        title: 'Open',
        text: 'Now the passing lane is open. The König can pass, and the Satellit is in the slot, ready to shoot.',
      },
    ],
    labels: [
      'Attacking zone. The König has the puck on the left boards. An opponent stands in the slot. Right behind him, in a grey area, stands a Satellit.',
      'The Satellit skates out of the grey area up into the high slot.',
      'The Satellit is open in the high slot. The König passes to him, past the opponent.',
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
      'Attacking zone. The König has the puck on the left boards. A Satellit in the slot drives to the net, his opponent follows.',
      'The Satellit and his opponent are in front of the goal. A green area in the slot is open. The König skates into it with the puck.',
      'The König shoots from the slot. The Satellit stands in front of the goalie.',
    ],
  },
  'close-gap': {
    caption: 'Jäger: close the gap and push outside',
    steps: [
      {
        title: 'Big gap',
        text: 'An opponent carries the puck over the blue line. The Jäger is far away: the opponent would have time and space to go to the goal. The Jäger closes the gap with a few quick strides.',
      },
      {
        title: 'Stick on puck',
        text: 'The Jäger is close, on the defensive side and a little inside. His stick points at the puck. The only way left for the opponent is outside.',
      },
      {
        title: 'Outside on the boards',
        text: 'The opponent is on the boards, outside the faceoff dots. From there he is hardly dangerous. The Jäger stays inside, stick on the puck.',
      },
    ],
    labels: [
      'Our zone. An opponent with the puck at the left blue line skates towards the goal. The Jäger skates towards him.',
      'The Jäger is close in front of the opponent, a little towards the middle, stick on the puck. The opponent veers outside towards the boards.',
      'The opponent is on the left boards next to the faceoff circle. The Jäger is inside next to him, stick on the puck.',
    ],
  },
  'guard-tight': {
    caption: 'Wächter: the closer to the goal, the tighter',
    steps: [
      {
        title: 'Far from the goal: some space',
        text: 'The opponent without the puck is high in the slot. The Wächter stands between him and the goal, with some space. He can see the opponent and the puck. Now the opponent skates to the goal.',
      },
      {
        title: 'In front of the goal: very close',
        text: 'In front of the goal the opponent is dangerous. The Wächter stays very close to him, on the defensive side. His stick is in the passing lane. The opponent on the boards tries the pass.',
      },
      {
        title: 'Pass picked off',
        text: 'The pass ends up on the Wächter’s stick. Now we have the puck – and the Wächter is the König.',
      },
    ],
    labels: [
      'Our zone. An opponent with the puck on the right boards, the Jäger in front of him. An opponent without the puck in the high slot skates to the goal. The Wächter goes with him; a blue fan shows he can see both the opponent and the puck.',
      'The opponent is in front of the goal, the Wächter right next to him on the goal side, stick in the passing lane. The opponent on the boards passes towards the goal.',
      'The puck lies at the Wächter’s stick in front of the goal.',
    ],
  },
};

export const sequenceText = { de, en };
