import { create } from "zustand";

export type Theme = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: Theme) => void;
  initTheme: () => void;
}

const STORAGE_KEY = "aetherflow_theme";

function getSystemResolved(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyToDOM(resolved: ResolvedTheme) {
  document.documentElement.setAttribute("data-theme", resolved);
  // Keep Tailwind dark: class in sync
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "dark",
  resolvedTheme: "dark",

  initTheme: () => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "dark";
    const resolved: ResolvedTheme = saved === "system" ? getSystemResolved() : (saved as ResolvedTheme);
    applyToDOM(resolved);
    set({ theme: saved, resolvedTheme: resolved });

    // Keep system theme reactive
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (get().theme === "system") {
          const next: ResolvedTheme = e.matches ? "dark" : "light";
          applyToDOM(next);
          set({ resolvedTheme: next });
        }
      });
  },

  setTheme: (theme) => {
    const resolved: ResolvedTheme = theme === "system" ? getSystemResolved() : theme;
    applyToDOM(resolved);
    localStorage.setItem(STORAGE_KEY, theme);
    set({ theme, resolvedTheme: resolved });
  },
}));
