"use client";
/**
 * LabShell.tsx
 * "use client" justified: viewport toggle state (Mobile / Desktop) must
 * be shared between the top bar and PreviewPane. Both live in the client tree.
 *
 * Layout:
 *   - Top bar: [Mobile | Desktop] toggle + Reset + Copy CSS buttons
 *   - Below: left = control panel, right = preview iframe
 *   - On narrow browsers (< 768px): stacks vertically
 */

import { useState, useCallback } from "react";
import { ControlPanel } from "@/components/ControlPanel";
import { PreviewPane }  from "@/components/PreviewPane";
import { buildBaseline, applyToRoot, saveToStorage } from "@/lib/type-roles";

type Viewport = "mobile" | "desktop";

const SHELL_STYLES = `
  .lab-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: #060a14;
    font-family: system-ui, -apple-system, sans-serif;
  }

  /* ---- Top bar ---- */
  .lab-topbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #0a0e1a;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    flex-shrink: 0;
    flex-wrap: wrap;
  }
  .lab-topbar__title {
    font-size: 12px;
    font-weight: 700;
    color: rgba(255,255,255,0.88);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-right: 8px;
    flex-shrink: 0;
  }
  .lab-viewport-btn {
    padding: 5px 14px;
    border-radius: 4px;
    border: 1px solid rgba(255,255,255,0.12);
    background: transparent;
    color: rgba(255,255,255,0.55);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: system-ui, sans-serif;
    transition: background 150ms, color 150ms, border-color 150ms;
    letter-spacing: 0.04em;
  }
  .lab-viewport-btn:hover {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.88);
  }
  .lab-viewport-btn--active {
    background: rgba(254,214,7,0.12);
    border-color: rgba(254,214,7,0.38);
    color: #FED607;
  }

  /* ---- Body: panel + preview side by side ---- */
  .lab-body {
    display: flex;
    flex: 1 1 auto;
    overflow: hidden;
    min-height: 0;
  }
  .lab-body__panel {
    width: 360px;
    flex-shrink: 0;
    background: #0d1020;
    border-right: 1px solid rgba(255,255,255,0.07);
    overflow-y: auto;
    padding: 16px;
  }
  .lab-body__preview {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* On narrow browsers: stack vertically, preview below */
  @media (max-width: 767px) {
    .lab-body { flex-direction: column; }
    .lab-body__panel {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
      overflow-y: visible;
    }
    .lab-body__preview { flex: 1 1 auto; min-height: 300px; }
  }
`;

export function LabShell() {
  const [viewport, setViewport] = useState<Viewport>("desktop");

  const handleReset = useCallback(() => {
    const fresh = buildBaseline();
    applyToRoot(fresh);
    saveToStorage(fresh);
    // ControlPanel reads from storage on next render cycle via its own state;
    // trigger a page reload so ControlPanel re-initializes cleanly.
    window.location.reload();
  }, []);

  return (
    <div className="lab-shell">
      <style>{SHELL_STYLES}</style>

      {/* Top bar */}
      <div className="lab-topbar">
        <span className="lab-topbar__title">appeX Type Lab</span>

        <button
          type="button"
          className={`lab-viewport-btn${viewport === "mobile" ? " lab-viewport-btn--active" : ""}`}
          onClick={() => setViewport("mobile")}
        >
          Mobile
        </button>
        <button
          type="button"
          className={`lab-viewport-btn${viewport === "desktop" ? " lab-viewport-btn--active" : ""}`}
          onClick={() => setViewport("desktop")}
        >
          Desktop
        </button>
      </div>

      {/* Panel + Preview */}
      <div className="lab-body">
        <div className="lab-body__panel">
          <ControlPanel />
        </div>
        <div className="lab-body__preview">
          <PreviewPane key={viewport} viewport={viewport} />
        </div>
      </div>
    </div>
  );
}
