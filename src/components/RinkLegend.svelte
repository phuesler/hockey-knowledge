<script lang="ts">
  /**
   * The key below a rink drawing. Shows only the symbols the drawings actually use,
   * so a simple diagram doesn't come with a long list.
   */
  import type { Scene } from './rink';
  import type { Locale } from '../lib/i18n';

  let { scenes, locale = 'de' }: { scenes: Scene[]; locale?: Locale } = $props();

  const de = {
    title: 'Legende',
    us: 'wir',
    them: 'Gegner',
    ghost: 'vorher',
    puck: 'Puck',
    skate: 'fahren',
    pass: 'Pass',
    lane: 'Weg zum Tor / Passweg',
    danger: 'Gefahrenzone',
    near: 'nahe Unterstützung',
    far: 'weite Unterstützung',
    gap: 'niemand da',
  };
  const en: typeof de = {
    title: 'Key',
    us: 'us',
    them: 'opponents',
    ghost: 'before',
    puck: 'puck',
    skate: 'skate',
    pass: 'pass',
    lane: 'way to goal / passing lane',
    danger: 'danger zone',
    near: 'near support',
    far: 'far support',
    gap: 'nobody there',
  };

  const s = $derived({ de, en }[locale]);

  type Key = keyof typeof de;
  const used = $derived.by(() => {
    const keys = new Set<Key>();
    for (const scene of scenes) {
      for (const p of scene.players) keys.add(p.ghost ? 'ghost' : p.team);
      if (scene.puck) keys.add('puck');
      for (const m of scene.moves ?? []) keys.add(m.kind);
      for (const a of scene.areas ?? []) {
        if (a.kind === 'danger' || a.kind === 'near' || a.kind === 'far' || a.kind === 'gap') keys.add(a.kind);
      }
    }
    const order: Key[] = ['us', 'them', 'ghost', 'puck', 'skate', 'pass', 'lane', 'danger', 'near', 'far', 'gap'];
    return order.filter((k) => keys.has(k));
  });
</script>

<ul class="legend" aria-label={s.title}>
  {#each used as key}
    <li>
      <svg viewBox="0 0 24 12" aria-hidden="true">
        {#if key === 'us' || key === 'them' || key === 'ghost'}
          <circle cx="12" cy="6" r="5" class={key} />
        {:else if key === 'puck'}
          <circle cx="12" cy="6" r="2.4" class="puck" />
        {:else if key === 'skate' || key === 'pass'}
          <path d="M2 6 H17" class="line {key}" />
          <polygon points="22,6 16,3 16,9" class="head" />
        {:else if key === 'lane'}
          <path d="M2 6 H22" class="line lane" />
        {:else}
          <rect x="2" y="1.5" width="20" height="9" rx="3" class="area {key}" />
        {/if}
      </svg>
      {s[key]}
    </li>
  {/each}
</ul>

<style>
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-1) var(--s-4);
    margin: var(--s-4) 0 0;
    padding: 0;
    list-style: none;
    font-size: var(--t-sm);
    color: var(--c-text-muted);
  }
  /* .prose spaces consecutive list items; .legend > li outranks it. */
  .legend > li {
    display: flex;
    align-items: center;
    gap: var(--s-1);
    margin: 0;
  }
  svg {
    width: 1.75rem;
    height: auto;
    flex: none;
  }

  .us {
    fill: var(--c-signal);
  }
  .them {
    fill: var(--c-text);
  }
  .ghost {
    fill: var(--c-surface);
    stroke: var(--c-signal);
    stroke-width: 1;
    stroke-dasharray: 2 1.5;
  }
  .puck {
    fill: var(--c-text);
  }
  .line {
    fill: none;
    stroke: var(--c-brand);
    stroke-width: 1.4;
  }
  .line.pass {
    stroke-dasharray: 3 2;
  }
  .line.lane {
    stroke: var(--c-text-muted);
    stroke-width: 1;
    stroke-dasharray: 0.5 2;
    stroke-linecap: round;
  }
  .head {
    fill: var(--c-brand);
  }
  .area {
    stroke-width: 1;
  }
  .area.danger {
    fill: var(--c-warn-soft);
    stroke: var(--c-warn);
    stroke-dasharray: 2 1.5;
  }
  .area.near {
    fill: var(--c-good-soft);
    stroke: var(--c-good);
  }
  .area.far {
    fill: var(--c-accent-soft);
    stroke: var(--c-accent);
  }
  .area.gap {
    fill: var(--c-brand-soft);
    stroke: var(--c-brand);
    stroke-dasharray: 2 1.5;
  }
</style>
