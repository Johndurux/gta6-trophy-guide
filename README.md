[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Johndurux/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Johndurux/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Vice Ledger — GTA VI trophy guide and tracker

Vice Ledger is a static, offline guide to all 55 PlayStation 5 trophies of Grand Theft Auto VI. Every trophy carries its official name, description and grade, plus a guide written for this entry that says what to do, where it happens and when it closes, with the sources it draws on listed beside it: the Exophase list, PowerPyx's trophy roadmap and its 100% completion checklist. A six-stage roadmap turns those descriptions into an order, calls out the game's one potentially missable trophy at the exact point of no return, and links every trophy back to its guide in one click.

The tracker side keeps a checklist over the same 55 trophies in localStorage: progress counts by grade, filters by kind (story, missable, collectibles, activities, still to do), a search box, and export to a JSON file plus import back. A spoiler guard hides the names, descriptions and guides of unearned story trophies until you mark them earned, so the roadmap can be read without spoiling the plot. The app is plain HTML, CSS and ES modules with no build step and no network request at run time; serve `app/` with any static file server and it works with the network off.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>