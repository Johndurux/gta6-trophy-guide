// The per-trophy panel: the official name, description and grade, my guide in my own
// words, the sources it draws on as links that only open when clicked, the flags, and
// the earned box. A trophy the spoiler guard still holds is shown sealed.

import { el, clear, hostOf } from './ui.js';
import { kindLabel, stageOf } from './data.js';

export function renderDetail({ node, trophy, guide, store, onToggle, onSpoilerOff, onStep }) {
  clear(node);
  if (!trophy) {
    node.append(
      el(
        'div',
        { class: 'detail-sealed' },
        el('span', { class: 'sealed-mark', text: '✦' }),
        el('h3', { text: 'Pick a trophy' }),
        el('p', { text: 'Choose a row on the left to read its guide, its sources and its roadmap stage.' }),
      ),
    );
    return;
  }

  const sealed = store.isSealed(trophy);
  const card = el('article', { class: 'detail-card' });
  card.append(sealed ? sealedHead(trophy, onToggle, onSpoilerOff) : openHead(trophy, store, onToggle));

  if (!sealed) {
    card.append(guideSection(trophy), sourcesSection(trophy));
  }

  card.append(footer(trophy, guide, onStep));
  node.append(card);
}

// --- header variants -------------------------------------------------------------

function openHead(trophy, store, onToggle) {
  const stage = stageOf(trophy.stage);
  const badges = el(
    'div',
    { class: 'detail-badges' },
    el('span', { class: `chip chip-grade grade-${trophy.grade}`, text: trophy.grade }),
    el('span', { class: `chip chip-${trophy.kind}`, text: kindLabel(trophy.kind) }),
    trophy.missable ? el('span', { class: 'chip chip-missable', text: 'Missable' }) : null,
    el('span', { class: 'chip chip-online', text: `Stage ${trophy.stage}` }),
  );

  const earnedBox = el('input', {
    type: 'checkbox',
    checked: store.isEarned(trophy.id),
    onchange: (event) => onToggle(trophy, event.target.checked),
  });

  return el(
    'header',
    { class: 'detail-head' },
    el(
      'div',
      { class: 'detail-head-main' },
      el('p', { class: 'detail-kicker', text: `Stage ${trophy.stage} · ${stage.title.split(' — ')[0]}` }),
      el('h2', { class: 'detail-name', text: trophy.name }),
      el('p', { class: 'detail-desc', text: trophy.description }),
      badges,
    ),
    el('label', { class: 'detail-earned' }, earnedBox, el('span', { class: 'earned-mark' }), 'Mark earned'),
  );
}

function sealedHead(trophy, onToggle, onSpoilerOff) {
  return el(
    'div',
    {},
    el(
      'header',
      { class: 'detail-head' },
      el('p', { class: 'detail-kicker', text: `Stage ${trophy.stage} · hidden trophy` }),
      el('h2', { class: 'detail-name', text: 'Hidden trophy' }),
      el('p', { class: 'detail-desc', text: 'PlayStation keeps this one secret until it is earned.' }),
    ),
    el(
      'div',
      { class: 'detail-sealed' },
      el('span', { class: 'sealed-mark', text: '⌧' }),
      el('h3', { text: 'Sealed by the spoiler guard' }),
      el(
        'p',
        { text: 'Its name, description, guide and sources stay hidden until you mark it earned or open the guard. The rest of the checklist is unaffected.' },
      ),
      el(
        'div',
        { class: 'sealed-actions' },
        el('button', { class: 'button button-primary', type: 'button', onclick: () => onToggle(trophy, true) }, 'I earned it — reveal'),
        el('button', { class: 'button button-ghost', type: 'button', onclick: () => onSpoilerOff() }, 'Show all spoilers'),
      ),
    ),
  );
}

// --- body sections ---------------------------------------------------------------

function guideSection(trophy) {
  const section = el(
    'section',
    { class: 'detail-section' },
    el('h3', {}, 'How to get it', el('b', { text: 'written for this guide' })),
    el('p', { class: 'detail-guide', text: trophy.guide }),
  );
  if (trophy.tips) {
    section.append(el('p', { class: 'detail-tip' }, el('b', { text: 'Tip' }), trophy.tips));
  }
  return section;
}

function sourcesSection(trophy) {
  const list = el('ul', { class: 'source-list' });
  for (const source of trophy.sources) {
    list.append(
      el(
        'li',
        {},
        el(
          'a',
          {
            href: source.url,
            target: '_blank',
            rel: 'noopener noreferrer',
            title: `${source.name} — ${hostOf(source.url)}`,
          },
          el('span', { text: '↗' }),
          el('span', { text: source.name }),
        ),
      ),
    );
  }

  return el(
    'section',
    { class: 'detail-section' },
    el('h3', {}, 'Sources', el('b', { text: String(trophy.sources.length) })),
    list,
    el('p', {
      class: 'source-note',
      text: 'Links open only when clicked — the guide itself loads nothing from the network.',
    }),
  );
}

function footer(trophy, guide, onStep) {
  const index = guide.trophies.findIndex((entry) => entry.id === trophy.id);
  return el(
    'footer',
    { class: 'detail-foot' },
    el('button', { class: 'button button-ghost', type: 'button', onclick: () => onStep(-1) }, '‹ Prev'),
    el('button', { class: 'button button-ghost', type: 'button', onclick: () => onStep(1) }, 'Next ›'),
    el('span', { text: `${index + 1} of ${guide.total}` }),
  );
}