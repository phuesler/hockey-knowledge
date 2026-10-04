/**
 * The static game situations drawn by RinkPlay.svelte: where everyone stands (in rink
 * metres, see rink.ts) and the words around each drawing, in German and English.
 *
 * A play has one or more panels. Each panel is one zone; `zone` says whose goal is at
 * the bottom, and `verdict` marks a "do this" / "not like this" comparison.
 */
import { DANGER_ZONE, POST_X, GOAL_LINE, type Pt, type Scene } from './rink';

export interface PlayPanel {
  zone: 'own' | 'attack';
  verdict?: 'good' | 'bad';
  scene: Scene;
}

const danger = { kind: 'danger', poly: DANGER_ZONE } as const;
const posts: [Pt, Pt] = [
  [-POST_X, GOAL_LINE],
  [POST_X, GOAL_LINE],
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

  /* Defensive support, overload: LD and C go to the puck together, 2 against 1. */
  overload: [
    {
      zone: 'own',
      scene: {
        areas: [{ kind: 'zone', ellipse: { at: [-11.6, 10.8], rx: 3.5, ry: 4.6 }, label: '2:1', labelAt: [-12, 16.6] }],
        players: [
          { team: 'them', at: [-13, 11] },
          { team: 'them', at: [-10, 3.2] },
          { team: 'them', at: [2.2, 8] },
          { team: 'them', at: [-9, 21] },
          { team: 'them', at: [8, 21] },
          { team: 'us', label: 'LD', at: [-8.6, 4.8], ghost: true },
          { team: 'us', label: 'C', at: [-4.8, 12.6], ghost: true },
          { team: 'us', label: 'LD', at: [-11.2, 8.6] },
          { team: 'us', label: 'C', at: [-10.4, 13.2] },
          { team: 'us', label: 'RD', at: [0.6, 5.5] },
          { team: 'us', label: 'LW', at: [-7.6, 18] },
          { team: 'us', label: 'RW', at: [2.4, 13.6] },
        ],
        puck: [-12.4, 9.9],
        moves: [
          { kind: 'skate', path: [[-8.6, 4.8], [-11.2, 8.6]], trim: 1.5 },
          { kind: 'skate', path: [[-4.8, 12.6], [-10.4, 13.2]], trim: 1.5 },
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

  /* Attacking zone, puck carrier pressed by two opponents in the corner. Our left side is
     on the right of the drawing here, because we face the goal at the bottom. */
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
    caption: 'Overload: zu zweit an den Puck',
    panels: [
      {
        title: '2 gegen 1 am Puck',
        text: 'Der Gegner hat den Puck an der Bande. LD kommt von unten, C von oben. Die anderen bleiben in der Mitte: RD vor dem Tor, RW im hohen Slot, LW zwischen Puck und blauer Linie.',
      },
    ],
    labels: [
      'Ein Gegner mit Puck an der linken Bande. Der linke Verteidiger und der Center fahren von zwei Seiten zu ihm. Der rechte Verteidiger steht vor dem Tor, die Flügel weiter oben.',
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
    note: 'Hier greifen wir an: Unten ist das gegnerische Tor. Darum spielt unser LW auf der rechten Seite der Zeichnung.',
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
    caption: 'Overload: two to the puck',
    panels: [
      {
        title: '2 against 1 at the puck',
        text: 'The attacker has the puck on the boards. LD comes from below, C from above. The others stay in the middle: RD in front of the goal, RW in the high slot, LW between the puck and the blue line.',
      },
    ],
    labels: [
      'An attacker with the puck on the left boards. The left defender and the centre close in from two sides. The right defender is in front of the goal, the wingers higher up.',
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
    note: 'Here we are attacking: the opponents’ goal is at the bottom. That is why our LW plays on the right of the drawing.',
  },
};

export const playText = { de, en };
