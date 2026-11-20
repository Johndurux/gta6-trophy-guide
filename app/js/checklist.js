// The checklist: one row per trophy with the earned box, grade dot, kind-free headline and
// the roadmap stage. Rows are rebuilt from the data on every change, which keeps the list
// and the progress counts honest without a framework.
//
// A row the spoiler guard holds names nothing: it reads "Hidden story trophy" and the stage
// it sits in — a whole phrase, never a clipped sentence.

import { el, clear } from './ui.js';
import { matches } from './filters.js';
import { hiddenLabel, stageOf } from './data.js';

export function renderChecklist({ listNode, guide, store, filter, openId, onOpen, onToggle }) {
  clear(listNode);
  const visible = guide.trophies.filter((trophy) => matches(trophy, filter, store));

  if (!visible.length) {
    listNode.append(
      el(
        'p',
        { class: 'detail-sealed' },
        el('span', { class: 'sealed-mark', text: '∅' }),
        el('h3', { text: 'Nothing matches' }),
        el('p', { text: 'Clear the search or pick another kind to see trophies again.' }),
      ),
    );
    return visible;
  }

  for (const trophy of visible) {
    listNode.append(buildRow(trophy, { store, openId, onOpen, onToggle }));
  }
  return visible;
}

function buildRow(trophy, { store, openId, onOpen, onToggle }) {
  const earned = store.isEarned(trophy.id);
  const sealed = store.isSealed(trophy);
  const classes = ['trophy-row'];
  if (earned) classes.push('is-earned');
  if (openId === trophy.id) classes.push('is-open');
  if (sealed) classes.push('row-sealed');

  const check = el('input', {
    type: 'checkbox',
    checked: earned,
    'aria-label': `Mark ${sealed ? 'this hidden trophy' : trophy.name} earned`,
    onchange: (event) => onToggle(trophy, event.target.checked),
  });

  // The second line is one short phrase either way, so it can never be clipped: the stage
  // for a sealed trophy, the official description for an open one.
  const subline = sealed ? `Stage ${trophy.stage} · ${stageOf(trophy.stage).window}` : trophy.description;

  const meta = el('span', { class: 'row-meta' });
  if (trophy.missable) meta.append(el('span', { class: 'chip chip-missable', text: 'Missable' }));
  meta.append(el('span', { class: 'row-stage', text: `S${trophy.stage}` }));

  return el(
    'div',
    { class: classes.join(' '), role: 'listitem', dataset: { id: String(trophy.id) } },
    el('label', { class: 'row-check' }, check, el('span', { class: 'check-box' })),
    el(
      'button',
      { class: 'row-body', type: 'button', onclick: () => onOpen(trophy) },
      el('span', { class: `row-grade grade-${trophy.grade}` }),
      el(
        'span',
        { class: 'row-text' },
        el('span', { class: 'row-name', text: sealed ? hiddenLabel(trophy) : trophy.name }),
        el('span', { class: 'row-desc', text: subline, title: sealed ? 'Sealed until you mark it earned' : subline }),
      ),
      meta,
    ),
  );
}
