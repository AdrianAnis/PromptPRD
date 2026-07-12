export const THEME_STORAGE_KEY = "promptprd-theme";

export type Theme = "light" | "dark";

const listeners = new Set<() => void>();

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  listeners.forEach((listener) => listener());
}

export function getCurrentTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getServerTheme(): Theme {
  return "dark";
}
