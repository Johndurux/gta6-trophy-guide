// Second pass over app/data/trophies.json: trims the walk-through for trophies that are not
// the cover of this guide, and tightens the one trophy a run can lose so that its whole page
// — title, description, walk-through and the point-of-no-return box — fits one screen.
//
//   node tools/tighten-guides.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const FILE = new URL('../app/data/trophies.json', import.meta.url);

/** Shorter walk-throughs for the long lists: the same facts, one line a step. */
const SHORTER = {
  14: [
    'Finish the story first: the 100% list appears under Progress > Stats > 100% Completion once the credits roll.',
    'Clear the categories required in full — all bank vaults and gang operations, the underwater discoveries, all 42 shooting-range golds, all 42 drone races and Bret’s 15 Target Decks.',
    'Top up the partial ones: 300 stunts, 200 of 277 vehicle scans, 100 of 255 animal scans, 100 of 255 WAiNK scans, 15 of 18 meditations, 70 of 80 challenges, 100 optional missions.',
    'Check the in-game list for the last few percent — it is the authority, not this tracker.',
  ],
  15: [
    'Fly under bridges with a helicopter or plane: 202 of the 397 stunts are fly-unders and they add numbers fastest.',
    'Fill in with the 130 stunt jumps, the 40 knife flights and the 25 base jumps as you travel between other objectives.',
    'Track the count under Progress > Activities > Stunts and turn stunt spots on in the map filter.',
    'Stop at 250 for the trophy; the 100% list wants 300.',
  ],
  17: [
    'Pick a shooting range off the map and learn each challenge’s target order on a slow, accurate run.',
    'Retry for the clock from the range’s own score screen — leaving the building costs a reload.',
    'Nine of the 42 golds are usually the last, so clear a range completely before moving on.',
    'Range practice also raises Focus, which is what Gunslinger needs.',
  ],
  22: [
    'Wait for Andy’s call and the Belville address in Chapter 3 — the five jobs are Lucia-only.',
    'Work them in order: Climbing the Cellerichain, Pay the Cellerica Fee, Peach!, Read the Label, Puff Puff Pass.',
    'Finish Puff Puff Pass — that is the trophy. The markers stay on the map in free roam, so nothing is lost by waiting.',
  ],
  23: [
    'Start with Kenton at the green KR marker in Key Lento in Chapter 1 to open the treasure strand.',
    'Dive at the seven purple chest markers and dig with the metal detector.',
    'He goes quiet after Chapter 1 and texts again later — finish the last wreck then. Progress > Collections > Kenton’s Treasures tracks the seven.',
  ],
  26: [
    'Finish the Chapter 3 mission Clonin’ Keys, Makin’ GS for the Key Cloner and Randy’s Wish List.',
    'Scan a car with WAiNK to see whether it is on the list before you steal it.',
    'Hunt the hotel driveways around Vice Beach and Ocean Beach; that is where the sports cars cluster.',
    'Deliver all 16 to the garage in west Vice City. Condition pays more, never the trophy.',
  ],
  28: [
    'After Down to Earth in Chapter 1, follow Lucia to the balcony and accept her meditation.',
    'Reach 18 spots; the pair count twice and the last needs both after Coffee Break in Chapter 2.',
    'Track the total under Progress > Collections > Exploration > Meditations.',
  ],
  31: [
    'Hold Up on the D-pad and scan with R1/RB, from a car: the app marks what is already done.',
    'Work the dense pools first — 31 Landmarks, 35 Curiosities, 23 Sculptures and the No Flusher tags.',
    'Stop at 100; those same hundred are what the 100% list asks for.',
  ],
  34: [
    'Bring your partner and pick three shops close together — the north Vice City jewelry stores are the easiest chain.',
    'Rob them back-to-back and keep the police chasing: losing the wanted level resets the chain.',
    'Give it thirty seconds after the third before deciding, and rob a fourth if nothing pops.',
  ],
  36: [
    'Fill the Focus meter first — eating, drinking and washing up at home all raise it — and carry Adrenaline.',
    'Take an accurate automatic rifle such as the Duke 556 to a gang operation; thugs count, police and civilians appear not to.',
    'Click both sticks while aiming, then take five enemies inside the one window.',
  ],
  37: [
    'Drive to VCIA and get onto the airfield; gates E3 and E4 have a door by the stairs.',
    'Steal a large passenger jet at a boarding bridge — planes parked on the airfield do not count.',
    'Back out, take off and fly about a kilometre clear of the airport.',
  ],
  40: [
    'Finish That’s Where The Money Is... in Chapter 4 to open vault robberies. Yasmani sells van tips for $10,000.',
    'Tail a security van to its bank and get in while the vault stands open.',
    'Hand a bag to your partner — the haul is too heavy for one character — then run on a fast bike.',
    'Five vaults is the trophy; all eight are needed for A Long Road.',
  ],
  42: [
    'Fly long legs over every dark patch, coasts first, and move the map filter to unexplored.',
    'You never have to land: map discovery is the count, not collectibles.',
    'A handful of flights usually finishes it; repeat only if a corner stays dark.',
  ],
  46: [
    'Wait for Hit Kingpin Bowling in Chapter 2 to mark the Port Gellhorn alley as a gang operation.',
    'Take the watch from the south-east office, the shotgun from the north-east table, then blow the hall safe with sticky bombs.',
    'All three in one visit, then lose the police — the robbery respawns slowly.',
  ],
  48: [
    'Turn on Criminal Profile notifications under Settings > UI to see each shift.',
    'Play normally: robberies, fights and general crime all move the meter.',
    'Keep going to 500 — and stop short of Irredeemable, which is permanent.',
  ],
  50: [
    'Go alone after 2 AM and drive the road north-west of the Starlet Motel in Kelly County.',
    'Look for a blinking car at the roadside; if it is missing, drive away and come back, because the spawn is not guaranteed.',
    'Follow the prompt beside the car.',
  ],
  52: [
    'Finish Credit Check (Meet Raul’s Crew) in Chapter 3 to get the Dye Pack Jammer.',
    'Rob banks and Payday Loans, then sell the marked bills to a fence — Yasmani in Vice City pays most.',
    'It is a running total, not one delivery; bank vaults can hand over $205,000 a time once they open.',
  ],
  55: [
    'Wait for Moses’ Chapter 2 mission to install the Scooter Bros app.',
    'Steal cars and register them at his Port Gellhorn garage after a respray; at first only cars without trackers.',
    'From Chapter 3 any Pay ’n’ Spray can register tracked ones. Ten total, with cheap cars and bikes keeping the bill down.',
  ],
};

const SHORTER_SUMMARY = {
  28: 'The one trophy a finished run can lose — everything else waits for you after the credits.',
};

/** The guide prose for the cover trophy, split into the page's paragraphs. */
const SHORTER_GUIDE = {
  28: 'Meditate at all 18 spots across Leonida; a spot with both characters together counts twice, and the last one needs them both, which only opens up after Coffee Break in Chapter 2.',
};

const doc = JSON.parse(readFileSync(FILE, 'utf8'));
let steps = 0;
let prose = 0;

for (const trophy of doc.trophies) {
  if (SHORTER[trophy.id]) {
    trophy.steps = SHORTER[trophy.id];
    steps += 1;
  }
  if (SHORTER_SUMMARY[trophy.id]) trophy.summary = SHORTER_SUMMARY[trophy.id];
  if (SHORTER_GUIDE[trophy.id]) {
    trophy.guide = SHORTER_GUIDE[trophy.id];
    prose += 1;
  }
}

writeFileSync(FILE, `${JSON.stringify(doc, null, 2)}\n`);
console.log(`shortened ${steps} walk-throughs and ${prose} guide prose passages`);
