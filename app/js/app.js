// Boot: loads the trophy data, wires the controls, and redraws the two views from one state object.

import { createStore } from './store.js';
import { FILTERS, countForFilter, visibleTrophies } from './trophy-filter.js';
import { renderTrophyList, renderDetail } from './checklist-view.js';
import { renderRoadmap } from './roadmap-view.js';

const GRADES = ['platinum', 'gold', 'silver', 'bronze'];

const dom = {
  list: document.getElementById('trophy-list'),
  detail: document.getElementById('detail-panel'),
  chips: document.getElementById('filter-chips'),
  search: document.getElementById('search-input'),
  spoiler: document.getElementById('spoiler-toggle'),
  earnedCount: document.getElementById('earned-count'),
  totalCount: document.getElementById('total-count'),
  percent: document.getElementById('earned-percent'),
  fill: document.getElementById('progress-fill'),
  legend: document.getElementById('progress-legend'),
  resultCount: document.getElementById('result-count'),
  summary: document.getElementById('list-summary'),
  empty: document.getElementById('empty-note'),
  exportButton: document.getElementById('export-button'),
  importInput: document.getElementById('import-input'),
  roadmapRoot: document.getElementById('roadmap-root'),
  tabs: [...document.querySelectorAll('.tab')],
  views: [...document.querySelectorAll('.view')],
};

const [trophyDoc, roadmap] = await Promise.all([
  fetch('data/trophies.json').then((response) => response.json()),
  fetch('data/roadmap.json').then((response) => response.json()),
]);

const trophies = trophyDoc.trophies;
const store = createStore(trophies.map((trophy) => trophy.name));
const launch = readLaunchState(trophies);

const state = {
  filterId: launch.filterId,
  query: launch.query,
  selectedId: launch.openId,
  view: launch.view,
};

applyLaunchState(launch);

/* ---------- launch state (?view=roadmap&filter=missable&open=28&spoiler=1&earned=2,3) ---------- */

function readLaunchState(list) {
  const params = new URLSearchParams(window.location.search);
  const filterId = FILTERS.some((filter) => filter.id === params.get('filter')) ? params.get('filter') : 'all';
  const view = params.get('view') === 'roadmap' ? 'roadmap' : 'checklist';
  const openId = Number(params.get('open'));
  const earnedIds = (params.get('earned') ?? '')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => list.some((trophy) => trophy.id === value));
  return {
    filterId,
    view,
    query: params.get('q') ?? '',
    openId: list.some((trophy) => trophy.id === openId) ? openId : list[0].id,
    spoilerOn: params.get('spoiler') === '1',
    earnedIds,
  };
}

function applyLaunchState(launchState) {
  dom.search.value = launchState.query;
  for (const id of launchState.earnedIds) {
    const trophy = trophies.find((entry) => entry.id === id);
    if (trophy) store.setEarned(trophy.name, true);
  }
  if (launchState.spoilerOn) store.setSpoiler(true);
  dom.spoiler.checked = store.isSpoilerOn();
}

/* ---------- rendering ---------- */

function buildFilterChips() {
  const fragment = document.createDocumentFragment();
  for (const filter of FILTERS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.dataset.filter = filter.id;
    chip.classList.toggle('is-active', filter.id === state.filterId);
    chip.append(document.createTextNode(filter.label));
    const count = document.createElement('span');
    count.className = 'chip-count';
    count.textContent = ` ${countForFilter(trophies, filter.id, (name) => store.isEarned(name))}`;
    chip.append(count);
    chip.addEventListener('click', () => {
      state.filterId = filter.id;
      render();
    });
    fragment.append(chip);
  }
  dom.chips.replaceChildren(fragment);
}

function renderProgress() {
  const earned = store.earnedCount();
  const total = trophies.length;
  dom.earnedCount.textContent = String(earned);
  dom.totalCount.textContent = ` / ${total}`;
  const percent = Math.round((earned / total) * 100);
  dom.percent.textContent = `${percent}%`;
  dom.fill.style.width = `${percent}%`;

  const fragment = document.createDocumentFragment();
  for (const grade of GRADES) {
    const ofGrade = trophies.filter((trophy) => trophy.grade === grade);
    const done = ofGrade.filter((trophy) => store.isEarned(trophy.name)).length;
    const item = document.createElement('li');
    const dot = document.createElement('span');
    dot.className = `legend-dot ${grade}`;
    const text = document.createElement('b');
    text.textContent = `${done}/${ofGrade.length}`;
    const label = document.createElement('span');
    label.textContent = grade;
    item.append(dot, text, label);
    fragment.append(item);
  }
  dom.legend.replaceChildren(fragment);
}

function renderChecklist() {
  const visible = visibleTrophies(trophies, {
    filterId: state.filterId,
    query: state.query,
    isEarned: (name) => store.isEarned(name),
  });

  if (!visible.some((trophy) => trophy.id === state.selectedId) && visible.length) {
    state.selectedId = visible[0].id;
  }

  renderTrophyList(dom.list, {
    visible,
    earned: new Set(store.allEarned()),
    spoilerOn: store.isSpoilerOn(),
    selectedId: state.selectedId,
    onSelect: (id) => {
      state.selectedId = id;
      renderChecklist();
    },
    onToggle: (trophy) => store.toggle(trophy.name),
  });

  renderDetail(dom.detail, {
    selected: trophies.find((trophy) => trophy.id === state.selectedId),
    stages: roadmap.stages,
    earned: new Set(store.allEarned()),
    spoilerOn: store.isSpoilerOn(),
    onToggle: (trophy) => store.toggle(trophy.name),
  });

  const earnedShown = visible.filter((trophy) => store.isEarned(trophy.name)).length;
  dom.resultCount.textContent = `${visible.length} shown`;
  dom.summary.textContent = `${earnedShown} of these earned · ${55 - store.earnedCount()} left to platinum`;
  dom.empty.hidden = visible.length > 0;
  dom.list.hidden = visible.length === 0;

  // Centre the trophy whose guide is open inside the list's own viewport, not the page's.
  const selectedRow = dom.list.querySelector('.trophy-row.is-selected');
  const listColumn = dom.list.parentElement;
  if (selectedRow && listColumn) {
    const rowRect = selectedRow.getBoundingClientRect();
    const columnRect = listColumn.getBoundingClientRect();
    listColumn.scrollTop += rowRect.top - columnRect.top - (columnRect.height / 2 - rowRect.height / 2);
  }
}

function renderRoadmapView() {
  renderRoadmap(dom.roadmapRoot, {
    roadmap,
    trophies,
    earned: new Set(store.allEarned()),
    spoilerOn: store.isSpoilerOn(),
    onPickTrophy: (id) => {
      state.selectedId = id;
      state.view = 'checklist';
      state.filterId = 'all';
      state.query = '';
      dom.search.value = '';
      render();
      window.scrollTo({ top: 0, behavior: 'instant' });
    },
  });
}

function renderTabs() {
  for (const tab of dom.tabs) {
    const active = tab.dataset.view === state.view;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  }
  for (const view of dom.views) {
    view.hidden = view.dataset.view !== state.view;
  }
}

function renderSpoilerBanner() {
  const banner = document.getElementById('spoiler-banner');
  if (!banner) return;
  const on = store.isSpoilerOn();
  banner.hidden = !on;
  if (!on) return;
  const hiddenCount = trophies.filter(
    (trophy) => trophy.kind === 'story' && trophy.grade !== 'platinum' && !store.isEarned(trophy.name),
  ).length;
  banner.textContent = `Spoiler guard on — ${hiddenCount} story trophies stay hidden (names, descriptions and guides) until you mark them earned.`;
}

function render() {
  renderTabs();
  renderSpoilerBanner();
  buildFilterChips();
  renderProgress();
  if (state.view === 'checklist') renderChecklist();
  else renderRoadmapView();
}

/* ---------- wiring ---------- */

for (const tab of dom.tabs) {
  tab.addEventListener('click', () => {
    state.view = tab.dataset.view;
    render();
  });
}

let searchTimer;
dom.search.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.query = dom.search.value;
    render();
  }, 90);
});

dom.spoiler.addEventListener('change', () => store.setSpoiler(dom.spoiler.checked));

dom.exportButton.addEventListener('click', () => {
  const url = URL.createObjectURL(store.exportFile());
  const link = document.createElement('a');
  link.href = url;
  link.download = 'vice-ledger-progress.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
});

dom.importInput.addEventListener('change', async () => {
  const file = dom.importInput.files?.[0];
  if (!file) return;
  try {
    const result = await store.importFile(file);
    dom.exportButton.textContent = `Imported ${result.imported} ✓`;
  } catch (error) {
    dom.exportButton.textContent = 'Import failed';
    console.warn('Import failed:', error.message);
  } finally {
    dom.importInput.value = '';
    setTimeout(() => {
      dom.exportButton.textContent = 'Export progress';
    }, 2600);
  }
});

store.subscribe(() => render());

render();