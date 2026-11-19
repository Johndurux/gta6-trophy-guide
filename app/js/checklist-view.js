// The checklist column and the per-trophy panel beside it.

import { isRedacted, redactedTitle } from './trophy-filter.js';

const KIND_LABEL = { story: 'Story', activity: 'Activity', collectible: 'Collectible', online: 'Online' };

function badge(text, variant) {
  const el = document.createElement('span');
  el.className = `badge ${variant}`;
  el.textContent = text;
  return el;
}

function stageLabel(stages, stageNumber) {
  const stage = stages.find((entry) => entry.stage === stageNumber);
  if (!stage) return `Stage ${stageNumber}`;
  // The stage title's first clause is enough for the eyebrow; the roadmap spells the rest out.
  return `Stage ${stage.stage} — ${stage.title.split(' — ')[0]}`;
}

/* ---------- the list ---------- */

export function renderTrophyList(listEl, context) {
  const { visible, earned, spoilerOn, selectedId, onSelect, onToggle } = context;
  const fragment = document.createDocumentFragment();

  for (const trophy of visible) {
    const redacted = isRedacted(trophy, spoilerOn, (name) => earned.has(name));
    const isEarned = earned.has(trophy.name);

    const row = document.createElement('li');
    row.className = 'trophy-row';
    row.dataset.id = String(trophy.id);
    row.classList.toggle('is-earned', isEarned);
    row.classList.toggle('is-selected', trophy.id === selectedId);
    row.classList.toggle('is-redacted', redacted);
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.setAttribute('aria-pressed', String(trophy.id === selectedId));

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'row-check';
    box.checked = isEarned;
    box.title = isEarned ? 'Mark as not earned' : 'Mark as earned';
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => onToggle(trophy));

    const grade = document.createElement('span');
    grade.className = `grade-chip ${trophy.grade}`;
    grade.textContent = trophy.grade;

    const text = document.createElement('div');
    text.className = 'row-text';
    const name = document.createElement('span');
    name.className = 'trophy-name';
    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    if (redacted) {
      name.textContent = redactedTitle(trophy);
      desc.textContent = 'Hidden by the spoiler guard — mark it earned to reveal it.';
    } else {
      name.textContent = trophy.name;
      desc.textContent = trophy.description;
    }
    text.append(name, desc);

    const badges = document.createElement('div');
    badges.className = 'row-badges';
    badges.append(badge(KIND_LABEL[trophy.kind] ?? trophy.kind, trophy.kind));
    if (trophy.missable) badges.append(badge('Missable', 'missable'));
    badges.append(badge(`S${trophy.stage}`, 'stage'));

    row.append(box, grade, text, badges);
    row.addEventListener('click', () => onSelect(trophy.id));
    row.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect(trophy.id);
      }
    });

    fragment.append(row);
  }

  listEl.replaceChildren(fragment);
}

/* ---------- the panel ---------- */

export function renderDetail(panelEl, context) {
  const { selected, stages, earned, spoilerOn, onToggle } = context;
  if (!selected) {
    panelEl.replaceChildren();
    return;
  }

  const isEarned = earned.has(selected.name);
  const redacted = isRedacted(selected, spoilerOn, (name) => earned.has(name));
  const fragment = document.createDocumentFragment();

  const top = document.createElement('div');
  top.className = 'detail-top';
  const heading = document.createElement('div');
  const eyebrow = document.createElement('p');
  eyebrow.className = 'detail-eyebrow';
  eyebrow.textContent = `${selected.grade} · ${stageLabel(stages, selected.stage)}`;
  const title = document.createElement('h2');
  title.className = 'detail-title';
  title.textContent = redacted ? redactedTitle(selected) : selected.name;
  if (redacted) title.classList.add('is-redacted');
  heading.append(eyebrow, title);
  top.append(heading);

  const badges = document.createElement('div');
  badges.className = 'detail-badges';
  badges.append(badge(KIND_LABEL[selected.kind] ?? selected.kind, selected.kind));
  if (selected.missable) badges.append(badge('Missable', 'missable'));
  if (selected.target) badges.append(badge(selected.target, 'stage'));
  if (isEarned) badges.append(badge('Earned', 'story'));

  const official = document.createElement('blockquote');
  official.className = 'official-line';
  const tag = document.createElement('span');
  tag.className = 'official-tag';
  tag.textContent = 'PlayStation trophy description';
  official.append(tag, document.createTextNode(
    redacted ? 'Hidden until this trophy is earned — the spoiler guard is on.' : selected.description,
  ));

  const guideLabel = document.createElement('p');
  guideLabel.className = 'section-label';
  guideLabel.textContent = 'Guide — written for this entry';

  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = redacted
    ? 'The guide for this story trophy stays under the spoiler guard until you mark it earned.'
    : selected.guide;

  fragment.append(top, badges, official, guideLabel, guide);

  if (!redacted && selected.tips) {
    const tip = document.createElement('p');
    tip.className = 'tip-line';
    const label = document.createElement('b');
    label.textContent = 'Tip ';
    tip.append(label, document.createTextNode(selected.tips));
    fragment.append(tip);
  }

  const sourceLabel = document.createElement('p');
  sourceLabel.className = 'section-label';
  const sources = selected.sources ?? [];
  sourceLabel.textContent = redacted
    ? `${sources.length} source${sources.length === 1 ? '' : 's'} — shown after the trophy is earned`
    : `Sources (${sources.length}) — opens when clicked`;
  fragment.append(sourceLabel);

  if (!redacted) {
    const list = document.createElement('ul');
    list.className = 'source-list';
    for (const source of sources) {
      const item = document.createElement('li');
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'source-link';
      link.title = `Open ${source.url} in a new tab`;
      const name = document.createElement('span');
      name.className = 'source-name';
      name.textContent = source.name;
      const url = document.createElement('span');
      url.className = 'source-url';
      url.textContent = source.url.replace(/^https?:\/\//, '');
      url.title = source.url;
      link.append(name, url);
      link.addEventListener('click', () => window.open(source.url, '_blank', 'noopener,noreferrer'));
      item.append(link);
      list.append(item);
    }
    fragment.append(list);
  }

  const action = document.createElement('div');
  action.className = 'earned-action';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'earned-button';
  button.classList.toggle('is-earned', isEarned);
  button.textContent = isEarned ? 'Earned — tap to undo' : 'Mark as earned';
  button.addEventListener('click', () => onToggle(selected));
  const hint = document.createElement('span');
  hint.className = 'stage-hint';
  hint.textContent = isEarned ? 'Saved in this browser' : 'Progress saves as you tick';
  action.append(button, hint);

  fragment.append(action);
  panelEl.replaceChildren(fragment);
}