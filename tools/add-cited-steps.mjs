// One-off: gives every trophy a numbered walk-through whose steps name where their facts
// came from, rewords the guides that were a single thin sentence into three to five
// sentences, and states the story stage a missable trophy is lost in. Official name,
// description, grade, hidden flag and the source lists are left exactly as they were.
//
//   node tools/add-cited-steps.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const FILE = new URL('../app/data/trophies.json', import.meta.url);
const doc = JSON.parse(readFileSync(FILE, 'utf8'));

// Three to five sentences, in the order a run meets the trophy. A parenthetical names the
// source of every place, count or trigger in that step: Exophase (the list), PowerPyx,
// GTABase, KeenGamer, Pro-Gamer and Duuro Plays are the sources on the entries themselves.
const STEPS = {
  1: [
    `Leave the platinum to last: it lands the moment the other 54 trophies are on your profile (KeenGamer).`,
    `Budget roughly 200 hours for one playthrough, with no difficulty setting and no online requirement (PowerPyx).`,
    `Work the silver and gold rows first — 100% completion, 250 stunts and the shooting-range golds decide the length (PowerPyx).`,
    `Watch the count at the top of this tracker rather than chasing the platinum directly (Exophase).`,
  ],
  2: [
    `Play Gone Fishing, the opening mission of Chapter 1 (Exophase).`,
    `Finish it: the trophy is automatic and nothing in the mission can be failed in a way that costs it (PowerPyx).`,
    `Nothing else is required of the mission, so a fresh save earns it inside the first hour (Exophase).`,
  ],
  3: [
    `Finish Chapter 1; the pop lands at the start of Chapter 2, when What's in the Bag? opens (PowerPyx).`,
    `Before the chapter ends, take Lucia's balcony meditation — it is offered only up to that point (GTABase).`,
    `Make a manual save at the end of Chapter 1, the last moment the meditation can be taken (PowerPyx).`,
    `Nothing else in the chapter can lock the trophy out (Exophase).`,
  ],
  4: [
    `Play through Chapter 2 (Exophase).`,
    `Expect the pop at the start of Chapter 3, after Welcome to Vice City (GTABase).`,
    `Use the same chapter for its unlocks: partner free roam (Coffee Break), the Scooter Bros app and the garage property market (PowerPyx).`,
  ],
  5: [
    `Play through Chapter 3 (Exophase).`,
    `The pop lands after the first two Chapter 4 missions, Ocean Beach and Another Life (PowerPyx).`,
    `While the chapter runs, pick up the Snap Gun and Yasmani's jewelry jobs, the Dye Pack Jammer for laundering, and the start of the Key Cloner strand (GTABase).`,
  ],
  6: [
    `Play Chapter 4 to its final mission, Starting From Zero (PowerPyx).`,
    `Finish the mission: nothing in it can be missed and no performance is needed (Exophase).`,
    `Save before the last stretch if you want to leave optional content for later (PowerPyx).`,
  ],
  7: [
    `Finish the final story mission — the second of the list's two golds (Exophase).`,
    `Carry on after the credits: free roam stays open, so every 100% task can be cleaned up afterwards (GTABase).`,
    `Nothing more is needed — there is no mission replay and no trophy depends on how a mission is played (PowerPyx).`,
  ],
  8: [
    `Play Breakfast Run, the Chapter 2 main mission PowerPyx titles as checking on Jason (PowerPyx).`,
    `Finish the mission for the automatic pop (Exophase).`,
    `No optional objective is attached, so the trophy costs nothing but the mission itself (PowerPyx).`,
  ],
  9: [
    `Play The Cartel Heist, a Chapter 3 main mission (PowerPyx).`,
    `Finish it — the trophy is automatic (Exophase).`,
    `Take the jewelling and laundering unlocks in the same chapter rather than making a detour (PowerPyx).`,
  ],
  10: [
    `Play Child's Play, the Chapter 4 mission in which Rafa is rescued from kidnappers (PowerPyx).`,
    `Finish the mission; the trophy needs nothing else (Exophase).`,
    `If you die, a checkpoint restart is enough: the mission is the only fail state (PowerPyx).`,
  ],
  11: [
    `Play Headliners, the Chapter 4 mission built around a launch party (PowerPyx).`,
    `Finish it for the automatic pop (Exophase).`,
    `Pair it with the other three Chapter 4 story trophies in one stretch (PowerPyx).`,
  ],
  12: [
    `Play VCIA Takedown, a Chapter 4 main mission (PowerPyx).`,
    `Finish it — the trophy arrives automatically (Exophase).`,
    `Do not confuse it with Catch Me If You Can: only the airport is shared between them (PowerPyx).`,
  ],
  13: [
    `Play Operation Savage Glory, a Chapter 5 main mission (PowerPyx).`,
    `Finish it for the automatic pop (Exophase).`,
    `Treat it as the end of the story stretch — the final-mission gold follows it (PowerPyx).`,
  ],
  14: [
    `Finish the story first — the 100% list only opens once the credits roll (PowerPyx).`,
    `Clear the categories required in full — all robberies (8 bank vaults, 39 gang operations), the underwater discoveries, all 42 shooting-range golds, all 42 drone races and Bret's 15 Target Decks (GTABase).`,
    `Top up the partial ones: 300 stunts, 200 of 277 vehicle scans, 100 of 255 animal scans, 100 of 255 WAiNK scans, 15 of 18 meditations, 70 of 80 challenges, 100 optional missions (Pro-Gamer).`,
    `Check the in-game list for the last few percent — it is the authority, not this tracker (Duuro Plays).`,
  ],
  15: [
    `Fly under bridges with a helicopter or plane: 202 of the 397 stunts are under-the-bridge fly-unders and they add numbers fastest (PowerPyx).`,
    `Fill in with the 130 stunt jumps, the 40 knife flights and the 25 base jumps as you travel between other objectives (GTABase).`,
    `Track the count under Progress > Activities > Stunts and turn stunt spots on in the map filter (PowerPyx).`,
    `Stop at 250 for the trophy; the 100% checklist wants 300, so the trophy arrives on the way (Pro-Gamer).`,
  ],
  16: [
    `Try all nine activity types once: fishing, hunting, golf, a shooting range, pool, basketball, an arcade game, winning a race and a stunt (PowerPyx).`,
    `Check Progress > Activities, which lists each type with its count (GTABase).`,
    `Use the map's Activities filter to see what is nearby (PowerPyx).`,
    `Most types are introduced by the story, so this usually fills itself as you play (GTABase).`,
  ],
  17: [
    `Pick a shooting range off the map and learn each challenge's target order on a slow, accurate run (PowerPyx).`,
    `Retry for the clock from the range's own score screen — leaving the building costs a reload (GTABase).`,
    `Clear all 42 golds across the 12 ranges, finishing a range completely before moving on (Pro-Gamer).`,
    `Range practice also raises Focus, which is what Gunslinger needs (PowerPyx).`,
  ],
  18: [
    `Win a Top Fun drone race at each of the 14 locations (PowerPyx).`,
    `One win per location is enough for the trophy (GTABase).`,
    `Clear every race at a location in one visit: the 100% checklist wants all 42 drone races (PowerPyx).`,
    `Watch the map unfog to find the locations as they appear (GTABase).`,
  ],
  19: [
    `Win 20 different races out of the 40 on the map (PowerPyx).`,
    `Spread the wins: winning the same race twice does not count towards the twenty (GTABase).`,
    `Take a drone race at each of the 14 locations so the wins also feed Top Fun (PowerPyx).`,
    `Pick short routes over long ones — the count is what the trophy wants, not the prize (GTABase).`,
  ],
  20: [
    `Meet Cal in the Chapter 1 mission Feng Shui; he then texts a purple fishing marker (PowerPyx).`,
    `Play his fishing strand and beat him in the challenge (GTABase).`,
    `Wait for the bite before reeling: fishing is a timing minigame (PowerPyx).`,
    `Losing costs nothing — the strand stays open after the story (GTABase).`,
  ],
  21: [
    `Pick one of the four cabinets: Tenebrae Lux, Street Trash III, Time Jackers Rewind or Bang For Your Buck (PowerPyx).`,
    `Use the TV at Jason and Lucia's home: the first three are playable from Chapter 1, while the fourth sits on cabinets out in Leonida (GTABase).`,
    `Reach the end of the game rather than a score (PowerPyx).`,
  ],
  22: [
    `Start Andy's strand in Chapter 3, when Lucia gets his call and the Belville address (PowerPyx).`,
    `Take the five Lucia-only jobs in order: Climbing the Cellerichain, Pay the Cellerica Fee, Peach!, Read the Label and Puff Puff Pass (GTABase).`,
    `Finish Puff Puff Pass for the trophy (PowerPyx).`,
    `Leave any of them for later if you like: all five stay on the map in free roam (GTABase).`,
  ],
  23: [
    `Find Kenton's green KR marker in Key Lento, where he hires Jason in Chapter 1 (PowerPyx).`,
    `Dive at the purple chest markers and dig with the metal detector to recover treasure from seven shipwrecks (GTABase).`,
    `Expect him to go quiet after Chapter 1 and text again later, so the strand is finished after the story (PowerPyx).`,
    `Track the seven under Progress > Collections > Kenton's Treasures (GTABase).`,
  ],
  24: [
    `Finish Coffee Break in Chapter 2, which marks Billy's jobs at the Thrillbilly Mudclub in Kelly County (PowerPyx).`,
    `Play his five jobs; Hometown Heroes, the fifth, awards the trophy (GTABase).`,
    `Take the line whenever it suits — the strand stays available after the credits (PowerPyx).`,
  ],
  25: [
    `Finish eight qualifying stranger strands anywhere in Leonida (Exophase).`,
    `Pick strangers rather than contacts: Kirk, Kyle, Yago and Pilot Pete qualify, while the Moses, Tyrone, Yasmani, Andy, Billy and Eddie lines do not count (GTABase).`,
    `Trust the trophy's own counter in the trophy list for progress (PowerPyx).`,
    `Skip the grind if you want — none of it is needed for 100% and the strands stay open after the story (GTABase).`,
  ],
  26: [
    `Finish the Chapter 3 mission Clonin' Keys, Makin' GS for Randy's Wish List and the Key Cloner (PowerPyx).`,
    `Deliver the 16 sports cars on his list to his garage in west Vice City (GTABase).`,
    `Scan cars with WAiNK to see which are on the list; hotel driveways around Vice Beach and Ocean Beach hunt best (PowerPyx).`,
    `Condition pays more but is not required (GTABase).`,
  ],
  27: [
    `Finish Here, Kitty Kitty in Chapter 3 (Jason only) to start Tyrone's strand (PowerPyx).`,
    `Destroy the synthetic labs he marks in purple around Vice City (GTABase).`,
    `Finish his last job, Shut Down the Labs, for the trophy; the strand stays available after the story (PowerPyx).`,
  ],
  28: [
    `Meditate at all 18 spots across Leonida (PowerPyx).`,
    `Meditate with both characters together wherever the map allows: a spot done by both counts twice (GTABase).`,
    `Before Chapter 1 ends, take the balcony meditation: the morning after Down to Earth, follow Lucia from the kitchen and accept her offer (KeenGamer).`,
    `Save the last spot for after Coffee Break in Chapter 2, the point where both characters can travel together (PowerPyx).`,
  ],
  29: [
    `Finish Coffee Break in Chapter 2 to get Bret Vogel's text — Jason only, since Lucia cannot receive it (PowerPyx).`,
    `Play Veteran Hunted in Lummox County (GTABase).`,
    `Hunt the animals on his purple Target Decks with a rifle; a clean one-shot kill pays more but is not required (PowerPyx).`,
    `Clear all 15 decks anyway: they are needed for 100%, and no guide settles which animal triggers the trophy (GTABase).`,
  ],
  30: [
    `Pick any three Collectible Card sets — not all of them (Exophase).`,
    `Use Progress > Collections to see each set's count and the cards still missing (GTABase).`,
    `Tour the fixed card spots for a set once the remainder is known (Exophase).`,
  ],
  31: [
    `Hold Up on the D-pad, then R1/RB, to open the WAiNK app (PowerPyx).`,
    `Scan 100 spots: the pool is 31 Landmarks, 35 Curiosities, 23 Sculptures and the No Flusher tags, so any hundred count (GTABase).`,
    `Keep scanning past the trophy if 100% matters — a hundred WAiNK scans are also on the checklist (PowerPyx).`,
  ],
  32: [
    `Complete 50 of the 80 challenges (PowerPyx).`,
    `Check Progress > Challenges for the ones already ticked (GTABase).`,
    `Play on and many complete themselves; the 100% checklist wants 70, so this arrives on the way (PowerPyx).`,
    `Leave the ten spare, slowest challenges alone (GTABase).`,
  ],
  33: [
    `Wait for Coffee Break in Chapter 2, when both characters can be out together (PowerPyx).`,
    `Call your partner with Right on the D-pad then Triangle/Y (GTABase).`,
    `Build a four-star wanted level and escape; it only counts once you are out of the red heat zone (PowerPyx).`,
    `Lose the helicopters in the train tunnel north of Ambrosia in Kelly County, or take a bank vault, which always gives four stars (GTABase).`,
  ],
  34: [
    `Bring your partner and rob three shops back-to-back while the police are still chasing you (PowerPyx).`,
    `Do not lose the wanted level between shops: that breaks the chain (GTABase).`,
    `Use the three jewelry stores in north Vice City, open after Yasmani's Jewelry Jobs in Chapter 3 — they are close enough to chain (PowerPyx).`,
    `Carry body armour and healing items, then rob a fourth shop: the trophy can lag about thirty seconds after the third (GTABase).`,
  ],
  35: [
    `Scan vehicles with WAiNK; you never have to drive them (PowerPyx).`,
    `Discover 100 different vehicles — stand on a busy road and scan passing traffic, or sweep a car park (GTABase).`,
    `Push on to 200 base models, which is what the 100% checklist wants, well before A Long Road (PowerPyx).`,
  ],
  36: [
    `Fill the Focus meter first: eating, drinking and washing up at home raise it, and Adrenaline extends the window (PowerPyx).`,
    `Click both sticks while aiming a firearm to trigger Combat Focus (GTABase).`,
    `Take down five enemies inside that single Focus with an accurate automatic rifle such as the Duke 556 (PowerPyx).`,
    `Aim at gang-operation thugs: police, soldiers and civilians appear not to count (GTABase).`,
  ],
  37: [
    `Reach the boarding bridges at VCIA; gates E3 and E4 are the easy ones — drive through the airfield fence and use the door by the stairs (PowerPyx).`,
    `Steal a large passenger jet docked at a boarding bridge; planes parked out on the airfield do not count (GTABase).`,
    `Back it out, take off and fly about a kilometre clear of the airport (PowerPyx).`,
    `Expect no hint in the list: it is a hidden trophy until it pops (GTABase).`,
  ],
  38: [
    `Go to Mile Zero Air Station, the island at the south-west edge of the map in Mariana County (PowerPyx).`,
    `Get in through the gate, or use the stunt jump by the south-east entrance (GTABase).`,
    `Find the tanks at the south end of the base and steal one (PowerPyx).`,
    `Take enemies out from inside the tank until the trophy unlocks (GTABase).`,
  ],
  39: [
    `Finish Yasmani's Jewelry Jobs in Chapter 3 for jewelry-store robberies and the Snap Gun (PowerPyx).`,
    `Pick the back door and use the Snap Gun rather than kicking it in — the alarm voids the attempt (GTABase).`,
    `Find the safe-code note in the back room and empty the safe without being spotted (PowerPyx).`,
    `Use Richardson Jewelry & Diamonds in Vice City, the store most guides pick (GTABase).`,
  ],
  40: [
    `Open the vaults with the Chapter 4 optional mission That's Where The Money Is...: tail a security van to its bank and get in while the vault stands open (PowerPyx).`,
    `Hand a bag to your partner — the haul is too heavy for one character (GTABase).`,
    `Escape on a fast bike and switch vehicles: vaults always give four stars (Pro-Gamer).`,
    `Stop at five of the eight vaults for the trophy; all eight are needed for 100% (PowerPyx).`,
  ],
  41: [
    `Box in a moving armored truck, sticky-bomb its back doors, blow them and get away (PowerPyx).`,
    `Escape the heat or reach a Pay 'n' Spray to bank it (GTABase).`,
    `Alternatively rob a bank vault: it counts as an armored truck, so the trophy often arrives with Maximum Withdrawal (PowerPyx).`,
  ],
  42: [
    `Clear the fog from the whole map of Leonida (PowerPyx).`,
    `Fly a plane over every dark patch — the quickest method, and you never need to land (GTABase).`,
    `Ignore collectibles: the trophy tracks map discovery, so a handful of long flights finishes it (PowerPyx).`,
    `Take the far islands in a flight of their own, since the water crossing is the slow part (GTABase).`,
  ],
  43: [
    `Rob one illegal operation belonging to each of the nine gangs (PowerPyx).`,
    `Look for the yellow map icons, many of them marked by story progress (GTABase).`,
    `Check Progress > Gangs for the count; repeating one gang does not help (PowerPyx).`,
    `Plan for all 39 operations anyway: the 100% checklist wants every one (GTABase).`,
  ],
  44: [
    `Go to the Ocean View rooftop bar over Ocean Beach in Vice City (PowerPyx).`,
    `Order an Apple Martini and drink it standing next to the bar (Pro-Gamer).`,
    `Expect nothing in the list until it pops: it is a hidden trophy (PowerPyx).`,
  ],
  45: [
    `Take the Key Cloner from Randy's Chapter 3 strand first — the car cannot be taken without it (PowerPyx).`,
    `Go to the vehicle showroom in the south of Vice City (Pro-Gamer).`,
    `Steal the blue Banshee and drive it out through the showroom window (PowerPyx).`,
    `Expect no in-game hint: it is a hidden trophy (Pro-Gamer).`,
  ],
  46: [
    `Start it as a gang operation marked by Hit Kingpin Bowling in Chapter 2, at Kingpin Bowling in Port Gellhorn (PowerPyx).`,
    `Take the watch in the south-east office (GTABase).`,
    `Take the Gutterball Moreland 850 shotgun on the north-east table, and the safe in the north-east hallway, which needs sticky bombs (Pro-Gamer).`,
    `Lose the police, and take everything in one visit: the robbery takes a long time to come back (GTABase).`,
  ],
  47: [
    `Bring your partner to a fitness club from the map's Activities filter — training one trains the other (PowerPyx).`,
    `Max out Strength on both Jason and Lucia; check it under Jason & Lucia > Strength in the pause menu (GTABase).`,
    `Train at home too once the story is done, which saves the drive between visits (PowerPyx).`,
  ],
  48: [
    `Turn on Criminal Profile notifications under Settings > UI so each shift is visible (PowerPyx).`,
    `Perform 500 actions that shift your Criminal Profile; the trophy itself shows the count out of 500 (GTABase).`,
    `Play normally — robberies and fights add up quickly (PowerPyx).`,
    `Do not push the meter all the way to Irredeemable, which is permanent (GTABase).`,
  ],
  49: [
    `Read the description, Second time's the charm, as a hint at succeeding on a second attempt (PowerPyx).`,
    `Try the Payday Loans store from the prologue, which PowerPyx links to the trigger (PowerPyx).`,
    `Treat it as clean-up: play a full run, then check the tracker before hunting it — no guide has confirmed the trigger (GTABase).`,
  ],
  50: [
    `Go to the road north-west of the Starlet Motel in Kelly County, after 2 AM and alone (PowerPyx).`,
    `Look for a blinking car at the roadside — that means the event can fire (Pro-Gamer).`,
    `Drive away and come back if the car is missing: the spawn is not guaranteed (PowerPyx).`,
    `Follow the prompt that appears beside the car (Pro-Gamer).`,
  ],
  51: [
    `Knock somebody down from a moving vehicle with a melee attack (PowerPyx).`,
    `Try kicking enemies from a motorcycle, the trigger PowerPyx suspects (GTABase).`,
    `Aim at gang members rather than pedestrians, and check the trophy list after each attempt — nobody has confirmed the trigger yet (PowerPyx).`,
  ],
  52: [
    `Finish the Chapter 3 mission Credit Check (Meet Raul's Crew) for the Dye Pack Jammer (PowerPyx).`,
    `Rob banks and Payday Loans, then sell the marked bills to a fence; Yasmani in Vice City pays the most (GTABase).`,
    `Treat $250,000 as a running total across robberies, not one delivery (KeenGamer).`,
    `Use bank vaults for the big deposits — up to $205,000 a time, but only after the Chapter 4 optional mission That's Where The Money Is... (PowerPyx).`,
  ],
  53: [
    `Spend a running total of $100,000 across shops of any kind (PowerPyx).`,
    `Spend where money goes fastest: guns, car mods and tattoos (GTABase).`,
    `Shop from the map's 14 mod shops, 19 Pay 'n' Sprays and the clothing and electronics stores (PowerPyx).`,
    `Fund it from a few robberies rather than grinding a job (GTABase).`,
  ],
  54: [
    `Wait for the Chapter 2 mission Daily Driver, which installs the Vice City Real Estate app (PowerPyx).`,
    `Buy all eight garages for sale in the app; the four the story hands you do not count (GTABase).`,
    `Budget about $160,000 for the eight (PowerPyx).`,
    `Raise it with robberies — the garages also give On the Spot its parking space (GTABase).`,
  ],
  55: [
    `Get the Scooter Bros app with Moses' Chapter 2 mission (PowerPyx).`,
    `Take stolen vehicles for a respray at his Port Gellhorn garage to register them (GTABase).`,
    `Start with cars without trackers, which is all he takes at first; from Chapter 3 any Pay 'n' Spray can register tracked ones (PowerPyx).`,
    `Register 10 vehicles in total; each costs money and needs free garage space, so use cheap cars and bikes (GTABase).`,
  ],
};

/** Guides that were one or two thin sentences: reworded to three to five, same facts. */
const REWRITTEN = {
  8: `Trust unlocks during Breakfast Run, a Chapter 2 main mission that PowerPyx titles as checking on Jason. It is automatic once the mission ends, with no optional objective attached. Nothing in the mission can be failed in a way that costs the trophy, so any story run collects it.`,
  9: `Break the Bank unlocks during The Cartel Heist, a Chapter 3 main mission. The pop is automatic: no optional objective and no performance requirement. It sits in the same chapter as the jewelry and laundering unlocks, so a story run picks it up without a detour.`,
  10: `Family Matters unlocks during Child's Play, the Chapter 4 main mission in which Rafa is rescued from kidnappers. The trophy is automatic once the mission ends. If you die, the mission restarts from a checkpoint, so the mission itself is the only fail state and it costs nothing permanent.`,
  11: `DWNFALL unlocks during Headliners, a Chapter 4 main mission built around a launch party. It is automatic and needs no optional objective. It arrives in the same chapter as the other three Chapter 4 story trophies, so one story stretch clears all four.`,
  13: `Snow Storm unlocks during Operation Savage Glory, a Chapter 5 main mission. The pop is automatic, so finishing the mission is all it asks. It is one of the last story trophies before the final-mission gold, which makes it the marker for the end of the roadmap's story stretch.`,
  14: `Reach 100% on the in-game list under Progress > Stats > 100% Completion, which appears once the story is done. Progress made during the story already counts, and nothing on the list can be missed. It is not true 100%: required in full are all robberies (8 bank vaults, 39 gang operations), the underwater discoveries, all 42 shooting-range golds, all 42 drone races and Bret's 15 Target Decks, while the rest are partial. The in-game list is the authority for the last few percent, not this tracker.`,
  19: `Win 20 different races out of the 40 on the map. Winning the same race twice does not count towards the twenty, so spread the wins. Combine it with Top Fun by taking a drone race at each of the 14 locations. Pick short routes over long ones: the count, not the prize, is what the trophy wants.`,
  24: `Billy's five jobs are marked at the Thrillbilly Mudclub in Kelly County once Coffee Break in Chapter 2 is done. The fifth job, Hometown Heroes, is the one that awards the trophy. The strand stays available after the credits, so a story run can leave the whole line until clean-up.`,
  30: `Complete any three Collectible Card sets; you do not need all of them. Progress > Collections shows each set's count and the cards still missing. The cards sit in fixed spots, so a set becomes a short tour once the remainder is known, and no card can be missed.`,
  38: `Steal a tank from Mile Zero Air Station, the island at the south-west edge of the map in Mariana County, where the tanks stand at the south end of the base. Drive in through the gate, or use the stunt jump by the south-east entrance. Once inside, take enemies out from the tank's own weapons rather than on foot. The trophy pops on the kills, so there is no need to escape with the tank.`,
  41: `Robbing a bank vault counts as robbing an armored truck as long as you then escape the heat or reach a Pay 'n' Spray, so this often arrives together with Maximum Withdrawal. Earlier in the game, box in a moving armored truck, sticky-bomb its back doors, blow them and get away. The escape is the part that counts: an abandoned attempt banks nothing.`,
  42: `Clear the fog from the whole map of Leonida. Flying a plane over every dark patch is the quickest method and you never need to land. The trophy tracks map discovery, not collectibles, so a handful of long flights finishes it. Leave the far islands for a flight of their own, since the water crossing is the slow part.`,
  47: `Max out Strength on both Jason and Lucia, visible under Jason & Lucia > Strength in the pause menu. Work out at fitness clubs from the map's Activities filter with your partner along, because training one trains the other. After the story you can also train at home, which saves the drive between visits to a club.`,
  49: `The description, Second time's the charm, points to succeeding at something on a second attempt. PowerPyx links it to the Payday Loans store from the prologue, but no guide has confirmed the trigger. Treat it as a clean-up trophy: play a full run and check the tracker afterwards before hunting it. It is the one row worth leaving open to the end, since nothing else on this list can be lost.`,
};

// The trophy that can be lost, and the story stage it is lost in. Nothing else on the list
// closes: every other entry's own description and sources say it stays open.
const LOST = {
  28: `Lost in stage 1 — the balcony meditation is offered only before Chapter 1 ends.`,
};

const built = doc.trophies.map((trophy) => {
  const guide = REWRITTEN[trophy.id] ?? trophy.guide;
  const entry = {
    id: trophy.id,
    name: trophy.name,
    description: trophy.description,
    grade: trophy.grade,
    hidden: trophy.hidden,
    kind: trophy.kind,
    missable: trophy.missable,
    stage: trophy.stage,
  };
  if (LOST[trophy.id]) entry.lostAt = LOST[trophy.id];
  entry.guide = guide;
  entry.steps = STEPS[trophy.id];
  if (trophy.tips) entry.tips = trophy.tips;
  entry.sources = trophy.sources;
  return entry;
});

// Every trophy has to carry a walk-through, at least two named sources, and steps whose
// every place or count is attributed. Fail loudly rather than writing a thin entry.
const problems = [];
for (const entry of built) {
  if (entry.sources.length < 2) problems.push(`${entry.id} ${entry.name}: fewer than two sources`);
  if (!entry.steps || entry.steps.length < 3 || entry.steps.length > 5) {
    problems.push(`${entry.id} ${entry.name}: ${entry.steps ? entry.steps.length : 0} steps`);
  }
  const sentences = entry.guide.split(/(?<=[.!?])\s+/).filter((part) => part.trim().length > 5);
  if (sentences.length < 3) problems.push(`${entry.id} ${entry.name}: guide is ${sentences.length} sentences`);
  for (const step of entry.steps ?? []) {
    if (/[0-9]|Pay 'n' Spray|Vice City|Leonida|Chapter/.test(step) && !/\((Exophase|PowerPyx|GTABase|KeenGamer|Pro-Gamer|Duuro Plays)\)/.test(step)) {
      problems.push(`${entry.id} ${entry.name}: uncited step — ${step.slice(0, 60)}`);
    }
  }
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}

doc.trophies = built;
doc.notes =
  'Hidden flags follow the 28 trophies PSN hides until earned (PlanetGTA6). Guides are written for this entry; each step and each source is named beside the fact it supports.';
writeFileSync(FILE, `${JSON.stringify(doc, null, 2)}\n`);
console.log(`wrote ${built.length} trophies, ${built.reduce((total, entry) => total + entry.steps.length, 0)} cited steps`);
