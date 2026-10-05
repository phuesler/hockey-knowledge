<script lang="ts">
  /**
   * Zuordnung in the defensive zone: pick where the puck is, and all five players slide
   * to the area they take over. Shows that the tasks belong to the spots, not to the
   * players – when the puck changes sides, LD and RD swap jobs.
   *
   * Server-rendered with the puck in the left corner, so the article is complete
   * without JavaScript. The sliding is a CSS transition in Rink.svelte, which only runs
   * when the visitor has not asked for reduced motion.
   */
  import Rink from './Rink.svelte';
  import RinkLegend from './RinkLegend.svelte';
  import type { Player, Pt, Scene } from './rink';
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
      `Eigene Zone, der Puck ist hier: ${spot}. Die fünf Spieler stehen in ihren Bereichen, wie in der Liste darunter beschrieben.`,
    tasks: {
      cornerLeft: {
        LD: 'Druck auf den Puck. Auf der Abwehrseite, den Gegner an der Bande halten.',
        C: 'Tief unterstützen: hilft LD und steht zwischen dem Gegner an der Bande und dem Slot.',
        RD: 'Vor dem Tor. Zwischen Gegner und Tor, Stock auf dem Eis.',
        LW: 'Zwischen Puck und dem gegnerischen Verteidiger an der blauen Linie.',
        RW: 'Hoher Slot. Hält die Mitte zu und behält den zweiten Verteidiger im Blick.',
      },
      pointLeft: {
        LW: 'Geht auf den Verteidiger mit dem Puck, Stock in die Schussbahn.',
        C: 'Übernimmt den Gegner an der Bande.',
        LD: 'Deckt den Gegner tief neben dem Tor.',
        RD: 'Vor dem Tor. Zwischen Gegner und Tor.',
        RW: 'Hoher Slot. Bereit, falls der Puck zum zweiten Verteidiger geht.',
      },
      behindNet: {
        LD: 'Folgt dem Puck hinter das Tor und macht Druck.',
        RD: 'Am anderen Pfosten. Lässt den Gegner nicht ums Tor herumfahren.',
        C: 'Vor dem Tor. Deckt den Gegner im Slot.',
        LW: 'In der Mitte, auf Höhe der Bullykreise.',
        RW: 'In der Mitte, auf Höhe der Bullykreise.',
      },
      cornerRight: {
        RD: 'Druck auf den Puck. Jetzt macht RD, was eben LD gemacht hat.',
        C: 'Tief unterstützen, jetzt auf der rechten Seite.',
        LD: 'Vor dem Tor. Zwischen Gegner und Tor, Stock auf dem Eis.',
        RW: 'Zwischen Puck und dem gegnerischen Verteidiger an der blauen Linie.',
        LW: 'Hoher Slot. Hält die Mitte zu.',
      },
    } satisfies Record<Spot, Record<Role, string>>,
    note: 'Die Aufgaben gehören zum Bereich, nicht zur Person. Wechselt der Puck die Seite, tauschen LD und RD die Aufgabe, ebenso LW und RW. Steht jemand gerade woanders, übernimmt der Spieler, der am nächsten ist.',
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
      `Our zone, the puck is here: ${spot}. The five players are in their areas, as described in the list below.`,
    tasks: {
      cornerLeft: {
        LD: 'Pressure on the puck. On the defensive side, keep the attacker on the boards.',
        C: 'Low support: helps LD and stays between the attacker on the boards and the slot.',
        RD: 'In front of the goal. Between the attacker and the goal, stick on the ice.',
        LW: 'Between the puck and the opposing defender at the blue line.',
        RW: 'High slot. Closes the middle and keeps an eye on the second defender.',
      },
      pointLeft: {
        LW: 'Goes out to the defender with the puck, stick in the shooting lane.',
        C: 'Takes over the attacker on the boards.',
        LD: 'Covers the attacker low next to the goal.',
        RD: 'In front of the goal. Between the attacker and the goal.',
        RW: 'High slot. Ready in case the puck goes to the second defender.',
      },
      behindNet: {
        LD: 'Follows the puck behind the goal and puts on pressure.',
        RD: 'At the far post. Doesn’t let the attacker come round the goal.',
        C: 'In front of the goal. Covers the attacker in the slot.',
        LW: 'In the middle, level with the faceoff circles.',
        RW: 'In the middle, level with the faceoff circles.',
      },
      cornerRight: {
        RD: 'Pressure on the puck. RD now does what LD just did.',
        C: 'Low support, now on the right side.',
        LD: 'In front of the goal. Between the attacker and the goal, stick on the ice.',
        RW: 'Between the puck and the opposing defender at the blue line.',
        LW: 'High slot. Closes the middle.',
      },
    },
    note: 'The jobs belong to the area, not to the person. When the puck changes sides, LD and RD swap jobs, and so do LW and RW. If someone is somewhere else at that moment, the nearest player takes over.',
  };

  const s = $derived({ de, en }[locale]);

  /* Rink metres, see rink.ts. Opponents o1–o5: o4 and o5 are their defenders at the blue line. */
  const layouts: Record<Spot, { us: Record<Role, Pt>; them: Pt[]; puck: Pt }> = {
    cornerLeft: {
      us: { LD: [-8.8, 3.9], C: [-8.2, 9.2], RD: [0.5, 5.6], LW: [-8.6, 16.4], RW: [2.4, 14] },
      them: [[-11.5, 2.9], [-12.5, 12], [2.2, 8], [-9, 21], [8, 21]],
      puck: [-10.3, 1.9],
    },
    pointLeft: {
      us: { LW: [-7.6, 17.8], C: [-10, 11.8], LD: [-3.3, 5.2], RD: [0.4, 5.6], RW: [3.6, 15.5] },
      them: [[-6, 6.6], [-12.8, 13], [2.2, 8], [-9, 20.6], [8, 21]],
      puck: [-8.2, 19.6],
    },
    behindNet: {
      us: { LD: [-2.8, 1.8], RD: [2.6, 4.3], C: [1, 7.2], LW: [-5.5, 13.5], RW: [5, 13.5] },
      them: [[0.6, 1.5], [-8.5, 3.4], [3.2, 9], [-9, 21], [8, 21]],
      puck: [-0.6, 1.3],
    },
    cornerRight: {
      us: { RD: [8.8, 3.9], C: [8.2, 9.2], LD: [-0.5, 5.6], RW: [8.6, 16.4], LW: [-2.4, 14] },
      them: [[11.5, 2.9], [12.5, 12], [-2.2, 8], [-8, 21], [9, 21]],
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
    return { players, puck: layout.puck };
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
