import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";
type Resolved = "light" | "dark";

const STORAGE_KEY = "gp-theme";

interface ThemeContextValue {
  theme: Theme;
  resolved: Resolved;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStored(): Theme {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

const systemPrefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readStored);
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark);

  useEffect(() => {
    const list = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(list.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, []);

  const resolved: Resolved = theme === "system" ? (systemDark ? "dark" : "light") : theme;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [resolved]);

  const toggle = useCallback(() => {
    const root = document.documentElement;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("theme-anim");
      window.setTimeout(() => root.classList.remove("theme-anim"), 400);
    }
    const next: Theme = resolved === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable (private mode) — theme still applies for this session */
    }
  }, [resolved]);

  const value = useMemo(() => ({ theme, resolved, toggle }), [theme, resolved, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}
