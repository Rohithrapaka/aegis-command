import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type AegisTheme = "light" | "obsidian" | "midnight";

const STORAGE_KEY = "aegis-theme";
const CLASSES: Record<AegisTheme, string> = {
  light: "",
  obsidian: "obsidian",
  midnight: "midnight",
};

const ThemeContext = createContext<{
  theme: AegisTheme;
  setTheme: (t: AegisTheme) => void;
}>({ theme: "light", setTheme: () => {} });

export function ThemeProvider({
  children,
  initial = "light",
}: {
  children: ReactNode;
  initial?: AegisTheme;
}) {
  const [theme, setThemeState] = useState<AegisTheme>(initial);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as AegisTheme | null;
    if (stored && stored in CLASSES) setThemeState(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("obsidian", "midnight");
    const cls = CLASSES[theme];
    if (cls) root.classList.add(cls);
  }, [theme]);

  const setTheme = useCallback((t: AegisTheme) => {
    setThemeState(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

/** Forces a theme class while mounted (used by the Command Center shell). */
export function useScopedTheme(theme: AegisTheme) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("obsidian", "midnight");
    if (CLASSES[theme]) root.classList.add(CLASSES[theme]);
  }, [theme]);
}