/**
 * app/(preview)/layout.tsx
 * Root layout for the preview iframe route group.
 * Owns its own <html> and <body> via Next.js route groups with multiple
 * root layouts. This eliminates the hydration mismatch caused by a nested
 * layout re-rendering <html>/<body> under the old single root layout.
 *
 * Loads the same fonts as (lab)/layout.tsx so the iframe has identical
 * typeface rendering. Body reset is handled by globals.css -- no inline
 * style on <body> to avoid React 19 shorthand-to-longhand normalization.
 */

import type { Viewport } from "next";
import localFont from "next/font/local";
import "../globals.css";

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
};

const tektur = localFont({
  src: [
    { path: "../../../public/fonts/tektur/Tektur-Regular.woff2",  weight: "400", style: "normal" },
    { path: "../../../public/fonts/tektur/Tektur-Medium.woff2",   weight: "500", style: "normal" },
    { path: "../../../public/fonts/tektur/Tektur-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../../public/fonts/tektur/Tektur-Bold.woff2",     weight: "700", style: "normal" },
  ],
  variable: "--font-tektur",
  display:  "swap",
  preload:  true,
  fallback: ["system-ui", "sans-serif"],
});

const hubotSans = localFont({
  src: [
    { path: "../../../public/fonts/hubot-sans/HubotSans-Regular.woff2",  weight: "400", style: "normal" },
    { path: "../../../public/fonts/hubot-sans/HubotSans-Medium.woff2",   weight: "500", style: "normal" },
    { path: "../../../public/fonts/hubot-sans/HubotSans-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../../public/fonts/hubot-sans/HubotSans-Bold.woff2",     weight: "700", style: "normal" },
  ],
  variable: "--font-hubot",
  display:  "swap",
  preload:  true,
  fallback: ["system-ui", "sans-serif"],
});

/**
 * Synchronous CSS var initializer script injected before first paint.
 * Reads appex-type-lab-v4 from localStorage and writes all type vars to
 * document.documentElement inline style so the iframe's first paint uses
 * the correct values -- eliminating the postMessage race condition.
 *
 * Falls back to hard-coded baseline values if localStorage is empty or
 * contains unparseable data. Baseline values must stay in sync with
 * type-roles.ts TYPE_ROLES.
 *
 * Written as a dangerouslySetInnerHTML script (not a module) so it runs
 * synchronously before any React hydration.
 */
const PREVIEW_INIT_SCRIPT = `(function(){
  var BASELINE = {
    "hero-headline": { d: 96, m: 56, color: "#E8EAF0" },
    "hero-subhead":  { d: 18, m: 15, color: "#A892BD" },
    "hero-meta":     { d: 12, m: 12, color: "#FED607" },
    "cta-btn":       { d: 14, m: 14, color: "#0A0F1F" }
  };
  var values = BASELINE;
  try {
    var raw = localStorage.getItem("appex-type-lab-v4");
    if (raw) {
      var parsed = JSON.parse(raw);
      var ok = true;
      for (var id in BASELINE) {
        if (!parsed[id] || typeof parsed[id].desktopSize !== "number") { ok = false; break; }
      }
      if (ok) {
        values = {};
        for (var id in BASELINE) {
          values[id] = { d: parsed[id].desktopSize, m: parsed[id].mobileSize, color: parsed[id].color };
        }
      }
    }
  } catch(e) {}
  var root = document.documentElement;
  var isMobile = window.innerWidth <= 767;
  for (var id in values) {
    var cfg = values[id];
    root.style.setProperty("--type-" + id + "-size-d", cfg.d + "px");
    root.style.setProperty("--type-" + id + "-size-m", cfg.m + "px");
    root.style.setProperty("--type-" + id + "-size", (isMobile ? cfg.m : cfg.d) + "px");
    root.style.setProperty("--color-" + id, cfg.color);
  }
})();`;

export default function PreviewRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${tektur.variable} ${hubotSans.variable}`}>
      <head>
        {/* Synchronous CSS var initialization -- runs before first paint.
            Eliminates the postMessage race where the iframe renders before
            PreviewVarReceiver receives vars from the outer ControlPanel.
            Falls back to baseline values if localStorage is empty. */}
        <script dangerouslySetInnerHTML={{ __html: PREVIEW_INIT_SCRIPT }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
