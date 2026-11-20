// The roadmap view: the six stages from the opening chapter to the platinum, each one
// naming the point of no return for that stretch — what closes for good there, or that
// nothing does. Reads the same trophies the checklist does, grouped by stage.

import { el, clear } from './ui.js';
import { STAGES } from './data.js';

export function renderRoadmap({ node, guide, store, onOpen }) {
  clear(node);

  const grid = el('div', { class: 'roadmap-grid' });
  for (const stage of STAGES) {
    grid.append(stageCard(stage, guide, store, onOpen));
  }

  node.append(
    el(
      'header',
      { class: 'roadmap-intro' },
      el(
        'div',
        {},
        el('h2', { text: 'Roadmap to the platinum' }),
        el('p', {
          text: 'Six stages built from the official descriptions, in the order a platinum run takes them. Every stage names its point of no return — the wall to respect, or none.',
        }),
      ),
      el(
        'div',
        { class: 'roadmap-legend' },
        el('span', { text: `${guide.total} trophies` }),
        el('span', { text: `${guide.missable} missable` }),
        el('span', { text: '≈200 h' }),
      ),
    ),
    grid,
  );
}

function stageCard(stage, guide, store, onOpen) {
  const trophies = guide.groupedByStage(stage.id);
  const earned = trophies.filter((trophy) => store.isEarned(trophy.id)).length;
  const list = el('ul', { class: 'stage-trophies' });

  for (const trophy of trophies) {
    const sealed = store.isSealed(trophy);
    list.append(
      el(
        'li',
        {
          class: `stage-trophy${store.isEarned(trophy.id) ? ' is-earned' : ''}`,
          onclick: () => onOpen(trophy),
          title: sealed ? 'Sealed until earned' : trophy.description,
        },
        el('span', { class: `row-grade grade-${trophy.grade}` }),
        el('span', { class: 'stage-trophy-name', text: sealed ? 'Hidden trophy' : trophy.name }),
        trophy.missable ? el('span', { class: 'stage-trophy-tag', text: 'Missable' }) : null,
      ),
    );
  }

  // The gate line is the stage's point of no return, said either way: a closing window
  // is marked in pink, a stage that stays open in teal, so the order reads at a glance.
  const closes = Boolean(stage.missable);
  const classes = ['stage-card'];
  if (closes) classes.push('is-missable-stage');
  else classes.push('is-open-gate');
  if (trophies.length > 10) classes.push('is-long');

  return el(
    'article',
    { class: classes.join(' ') },
    el(
      'header',
      { class: 'stage-head' },
      el('span', { class: 'stage-number', text: String(stage.id).padStart(2, '0') }),
      el('h3', { class: 'stage-title', text: stage.title }),
      el('span', { class: 'stage-count', text: `${earned} / ${trophies.length}` }),
    ),
    el('p', { class: 'stage-note' }, el('em', { class: 'stage-window', text: stage.window }), stage.note),
    el(
      'p',
      { class: 'stage-gate' },
      el('b', { text: closes ? 'Point of no return' : 'Point of no return — none' }),
      stage.pointOfNoReturn,
    ),
    list,
  );
}
