"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQueryList = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setMatches(
        "matches" in event ? event.matches : (event as MediaQueryList).matches
      );
    };

    // Set initial value
    setMatches(mediaQueryList.matches);

    // Subscribe to changes (with cross-browser support)
    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener(
        "change",
        onChange as (e: MediaQueryListEvent) => void
      );
    } else if (typeof mediaQueryList.addListener === "function") {
      mediaQueryList.addListener(onChange as (mql: MediaQueryList) => void);
    }

    return () => {
      if (typeof mediaQueryList.removeEventListener === "function") {
        mediaQueryList.removeEventListener(
          "change",
          onChange as (e: MediaQueryListEvent) => void
        );
      } else if (typeof mediaQueryList.removeListener === "function") {
        mediaQueryList.removeListener(
          onChange as (mql: MediaQueryList) => void
        );
      }
    };
  }, [query]);

  return matches;
}
