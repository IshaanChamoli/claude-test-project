"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggle: (x: number, y: number) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  const toggle = (x: number, y: number) => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    root.style.setProperty("--wipe-x", `${x}px`);
    root.style.setProperty("--wipe-y", `${y}px`);

    const applyTheme = () => {
      root.classList.toggle("light", next === "light");
      setTheme(next);
      localStorage.setItem("theme", next);
    };

    if (!("startViewTransition" in document)) {
      applyTheme();
      return;
    }

    (document as Document & { startViewTransition: (cb: () => void) => unknown })
      .startViewTransition(applyTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
