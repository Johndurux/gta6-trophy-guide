// The checklist: one row per trophy with the earned box, grade dot, kind chip, missable
// flag and roadmap stage. Rows are rebuilt from the data on every change, which keeps
// the list and the progress counts honest without a framework.

import { el, clear } from './ui.js';
import { kindLabel } from './data.js';
import { matches } from './filters.js';

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

  const meta = el('span', { class: 'row-meta' });
  if (sealed) meta.append(el('span', { class: 'chip chip-sealed', text: 'Sealed' }));
  else meta.append(el('span', { class: `chip chip-${trophy.kind}`, text: kindLabel(trophy.kind) }));
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
        el('span', { class: 'row-name', text: sealed ? 'Hidden trophy' : trophy.name }),
        el('span', {
          class: 'row-desc',
          text: sealed ? 'Sealed until you mark it earned — spoiler guard is on' : trophy.description,
        }),
      ),
      meta,
    ),
  );
}