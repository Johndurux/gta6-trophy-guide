// The data layer: loads app/data/trophies.json once, then groups and counts it for the
// views. The JSON holds the official list plus my guide, sources, kind, stage and flags.

const TROPHIES_URL = 'data/trophies.json';

// The six roadmap stages, in the order a platinum run takes them. Each note says what
// changes at that point and what (if anything) has to happen before it closes.
export const STAGES = [
  {
    id: 1,
    title: 'Chapter 1 — the one door that closes',
    window: '0–10 h',
    missable: true,
    warning: 'The balcony meditation is the only thing in the game that can close for good.',
    note: 'Take every optional offer the chapter makes before it ends.',
  },
  {
    id: 2,
    title: 'Chapters 2–3 — the state opens up',
    window: '10–60 h',
    missable: false,
    note: 'Coffee Break opens partner free roam: robberies, garages, Scooter Bros and laundering.',
  },
  {
    id: 3,
    title: 'Chapters 4–5 — close the story',
    window: '60–80 h',
    missable: false,
    note: "Story trophies arrive on their own; keep a manual save before Chapter 4's last mission.",
  },
  {
    id: 4,
    title: '100% checklist — the long middle',
    window: '80–190 h',
    missable: false,
    note: 'The 100% list opens after the credits. Robberies, ranges, drone races and Target Decks count in full.',
  },
  {
    id: 5,
    title: 'Side strands, one-offs, clean-up',
    window: '190–200 h',
    missable: false,
    note: 'Every strand and hidden one-off stays open: UFO, showroom smash, bowling robbery.',
  },
  {
    id: 6,
    title: 'Platinum',
    window: 'the end',
    missable: false,
    note: 'Arrives with the 55th trophy. Nothing extra to do.',
  },
];

const KIND_LABELS = {
  story: 'Story',
  collectible: 'Collectible',
  activity: 'Activity',
  missable: 'Missable',
  online: 'Online',
};

export function kindLabel(kind) {
  return KIND_LABELS[kind] ?? 'Activity';
}

export function stageOf(id) {
  return STAGES.find((stage) => stage.id === id) ?? STAGES[STAGES.length - 1];
}

export async function loadGuide() {
  const response = await fetch(TROPHIES_URL);
  if (!response.ok) throw new Error(`trophies.json answered ${response.status}`);
  const document_ = await response.json();
  const raw = Array.isArray(document_) ? document_ : document_.trophies;
  if (!Array.isArray(raw)) throw new Error('trophies.json has no trophies array');

  const trophies = raw
    .map((item, index) => ({
      id: Number(item.id ?? index + 1),
      name: String(item.name ?? ''),
      description: String(item.description ?? ''),
      grade: String(item.grade ?? 'bronze').toLowerCase(),
      hidden: Boolean(item.hidden),
      kind: String(item.kind ?? 'activity'),
      missable: Boolean(item.missable),
      stage: Number(item.stage ?? 5),
      guide: String(item.guide ?? ''),
      tips: String(item.tips ?? ''),
      sources: Array.isArray(item.sources) ? item.sources.filter((source) => source && source.url) : [],
    }))
    .sort((a, b) => a.id - b.id);

  const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  const byName = new Map(trophies.map((trophy) => [trophy.name, trophy]));
  const byGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const byKind = { story: 0, collectible: 0, activity: 0 };
  let missable = 0;
  let hidden = 0;
  let sources = 0;

  for (const trophy of trophies) {
    if (byGrade[trophy.grade] !== undefined) byGrade[trophy.grade] += 1;
    if (byKind[trophy.kind] !== undefined) byKind[trophy.kind] += 1;
    if (trophy.missable) missable += 1;
    if (trophy.hidden) hidden += 1;
    sources += trophy.sources.length;
  }

  return {
    trophies,
    byId,
    byName,
    total: trophies.length,
    byGrade,
    byKind,
    missable,
    hidden,
    sources,
    groupedByStage(stageId) {
      return trophies.filter((trophy) => trophy.stage === stageId);
    },
  };
}