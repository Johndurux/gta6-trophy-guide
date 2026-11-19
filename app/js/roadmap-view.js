// The roadmap to the platinum: six stages, the point of no return called out, every trophy reachable in one click.

import { isRedacted, redactedTitle } from './trophy-filter.js';

const FACT_ORDER = [
  ['hours', 'Platinum time'],
  ['difficulty', 'Difficulty'],
  ['missable', 'Missable'],
  ['replay', 'Replay'],
];

const NOTE_ORDER = ['online', 'cheats', 'freeRoam'];

export function renderRoadmap(rootEl, { roadmap, trophies, earned, spoilerOn, onPickTrophy }) {
  const fragment = document.createDocumentFragment();
  const grid = document.createElement('div');
  grid.className = 'roadmap-stages';
  const PILL_LIMIT = 7;

  const intro = document.createElement('dl');
  intro.className = 'roadmap-intro';
  for (const [key, label] of FACT_ORDER) {
    const value = roadmap.highlights?.[key];
    if (!value) continue;
    const card = document.createElement('div');
    card.className = 'fact-card';
    if (key === 'missable' || key === 'cheats' || key === 'replay') card.classList.add('is-alert');
    const term = document.createElement('dt');
    term.textContent = label;
    const detail = document.createElement('dd');
    detail.textContent = value;
    card.append(term, detail);
    intro.append(card);
  }
  fragment.append(intro);

  const notes = document.createElement('p');
  notes.className = 'roadmap-notes';
  for (const key of NOTE_ORDER) {
    const value = roadmap.highlights?.[key];
    if (value) notes.append(document.createTextNode(`${value} · `));
  }
  notes.lastChild.textContent = notes.lastChild.textContent.replace(/ · $/, '');
  fragment.append(notes);

  for (const stage of roadmap.stages) {
    const inStage = trophies.filter((trophy) => trophy.stage === stage.stage);
    const block = document.createElement('section');
    block.className = 'stage-block';
    block.classList.toggle('has-missable', inStage.some((trophy) => trophy.missable));

    const head = document.createElement('div');
    head.className = 'stage-head';
    const number = document.createElement('span');
    number.className = 'stage-number';
    number.textContent = `STAGE ${stage.stage}`;
    const title = document.createElement('h2');
    title.className = 'stage-title';
    title.textContent = stage.title;
    head.append(number, title);

    const blurb = document.createElement('p');
    blurb.className = 'stage-blurb';
    blurb.textContent = stage.blurb;

    block.append(head, blurb);

    if (stage.beforeLeave && stage.beforeLeave !== 'n/a') {
      const gate = document.createElement('p');
      gate.className = 'stage-gate';
      const label = document.createElement('b');
      label.textContent = stage.missable ? 'Point of no return ' : 'Before you leave ';
      gate.append(label, document.createTextNode(stage.beforeLeave));
      block.append(gate);
    }

    const pills = document.createElement('div');
    pills.className = 'stage-trophies';
    for (const trophy of inStage.slice(0, PILL_LIMIT)) {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'stage-pill';
      pill.classList.toggle('is-earned', earned.has(trophy.name));
      pill.classList.toggle('is-missable', trophy.missable === true);
      const dot = document.createElement('span');
      dot.className = 'pill-dot';
      dot.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      const hidden = isRedacted(trophy, spoilerOn, (name) => earned.has(name));
      label.textContent = hidden ? redactedTitle(trophy) : trophy.name;
      if (earned.has(trophy.name)) label.textContent += ' ✓';
      pill.append(dot, label);
      pill.title = hidden ? 'Hidden by the spoiler guard' : trophy.description;
      pill.addEventListener('click', () => onPickTrophy(trophy.id));
      pills.append(pill);
    }
    if (inStage.length > PILL_LIMIT) {
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'stage-pill is-more';
      more.textContent = `+${inStage.length - PILL_LIMIT} more in the checklist`;
      more.addEventListener('click', () => onPickTrophy(inStage[PILL_LIMIT].id));
      pills.append(more);
    }
    block.append(pills);
    grid.append(block);
  }

  fragment.append(grid);
  rootEl.replaceChildren(fragment);
}