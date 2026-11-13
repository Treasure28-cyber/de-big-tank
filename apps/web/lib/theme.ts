type Theme = 'light' | 'dark';
// Ignore legacy preferences once so both public and admin start in dark mode.
// New manual choices remain shared and persistent.
const themeEvent = 'dbt-theme-change';

export const getServerTheme = (): Theme => 'dark';
export const getTheme = (): Theme => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  window.dispatchEvent(new Event(themeEvent));
}

export function subscribeTheme(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === 'dbt-theme-v2' || event.key === null) {
      applyTheme(event.newValue === 'light' ? 'light' : 'dark');
    }
  };
  window.addEventListener(themeEvent, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(themeEvent, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { window.localStorage.setItem('dbt-theme-v2', next); } catch {
    // Keep the current visit's choice even when persistent storage is blocked.
  }
}
