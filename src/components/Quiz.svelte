<script lang="ts">
  /**
   * A short quiz at the end of an article: one question at a time, and after every answer
   * an explanation of why it is right or wrong. A question can show a rink picture; once
   * it is answered, the explanation can bring a second picture of how it should look, right
   * below the text, so it is in view on a phone. No points, timer or sounds: the
   * explanation is what makes a quiz teach. The questions live in quizzes.ts.
   *
   *   <Quiz client:visible={{ rootMargin: '300px' }} quiz="regeln" />
   *
   * Server-rendered as a list of every question, each with its solution in a <details>,
   * so the article stays complete without JavaScript. Once the island is running it
   * switches to one question at a time.
   */
  import { tick } from 'svelte';
  import Rink from './Rink.svelte';
  import RinkLegend from './RinkLegend.svelte';
  import { candidates, quizText, quizzes, type QuizFigure, type QuizId } from './quizzes';
  import type { Scene } from './rink';
  import type { Locale } from '../lib/i18n';

  let { quiz, locale = 'de' }: { quiz: QuizId; locale?: Locale } = $props();
  const uid = $props.id();

  const de = {
    zone: {
      own: 'Unten ist unser Tor',
      attack: 'Oben ist das gegnerische Tor, wir greifen nach oben an',
      full: 'Das ganze Eis: unten unser Tor, oben das gegnerische',
      neutral: 'Die neutrale Zone: unser Tor liegt unten, wir greifen nach oben an',
    },
    progress: (n: number, of: number) => `Frage ${n} von ${of}`,
    correct: 'Richtig!',
    notQuite: 'Nicht ganz.',
    rightAnswer: 'Richtige Antwort',
    yourAnswer: 'Deine Antwort',
    answerIs: 'Richtig ist:',
    next: 'Nächste Frage',
    result: 'Zum Ergebnis',
    score: (right: number, of: number) => `${right} von ${of} richtig`,
    allRight: 'Alles richtig. Stark!',
    reread: 'Lies hier noch einmal nach:',
    later: 'Mach das Quiz in ein paar Tagen noch einmal. Wer sich später wieder erinnert, behält es länger.',
    again: 'Noch einmal',
    solution: 'Lösung',
    after: 'So sieht es richtig aus:',
  };
  const en: typeof de = {
    zone: {
      own: 'Our goal is at the bottom',
      attack: 'The opponents’ goal is at the top, we attack upwards',
      full: 'The whole rink: our goal at the bottom, the opponents’ at the top',
      neutral: 'The neutral zone: our goal is below, we attack upwards',
    },
    progress: (n, of) => `Question ${n} of ${of}`,
    correct: 'Right!',
    notQuite: 'Not quite.',
    rightAnswer: 'Right answer',
    yourAnswer: 'Your answer',
    answerIs: 'The right answer:',
    next: 'Next question',
    result: 'See your result',
    score: (right, of) => `${right} of ${of} right`,
    allRight: 'All right. Well done!',
    reread: 'Have another look here:',
    later: 'Do the quiz again in a few days. Remembering it again later makes it stick.',
    again: 'Try again',
    solution: 'Answer',
    after: 'This is how it should look:',
  };

  const s = $derived({ de, en }[locale]);
  const geo = $derived(quizzes[quiz]);
  const text = $derived(quizText[locale][quiz]);
  const count = $derived(geo.length);

  /* The server renders every question as a list; the browser switches to one at a time. */
  let mounted = $state(false);
  $effect(() => {
    mounted = true;
  });

  let index = $state(0);
  /* The option picked for each question, by question index. */
  let answers = $state<Record<number, number>>({});
  let finished = $state(false);

  const question = $derived(text.questions[index]);
  const g = $derived(geo[index]);
  const picked = $derived(answers[index]);
  const answered = $derived(picked !== undefined);
  const score = $derived(geo.filter((q, i) => answers[i] === q.correct).length);
  /* The sections to reread, once each, in article order of the questions. */
  const missed = $derived(
    text.questions
      .filter((q, i) => answers[i] !== geo[i].correct)
      .filter((q, i, all) => all.findIndex((o) => o.section === q.section) === i),
  );

  let promptEl: HTMLElement | undefined = $state();
  let feedbackEl: HTMLElement | undefined = $state();
  let summaryEl: HTMLElement | undefined = $state();

  /* The picture before answering, with the spots to choose from. */
  function before(f: QuizFigure): Scene {
    if (!f.candidates) return f.scene;
    return { ...f.scene, players: [...f.scene.players, ...candidates(f.candidates)] };
  }
  /* The key leaves out the candidate spots: the question names them. */
  const legend = (f: QuizFigure) => (f.after ? [f.scene, f.after] : [f.scene]);

  async function choose(option: number) {
    if (answered) return;
    answers[index] = option;
    await tick();
    feedbackEl?.focus();
  }

  async function next() {
    if (index < count - 1) {
      index += 1;
      await tick();
      promptEl?.focus();
    } else {
      finished = true;
      await tick();
      summaryEl?.focus();
    }
  }

  async function restart() {
    answers = {};
    index = 0;
    finished = false;
    await tick();
    promptEl?.focus();
  }
</script>

<div class="quiz" role="group" aria-labelledby="{uid}-title">
  <p class="title" id="{uid}-title">{text.title}</p>

  {#if !mounted}
    <ol class="all">
      {#each text.questions as q, i}
        {@const f = geo[i].figure}
        <li>
          <p class="prompt">{q.prompt}</p>
          {#if f}
            <div class="figure" class:tall={f.view === 'full'}>
              <p class="zone">{s.zone[f.zone]}</p>
              <Rink scene={before(f)} label={q.label ?? ''} view={f.view} flip={f.zone === 'attack'} />
            </div>
          {/if}
          <ul class="plain">
            {#each q.options as o}<li>{o.text}</li>{/each}
          </ul>
          <details>
            <summary>{s.solution}</summary>
            <p><strong>{q.options[geo[i].correct].text}</strong></p>
            <p>{q.options[geo[i].correct].feedback}</p>
            {#if f?.after}
              <div class="figure" class:tall={f.view === 'full'}>
                <Rink scene={f.after} label={q.afterLabel ?? ''} view={f.view} flip={f.zone === 'attack'} />
              </div>
            {/if}
          </details>
        </li>
      {/each}
    </ol>
  {:else if !finished}
    <p class="progress" aria-live="polite">{s.progress(index + 1, count)}</p>
    <p class="prompt" id="{uid}-prompt" tabindex="-1" bind:this={promptEl}>{question.prompt}</p>

    <div class="layout" class:pictured={g.figure}>
      {#if g.figure}
        {@const f = g.figure}
        <!-- A fresh drawing per question, so players don't slide over from the last one. -->
        {#key index}
          <div class="figure" class:tall={f.view === 'full'}>
            <p class="zone">{s.zone[f.zone]}</p>
            <Rink scene={before(f)} label={question.label ?? ''} view={f.view} flip={f.zone === 'attack'} />
            <RinkLegend scenes={legend(f)} {locale} />
          </div>
        {/key}
      {/if}

      <div>

        <ul class="options plain" aria-labelledby="{uid}-prompt">
          {#each question.options as option, i}
            {@const right = answered && i === g.correct}
            {@const wrong = answered && i === picked && i !== g.correct}
            <li>
              <button
                type="button"
                class:right
                class:wrong
                class:faded={answered && !right && !wrong}
                aria-disabled={answered}
                onclick={() => choose(i)}
              >
                {option.text}
                {#if right}
                  <span class="mark">✓ {s.rightAnswer}</span>
                {:else if wrong}
                  <span class="mark">✗ {s.yourAnswer}</span>
                {/if}
              </button>
            </li>
          {/each}
        </ul>

        {#if answered}
          <div class="feedback" class:good={picked === g.correct} tabindex="-1" bind:this={feedbackEl}>
            <p class="verdict">{picked === g.correct ? `✓ ${s.correct}` : `✗ ${s.notQuite}`}</p>
            <p>{question.options[picked].feedback}</p>
            {#if picked !== g.correct}
              <p>
                <strong>{s.answerIs} {question.options[g.correct].text}</strong>
                {question.options[g.correct].feedback}
              </p>
            {/if}
            {#if g.figure?.after}
              {@const f = g.figure}
              {@const after = g.figure.after}
              <div class="figure after" class:tall={f.view === 'full'}>
                <p class="zone">{s.after}</p>
                <Rink scene={after} label={question.afterLabel ?? ''} view={f.view} flip={f.zone === 'attack'} />
              </div>
            {/if}
            <button type="button" class="action" onclick={next}>
              {index < count - 1 ? s.next : s.result}
            </button>
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <div class="summary" tabindex="-1" bind:this={summaryEl}>
      <p class="score">{s.score(score, count)}</p>
      {#if missed.length === 0}
        <p>{s.allRight}</p>
      {:else}
        <p>{s.reread}</p>
        <ul>
          {#each missed as q}<li><a href="#{q.section}">{q.topic}</a></li>{/each}
        </ul>
      {/if}
      <p class="hint">{s.later}</p>
      <button type="button" class="action" onclick={restart}>{s.again}</button>
    </div>
  {/if}
</div>

<style>
  .quiz {
    margin: var(--s-6) 0;
    padding: var(--s-5);
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
  }

  .title {
    margin: 0 0 var(--s-4);
    font-size: var(--t-sm);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--c-text-muted);
    font-weight: 700;
  }
  .progress,
  .zone {
    margin: 0 0 var(--s-2);
    font-size: var(--t-sm);
    color: var(--c-text-muted);
  }
  .prompt {
    margin: 0 0 var(--s-4);
    font-weight: 700;
  }

  .layout {
    display: grid;
    gap: var(--s-5);
  }
  @media (min-width: 44rem) {
    .layout.pictured {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
      align-items: start;
    }
  }

  /* A drawing stays phone-sized; the full rink is twice as tall as wide, so narrower. */
  .figure {
    max-width: 26rem;
  }
  .figure.tall {
    max-width: 16rem;
  }

  /* .prose spaces and marks list items; these lists bring their own spacing. */
  .plain {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .plain > li {
    margin: 0;
  }
  .options {
    display: grid;
    gap: var(--s-2);
  }

  button {
    font: inherit;
    cursor: pointer;
  }
  .options button {
    display: grid;
    gap: var(--s-1);
    width: 100%;
    min-height: 2.75rem;
    padding: var(--s-2) var(--s-3);
    text-align: left;
    color: var(--c-text);
    background: var(--c-surface-2);
    border: 1px solid var(--c-border);
    border-radius: var(--radius);
  }
  .options button[aria-disabled='true'] {
    cursor: default;
  }
  .options button.right {
    background: var(--c-good-soft);
    border: 2px solid var(--c-good);
  }
  .options button.wrong {
    background: var(--c-brand-soft);
    border: 2px solid var(--c-brand);
  }
  .options button.faded {
    color: var(--c-text-muted);
  }
  .mark {
    font-size: var(--t-sm);
    font-weight: 700;
  }
  .right .mark {
    color: var(--c-good);
  }
  .wrong .mark {
    color: var(--c-brand);
  }

  .feedback {
    margin-top: var(--s-4);
    padding: var(--s-4);
    background: var(--c-brand-soft);
    border-left: 4px solid var(--c-brand);
    border-radius: var(--radius);
  }
  .feedback.good {
    background: var(--c-good-soft);
    border-left-color: var(--c-good);
  }
  .feedback p {
    margin: 0 0 var(--s-3);
  }
  .feedback .after {
    margin-bottom: var(--s-4);
    padding: var(--s-3);
    background: var(--c-surface);
    border-radius: var(--radius);
  }
  .verdict {
    font-weight: 700;
  }

  .action {
    min-height: 2.75rem;
    padding: var(--s-2) var(--s-4);
    font-weight: 700;
    color: var(--c-header-text);
    background: var(--c-signal);
    border: 1px solid var(--c-signal);
    border-radius: var(--radius);
  }
  button:focus-visible,
  [tabindex='-1']:focus-visible {
    outline: 2px solid var(--c-accent);
    outline-offset: 2px;
  }
  [tabindex='-1']:focus:not(:focus-visible) {
    outline: none;
  }

  .summary .score {
    margin: 0 0 var(--s-2);
    font-size: var(--t-h3);
    font-weight: 700;
  }
  .summary p,
  .summary ul {
    margin: 0 0 var(--s-3);
  }
  .hint {
    font-size: var(--t-sm);
    color: var(--c-text-muted);
  }

  /* Without JavaScript: every question with its solution. */
  .all {
    display: grid;
    gap: var(--s-6);
    margin: 0;
    padding-left: var(--s-5);
  }
  .all > li {
    margin: 0;
  }
  .all .figure {
    margin-bottom: var(--s-3);
  }
  .all .plain {
    display: grid;
    gap: var(--s-1);
    margin-bottom: var(--s-3);
  }
  .all .plain > li::before {
    content: '○ ';
    color: var(--c-text-muted);
  }
  details p {
    margin: var(--s-2) 0 0;
  }
  summary {
    cursor: pointer;
    font-weight: 700;
    color: var(--c-brand);
  }
</style>
