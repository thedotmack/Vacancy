export type Mark = 'yes' | 'no';

const STORAGE_KEY = 'vacancy_marks';
const EVENT_NAME = 'marks-changed';

type Store = Record<string, Mark>;

function read(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as Store;
    return {};
  } catch {
    return {};
  }
}

function write(store: Store): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* localStorage unavailable */
  }
}

let cache: Store | null = null;
function getCache(): Store {
  if (cache === null) cache = read();
  return cache;
}

export function getMark(gate: string): Mark | null {
  return getCache()[gate] ?? null;
}

export function setMark(gate: string, mark: Mark | null): void {
  const store = getCache();
  if (mark === null) delete store[gate];
  else store[gate] = mark;
  write(store);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { gate, mark } }));
}

export function getAllMarks(): Store {
  return { ...getCache() };
}

export function onMarksChanged(cb: () => void): () => void {
  const handler = (): void => cb();
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
