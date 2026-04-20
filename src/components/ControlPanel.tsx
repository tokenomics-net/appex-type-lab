"use client";
/**
 * ControlPanel.tsx
 * "use client" justified: all slider/button interactions, localStorage,
 * URL hash, clipboard, and document.documentElement.style.setProperty
 * require browser APIs.
 *
 * Renders the left-side control panel. All type changes are applied via
 * CSS custom properties on :root -- the preview updates instantly with
 * no React re-render of the preview iframes.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  TYPE_ROLES,
  buildBaseline,
  buildBumpSmall,
  buildBumpAll,
  toCssBlock,
  toHashFragment,
  fromHashFragment,
  type FontRoleConfig,
} from "@/lib/type-roles";

type PresetName = "Baseline" | "Bump small text" | "Bump all" | "Custom";

const STORAGE_KEY = "appex-type-lab-custom";

function applyToRoot(values: Record<string, FontRoleConfig>) {
  const root = document.documentElement;
  for (const [id, cfg] of Object.entries(values)) {
    root.style.setProperty(`--type-${id}-size`,           cfg.size);
    root.style.setProperty(`--type-${id}-line-height`,    String(cfg.lineHeight));
    root.style.setProperty(`--type-${id}-weight`,         String(cfg.weight));
    root.style.setProperty(`--type-${id}-letter-spacing`, cfg.letterSpacing);
  }
}

function loadCustomFromStorage(): Record<string, FontRoleConfig> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, FontRoleConfig>;
  } catch {
    return null;
  }
}

function saveCustomToStorage(values: Record<string, FontRoleConfig>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch { /* noop */ }
}

export function ControlPanel({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const BASELINE  = buildBaseline();
  const BUMP_SMALL = buildBumpSmall();
  const BUMP_ALL   = buildBumpAll();

  const [preset,  setPreset]  = useState<PresetName>("Baseline");
  const [values,  setValues]  = useState<Record<string, FontRoleConfig>>(BASELINE);
  const [copied,  setCopied]  = useState<"css" | "url" | null>(null);
  const initRef = useRef(false);

  // On mount: check URL hash first, then localStorage
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const hash = window.location.hash.replace(/^#/, "");
    if (hash) {
      const parsed = fromHashFragment(hash);
      if (parsed) {
        setValues(parsed);
        setPreset("Custom");
        applyToRoot(parsed);
        return;
      }
    }
    const stored = loadCustomFromStorage();
    if (stored) {
      setValues(stored);
      setPreset("Custom");
      applyToRoot(stored);
      return;
    }
    applyToRoot(BASELINE);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchPreset = useCallback((name: PresetName) => {
    setPreset(name);
    let next: Record<string, FontRoleConfig>;
    if (name === "Baseline")       next = { ...BASELINE };
    else if (name === "Bump small text") next = { ...BUMP_SMALL };
    else if (name === "Bump all")  next = { ...BUMP_ALL };
    else {
      const stored = loadCustomFromStorage();
      next = stored ?? { ...BASELINE };
    }
    setValues(next);
    applyToRoot(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateRole = useCallback((roleId: string, field: keyof FontRoleConfig, raw: string | number) => {
    setValues((prev) => {
      const cur = prev[roleId] ?? BASELINE[roleId];
      const next: FontRoleConfig = { ...cur, [field]: raw };
      const all = { ...prev, [roleId]: next };
      // Apply immediately to :root
      document.documentElement.style.setProperty(`--type-${roleId}-${field.replace(/([A-Z])/g, "-$1").toLowerCase()}`, String(raw));
      // Persist as Custom
      setPreset("Custom");
      saveCustomToStorage(all);
      return all;
    });
  }, [BASELINE]);

  const handleReset = useCallback(() => {
    switchPreset("Baseline");
  }, [switchPreset]);

  const handleCopyCSS = useCallback(async () => {
    const css = toCssBlock(values);
    await navigator.clipboard.writeText(css);
    setCopied("css");
    setTimeout(() => setCopied(null), 2000);
  }, [values]);

  const handleDownloadJSON = useCallback(() => {
    const json = JSON.stringify(values, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "appex-type-config.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [values]);

  const handleShareURL = useCallback(async () => {
    const frag = toHashFragment(values);
    const url = `${window.location.origin}${window.location.pathname}#${frag}`;
    await navigator.clipboard.writeText(url);
    window.history.replaceState(null, "", `#${frag}`);
    setCopied("url");
    setTimeout(() => setCopied(null), 2000);
  }, [values]);

  return (
    <aside
      className={`type-lab-panel${isOpen ? " type-lab-panel--open" : ""}`}
      aria-label="Typography control panel"
    >
      <style>{`
        .type-lab-panel {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 320px;
          background: #0d1020;
          border-right: 1px solid rgba(255,255,255,0.08);
          overflow-y: auto;
          z-index: 500;
          display: flex;
          flex-direction: column;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.82);
          transform: translateX(-100%);
          transition: transform 280ms cubic-bezier(0.22,1,0.36,1);
        }
        .type-lab-panel--open {
          transform: translateX(0);
        }
        /* Always visible on wide screens */
        @media (min-width: 1100px) {
          .type-lab-panel {
            transform: translateX(0);
          }
        }

        .panel-header {
          padding: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          position: sticky;
          top: 0;
          background: #0d1020;
          z-index: 1;
        }
        .panel-header h1 {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 12px 0;
          letter-spacing: 0.04em;
        }

        .panel-presets {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .panel-preset-btn {
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.12);
          background: transparent;
          color: rgba(255,255,255,0.6);
          font-size: 11px;
          cursor: pointer;
          transition: background 150ms, color 150ms, border-color 150ms;
          font-family: system-ui, sans-serif;
        }
        .panel-preset-btn:hover {
          background: rgba(255,255,255,0.06);
          color: #fff;
        }
        .panel-preset-btn--active {
          background: rgba(254,214,7,0.14);
          border-color: rgba(254,214,7,0.4);
          color: #FED607;
        }

        .panel-actions {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .panel-action-btn {
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.7);
          font-size: 11px;
          cursor: pointer;
          transition: background 150ms, color 150ms;
          font-family: system-ui, sans-serif;
        }
        .panel-action-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .panel-action-btn--success {
          background: rgba(22,197,94,0.2);
          border-color: rgba(22,197,94,0.4);
          color: #16c55e;
        }

        .panel-body {
          padding: 8px 0;
          flex: 1;
        }

        .panel-role {
          padding: 10px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .panel-role:last-child {
          border-bottom: none;
        }

        .panel-role__label {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.88);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .panel-role__family-badge {
          font-size: 9px;
          padding: 1px 4px;
          border-radius: 3px;
          background: rgba(90,28,203,0.28);
          color: rgba(185,160,204,0.8);
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .panel-role__family-badge--display {
          background: rgba(254,214,7,0.12);
          color: rgba(254,214,7,0.7);
        }

        .panel-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 5px;
        }
        .panel-row__name {
          width: 72px;
          flex-shrink: 0;
          color: rgba(255,255,255,0.45);
          font-size: 10px;
        }
        .panel-row__slider {
          flex: 1;
          -webkit-appearance: none;
          height: 3px;
          border-radius: 2px;
          background: rgba(255,255,255,0.12);
          outline: none;
          cursor: pointer;
        }
        .panel-row__slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #FED607;
          cursor: pointer;
        }
        .panel-row__slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #FED607;
          cursor: pointer;
          border: none;
        }
        .panel-row__value {
          width: 60px;
          text-align: right;
          color: rgba(255,255,255,0.6);
          font-size: 10px;
          font-variant-numeric: tabular-nums;
        }

        .panel-weight-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 5px;
        }
        .panel-weight-row__name {
          width: 72px;
          flex-shrink: 0;
          color: rgba(255,255,255,0.45);
          font-size: 10px;
        }
        .panel-weight-btns {
          display: flex;
          gap: 3px;
        }
        .panel-weight-btn {
          padding: 2px 6px;
          border-radius: 3px;
          border: 1px solid rgba(255,255,255,0.10);
          background: transparent;
          color: rgba(255,255,255,0.5);
          font-size: 10px;
          cursor: pointer;
          font-family: system-ui, sans-serif;
          transition: background 100ms, color 100ms;
        }
        .panel-weight-btn:hover {
          background: rgba(255,255,255,0.06);
          color: #fff;
        }
        .panel-weight-btn--active {
          background: rgba(254,214,7,0.14);
          border-color: rgba(254,214,7,0.4);
          color: #FED607;
        }

        .panel-toggle {
          position: fixed;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          z-index: 600;
          writing-mode: vertical-rl;
          background: #FED607;
          color: #0A0F1F;
          border: none;
          padding: 12px 6px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          border-radius: 0 4px 4px 0;
          letter-spacing: 0.1em;
          font-family: system-ui, sans-serif;
        }
        @media (min-width: 1100px) {
          .panel-toggle { display: none; }
        }
      `}</style>

      {/* Mobile toggle button */}
      <button className="panel-toggle" onClick={onToggle} aria-label="Toggle control panel" type="button">
        {isOpen ? "CLOSE" : "CONTROLS"}
      </button>

      <div className="panel-header">
        <h1>Typography Controls</h1>

        <div className="panel-presets">
          {(["Baseline", "Bump small text", "Bump all", "Custom"] as PresetName[]).map((p) => (
            <button
              key={p}
              type="button"
              className={`panel-preset-btn${preset === p ? " panel-preset-btn--active" : ""}`}
              onClick={() => switchPreset(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="panel-actions">
          <button type="button" className="panel-action-btn" onClick={handleReset}>
            Reset
          </button>
          <button
            type="button"
            className={`panel-action-btn${copied === "css" ? " panel-action-btn--success" : ""}`}
            onClick={handleCopyCSS}
          >
            {copied === "css" ? "Copied!" : "Copy CSS"}
          </button>
          <button type="button" className="panel-action-btn" onClick={handleDownloadJSON}>
            DL JSON
          </button>
          <button
            type="button"
            className={`panel-action-btn${copied === "url" ? " panel-action-btn--success" : ""}`}
            onClick={handleShareURL}
          >
            {copied === "url" ? "Copied!" : "Share URL"}
          </button>
        </div>
      </div>

      <div className="panel-body">
        {TYPE_ROLES.map((role) => {
          const cur = values[role.id] ?? role.baseline;
          const baseSize  = parseFloat(role.baseline.size);
          const curSize   = parseFloat(cur.size);
          const minSize   = Math.round(baseSize * 0.5);
          const maxSize   = Math.round(baseSize * 2.0);
          const curRem    = (curSize / 16).toFixed(3);

          return (
            <div key={role.id} className="panel-role">
              <div className="panel-role__label">
                {role.label}
                <span className={`panel-role__family-badge${role.family === "display" ? " panel-role__family-badge--display" : ""}`}>
                  {role.family === "display" ? "Tektur" : "Hubot"}
                </span>
              </div>

              {/* Size slider */}
              <div className="panel-row">
                <span className="panel-row__name">Size</span>
                <input
                  type="range"
                  className="panel-row__slider"
                  min={minSize}
                  max={maxSize}
                  step={0.5}
                  value={curSize}
                  onChange={(e) => updateRole(role.id, "size", `${e.target.value}px`)}
                />
                <span className="panel-row__value">{curSize}px / {curRem}rem</span>
              </div>

              {/* Line height slider */}
              <div className="panel-row">
                <span className="panel-row__name">Line height</span>
                <input
                  type="range"
                  className="panel-row__slider"
                  min={1.0}
                  max={2.0}
                  step={0.05}
                  value={cur.lineHeight}
                  onChange={(e) => updateRole(role.id, "lineHeight", parseFloat(e.target.value))}
                />
                <span className="panel-row__value">{cur.lineHeight.toFixed(2)}</span>
              </div>

              {/* Letter spacing slider */}
              <div className="panel-row">
                <span className="panel-row__name">Letter spacing</span>
                <input
                  type="range"
                  className="panel-row__slider"
                  min={-0.05}
                  max={0.1}
                  step={0.005}
                  value={parseFloat(cur.letterSpacing)}
                  onChange={(e) => updateRole(role.id, "letterSpacing", `${parseFloat(e.target.value).toFixed(3)}em`)}
                />
                <span className="panel-row__value">{parseFloat(cur.letterSpacing).toFixed(3)}em</span>
              </div>

              {/* Weight buttons */}
              <div className="panel-weight-row">
                <span className="panel-weight-row__name">Weight</span>
                <div className="panel-weight-btns">
                  {role.availableWeights.map((w) => (
                    <button
                      key={w}
                      type="button"
                      className={`panel-weight-btn${cur.weight === w ? " panel-weight-btn--active" : ""}`}
                      onClick={() => updateRole(role.id, "weight", w)}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
