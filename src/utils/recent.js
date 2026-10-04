const STORAGE_KEY = 'reactcase-wizard-recent';
const MAX_ITEMS = 12;

function canUseStorage() {
  try {
    const testKey = '__rcw_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function readRaw() {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.text === 'string' &&
        typeof item.label === 'string' &&
        typeof item.timestamp === 'number',
    );
  } catch {
    return [];
  }
}

function writeRaw(items) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function loadRecentItems() {
  return readRaw().slice(0, MAX_ITEMS);
}

export function addRecentItem({ text, label, actionId }) {
  if (!text || !text.trim()) return loadRecentItems();

  const current = readRaw();
  const newest = current[0];

  if (
    newest &&
    newest.text === text &&
    newest.actionId === actionId &&
    newest.label === label
  ) {
    return current;
  }

  const next = [
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      label: label || 'Transformed',
      actionId: actionId || null,
      timestamp: Date.now(),
    },
    ...current.filter(
      (item) => !(item.text === text && item.actionId === actionId),
    ),
  ].slice(0, MAX_ITEMS);

  writeRaw(next);
  return next;
}

export function clearRecentItems() {
  if (!canUseStorage()) return [];
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return [];
}

export function formatRelativeTime(timestamp, now = Date.now()) {
  const delta = Math.max(0, now - timestamp);
  const seconds = Math.floor(delta / 1000);

  if (seconds < 45) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
