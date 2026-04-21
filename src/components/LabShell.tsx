"use client";
/**
 * LabShell.tsx
 * "use client" justified: layout state (activeViewport toggle) and child
 * client components require a client boundary.
 *
 * Layout (≥1024px):
 *   side-by-side flex row:
 *     .lab-panel  -- left, 400px basis, shrinkable, scrolls vertically
 *     .lab-preview -- right, takes remaining width, scrolls horizontally
 *                     when the iframe is wider than the available space
 *
 * Layout (<1024px):
 *   vertical stack: panel on top, preview below.
 *
 * Overflow contract:
 *   - body: overflow-x hidden (no outer horizontal scrollbar ever)
 *   - .lab-columns: flex row, min-width 0 on both children
 *   - .lab-preview: overflow-x auto (the PANE scrolls, not the body)
 *   - iframe: native width (390 or 1280px), never scaled or transformed
 */

import { useState } from "react";
import { ControlPanel } from "@/components/ControlPanel";
import { PreviewPane }  from "@/components/PreviewPane";
import { buildBaseline, loadFromStorage, toCssBlock } from "@/lib/type-roles";

type Viewport = "mobile" | "desktop";

const SHELL_STYLES = `
  /* ---- Shell: full-height flex column ---- */
  .lab-shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: #060a14;
    font-family: system-ui, -apple-system, sans-serif;
  }

  /* ---- Top bar: sticky, always on top ---- */
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
    flex-shrink: 0;
  }
  .lab-topbar__action {
    padding: 4px 10px;
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
  /* At very narrow widths, shrink the topbar title to prevent overflow */
  @media (max-width: 500px) {
    .lab-topbar__title {
      font-size: 10px;
      letter-spacing: 0.04em;
    }
    .lab-toggle {
      margin-left: 6px;
    }
    .lab-toggle__btn {
      padding: 4px 8px;
      font-size: 10px;
    }
    .lab-topbar__actions {
      gap: 4px;
    }
    .lab-topbar__action {
      padding: 4px 8px;
      font-size: 10px;
    }
  }
  .lab-topbar__action:hover {
    background: rgba(255,255,255,0.06);
  }
  .lab-topbar__action--copied {
    border-color: rgba(22,197,94,0.4);
    background: rgba(22,197,94,0.15);
    color: #16c55e;
  }

  /*
   * ---- Two-column row (desktop ≥1024px) ----
   *
   * flex-wrap: nowrap keeps panel and preview side-by-side.
   * min-height fills the remaining viewport below the top bar.
   * flex: 1 1 0 on the row itself lets it grow to fill available height.
   */
  .lab-columns {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    flex: 1 1 0;
    min-height: 0;
  }

  /*
   * ---- Control panel (left column) ----
   *
   * flex: 0 1 400px  -- natural basis 400px, allowed to SHRINK (not 0!)
   * min-width: 320px  -- never narrower than a usable panel
   * overflow-y: auto  -- panel scrolls independently if taller than viewport
   * min-width: 0 on a flex child is the critical unlock that lets flex
   * calculate sizes correctly. Without it the implicit min-width: auto
   * can prevent shrinking below the content's intrinsic width.
   */
  .lab-panel {
    flex: 0 1 400px;
    min-width: 320px;
    max-width: 420px;
    background: #0d1020;
    border-right: 1px solid rgba(255,255,255,0.07);
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
  }

  /*
   * ---- Preview pane (right column) ----
   *
   * flex: 1 1 0       -- takes all remaining width
   * min-width: 0      -- CRITICAL: allows the pane to shrink below the
   *                      iframe's intrinsic width. Without this, the 1280px
   *                      iframe forces the pane (and the whole flex row) to
   *                      be at least 1280px, blowing out the body.
   * overflow-x: auto  -- the PANE scrolls horizontally when the browser
   *                      window is narrower than the iframe. The BODY does not.
   * overflow-y: auto  -- allow vertical scroll within the pane too
   */
  .lab-preview {
    flex: 1 1 0;
    min-width: 0;
    overflow-x: auto;
    overflow-y: auto;
    background: #060a14;
  }

  /*
   * ---- Mobile / narrow: stack vertically at <1024px ----
   *
   * Panel becomes full-width block on top. Preview fills below.
   * This is the ONLY viewport where stacking is acceptable.
   */
  @media (max-width: 1023px) {
    .lab-columns {
      flex-direction: column;
    }
    .lab-panel {
      flex: none;
      width: 100%;
      max-width: 100%;
      min-width: 0;
      border-right: none;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      overflow-y: visible;
    }
    .lab-preview {
      flex: none;
      width: 100%;
    }
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

      {/* Top bar: sticky, Mobile/Desktop toggle, Reset, Copy CSS */}
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

      {/*
        Two-column row at ≥1024px (panel LEFT, preview RIGHT).
        Stacks vertically at <1024px via the media query above.
      */}
      <div className="lab-columns">
        {/* LEFT: control panel */}
        <div className="lab-panel">
          <ControlPanel />
        </div>

        {/* RIGHT: preview pane (scrolls horizontally when iframe > pane width) */}
        <div className="lab-preview">
          <PreviewPane viewport={viewport} />
        </div>
      </div>
    </div>
  );
}
