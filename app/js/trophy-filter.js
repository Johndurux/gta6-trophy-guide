// Which trophies a filter and a search let through, and when the spoiler guard blanks one out.

export const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'story', label: 'Story' },
  { id: 'missable', label: 'Missable' },
  { id: 'collectible', label: 'Collectibles' },
  { id: 'activity', label: 'Activities' },
  { id: 'unearned', label: 'Still to do' },
];

export function matchesFilter(trophy, filterId, isEarned) {
  switch (filterId) {
    case 'story':
      return trophy.kind === 'story';
    case 'missable':
      return trophy.missable === true;
    case 'collectible':
      return trophy.kind === 'collectible';
    case 'activity':
      return trophy.kind === 'activity';
    case 'unearned':
      return !isEarned(trophy.name);
    default:
      return true;
  }
}

export function countForFilter(trophies, filterId, isEarned) {
  return trophies.filter((trophy) => matchesFilter(trophy, filterId, isEarned)).length;
}

// Name, official description, our guide, the kind, the target and the source names: one haystack per trophy.
function haystack(trophy) {
  return [
    trophy.name,
    trophy.description,
    trophy.guide,
    trophy.kind,
    trophy.target ?? '',
    trophy.tips ?? '',
    ...(trophy.sources ?? []).map((source) => source.name),
  ]
    .join(' ')
    .toLowerCase();
}

export function matchesSearch(trophy, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const hay = haystack(trophy);
  return needle.split(/\s+/).every((word) => hay.includes(word));
}

// Story trophies stay under the guard until they are marked earned; the platinum never does.
export function isRedacted(trophy, spoilerOn, isEarned) {
  return spoilerOn && trophy.kind === 'story' && trophy.grade !== 'platinum' && !isEarned(trophy.name);
}

export function redactedTitle(trophy) {
  return trophy.grade === 'gold' ? 'Hidden gold story trophy' : 'Hidden story trophy';
}

export function visibleTrophies(trophies, { filterId, query, isEarned }) {
  return trophies.filter(
    (trophy) => matchesFilter(trophy, filterId, isEarned) && matchesSearch(trophy, query),
  );
}