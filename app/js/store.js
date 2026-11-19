// Progress store: the earned set and the spoiler guard, kept in localStorage and exchanged as a JSON file.

const PROGRESS_KEY = 'vice-ledger.progress.v1';
const SPOILER_KEY = 'vice-ledger.spoiler-guard.v1';

export function createStore(officialNames) {
  const known = new Set(officialNames);
  const listeners = new Set();
  let earned = readEarned();
  let spoiler = readSpoiler();

  function readEarned() {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      return new Set(raw ? sanitize(JSON.parse(raw)) : []);
    } catch {
      return new Set();
    }
  }

  function sanitize(value) {
    const list = Array.isArray(value) ? value : Array.isArray(value?.earned) ? value.earned : [];
    return list.filter((name) => typeof name === 'string' && known.has(name));
  }

  function readSpoiler() {
    try {
      return localStorage.getItem(SPOILER_KEY) === 'on';
    } catch {
      return false;
    }
  }

  function persist() {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned]));
    } catch {
      /* storage blocked: the session still works, it just will not outlive the tab */
    }
    for (const listener of listeners) listener({ earned, spoiler });
  }

  function announce() {
    for (const listener of listeners) listener({ earned, spoiler });
  }

  return {
    isEarned: (name) => earned.has(name),
    earnedCount: () => earned.size,
    allEarned: () => [...earned],

    setEarned(name, value) {
      if (!known.has(name)) return;
      if (value) earned.add(name);
      else earned.delete(name);
      persist();
    },

    toggle(name) {
      this.setEarned(name, !earned.has(name));
    },

    reset() {
      earned = new Set();
      persist();
    },

    isSpoilerOn: () => spoiler,

    setSpoiler(value) {
      spoiler = Boolean(value);
      try {
        localStorage.setItem(SPOILER_KEY, spoiler ? 'on' : 'off');
      } catch {
        /* ignore blocked storage */
      }
      announce();
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    // A plain JSON file the reader can keep, e-mail himself or move to another browser.
    exportFile() {
      const payload = {
        app: 'vice-ledger',
        game: 'Grand Theft Auto VI',
        checklist: 'PlayStation 5 trophies',
        exportedAt: new Date().toISOString(),
        earnedCount: earned.size,
        totalCount: known.size,
        earned: [...earned].sort(),
      };
      return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    },

    // Accepts this app's file, a bare array (the starter's format) or {earned: [...]}.
    async importFile(file) {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const names = sanitize(parsed);
      const listed = Array.isArray(parsed) ? parsed : parsed?.earned ?? [];
      if (!names.length && !Array.isArray(listed)) {
        throw new Error('That file holds no trophy checklist.');
      }
      earned = new Set(names);
      persist();
      return { imported: earned.size, ignored: listed.length - earned.size };
    },
  };
}