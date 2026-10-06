<script lang="ts">
  /**
   * Zuordnung in the defensive zone: the zone is split into five coloured areas, one per
   * position. Pick where the puck is, and the players slide to their spots: whoever has
   * the puck in their area puts on pressure, the far-side defender takes the front of the
   * goal, and the centre is near support at the puck – unless an attacker in front of the
   * goal is open, then the centre takes them.
   *
   * Server-rendered with the puck in the left corner, so the article is complete
   * without JavaScript. The sliding is a CSS transition in Rink.svelte, which only runs
   * when the visitor has not asked for reduced motion.
   */
  import Rink from './Rink.svelte';
  import RinkLegend from './RinkLegend.svelte';
  import { COVERAGE_AREAS, type Player, type Pt, type Scene } from './rink';
  import type { Locale } from '../lib/i18n';

  let { locale = 'de' }: { locale?: Locale } = $props();

  type Spot = 'cornerLeft' | 'pointLeft' | 'behindNet' | 'cornerRight';
  type Role = 'LD' | 'RD' | 'C' | 'LW' | 'RW';
  const roles: Role[] = ['LD', 'RD', 'C', 'LW', 'RW'];

  const de = {
    title: 'Zuordnung: Wo ist der Puck?',
    choose: 'Wo ist der Puck?',
    spots: {
      cornerLeft: 'Linke Ecke',
      pointLeft: 'Linke blaue Linie',
      behindNet: 'Hinter dem Tor',
      cornerRight: 'Rechte Ecke',
    },
    label: (spot: string) =>
      `Eigene Zone, in fünf farbige Bereiche geteilt. Der Puck ist hier: ${spot}. Jeder Spieler steht in seinem Bereich, wie in der Liste darunter beschrieben.`,
    tasks: {
      cornerLeft: {
        LD: 'Der Puck ist in seinem Bereich: Druck auf den Puck, auf der Abwehrseite.',
        C: 'Nahe Unterstützung für LD: tief neben dem Zweikampf, bereit zu helfen.',
        RD: 'Vor dem Tor auf seiner Seite. Deckt den Gegner vor dem Tor, Stock auf dem Eis.',
        LW: 'Hoch auf der Puckseite. Hat den Gegner an der Bande und den an der blauen Linie im Blick.',
        RW: 'Hoch auf der anderen Seite, nah an der Mitte. Hält den hohen Slot zu.',
      },
      pointLeft: {
        LW: 'Der Puck ist in seinem Bereich: geht auf den Verteidiger mit dem Puck, Stock in die Schussbahn.',
        LD: 'Rückt in seinem Bereich nach oben und deckt den Gegner an der Bande.',
        C: 'Vor dem Tor: Dort steht ein Gegner frei, weil RD schon einen Gegner deckt.',
        RD: 'Nah am Tor auf seiner Seite. Deckt den Gegner dort.',
        RW: 'Hoch auf der anderen Seite. Bereit, falls der Puck zum zweiten Verteidiger geht.',
      },
      behindNet: {
        LD: 'Der Puck ist hinter dem Tor auf seiner Seite: Druck auf den Puck.',
        C: 'Nahe Unterstützung für LD, am linken Pfosten.',
        RD: 'Vor dem Tor auf seiner Seite. Deckt den Gegner vor dem Tor und lässt niemanden ums Tor herumfahren.',
        LW: 'In seinem Bereich, nah an der Mitte, auf Höhe der Bullykreise.',
        RW: 'In seinem Bereich, nah an der Mitte, auf Höhe der Bullykreise.',
      },
      cornerRight: {
        RD: 'Der Puck ist in seinem Bereich: Druck auf den Puck, auf der Abwehrseite.',
        C: 'Nahe Unterstützung für RD: tief neben dem Zweikampf, bereit zu helfen.',
        LD: 'Vor dem Tor auf seiner Seite. Deckt den Gegner vor dem Tor, Stock auf dem Eis.',
        RW: 'Hoch auf der Puckseite. Hat den Gegner an der Bande und den an der blauen Linie im Blick.',
        LW: 'Hoch auf der anderen Seite, nah an der Mitte. Hält den hohen Slot zu.',
      },
    } satisfies Record<Spot, Record<Role, string>>,
    note: 'Jeder hat seinen Bereich. Ist der Puck in deinem Bereich, machst du Druck. Der Center ist die nahe Unterstützung beim Puck. Vor das Tor geht er nur, wenn dort ein Gegner frei steht, den der Verteidiger der anderen Seite nicht deckt.',
  };

  const en: typeof de = {
    title: 'Coverage: where is the puck?',
    choose: 'Where is the puck?',
    spots: {
      cornerLeft: 'Left corner',
      pointLeft: 'Left blue line',
      behindNet: 'Behind the goal',
      cornerRight: 'Right corner',
    },
    label: (spot) =>
      `Our zone, split into five coloured areas. The puck is here: ${spot}. Each player is in their area, as described in the list below.`,
    tasks: {
      cornerLeft: {
        LD: 'The puck is in their area: pressure on the puck, on the defensive side.',
        C: 'Near support for LD: low, next to the battle, ready to help.',
        RD: 'In front of the goal on their side. Covers the attacker in front of the goal, stick on the ice.',
        LW: 'High on the puck side. Watches the attacker on the boards and the one at the blue line.',
        RW: 'High on the other side, close to the middle. Closes the high slot.',
      },
      pointLeft: {
        LW: 'The puck is in their area: goes out to the defender with the puck, stick in the shooting lane.',
        LD: 'Moves up within their area and covers the attacker on the boards.',
        C: 'In front of the goal: an attacker is open there, because RD is already covering someone.',
        RD: 'Close to the goal on their side. Covers the attacker there.',
        RW: 'High on the other side. Ready in case the puck goes to the second defender.',
      },
      behindNet: {
        LD: 'The puck is behind the goal on their side: pressure on the puck.',
        C: 'Near support for LD, at the left post.',
        RD: 'In front of the goal on their side. Covers the attacker in front of the goal and doesn’t let anyone come round the goal.',
        LW: 'In their area, close to the middle, level with the faceoff circles.',
        RW: 'In their area, close to the middle, level with the faceoff circles.',
      },
      cornerRight: {
        RD: 'The puck is in their area: pressure on the puck, on the defensive side.',
        C: 'Near support for RD: low, next to the battle, ready to help.',
        LD: 'In front of the goal on their side. Covers the attacker in front of the goal, stick on the ice.',
        RW: 'High on the puck side. Watches the attacker on the boards and the one at the blue line.',
        LW: 'High on the other side, close to the middle. Closes the high slot.',
      },
    },
    note: 'Everyone has their own area. If the puck is in your area, you put on pressure. The centre is the near support at the puck. They only go to the front of the goal if an attacker is open there that the far-side defender isn’t covering.',
  };

  const s = $derived({ de, en }[locale]);

  /* Rink metres, see rink.ts. Defenders and wingers stay inside their own area from
     COVERAGE_AREAS; the centre leaves the middle strip to support at the puck.
     Opponents o1–o5: o4 and o5 are their defenders at the blue line. */
  const layouts: Record<Spot, { us: Record<Role, Pt>; them: Pt[]; puck: Pt }> = {
    cornerLeft: {
      us: { LD: [-8.8, 3.9], C: [-6.4, 7], RD: [1.9, 5.2], LW: [-10, 15], RW: [4, 15] },
      them: [[-11.5, 2.9], [-12.5, 12.5], [2.2, 8], [-9, 21], [8, 21]],
      puck: [-10.3, 1.9],
    },
    pointLeft: {
      us: { LW: [-7.6, 17.8], LD: [-10.4, 10.4], C: [-0.3, 5.6], RD: [3.6, 4.2], RW: [4.5, 16] },
      them: [[5.5, 6.5], [-12.8, 13], [0.4, 8.4], [-9, 20.6], [8, 21]],
      puck: [-8.2, 19.6],
    },
    behindNet: {
      us: { LD: [-5.8, 2.4], C: [-3.2, 5.4], RD: [2.4, 6], LW: [-6, 14], RW: [5.5, 14] },
      them: [[-3, 1.6], [-9.5, 9.5], [3.2, 9], [-9, 21], [8, 21]],
      puck: [-1.7, 1.3],
    },
    cornerRight: {
      us: { RD: [8.8, 3.9], C: [6.4, 7], LD: [-1.9, 5.2], RW: [10, 15], LW: [-4, 15] },
      them: [[11.5, 2.9], [12.5, 12.5], [-2.2, 8], [-8, 21], [9, 21]],
      puck: [10.3, 1.9],
    },
  };

  const spots = Object.keys(layouts) as Spot[];
  let spot = $state<Spot>('cornerLeft');

  const scene = $derived.by((): Scene => {
    const layout = layouts[spot];
    const players: Player[] = [
      ...layout.them.map((at, i) => ({ id: `o${i}`, team: 'them' as const, at })),
      ...roles.map((role) => ({ id: role, team: 'us' as const, label: role, at: layout.us[role] })),
    ];
    return { players, puck: layout.puck, areas: COVERAGE_AREAS };
  });
</script>

<figure class="explorer">
  <figcaption>{s.title}</figcaption>

  <div class="layout">
    <div>
      <div class="spots" role="group" aria-label={s.choose}>
        {#each spots as option}
          <button type="button" aria-pressed={spot === option} onclick={() => (spot = option)}>
            {s.spots[option]}
          </button>
        {/each}
      </div>
      <Rink {scene} label={s.label(s.spots[spot])} />
      <RinkLegend scenes={[scene]} {locale} />
    </div>

    <ul class="tasks" aria-live="polite">
      {#each roles as role}
        <li>
          <span class="role">{role}</span>
          <span>{s.tasks[spot][role]}</span>
        </li>
      {/each}
    </ul>
  </div>

  <p class="note">{s.note}</p>
</figure>

<style>
  .explorer {
    margin: var(--s-6) 0;
    padding: var(--s-5);
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
  }

  figcaption {
    font-size: var(--t-sm);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--c-text-muted);
    font-weight: 700;
    margin-bottom: var(--s-4);
  }

  .layout {
    display: grid;
    gap: var(--s-5);
  }
  @media (min-width: 44rem) {
    .layout {
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
      align-items: start;
    }
  }

  .spots {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--s-2);
    margin-bottom: var(--s-4);
  }
  button {
    min-height: 2.75rem;
    padding: var(--s-2);
    font: inherit;
    font-size: var(--t-sm);
    font-weight: 600;
    color: var(--c-text);
    background: var(--c-surface-2);
    border: 1px solid var(--c-border);
    border-radius: var(--radius);
    cursor: pointer;
  }
  button[aria-pressed='true'] {
    color: var(--c-header-text);
    background: var(--c-signal);
    border-color: var(--c-signal);
  }
  button:focus-visible {
    outline: 2px solid var(--c-accent);
    outline-offset: 2px;
  }

  .tasks {
    display: grid;
    gap: var(--s-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  /* .prose spaces consecutive list items; .tasks > li outranks it. */
  .tasks > li {
    display: grid;
    grid-template-columns: 2.5rem 1fr;
    gap: var(--s-2);
    align-items: baseline;
    margin: 0;
  }
  .role {
    display: inline-grid;
    place-items: center;
    height: 1.75rem;
    font-size: var(--t-sm);
    font-weight: 700;
    color: var(--c-header-text);
    background: var(--c-signal);
    border-radius: 999px;
  }

  .note {
    margin: var(--s-4) 0 0;
    font-size: var(--t-sm);
    color: var(--c-text-muted);
  }
</style>
