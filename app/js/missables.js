// The missable callout view: the one trophy that can be lost — Positive Mental Attitude
// in Chapter 1 — as a single focused card, with its official description, why it closes,
// the steps to take it, its cited sources, and beside it a guard card showing how many
// story trophies the spoiler guard is still holding back.

import { el, clear } from './ui.js';
import { stageOf } from './data.js';

const TIMED = [
  {
    id: 46,
    name: "Let's Go Bowling",
    tag: 'slow respawn',
    note: 'The Kingpin Bowling robbery in Port Gellhorn respawns slowly. Take all three valuables in one visit.',
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
    note: 'The UFO event only fires after 2 AM, alone, and not on every visit. Drive away and return if the car is missing.',
  },
  {
    id: 37,
    name: 'Catch Me If You Can',
    tag: 'one kind of plane',
    note: 'Only jets docked at a boarding bridge count. Aeroplanes parked on the airfield do not unlock it.',
  },
];

export function renderMissables({ node, guide, store, onOpen, onSpoilerOff }) {
  clear(node);
  const missable = guide.trophies.find((trophy) => trophy.missable);
  const sealedCount = guide.trophies.filter((trophy) => store.isSealed(trophy)).length;

  const board = el('div', { class: 'missable-view' });
  board.append(calloutCard(missable, onOpen));
  board.append(guardCard(sealedCount, store.spoilerSealed, onSpoilerOff, guide, store));
  node.append(board);
}

function calloutCard(missable, onOpen) {
  if (!missable) {
    return el('article', { class: 'callout' }, el('h2', { text: 'No missable trophies' }));
  }
  const stage = stageOf(missable.stage);

  const steps = el('ol', { class: 'callout-steps' });
  for (const step of [
    'Finish the Chapter 1 mission Down to Earth.',
    'Sleep, then find Lucia in the kitchen the next morning.',
    'Follow her out to the balcony and accept the meditation.',
    'Manual-save before the chapter’s last mission and verify the trophy popped.',
  ]) {
    steps.append(el('li', { text: step }));
  }

  const sources = el('div', { class: 'callout-sources' }, sourceLinks(missable));

  return el(
    'article',
    { class: 'callout' },
    el('span', { class: 'callout-tag', text: `Missable · Stage ${missable.stage} · ${stage.window} · ${missable.grade}` }),
    el('h2', { text: missable.name }),
    el('p', { class: 'callout-desc', text: missable.description }),
    el(
      'p',
      {
        text: 'The only trophy the run can lose. In Chapter 1, the morning after the mission Down to Earth, Lucia offers the first meditation on the balcony at home. The scene is gone once Chapter 1 ends, and guides still disagree on whether the trophy sums it in at the end — so treat it as required and take it before the finale.',
      },
    ),
    steps,
    sources,
    el(
      'div',
      { class: 'callout-actions' },
      el('button', { class: 'button button-primary', type: 'button', onclick: () => onOpen(missable) }, 'Open its guide'),
    ),
  );
}

function sourceLinks(trophy) {
  const list = el('ul', { class: 'source-list' });
  for (const source of trophy.sources) {
    list.append(
      el(
        'li',
        {},
        el('a', { href: source.url, target: '_blank', rel: 'noopener noreferrer', title: `${source.name} — ${source.url}` },
          el('span', { text: '↗' }), el('span', { text: source.name })),
      ),
    );
  }
  return list;
}

function guardCard(sealedCount, sealed, onSpoilerOff, guide, store) {
  const list = el('ul', { class: 'guard-list' });
  for (const entry of TIMED) {
    const trophy = guide.byId.get(entry.id);
    const masked = trophy ? store.isSealed(trophy) : false;
    list.append(
      el(
        'li',
        {},
        el('b', { text: `${masked ? 'Hidden trophy' : entry.name} — ` }),
        masked ? 'Sealed by the spoiler guard; open it to read the timing.' : entry.note,
        el('em', { text: entry.tag }),
      ),
    );
  }

  return el(
    'article',
    { class: 'guard-card' },
    el('span', { class: 'callout-tag', text: 'Spoiler guard' }),
    el(
      'h3',
      { text: `${sealedCount} hidden trophies are sealed right now` },
    ),
    el('p', {
      text: 'PSN keeps 28 of the 55 secret until earned. With the guard on, their names, descriptions, guides and rows stay masked; marking one earned — or opening the guard — reveals it. The rest are timings that change the order, never lost.',
    }),
    list,
    sealed
      ? el('div', { class: 'callout-actions' }, el('button', { class: 'button button-ghost', type: 'button', onclick: () => onSpoilerOff() }, 'Show all spoilers'))
      : el('p', { style: 'color:var(--teal);font-family:var(--mono);font-size:11px;letter-spacing:0.06em;text-transform:uppercase;' }, 'Guard is open — every name is readable'),
  );
}
