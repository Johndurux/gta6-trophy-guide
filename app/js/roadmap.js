// Two views that read the same data sideways: the roadmap (six stages from the opening
// chapter to the platinum, with the point of no return spelled out) and the missables
// board (the one trophy that can be lost, plus the timings that are easy to get wrong).

import { el, clear } from './ui.js';
import { STAGES } from './data.js';

export function renderRoadmap({ node, guide, store, onOpen, onToggle }) {
  clear(node);

  const grid = el('div', { class: 'roadmap-grid' });
  for (const stage of STAGES) {
    grid.append(stageCard(stage, guide, store, onOpen, onToggle));
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
          text: 'Six stages from the official descriptions, with the point of no return spelled out where one exists.',
        }),
      ),
      el(
        'div',
        { class: 'roadmap-legend' },
        el('span', { text: `${guide.total} trophies` }),
        el('span', { text: `${guide.missable} missable` }),
        el('span', { text: '200 h' }),
      ),
    ),
    grid,
  );
}

function stageCard(stage, guide, store, onOpen, onToggle) {
  const trophies = guide.groupedByStage(stage.id);
  const earned = trophies.filter((trophy) => store.isEarned(trophy.id)).length;
  const list = el('ul', { class: 'stage-trophies' });

  for (const trophy of trophies) {
    const sealed = store.isSealed(trophy);
    const row = el(
      'li',
      {
        class: `stage-trophy${store.isEarned(trophy.id) ? ' is-earned' : ''}`,
        onclick: () => onOpen(trophy),
        title: sealed ? 'Sealed until earned' : trophy.description,
      },
      el(`span`, { class: `row-grade grade-${trophy.grade}` }),
      el('span', { class: 'stage-trophy-name', text: sealed ? 'Hidden trophy' : trophy.name }),
      trophy.missable ? el('span', { class: 'stage-trophy-tag', text: 'Missable' }) : null,
    );
    list.append(row);
  }

  // A stage is a paragraph of the plan, not a gate: its note says what opens or closes here.
  const card = el(
    'article',
    { class: `stage-card${stage.missable ? ' is-missable-stage' : ''}${trophies.length > 10 ? ' is-long' : ''}` },
    el(
      'header',
      { class: 'stage-head' },
      el('span', { class: 'stage-number', text: String(stage.id).padStart(2, '0') }),
      el('h3', { class: 'stage-title', text: stage.title }),
      el('span', { class: 'stage-count', text: `${earned} / ${trophies.length}` }),
    ),
    el('p', { class: 'stage-note' },
      el('em', { class: 'stage-window', text: stage.window }),
      stage.warning ? el('b', { text: stage.warning }) : null,
      stage.note),
    list,
  );
  return card;
}

// --- the missables board ---------------------------------------------------------

const WINDOWS = [
  {
    id: 46,
    name: "Let's Go Bowling",
    tag: 'slow respawn',
    note: 'The Kingpin Bowling robbery in Port Gellhorn respawns slowly. Take all three valuables — watch, shotgun and safe — in one visit.',
  },
  {
    id: 45,
    name: 'Capital Offense',
    tag: 'needs Key Cloner',
    note: 'The showroom Banshee cannot be taken until the Key Cloner from Randy’s Chapter 3 strand is in hand.',
  },
  {
    id: 50,
    name: 'The Truth Is Out There',
    tag: '2 AM, solo',
    note: 'The UFO event only fires after 2 AM, alone, and not on every visit. Drive away and return if the blinking car is missing.',
  },
  {
    id: 49,
    name: 'Bad Luck, I Guess · Ten Pin',
    tag: 'unconfirmed',
    note: 'No guide has confirmed the trigger for either. Check the trophy list after a full run instead of farming blindly.',
  },
  {
    id: 37,
    name: 'Catch Me If You Can',
    tag: 'one kind of plane',
    note: 'Only jets docked at a boarding bridge count. Aeroplanes parked out on the airfield will not unlock it.',
  },
];

export function renderMissables({ node, guide, store, onOpen, onSpoilerOff }) {
  clear(node);
  const critical = guide.trophies.find((trophy) => trophy.missable);
  const sealed = guide.trophies.filter((trophy) => store.isSealed(trophy)).length;

  const board = el('div', { class: 'missable-board' });

  board.append(
    el(
      'header',
      { class: 'board-head' },
      el('h2', { text: 'Windows that close' }),
      el('p', {
        text: 'Only one of the 55 trophies can be lost. These are the timings beside it that guides warn about — sourced, not guessed.',
      }),
    ),
  );

  if (critical) {
    board.append(
      el(
        'article',
        { class: 'window-card is-critical' },
        el('span', { class: 'window-tag', text: `Missable · Stage ${critical.stage} · ${critical.grade}` }),
        el('h3', { text: critical.name }),
        el('p', {
          text: 'In Chapter 1, the morning after Down to Earth, Lucia offers the first meditation on the balcony at home. The scene is gone once Chapter 1 ends, and guides still disagree on whether the trophy sums it in, so treat it as required.',
        }),
        el(
          'ol',
          { class: 'window-steps' },
          el('li', { text: 'Finish the Chapter 1 mission Down to Earth.' }),
          el('li', { text: 'Sleep, then find Lucia in the kitchen the next morning.' }),
          el('li', { text: 'Follow her out to the balcony and accept the meditation.' }),
          el('li', { text: 'Make a manual save before the chapter’s last mission.' }),
        ),
        el('button', { class: 'button button-primary', type: 'button', onclick: () => onOpen(critical) }, 'Open its guide'),
      ),
    );
  }

  board.append(
    el(
      'article',
      { class: 'window-card' },
      el('span', { class: 'window-tag', text: 'Spoiler guard' }),
      el('h3', { text: `${sealed} hidden trophies sealed right now` }),
      el('p', {
        text: 'PSN hides 28 of the 55 until they are earned. With the guard on, their names, descriptions, guides and rows in this board stay masked; marking one earned, or opening the guard, reveals it.',
      }),
      el('button', { class: 'button button-ghost', type: 'button', onclick: () => onSpoilerOff() }, 'Show all spoilers'),
    ),
  );

  const list = el('ul', { class: 'window-list' });
  for (const entry of WINDOWS) {
    const trophy = guide.byId.get(entry.id);
    const masked = trophy ? store.isSealed(trophy) : false;
    list.append(
      el(
        'li',
        {},
        el('span', {}, el('b', { text: `${masked ? 'Hidden trophy' : entry.name} — ` }),
          masked ? 'Sealed by the spoiler guard; open it to read the timing.' : entry.note),
        el('em', { text: entry.tag }),
      ),
    );
  }

  board.append(
    el(
      'article',
      { class: 'window-card' },
      el('span', { class: 'window-tag', text: 'Timed, never lost' }),
      el('h3', { text: 'Worth doing in order anyway' }),
      list,
    ),
  );

  node.append(board);
}