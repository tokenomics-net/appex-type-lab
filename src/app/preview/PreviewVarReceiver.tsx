"use client";
/**
 * PreviewVarReceiver.tsx
 * "use client" justified: listens to window.message events (browser API)
 * and applies CSS custom property overrides to :root.
 *
 * The outer PreviewPane posts { type: "CSS_VARS", cssText: string }
 * whenever any control changes. This component applies the cssText
 * to document.documentElement.style so the iframe's components pick
 * up the updated --type-* and --color-* variables instantly.
 */

import { useEffect } from "react";

interface CssVarsMessage {
  type: "CSS_VARS";
  cssText: string;
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
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return null;
}
