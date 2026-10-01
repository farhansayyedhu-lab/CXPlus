"use client";

import { useEffect, useState } from "react";

export type SurfaceTheme = "auto" | "dark" | "light";

export function useSurfaceTheme(theme: SurfaceTheme = "auto"): "dark" | "light" {
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (theme === "dark" || theme === "light") {
      setResolvedTheme(theme);
      return;
    }

    const checkTheme = () => {
      const isHtmlDark =
        document.documentElement.classList.contains("dark") ||
        document.documentElement.getAttribute("data-theme") === "dark";
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setResolvedTheme(isHtmlDark || systemDark ? "dark" : "light");
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", checkTheme);

    return () => {
      observer.disconnect();
      mql.removeEventListener("change", checkTheme);
    };
  }, [theme]);

  return resolvedTheme;
}
