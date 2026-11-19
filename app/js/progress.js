// Progress that survives a refresh: the earned set and the spoiler setting live in
// localStorage, the earned set can leave as a JSON file and come back through the file input.

const STORAGE_KEY = 'vice-horizon.progress.v1';
const FILE_NAME = 'vice-horizon-progress.json';

export function createStore(guide) {
  const earned = new Set();
  let spoilerSealed = true;

  read();

  function read() {
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    } catch {
      return; // a corrupt save starts clean rather than breaking the app
    }
    if (!saved) return;
    spoilerSealed = saved.spoilerSealed !== false;
    for (const id of saved.earnedIds ?? []) {
      const trophy = guide.byId.get(Number(id));
      if (trophy) earned.add(trophy.id);
    }
    for (const name of saved.earnedNames ?? []) {
      const trophy = guide.byName.get(name);
      if (trophy) earned.add(trophy.id);
    }
  }

  function save() {
    const state = {
      app: 'vice-horizon',
      version: 1,
      spoilerSealed,
      earnedIds: [...earned].sort((a, b) => a - b),
      earnedNames: [...earned].map((id) => guide.byId.get(id)?.name ?? String(id)),
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // private mode or a full quota: the session still works, it just will not persist
    }
  }

  return {
    get earnedCount() {
      return earned.size;
    },
    isEarned(id) {
      return earned.has(id);
    },
    isSealed(trophy) {
      return spoilerSealed && trophy.hidden && !earned.has(trophy.id);
    },
    get spoilerSealed() {
      return spoilerSealed;
    },
    setSpoiler(sealed) {
      spoilerSealed = Boolean(sealed);
      save();
    },
    setEarned(id, on) {
      if (on) earned.add(id);
      else earned.delete(id);
      save();
    },
    toggle(id) {
      const next = !earned.has(id);
      this.setEarned(id, next);
      return next;
    },
    exportProgress() {
      const payload = {
        app: 'vice-horizon',
        version: 1,
        game: 'Grand Theft Auto VI',
        platform: 'PlayStation 5',
        savedAt: new Date().toISOString(),
        earned: [...earned].sort((a, b) => a - b).map((id) => guide.byId.get(id)?.name ?? String(id)),
        earnedIds: [...earned].sort((a, b) => a - b),
        total: guide.total,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = FILE_NAME;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      return payload.earned.length;
    },
    async importProgress(file) {
      const parsed = JSON.parse(await file.text());
      const names = Array.isArray(parsed) ? parsed : parsed.earned ?? parsed.earnedNames ?? [];
      const ids = Array.isArray(parsed?.earnedIds) ? parsed.earnedIds : [];
      const restored = new Set();
      for (const token of names) {
        const trophy = guide.byName.get(String(token)) ?? guide.byId.get(Number(token));
        if (trophy) restored.add(trophy.id);
      }
      for (const token of ids) {
        const trophy = guide.byId.get(Number(token));
        if (trophy) restored.add(trophy.id);
      }
      if (!restored.size) throw new Error('no trophy names this guide knows');
      earned.clear();
      for (const id of restored) earned.add(id);
      if (typeof parsed?.spoilerSealed === 'boolean') spoilerSealed = parsed.spoilerSealed;
      save();
      return restored.size;
    },
  };
}