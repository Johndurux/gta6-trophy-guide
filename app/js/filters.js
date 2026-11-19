// Filter state, the chip row and the predicate the checklist uses: kind, grade, a search
// across names, descriptions, guides and tips, and an optional "hide earned" switch.

import { el, clear } from './ui.js';

export const KIND_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'story', label: 'Story' },
  { key: 'collectible', label: 'Collectibles' },
  { key: 'activity', label: 'Activities' },
  { key: 'missable', label: 'Missable' },
  { key: 'online', label: 'Online' },
];

export function createFilter() {
  return { kind: 'all', grade: 'all', query: '', hideEarned: false };
}

export function filterLabel(kind) {
  return KIND_FILTERS.find((entry) => entry.key === kind)?.label ?? 'All';
}

export function countFor(kind, guide) {
  if (kind === 'all') return guide.total;
  if (kind === 'missable') return guide.missable;
  if (kind === 'online') return 0; // the PS5 list ships no online trophies
  return guide.byKind[kind] ?? 0;
}

export function matches(trophy, filter, store) {
  if (filter.kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (filter.kind === 'online') {
    return false;
  } else if (filter.kind !== 'all' && trophy.kind !== filter.kind) {
    return false;
  }

  if (filter.grade !== 'all' && trophy.grade !== filter.grade) return false;
  if (filter.hideEarned && store.isEarned(trophy.id)) return false;

  const query = filter.query.trim().toLowerCase();
  if (!query) return true;

  // A sealed trophy keeps its name and guide out of the search too, so a search cannot
  // give away what the spoiler guard is holding back.
  const sealed = store.isSealed(trophy);
  const searchable = [
    sealed ? '' : trophy.name,
    sealed ? '' : trophy.description,
    sealed ? '' : trophy.guide,
    sealed ? '' : trophy.tips,
    trophy.kind,
    trophy.grade,
    trophy.missable ? 'missable timing window' : '',
    `stage ${trophy.stage}`,
    store.isEarned(trophy.id) ? 'earned done' : 'missing left',
  ]
    .join(' ')
    .toLowerCase();

  return query.split(/\s+/).every((word) => searchable.includes(word));
}

export function renderChips(container, filter, guide, onChange) {
  clear(container);
  for (const entry of KIND_FILTERS) {
    const chip = el(
      'button',
      {
        class: `chip-filter${filter.kind === entry.key ? ' is-active' : ''}`,
        type: 'button',
        'aria-pressed': String(filter.kind === entry.key),
        onclick: () => onChange(entry.key),
      },
      entry.label,
      el('b', { text: String(countFor(entry.key, guide)) }),
    );
    container.append(chip);
  }
}