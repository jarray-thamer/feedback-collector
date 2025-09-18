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
      // The legacy addListener expects a function with a MediaQueryListEvent parameter,
      // but some browsers may call it with the MediaQueryList itself.
      // TypeScript expects (ev: MediaQueryListEvent), so we cast accordingly.
      mediaQueryList.addListener(onChange as EventListener);
    }

    return () => {
      if (typeof mediaQueryList.removeEventListener === "function") {
        mediaQueryList.removeEventListener(
          "change",
          onChange as (e: MediaQueryListEvent) => void
        );
      } else if (typeof mediaQueryList.removeListener === "function") {
        mediaQueryList.removeListener(onChange as EventListener);
      }
    };
  }, [query]);

  return matches;
}
