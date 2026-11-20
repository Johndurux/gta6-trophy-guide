// Boot and wiring. Loads the guide, restores saved progress, then paints whichever of
// the three views is asked for — the two-pane checklist, the roadmap, or the missable
// callout — and keeps the progress line, the filters and the spoiler guard in step.
// A query string can set the starting state, so a capture can be reproduced (see README).

import { loadGuide } from './data.js';
import { createStore } from './progress.js';
import { createFilter, filterLabel, renderChips } from './filters.js';
import { renderChecklist } from './checklist.js';
import { renderDetail } from './detail.js';
import { renderRoadmap } from './roadmap.js';
import { renderMissables } from './missables.js';
import { $, el, clear, percent, toast } from './ui.js';

const guide = await loadGuide();
const store = createStore(guide);
const filter = createFilter();
const ui = { view: 'checklist', openId: 14 };

const nodes = {
  workspace: $('#workspace'),
  listNode: $('#trophy-list'),
  listTitle: $('#list-title'),
  listCount: $('#list-count'),
  detail: $('#detail-pane'),
  roadmap: $('#roadmap-pane'),
  chips: $('#kind-chips'),
  search: $('#search'),
  grade: $('#grade-filter'),
  hideEarned: $('#hide-earned'),
  spoiler: $('#spoiler-toggle'),
  spoilerState: $('#spoiler-state'),
  count: $('#progress-count'),
  percentNode: $('#progress-percent'),
  fill: $('#progress-fill'),
  grades: $('#progress-grades'),
  filters: $('#filters'),
  exportButton: $('#export-progress'),
  importInput: $('#import-progress'),
};

// --- painting --------------------------------------------------------------------

function paint() {
  paintProgress();
  paintView();
}

function paintProgress() {
  const earned = store.earnedCount;
  nodes.count.textContent = String(earned);
  nodes.percentNode.textContent = `${percent(earned, guide.total)}%`;
  nodes.fill.style.width = `${percent(earned, guide.total)}%`;

  // The tier counts: how many of each grade are already on the profile.
  clear(nodes.grades);
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const total = guide.byGrade[grade] ?? 0;
    const done = guide.trophies.filter((trophy) => trophy.grade === grade && store.isEarned(trophy.id)).length;
    nodes.grades.append(
      el(
        'li',
        {},
        el('span', { class: `row-grade grade-${grade}` }),
        el('span', { text: `${grade} ${done}/${total}` }),
      ),
    );
  }

  nodes.spoiler.setAttribute('aria-pressed', String(store.spoilerSealed));
  nodes.spoilerState.textContent = store.spoilerSealed ? 'sealed' : 'open';
  nodes.search.value = filter.query;
  nodes.grade.value = filter.grade;
  nodes.hideEarned.setAttribute('aria-pressed', String(filter.hideEarned));
  nodes.hideEarned.textContent = filter.hideEarned ? 'Showing left' : 'Hide earned';

  for (const tab of document.querySelectorAll('.view-tab')) {
    tab.classList.toggle('is-active', tab.dataset.view === ui.view);
  }
}

function paintView() {
  // The filters and the search belong to the checklist: the roadmap and the missable
  // callout are read, not filtered, so their screens carry the tabs alone.
  nodes.filters.hidden = ui.view !== 'checklist';
  nodes.workspace.classList.toggle('is-callout', ui.view === 'missables');

  if (ui.view === 'roadmap') {
    nodes.workspace.hidden = true;
    nodes.roadmap.hidden = false;
    renderRoadmap({ node: nodes.roadmap, guide, store, onOpen: (trophy) => open(trophy, 'checklist') });
    return;
  }

  nodes.workspace.hidden = false;
  nodes.roadmap.hidden = true;

  if (ui.view === 'missables') {
    renderMissables({
      node: nodes.listNode,
      guide,
      store,
      onOpen: (trophy) => open(trophy, 'checklist'),
      onSpoilerOff: () => setSpoiler(false),
    });
    nodes.listTitle.textContent = 'Windows that close';
    nodes.listCount.textContent = `${guide.missable} missable`;
    return;
  }

  renderChips(nodes.chips, filter, guide, (kind) => {
    filter.kind = kind;
    paint();
  });

  const visible = renderChecklist({
    listNode: nodes.listNode,
    guide,
    store,
    filter,
    openId: ui.openId,
    onOpen: (trophy) => open(trophy),
    onToggle: (trophy, on) => setEarned(trophy, on),
  });
  const earnedShown = visible.filter((trophy) => store.isEarned(trophy.id)).length;
  nodes.listTitle.textContent = `Trophies${filter.kind === 'all' ? '' : ` · ${filterLabel(filter.kind)}`}`;
  nodes.listCount.textContent = `${visible.length} shown · ${earnedShown} earned`;

  renderDetail({
    node: nodes.detail,
    trophy: guide.byId.get(ui.openId),
    guide,
    store,
    onToggle: (trophy, on) => setEarned(trophy, on),
    onSpoilerOff: () => setSpoiler(false),
    onStep: (delta) => step(delta),
  });
}

// --- actions ---------------------------------------------------------------------

function setEarned(trophy, on) {
  store.setEarned(trophy.id, on);
  paint();
}

function setSpoiler(sealed) {
  store.setSpoiler(sealed);
  paint();
}

function open(trophy, view = ui.view) {
  ui.openId = trophy.id;
  ui.view = view;
  paint();
  if (nodes.detail) nodes.detail.scrollTop = 0;
  revealRow(trophy.id);
}

function revealRow(id) {
  // Scroll the list itself, never the document: scrollIntoView also scrolls ancestors,
  // which pushed the masthead off the top of the screen on a deep link.
  const list = nodes.listNode;
  const row = list?.querySelector(`.trophy-row[data-id="${id}"]`);
  if (!row) return;
  const listBox = list.getBoundingClientRect();
  const rowBox = row.getBoundingClientRect();
  list.scrollTop += rowBox.top - listBox.top - (listBox.height - rowBox.height) / 2;
  document.documentElement.scrollTop = 0;
}

function step(delta) {
  const index = guide.trophies.findIndex((trophy) => trophy.id === ui.openId);
  const next = guide.trophies[(index + delta + guide.total) % guide.total];
  open(next);
}

function setView(view) {
  ui.view = view;
  paint();
}

// --- events ----------------------------------------------------------------------

nodes.spoiler.addEventListener('click', () => setSpoiler(!store.spoilerSealed));

nodes.search.addEventListener('input', () => {
  filter.query = nodes.search.value;
  paint();
});

nodes.grade.addEventListener('change', () => {
  filter.grade = nodes.grade.value;
  paint();
});

nodes.hideEarned.addEventListener('click', () => {
  filter.hideEarned = !filter.hideEarned;
  paint();
});

nodes.exportButton.addEventListener('click', () => {
  const count = store.exportProgress();
  toast(`Exported ${count} of ${guide.total} trophies to JSON`);
});

nodes.importInput.addEventListener('change', async () => {
  const file = nodes.importInput.files?.[0];
  if (!file) return;
  try {
    const count = await store.importProgress(file);
    paint();
    toast(`Imported ${count} earned trophies`);
  } catch {
    toast('That file is not a Vice Horizon progress export');
  }
  nodes.importInput.value = '';
});

for (const tab of document.querySelectorAll('.view-tab')) {
  tab.addEventListener('click', () => setView(tab.dataset.view));
}

window.addEventListener('keydown', (event) => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
  if (event.key === 'ArrowDown' || event.key === 'j') { event.preventDefault(); step(1); }
  if (event.key === 'ArrowUp' || event.key === 'k') { event.preventDefault(); step(-1); }
});

// --- the starting state, optionally from the query string -------------------------

function readQuery() {
  const params = new URLSearchParams(location.search);

  const spoiler = params.get('spoiler');
  if (spoiler === 'open') store.setSpoiler(false);
  if (spoiler === 'sealed') store.setSpoiler(true);

  const earnedList = params.get('earned');
  if (earnedList) {
    for (const token of earnedList.split(',')) {
      const trophy = guide.byId.get(Number(token)) ?? guide.byName.get(token.trim());
      if (trophy) store.setEarned(trophy.id, true);
    }
  }

  const view = params.get('view');
  if (view && ['checklist', 'roadmap', 'missables'].includes(view)) ui.view = view;

  const kind = params.get('filter');
  if (kind && ['all', 'story', 'collectible', 'activity', 'missable', 'online'].includes(kind)) filter.kind = kind;

  const grade = params.get('grade');
  if (grade && ['platinum', 'gold', 'silver', 'bronze'].includes(grade)) filter.grade = grade;

  filter.query = params.get('q') ?? '';
  filter.hideEarned = params.get('left') === '1';

  const openToken = params.get('open');
  if (openToken) {
    const trophy = guide.byId.get(Number(openToken)) ?? guide.byName.get(openToken);
    if (trophy) ui.openId = trophy.id;
  }

  if (ui.view === 'missables') {
    const missable = guide.trophies.find((trophy) => trophy.missable);
    if (missable) ui.openId = missable.id;
  }
}

readQuery();
paint();

// A deep link (?open=14) shows the row it opened, not the top of the list.
if (ui.view === 'checklist') revealRow(ui.openId);
