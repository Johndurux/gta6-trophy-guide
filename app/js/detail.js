// The guide page: one trophy, written out rather than listed. A big title and the official
// description, then the "how to get it" block — a short lede, the numbered walk-through and
// the prose behind it — then, when the trophy is missable, the point-of-no-return warning,
// and finally the sources on one quiet line. A trophy the spoiler guard still holds is shown
// sealed, with the guard's state on show as a pill.

import { el, clear, hostOf } from './ui.js';
import { kindLabel, stageOf, hoursLabel, stageLabel, hiddenLabel } from './data.js';

// What the guard or the warning box says for the one trophy a run can lose. Keyed by
// trophy id, so a second missable trophy added to the data just gets the generic box.
const MISSABLE_NOTES = {
  28: {
    window:
      'Chapter 1 closes the balcony meditation at home: the morning after Down to Earth, follow Lucia from the kitchen and take it. No other spot in Leonida offers that scene again.',
    steps: [
      'Take it before the chapter’s last mission — there is no second offer.',
      'If Chapter 1 is already closed, the other 17 spots still count, but the trophy needs all 18.',
      'Meditations stay available in free roam, so the rest of the set can wait.',
    ],
    save: 'Manual-save at the end of Chapter 1 — a five-minute rewind beats a second 200-hour run.',
  },
};

export function renderDetail({ node, trophy, guide, store, onToggle, onSpoilerOff, onStep, onNextUnearned }) {
  clear(node);
  if (!trophy) {
    node.append(
      el(
        'div',
        { class: 'detail-sealed' },
        el('span', { class: 'sealed-mark', text: '✦' }),
        el('h3', { text: 'Pick a trophy' }),
        el('p', { text: 'Choose a row on the left to read its guide: the walk-through, the warning if it can be lost, and the sources its facts come from.' }),
      ),
    );
    return;
  }

  const sealed = store.isSealed(trophy);
  const card = el('article', { class: 'guide' });
  card.append(sealed ? sealedHead(trophy, onToggle, onSpoilerOff) : guideHead(trophy, onToggle));

  if (!sealed) {
    card.append(howTo(trophy));
    const warning = warningBox(trophy);
    if (warning) card.append(warning);
    card.append(sources(trophy));
  }

  card.append(footer(trophy, guide, store, onStep, onNextUnearned));
  node.append(card);
}

// --- the head of a guide page --------------------------------------------------------

function guideHead(trophy, onToggle) {
  const stage = stageOf(trophy.stage);

  const tags = el(
    'div',
    { class: 'guide-tags' },
    el('span', { class: `tag tag-grade grade-${trophy.grade}`, text: `${capitalise(trophy.grade)} trophy` }),
    el('span', { class: 'tag tag-kind', text: kindLabel(trophy.kind) }),
    trophy.missable ? el('span', { class: 'tag tag-missable', text: 'Missable — can be lost' }) : null,
    el('span', { class: 'tag tag-stage', text: `Stage ${trophy.stage} · ${stage.window}` }),
    el('span', { class: 'tag tag-hours', text: `${hoursLabel(trophy)} of the run` }),
  );

  const earned = el('input', {
    type: 'checkbox',
    checked: false,
    onchange: (event) => onToggle(trophy, event.target.checked),
  });

  return el(
    'header',
    { class: 'guide-head' },
    el('p', { class: 'guide-breadcrumb', text: `Stage ${trophy.stage} · ${stageLabel(trophy.stage)}` }),
    el(
      'div',
      { class: 'guide-titlerow' },
      el('h2', { class: 'guide-title', text: trophy.name }),
      el('label', { class: 'guide-earned' }, earned, el('span', { class: 'earned-mark' }), 'Mark earned'),
    ),
    el(
      'p',
      { class: 'guide-desc' },
      el('span', { class: 'guide-desc-tag', text: 'Official' }),
      trophy.description,
    ),
    tags,
  );
}

function sealedHead(trophy, onToggle, onSpoilerOff) {
  const stage = stageOf(trophy.stage);
  return el(
    'header',
    { class: 'guide-head guide-head-sealed' },
    el('p', { class: 'guide-breadcrumb', text: `Stage ${trophy.stage} · ${stageLabel(trophy.stage)}` }),
    el(
      'div',
      { class: 'guide-titlerow' },
      el('h2', { class: 'guide-title', text: hiddenLabel(trophy) }),
      el('span', { class: 'pill pill-sealed', text: 'Spoiler guard · sealed' }),
    ),
    el('p', {
      class: 'guide-desc',
      text: 'PlayStation keeps this one off the list until it is earned. The guard is holding its name, its official description and its guide back; marking it earned — or opening the guard — releases them.',
    }),
    el(
      'div',
      { class: 'sealed-actions' },
      el('button', { class: 'button button-primary', type: 'button', onclick: () => onToggle(trophy, true) }, 'I earned it — reveal'),
      el('button', { class: 'button button-ghost', type: 'button', onclick: () => onSpoilerOff() }, 'Show all spoilers'),
    ),
  );
}

// --- how to get it ------------------------------------------------------------------

function howTo(trophy) {
  const section = el('section', { class: 'block' }, el('h3', { class: 'block-title', text: 'How to get it' }));

  if (trophy.summary) section.append(el('p', { class: 'guide-lede', text: trophy.summary }));

  if (trophy.steps.length) {
    const steps = el('ol', { class: 'guide-steps' });
    for (const step of trophy.steps) steps.append(el('li', {}, el('span', { class: 'step-mark' }), el('span', { text: step })));
    section.append(steps);
  }

  for (const paragraph of paragraphs(trophy.guide)) section.append(el('p', { class: 'guide-body', text: paragraph }));

  if (trophy.tips) section.append(el('p', { class: 'guide-tip' }, el('b', { text: 'Tip' }), trophy.tips));
  return section;
}

function warningBox(trophy) {
  if (!trophy.missable) return null;
  const note = MISSABLE_NOTES[trophy.id] ?? genericNote(trophy);

  const list = el('ul', { class: 'warning-list' });
  for (const step of note.steps) list.append(el('li', { text: step }));

  return el(
    'section',
    { class: 'block block-warning' },
    el('h3', { class: 'warning-title' }, el('span', { class: 'warning-mark', text: '⚠' }), 'Before the point of no return'),
    el('p', { class: 'warning-window', text: note.window }),
    list,
    el('p', { class: 'warning-save', text: note.save }),
  );
}

function genericNote(trophy) {
  const stage = stageOf(trophy.stage);
  return {
    window: `This trophy can be lost. It closes with the end of ${stage.title.split(' — ')[0]}.`,
    steps: ['Take it before the stage closes.', 'Keep a manual save from before the closing mission.'],
    save: 'A manual save before the stage closes is the cheap insurance.',
  };
}

// --- sources, on one quiet line ------------------------------------------------------

function sources(trophy) {
  const line = el('p', { class: 'guide-sources' }, el('span', { class: 'sources-tag', text: 'Sources:' }));
  trophy.sources.forEach((source, index) => {
    if (index > 0) line.append(el('span', { class: 'sources-dot', text: '·' }));
    line.append(
      el('a', {
        href: source.url,
        target: '_blank',
        rel: 'noopener noreferrer',
        title: `${source.name} — ${hostOf(source.url)}`,
        text: shortName(source.name),
      }),
    );
  });

  return el(
    'section',
    { class: 'block block-sources' },
    line,
    el('p', { class: 'sources-note', text: 'Each name links to the page this guide drew on. The app itself loads nothing at run time.' }),
  );
}

// --- the foot: where to go next ------------------------------------------------------

function footer(trophy, guide, store, onStep, onNextUnearned) {
  const index = guide.trophies.findIndex((entry) => entry.id === trophy.id);
  const left = guide.trophies.filter((entry) => store && !store.isEarned(entry.id)).length;

  return el(
    'footer',
    { class: 'guide-foot' },
    el('button', { class: 'button button-ghost', type: 'button', onclick: () => onStep(-1) }, '‹ Previous'),
    el('button', { class: 'button button-ghost', type: 'button', onclick: () => onStep(1) }, 'Next ›'),
    onNextUnearned
      ? el('button', { class: 'button button-primary', type: 'button', onclick: () => onNextUnearned() }, `Next unearned (${left})`)
      : null,
    el('span', { class: 'guide-foot-count', text: `${index + 1} of ${guide.total}` }),
  );
}

// --- small helpers -------------------------------------------------------------------

/** A trophy's guide prose as short paragraphs: sentences grouped two at a time, at most three. */
export function paragraphs(text) {
  const sentences = String(text).trim().split(/(?<=\.)\s+(?=[A-Z(])/);
  if (sentences.length <= 1) return [String(text).trim()];

  const out = [];
  for (const sentence of sentences) {
    const last = out[out.length - 1];
    if (last && last.length + sentence.length < 300) out[out.length - 1] = `${last} ${sentence}`;
    else out.push(sentence);
  }
  // Three paragraphs at most: the tail joins the last one rather than standing alone.
  while (out.length > 3) out.splice(2, 2, `${out[2]} ${out[3]}`);
  return out;
}

function shortName(name) {
  return String(name).split(' — ')[0];
}

function capitalise(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
