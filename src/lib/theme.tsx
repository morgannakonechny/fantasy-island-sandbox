"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "dark" | "light";

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Matches the server-rendered default so hydration never mismatches. The
  // blocking script in layout.tsx already sets the real value on
  // <html data-theme> before paint (avoiding a visible flash); this just
  // brings React's own state in sync with it right after mount, in case a
  // returning visitor had picked "light".
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // One-time sync from the DOM attribute the blocking <head> script already
    // set pre-paint (see layout.tsx) — this is reading an external system's
    // state on mount, not reacting to a state change, so it can't be done any
    // other way without risking a server/client hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (document.documentElement.dataset.theme === "light") setTheme("light");
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        window.localStorage.setItem("theme", next);
      } catch {
        // Private browsing / storage disabled — theme just won't persist.
      }
      return next;
    });
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
