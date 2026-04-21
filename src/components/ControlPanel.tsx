"use client";
/**
 * ControlPanel.tsx
 * "use client" justified: slider/color-picker interactions, localStorage,
 * clipboard, and document.documentElement.style.setProperty all require
 * browser APIs.
 *
 * Each role renders three controls:
 *   - Role title row with color swatch (shared across breakpoints)
 *   - Desktop sub-row: slider + px input + rem readout
 *   - Mobile  sub-row: slider + px input + rem readout
 */

import { useState, useEffect, useRef } from "react";
import {
  TYPE_ROLES,
  buildBaseline,
  loadFromStorage,
  saveToStorage,
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

  .cp-role {
    padding: 14px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .cp-role:last-child { border-bottom: none; }

  /* Row header: role label + color swatch */
  .cp-role__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .cp-label {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.88);
    white-space: nowrap;
  }

  /* Desktop / Mobile sub-rows */
  .cp-axis {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 7px;
  }
  .cp-axis:last-child { margin-bottom: 0; }

  .cp-axis__label {
    font-size: 11px;
    font-weight: 500;
    color: rgba(255,255,255,0.45);
    width: 52px;
    flex-shrink: 0;
    letter-spacing: 0.03em;
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
    width: 48px;
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

  /* Rem readout badge */
  .cp-rem {
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    color: rgba(254,214,7,0.55);
    white-space: nowrap;
    width: 48px;
    flex-shrink: 0;
    text-align: right;
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

/** Slider range: 50% of the larger baseline up to 200% of the larger baseline */
function sliderRange(role: typeof TYPE_ROLES[number]): { min: number; max: number } {
  const larger = Math.max(role.baseline.desktopSize, role.baseline.mobileSize);
  return { min: Math.max(8, Math.round(larger * 0.4)), max: Math.round(larger * 2.5) };
}

export function ControlPanel() {
  const baseline = buildBaseline();
  const [values, setValues] = useState<RoleValues>(baseline);
  const initRef = useRef(false);

  // On mount: restore from localStorage (migrates old single-size shape)
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

  // Listen for the top-bar Reset button (LabShell dispatches "lab:reset")
  useEffect(() => {
    function onReset() {
      const fresh = buildBaseline();
      setValues(fresh);
      applyToRoot(fresh);
      saveToStorage(fresh);
    }
    window.addEventListener("lab:reset", onReset);
    return () => window.removeEventListener("lab:reset", onReset);
  }, []);

  function updateDesktopSize(roleId: string, size: number) {
    setValues((prev) => {
      const next = { ...prev, [roleId]: { ...prev[roleId], desktopSize: size } };
      saveToStorage(next);
      document.documentElement.style.setProperty(`--type-${roleId}-size-d`, `${size}px`);
      // Also write the resolved alias so the outer page reflects the desktop value
      // immediately. Tailwind v4 bakes static values for these; we must override inline.
      document.documentElement.style.setProperty(`--type-${roleId}-size`, `${size}px`);
      return next;
    });
  }

  function updateMobileSize(roleId: string, size: number) {
    setValues((prev) => {
      const next = { ...prev, [roleId]: { ...prev[roleId], mobileSize: size } };
      saveToStorage(next);
      document.documentElement.style.setProperty(`--type-${roleId}-size-m`, `${size}px`);
      // Note: we do NOT update --type-{roleId}-size here on the outer page because
      // the outer page is always desktop-width. The mobile size flows to the iframe
      // via postMessage and PreviewVarReceiver re-resolves it based on window.innerWidth.
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

  return (
    <div className="cp-panel">
      <style>{PANEL_STYLES}</style>

      {TYPE_ROLES.map((role) => {
        const cur = values[role.id] ?? role.baseline;
        const { min, max } = sliderRange(role);

        const dRem = (cur.desktopSize / 16).toFixed(3).replace(/\.?0+$/, "") + "rem";
        const mRem = (cur.mobileSize  / 16).toFixed(3).replace(/\.?0+$/, "") + "rem";

        return (
          <div key={role.id} className="cp-role">
            {/* Row header: label + color swatch */}
            <div className="cp-role__header">
              <span className="cp-label">{role.label}</span>
              <input
                type="color"
                className="cp-color"
                value={cur.color}
                onChange={(e) => updateColor(role.id, e.target.value)}
                aria-label={`${role.label} color`}
              />
            </div>

            {/* Desktop sub-row */}
            <div className="cp-axis">
              <span className="cp-axis__label">Desktop</span>
              <input
                type="range"
                className="cp-slider"
                min={min}
                max={max}
                step={1}
                value={cur.desktopSize}
                onChange={(e) => updateDesktopSize(role.id, parseInt(e.target.value, 10))}
                aria-label={`${role.label} desktop size`}
              />
              <input
                type="number"
                className="cp-px-input"
                min={min}
                max={max}
                step={1}
                value={cur.desktopSize}
                onChange={(e) => {
                  const raw = parseInt(e.target.value, 10);
                  if (!isNaN(raw)) updateDesktopSize(role.id, raw);
                }}
                onBlur={(e) => {
                  const raw = parseInt(e.target.value, 10);
                  const clamped = isNaN(raw) ? min : Math.min(max, Math.max(min, raw));
                  updateDesktopSize(role.id, clamped);
                }}
                aria-label={`${role.label} desktop size in px`}
              />
              <span className="cp-rem">{dRem}</span>
            </div>

            {/* Mobile sub-row */}
            <div className="cp-axis">
              <span className="cp-axis__label">Mobile</span>
              <input
                type="range"
                className="cp-slider"
                min={min}
                max={max}
                step={1}
                value={cur.mobileSize}
                onChange={(e) => updateMobileSize(role.id, parseInt(e.target.value, 10))}
                aria-label={`${role.label} mobile size`}
              />
              <input
                type="number"
                className="cp-px-input"
                min={min}
                max={max}
                step={1}
                value={cur.mobileSize}
                onChange={(e) => {
                  const raw = parseInt(e.target.value, 10);
                  if (!isNaN(raw)) updateMobileSize(role.id, raw);
                }}
                onBlur={(e) => {
                  const raw = parseInt(e.target.value, 10);
                  const clamped = isNaN(raw) ? min : Math.min(max, Math.max(min, raw));
                  updateMobileSize(role.id, clamped);
                }}
                aria-label={`${role.label} mobile size in px`}
              />
              <span className="cp-rem">{mRem}</span>
            </div>
          </div>
        );
      })}

    </div>
  );
}
