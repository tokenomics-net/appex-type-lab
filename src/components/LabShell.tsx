"use client";
/**
 * LabShell.tsx
 * "use client" justified: layout state (activeViewport toggle) and child
 * client components require a client boundary.
 *
 * Layout:
 *   - Top bar: lab title, Mobile/Desktop toggle, Reset, Copy CSS
 *   - Below: left = control panel, right = single preview pane
 *   - Toggle switches the visible PreviewPane between mobile (390px) and
 *     desktop (1280px). Only one iframe is mounted at a time.
 *   - The CSS variable cascade (-d and -m vars + media-query resolver) stays
 *     exactly as built. Both var families are always written by ControlPanel;
 *     the rendered iframe width determines which resolves.
 */

import { useState } from "react";
import { ControlPanel } from "@/components/ControlPanel";
import { PreviewPane }  from "@/components/PreviewPane";
import { buildBaseline, loadFromStorage, toCssBlock } from "@/lib/type-roles";

type Viewport = "mobile" | "desktop";

const SHELL_STYLES = `
  /*
   * Vertical stack layout: top-bar → control panel → preview pane.
   * No side-by-side split. Works at every viewport width from 320px up.
   * The outer page scrolls normally; the preview pane scrolls horizontally
   * when the iframe is wider than the browser window.
   */
  .lab-shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: #060a14;
    font-family: system-ui, -apple-system, sans-serif;
  }

  /* ---- Top bar ---- */
  .lab-topbar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #0a0e1a;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    flex-shrink: 0;
  }
  .lab-topbar__title {
    font-size: 12px;
    font-weight: 700;
    color: rgba(255,255,255,0.88);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  /* Toggle group */
  .lab-toggle {
    display: flex;
    align-items: center;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 5px;
    overflow: hidden;
    flex-shrink: 0;
    margin-left: 12px;
  }
  .lab-toggle__btn {
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.45);
    font-family: system-ui, sans-serif;
    transition: background 120ms, color 120ms;
  }
  .lab-toggle__btn--active {
    background: rgba(254,214,7,0.15);
    color: #FED607;
  }
  .lab-toggle__btn:not(.lab-toggle__btn--active):hover {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.7);
  }

  /* Top-bar action buttons (Reset, Copy CSS) */
  .lab-topbar__actions {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
  }
  .lab-topbar__action {
    padding: 4px 12px;
    border-radius: 4px;
    border: 1px solid rgba(255,255,255,0.12);
    background: transparent;
    color: rgba(255,255,255,0.7);
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    font-family: system-ui, sans-serif;
    white-space: nowrap;
    transition: border-color 120ms, background 120ms, color 120ms;
  }
  .lab-topbar__action:hover {
    background: rgba(255,255,255,0.06);
  }
  .lab-topbar__action--copied {
    border-color: rgba(22,197,94,0.4);
    background: rgba(22,197,94,0.15);
    color: #16c55e;
  }

  /* ---- Control panel: centered block, full-width, auto height ---- */
  .lab-body__panel {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    background: #0d1020;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    padding: 16px;
    box-sizing: border-box;
  }

  /* ---- Preview pane: horizontal scroll only, no height lock ---- */
  .lab-body__preview {
    width: 100%;
    background: #060a14;
  }
`;

export function LabShell() {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [copied, setCopied] = useState(false);

  // Reset: reads current values from ControlPanel via the applyToRoot path.
  // ControlPanel owns the state; we trigger a reset by dispatching a custom
  // event that ControlPanel listens for.
  function handleReset() {
    window.dispatchEvent(new CustomEvent("lab:reset"));
  }

  async function handleCopyCSS() {
    const stored = loadFromStorage();
    const css = toCssBlock(stored ?? buildBaseline());
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="lab-shell">
      <style>{SHELL_STYLES}</style>

      {/* Top bar */}
      <div className="lab-topbar">
        <span className="lab-topbar__title">appeX Type Lab</span>

        {/* Mobile / Desktop toggle */}
        <div className="lab-toggle" role="group" aria-label="Viewport">
          <button
            type="button"
            className={`lab-toggle__btn${viewport === "mobile" ? " lab-toggle__btn--active" : ""}`}
            onClick={() => setViewport("mobile")}
            aria-pressed={viewport === "mobile"}
          >
            Mobile
          </button>
          <button
            type="button"
            className={`lab-toggle__btn${viewport === "desktop" ? " lab-toggle__btn--active" : ""}`}
            onClick={() => setViewport("desktop")}
            aria-pressed={viewport === "desktop"}
          >
            Desktop
          </button>
        </div>

        {/* Reset + Copy CSS */}
        <div className="lab-topbar__actions">
          <button
            type="button"
            className="lab-topbar__action"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            type="button"
            className={`lab-topbar__action${copied ? " lab-topbar__action--copied" : ""}`}
            onClick={handleCopyCSS}
          >
            {copied ? "Copied!" : "Copy CSS"}
          </button>
        </div>
      </div>

      {/* Control panel -- stacked above preview at all viewports */}
      <div className="lab-body__panel">
        <ControlPanel />
      </div>

      {/* Preview pane -- below panel, horizontal scroll when iframe is wider than window */}
      <div className="lab-body__preview">
        <PreviewPane viewport={viewport} />
      </div>
    </div>
  );
}
