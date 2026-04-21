"use client";
/**
 * ControlPanel.tsx
 * "use client" justified: slider/color-picker interactions, localStorage,
 * clipboard, and document.documentElement.style.setProperty all require
 * browser APIs.
 *
 * Simplified to one row per role: label | size slider | color picker.
 * That is the complete set of controls -- no advanced disclosure, no
 * line-height, no weight, no letter-spacing, no temperature/tone sliders.
 */

import { useState, useEffect, useRef } from "react";
import {
  TYPE_ROLES,
  buildBaseline,
  loadFromStorage,
  saveToStorage,
  toCssBlock,
  applyToRoot,
  type RoleValues,
} from "@/lib/type-roles";

const PANEL_STYLES = `
  .cp-panel {
    width: 100%;
    background: #0d1020;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    color: rgba(255,255,255,0.82);
  }

  /* Two-line row per role.
     Line 1: label + live value readout.
     Line 2: slider + px input + color swatch.
  */
  .cp-role {
    padding: 14px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .cp-role:last-child { border-bottom: none; }

  /* Line 1 */
  .cp-role__header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 10px;
  }
  .cp-label {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.88);
    white-space: nowrap;
  }
  .cp-value-readout {
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    color: rgba(254,214,7,0.65);
    white-space: nowrap;
  }

  /* Line 2 */
  .cp-role__controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .cp-slider {
    -webkit-appearance: none;
    flex: 1 1 auto;
    height: 6px;
    border-radius: 3px;
    background: rgba(255,255,255,0.12);
    outline: none;
    cursor: pointer;
    min-width: 0;
  }
  .cp-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #FED607;
    cursor: pointer;
  }
  .cp-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #FED607;
    cursor: pointer;
    border: none;
  }

  /* Editable px number input */
  .cp-px-input {
    width: 52px;
    flex-shrink: 0;
    padding: 4px 6px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 4px;
    color: rgba(255,255,255,0.88);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    font-family: system-ui, sans-serif;
    text-align: right;
    outline: none;
    -moz-appearance: textfield;
  }
  .cp-px-input::-webkit-inner-spin-button,
  .cp-px-input::-webkit-outer-spin-button { -webkit-appearance: none; }
  .cp-px-input:focus {
    border-color: rgba(254,214,7,0.5);
    background: rgba(254,214,7,0.06);
  }

  .cp-color {
    -webkit-appearance: none;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 5px;
    padding: 2px;
    background: transparent;
    cursor: pointer;
  }
  .cp-color::-webkit-color-swatch-wrapper { padding: 0; }
  .cp-color::-webkit-color-swatch { border: none; border-radius: 3px; }
  .cp-color::-moz-color-swatch { border: none; border-radius: 3px; }
`;

export function ControlPanel() {
  const baseline = buildBaseline();
  const [values, setValues] = useState<RoleValues>(baseline);
  const [copied, setCopied] = useState(false);
  const initRef = useRef(false);

  // On mount: restore from localStorage
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const stored = loadFromStorage();
    if (stored) {
      setValues(stored);
      applyToRoot(stored);
    } else {
      applyToRoot(baseline);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateSize(roleId: string, size: number) {
    setValues((prev) => {
      const next = { ...prev, [roleId]: { ...prev[roleId], size } };
      saveToStorage(next);
      document.documentElement.style.setProperty(`--type-${roleId}-size`, `${size}px`);
      return next;
    });
  }

  function updateColor(roleId: string, color: string) {
    setValues((prev) => {
      const next = { ...prev, [roleId]: { ...prev[roleId], color } };
      saveToStorage(next);
      document.documentElement.style.setProperty(`--color-${roleId}`, color);
      return next;
    });
  }

  function handleReset() {
    const fresh = buildBaseline();
    setValues(fresh);
    applyToRoot(fresh);
    saveToStorage(fresh);
  }

  async function handleCopyCSS() {
    const css = toCssBlock(values);
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="cp-panel">
      <style>{PANEL_STYLES}</style>

      {TYPE_ROLES.map((role) => {
        const cur = values[role.id] ?? role.baseline;
        const minSize = Math.round(role.baseline.size * 0.5);
        const maxSize = Math.round(role.baseline.size * 2.0);
        const remDisplay = (cur.size / 16).toFixed(3).replace(/\.?0+$/, "");

        return (
          <div key={role.id} className="cp-role">
            {/* Line 1: label + live value readout */}
            <div className="cp-role__header">
              <span className="cp-label">{role.label}</span>
              <span className="cp-value-readout">{cur.size}px / {remDisplay}rem</span>
            </div>

            {/* Line 2: slider + px input + color swatch */}
            <div className="cp-role__controls">
              <input
                type="range"
                className="cp-slider"
                min={minSize}
                max={maxSize}
                step={1}
                value={cur.size}
                onChange={(e) => updateSize(role.id, parseInt(e.target.value, 10))}
                aria-label={`${role.label} size`}
              />

              <input
                type="number"
                className="cp-px-input"
                min={minSize}
                max={maxSize}
                step={1}
                value={cur.size}
                onChange={(e) => {
                  const raw = parseInt(e.target.value, 10);
                  if (!isNaN(raw)) updateSize(role.id, raw);
                }}
                onBlur={(e) => {
                  const raw = parseInt(e.target.value, 10);
                  const clamped = isNaN(raw)
                    ? minSize
                    : Math.min(maxSize, Math.max(minSize, raw));
                  updateSize(role.id, clamped);
                }}
                aria-label={`${role.label} size in px`}
              />

              <input
                type="color"
                className="cp-color"
                value={cur.color}
                onChange={(e) => updateColor(role.id, e.target.value)}
                aria-label={`${role.label} color`}
              />
            </div>
          </div>
        );
      })}

      <div style={{ display: "flex", gap: "8px", paddingTop: "12px" }}>
        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: "6px 14px",
            borderRadius: "4px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            color: "rgba(255,255,255,0.7)",
            fontSize: "12px",
            cursor: "pointer",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Reset to Baseline
        </button>
        <button
          type="button"
          onClick={handleCopyCSS}
          style={{
            padding: "6px 14px",
            borderRadius: "4px",
            border: copied ? "1px solid rgba(22,197,94,0.4)" : "1px solid rgba(255,255,255,0.12)",
            background: copied ? "rgba(22,197,94,0.15)" : "transparent",
            color: copied ? "#16c55e" : "rgba(255,255,255,0.7)",
            fontSize: "12px",
            cursor: "pointer",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {copied ? "Copied!" : "Copy CSS"}
        </button>
      </div>
    </div>
  );
}
