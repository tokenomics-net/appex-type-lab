"use client";
/**
 * LabShell.tsx
 * "use client" justified: layout state and child client components require
 * a client boundary.
 *
 * Layout:
 *   - Top bar: lab title
 *   - Below: left = control panel, right = dual preview panes side-by-side
 *     (Desktop at 1280px + Mobile at 390px always both visible)
 *   - Each iframe independently resolves CSS vars via its own breakpoint:
 *     Desktop iframe (1280px wide) resolves --type-*-size-d vars;
 *     Mobile iframe (390px wide) resolves --type-*-size-m vars.
 *   - ControlPanel writes both -d and -m vars; iframes pick the right one.
 */

import { ControlPanel } from "@/components/ControlPanel";
import { PreviewPane }  from "@/components/PreviewPane";

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
  }
  .lab-topbar__title {
    font-size: 12px;
    font-weight: 700;
    color: rgba(255,255,255,0.88);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    flex-shrink: 0;
  }
  .lab-topbar__hint {
    font-size: 11px;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.02em;
    margin-left: 8px;
  }

  /* ---- Body: panel + dual preview side by side ---- */
  .lab-body {
    display: flex;
    flex: 1 1 auto;
    overflow: hidden;
    min-height: 0;
  }
  .lab-body__panel {
    width: 380px;
    flex-shrink: 0;
    background: #0d1020;
    border-right: 1px solid rgba(255,255,255,0.07);
    overflow-y: auto;
    padding: 16px;
  }

  /* Dual preview: Desktop + Mobile panes side by side */
  .lab-body__previews {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    gap: 1px;
    background: rgba(255,255,255,0.05);
  }
  .lab-preview-desktop {
    flex: 1 1 60%;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: #060a14;
  }
  .lab-preview-mobile {
    flex: 0 0 420px;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: #060a14;
    border-left: 1px solid rgba(255,255,255,0.07);
  }

  /* On narrow browsers: stack vertically */
  @media (max-width: 1100px) {
    .lab-body { flex-direction: column; }
    .lab-body__panel {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
      overflow-y: visible;
      max-height: 50vh;
    }
    .lab-body__previews {
      flex: 1 1 auto;
      min-height: 300px;
    }
    .lab-preview-mobile {
      flex: 0 0 240px;
    }
  }
`;

export function LabShell() {
  return (
    <div className="lab-shell">
      <style>{SHELL_STYLES}</style>

      {/* Top bar */}
      <div className="lab-topbar">
        <span className="lab-topbar__title">appeX Type Lab</span>
        <span className="lab-topbar__hint">Desktop and Mobile sizes are independent per role</span>
      </div>

      {/* Panel + Dual Preview */}
      <div className="lab-body">
        <div className="lab-body__panel">
          <ControlPanel />
        </div>
        <div className="lab-body__previews">
          <div className="lab-preview-desktop">
            <PreviewPane viewport="desktop" />
          </div>
          <div className="lab-preview-mobile">
            <PreviewPane viewport="mobile" />
          </div>
        </div>
      </div>
    </div>
  );
}
