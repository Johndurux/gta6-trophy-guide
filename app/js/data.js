// The data layer: loads app/data/trophies.json once, then groups and counts it for the
// views. The JSON holds the official list plus my guide, sources, kind, stage and flags.

const TROPHIES_URL = 'data/trophies.json';

// The six roadmap stages, in the order a platinum run takes them. Each names the point
// of no return for that stretch: what can close for good (or nothing), so a reader can
// see the order and the walls to the run. From the official descriptions and the guides.
export const STAGES = [
  {
    id: 1,
    title: 'Chapter 1 — the one door that closes',
    window: '0–10 h',
    missable: true,
    pointOfNoReturn:
      'The Chapter 1 finale. The balcony meditation behind Positive Mental Attitude is gone the moment Chapter 1 ends, so take it before the chapter’s last mission.',
    note: 'Take every optional offer the chapter makes before it ends.',
  },
  {
    id: 2,
    title: 'Chapters 2–3 — the state opens up',
    window: '10–60 h',
    missable: false,
    pointOfNoReturn: 'None. Robberies, garages, Scooter Bros and the rest stay open after the credits.',
    note: 'Coffee Break opens partner free roam and strands.',
  },
  {
    id: 3,
    title: 'Chapters 4–5 — close the story',
    window: '60–80 h',
    missable: false,
    pointOfNoReturn:
      'None in the trophies, but keep a manual save before Chapter 4’s last mission in case a story trophy fails to pop.',
    note: 'Story trophies arrive on their own as each chapter closes.',
  },
  {
    id: 4,
    title: '100% checklist — the long middle',
    window: '80–190 h',
    missable: false,
    pointOfNoReturn: 'None. The 100% list has no closing window; work done before the credits already counts.',
    note: 'Robberies, ranges, drone races and Target Decks count in full; a share of the rest does.',
  },
  {
    id: 5,
    title: 'Side strands, one-offs, clean-up',
    window: '190–200 h',
    missable: false,
    pointOfNoReturn:
      'None — but the timing changes the order: the UFO only after 2 AM alone, the bowling robbery’s slow respawn, the showroom Banshee after the Key Cloner.',
    note: 'Every strand and hidden one-off stays open to the end.',
  },
  {
    id: 6,
    title: 'Platinum',
    window: 'the end',
    missable: false,
    pointOfNoReturn: 'None. The platinum lands by itself with the 55th trophy.',
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

/** The short name of a stage, without the clause after the dash: "Chapter 1", "Chapters 2–3". */
export function stageLabel(id) {
  return stageOf(id).title.split(' — ')[0];
}

/** What the spoiler guard calls a trophy it is hiding: "Hidden story trophy", "Hidden collectible trophy". */
export function hiddenLabel(trophy) {
  return `Hidden ${kindLabel(trophy.kind).toLowerCase()} trophy`;
}

/**
 * How long the trophy adds to a 100% run, in a form a reader can plan with: "≈ 2–3 h", or
 * "≈ 30 min" when it is under an hour at both ends. Empty when the data carries no hours.
 */
export function hoursLabel(trophy) {
  const hours = trophy.hours;
  if (!hours || !hours.low) return '';
  const low = hours.low * 60;
  const high = hours.high * 60;
  const show = (minutes) => (minutes < 60 ? `${Math.round(minutes)} min` : `${(minutes / 60).toFixed(minutes % 60 === 0 ? 0 : 1).replace('.0', '')} h`);
  return low === high ? `≈ ${show(low)}` : `≈ ${show(low)}–${show(high)}`;
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
      summary: String(item.summary ?? ''),
      steps: Array.isArray(item.steps) ? item.steps.map((step) => String(step)) : [],
      hours: item.hours && typeof item.hours === 'object'
        ? {
            low: Number(item.hours.low ?? 0),
            high: Number(item.hours.high ?? 0),
            beat: String(item.hours.beat ?? ''),
          }
        : null,
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