// make.fun entry point for the GTA 6 trophy guide (Node 22, standard library only).
//
// The site itself is static: app/index.html opens in any browser, with its ES modules and
// stylesheet next to it, and it fetches nothing from the network — the trophy list and the
// writing for each trophy live in app/data/trophies.json. This file only does the handover:
// in order, it makes sure the output directory exists, copies app/ and screenshots/ from
// beside this script into it, and finally writes dossier.json, the manifest the judge reads
// (what the first load downloads, in files and bytes, plus the guide's own source).
//
// dossier.json has to come out identical to what the judge would compute, so it is always
// built by the vendored library and never assembled by hand. Leave vendor/makefun-frontend.ts
// exactly as it is for that reason.
//
// Locally: `node serve.ts` serves the guide on http://localhost:8080. The grader writes to
// /output; anywhere else, name a directory with MAKEFUN_OUTPUT_DIR:
//   MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

/** Directory holding main.ts, app/ and screenshots/. */
const repoDir = fileURLToPath(new URL('.', import.meta.url));

/** Where the judge expects the entry; MAKEFUN_OUTPUT_DIR stands in outside its container. */
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/**
 * Limits taken from the bounty's gate.json. Only text_max_bytes decides how much of the
 * guide's source ends up in dossier.json; the other three change nothing in the bytes, they
 * exist so this program stops with the same complaint the judge would raise.
 */
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

/** Count the regular files under a directory, at any depth. */
function countFiles(dir: string): number {
  let files = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files += countFiles(path);
    else if (entry.isFile()) files += 1;
  }
  return files;
}

/** First step: create the output directory, or accept it if it is already there. */
function prepareOutputDirectory(dir: string): void {
  mkdirSync(dir, { recursive: true });
}

/** Second step: copy one tree into the output and report how many files landed. */
function copyTree(source: string, target: string): number {
  cpSync(source, target, { recursive: true });
  return countFiles(target);
}

/** Third step: let the vendored library write dossier.json, and hand back its bytes. */
function buildManifest(dir: string): Uint8Array {
  const dossier = buildDossier(dir, DOSSIER_CAPS);
  writeFileSync(join(dir, 'dossier.json'), dossier);
  return dossier;
}

const appDir = join(repoDir, 'app');
if (!existsSync(appDir) || !statSync(appDir).isDirectory()) {
  console.error(`main.ts: no app/ directory at ${appDir} — the guide's static site must sit beside this script, nothing was written.`);
  process.exit(1);
}

prepareOutputDirectory(outputDir);

let copied = copyTree(appDir, join(outputDir, 'app'));

// The screenshots are optional for the copy itself, but an entry without them has no cover.
const shotsDir = join(repoDir, 'screenshots');
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) copied += copyTree(shotsDir, join(outputDir, 'screenshots'));

const dossier = buildManifest(outputDir);
console.log(`copied ${copied} files to ${outputDir}; dossier.json is ${dossier.byteLength} bytes`);