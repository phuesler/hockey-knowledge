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
import type { Player, Pt, Scene, View } from './rink';
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

/** Candidate spots as ghost players labelled A, B, C (ids `cand-A` …). */
export function candidates(spots: readonly Pt[]): Player[] {
  return spots.map((at, i) => {
    const label = String.fromCharCode(65 + i);
    return { id: `cand-${label}`, team: 'us', label, ghost: true, at };
  });
}

const us = (label: string, at: Pt): Player => ({ id: label, team: 'us', label, at });
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
} satisfies Record<string, QuestionGeometry[]>;

export type QuizId = keyof typeof geometry;
export const quizzes: Record<QuizId, QuestionGeometry[]> = geometry;

interface QuizText {
  title: string;
  questions: QuestionText[];
}

const de: Record<QuizId, QuizText> = {
  regeln: {
    title: 'Quiz: Abseits, Icing und Strafen',
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
};

const en: typeof de = {
  regeln: {
    title: 'Quiz: offside, icing and penalties',
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
