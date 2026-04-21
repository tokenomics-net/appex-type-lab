"use client";
/**
 * PreviewVarReceiver.tsx
 * "use client" justified: listens to window.message events (browser API)
 * and applies CSS custom property overrides to :root.
 *
 * Two-way protocol:
 *   - On mount, sends { type: "CSS_VARS_REQUEST" } to parent so PreviewPane
 *     can re-send the current cssText even if the initial postMessage was lost
 *     to a hydration race condition.
 *   - Receives { type: "CSS_VARS", cssText } whenever a control changes.
 *     Applies all vars from cssText to :root inline style.
 *
 * Tailwind v4 resolves var() chains in :root at build time, producing
 * static values for --type-*-size. The stylesheet cascade from -d/-m
 * vars does not work at runtime. After applying the raw cssText, we
 * re-derive --type-*-size explicitly from the -d or -m value based on
 * window.innerWidth (<= 767 = mobile).
 */

import { useEffect } from "react";

interface CssVarsMessage {
  type: "CSS_VARS";
  cssText: string;
}

/** Role IDs that have -d/-m split vars. Must match TYPE_ROLES in type-roles.ts. */
const ROLE_IDS = [
  "hero-headline",
  "hero-subhead",
  "hero-meta",
  "cta-btn",
] as const;

/**
 * After applying all vars from cssText, re-resolve --type-{role}-size
 * to the correct -d or -m value based on current window.innerWidth.
 * This is necessary because Tailwind v4 bakes a static value for the
 * resolved alias at build time, preventing the cascade from working.
 */
function resolveBreakpointVars(): void {
  const root = document.documentElement;
  const isMobile = window.innerWidth <= 767;
  for (const id of ROLE_IDS) {
    const suffix = isMobile ? "m" : "d";
    const sourceVal = root.style.getPropertyValue(`--type-${id}-size-${suffix}`);
    if (sourceVal) {
      root.style.setProperty(`--type-${id}-size`, sourceVal);
    }
  }
}

export function PreviewVarReceiver() {
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // Accept from same origin only (both are localhost:3043)
      if (event.origin !== window.location.origin) return;
      const data = event.data as CssVarsMessage;
      if (!data || data.type !== "CSS_VARS") return;

      // Apply each property individually so we never wipe the static CSS vars
      // that globals.css sets on :root (ax-fortress, etc.). The cssText from
      // the outer document.documentElement.style contains ONLY the JS-set
      // overrides (setProperty calls), never the stylesheet-defined vars.
      const root = document.documentElement;
      const incoming = data.cssText;

      // Parse "prop: value; prop: value;" into pairs and apply
      for (const chunk of incoming.split(";")) {
        const colon = chunk.indexOf(":");
        if (colon === -1) continue;
        const prop  = chunk.slice(0, colon).trim();
        const value = chunk.slice(colon + 1).trim();
        if (prop) root.style.setProperty(prop, value);
      }

      // Re-resolve the breakpoint-aware alias after applying the raw vars.
      // This overrides the Tailwind-baked static value with the correct
      // desktop or mobile size based on this iframe's actual width.
      resolveBreakpointVars();
    }

    window.addEventListener("message", onMessage);

    // On mount: request the current vars from the parent. This covers the
    // race condition where the initial postMessage from PreviewPane arrived
    // before this useEffect ran (i.e., before PreviewVarReceiver was hydrated).
    window.parent.postMessage({ type: "CSS_VARS_REQUEST" }, window.location.origin);

    return () => window.removeEventListener("message", onMessage);
  }, []);

  return null;
}
