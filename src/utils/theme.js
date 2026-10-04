export const THEME_STORAGE_KEY = 'reactcase-theme';
export const DEFAULT_THEME = 'dark';

export function isValidTheme(value) {
  return value === 'dark' || value === 'light';
}

export function getStoredTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isValidTheme(stored)) return stored;
  } catch {
    // private mode / blocked storage
  }
  return DEFAULT_THEME;
}

export function setStoredTheme(theme) {
  if (!isValidTheme(theme)) return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore write failures
  }
}

export function applyTheme(theme) {
  const next = isValidTheme(theme) ? theme : DEFAULT_THEME;
  const root = document.documentElement;
  root.setAttribute('data-theme', next);
  root.style.colorScheme = next;
  return next;
}

export function toggleTheme(theme) {
  return theme === 'light' ? 'dark' : 'light';
}
