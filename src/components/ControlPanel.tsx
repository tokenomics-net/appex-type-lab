"use client";
/**
 * ControlPanel.tsx
 * "use client" justified: all slider/button interactions, localStorage,
 * URL hash, clipboard, and document.documentElement.style.setProperty
 * require browser APIs.
 *
 * Renders the left-side control panel. Typography and color changes are
 * applied via CSS custom properties on :root -- the preview updates
 * instantly with no React re-render of the preview content.
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
import {
  COLOR_TOKENS,
  buildBaselineColorDeltas,
  toCssValue,
  type ColorDeltaMap,
} from "@/lib/color-tokens";

type PresetName = "Baseline" | "Bump small text" | "Bump all" | "Custom";

const STORAGE_KEY = "appex-type-lab-custom";

// ---- Apply helpers ----

function applyTypeToRoot(values: Record<string, FontRoleConfig>): void {
  const root = document.documentElement;
  for (const [id, cfg] of Object.entries(values)) {
    root.style.setProperty(`--type-${id}-size`,           cfg.size);
    root.style.setProperty(`--type-${id}-line-height`,    String(cfg.lineHeight));
    root.style.setProperty(`--type-${id}-weight`,         String(cfg.weight));
    root.style.setProperty(`--type-${id}-letter-spacing`, cfg.letterSpacing);
  }
}

function applyColorToRoot(deltas: ColorDeltaMap): void {
  const root = document.documentElement;
  for (const token of COLOR_TOKENS) {
    const delta = deltas[token.id] ?? { warm: 0, tone: 0 };
    root.style.setProperty(`--color-${token.id}`, toCssValue(token.baselineHex, delta.warm, delta.tone));
  }
}

function applyAllToRoot(
  typeValues: Record<string, FontRoleConfig>,
  colorDeltas: ColorDeltaMap
): void {
  applyTypeToRoot(typeValues);
  applyColorToRoot(colorDeltas);
}

// ---- Storage helpers ----

interface StoredState {
  type: Record<string, FontRoleConfig>;
  color: ColorDeltaMap;
}

function loadFromStorage(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    // Support old format (no color key)
    if (parsed.type) {
      return {
        type: parsed.type,
        color: parsed.color ?? buildBaselineColorDeltas(),
      };
    }
    // Very old format: the whole object was FontRoleConfig map
    return { type: parsed as unknown as Record<string, FontRoleConfig>, color: buildBaselineColorDeltas() };
  } catch {
    return null;
  }
}

function saveToStorage(state: StoredState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* noop */ }
}

export function ControlPanel({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const BASELINE        = buildBaseline();
  const BUMP_SMALL      = buildBumpSmall();
  const BUMP_ALL        = buildBumpAll();
  const BASELINE_COLORS = buildBaselineColorDeltas();

  const [preset,       setPreset]       = useState<PresetName>("Baseline");
  const [typeValues,   setTypeValues]   = useState<Record<string, FontRoleConfig>>(BASELINE);
  const [colorDeltas,  setColorDeltas]  = useState<ColorDeltaMap>(BASELINE_COLORS);
  const [copied,       setCopied]       = useState<"css" | "url" | null>(null);
  const [colorOpen,    setColorOpen]    = useState<boolean>(false);
  const initRef = useRef(false);

  // On mount: check URL hash first, then localStorage
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const hash = window.location.hash.replace(/^#/, "");
    if (hash) {
      const parsed = fromHashFragment(hash);
      if (parsed) {
        const colors = parsed.color ?? buildBaselineColorDeltas();
        setTypeValues(parsed.type);
        setColorDeltas(colors);
        setPreset("Custom");
        applyAllToRoot(parsed.type, colors);
        return;
      }
    }
    const stored = loadFromStorage();
    if (stored) {
      setTypeValues(stored.type);
      setColorDeltas(stored.color);
      setPreset("Custom");
      applyAllToRoot(stored.type, stored.color);
      return;
    }
    applyAllToRoot(BASELINE, BASELINE_COLORS);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchPreset = useCallback((name: PresetName) => {
    setPreset(name);
    let nextType: Record<string, FontRoleConfig>;
    let nextColor: ColorDeltaMap = { ...BASELINE_COLORS };

    if (name === "Baseline") {
      nextType  = { ...BASELINE };
      nextColor = { ...BASELINE_COLORS };
    } else if (name === "Bump small text") {
      nextType  = { ...BUMP_SMALL };
      // Color presets unchanged -- Bump presets are font-size only
    } else if (name === "Bump all") {
      nextType  = { ...BUMP_ALL };
    } else {
      const stored = loadFromStorage();
      nextType  = stored?.type  ?? { ...BASELINE };
      nextColor = stored?.color ?? { ...BASELINE_COLORS };
    }

    setTypeValues(nextType);
    setColorDeltas(nextColor);
    applyAllToRoot(nextType, nextColor);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Typography update handler ----
  const updateRole = useCallback((roleId: string, field: keyof FontRoleConfig, raw: string | number) => {
    setTypeValues((prev) => {
      const cur = prev[roleId] ?? BASELINE[roleId];
      const next: FontRoleConfig = { ...cur, [field]: raw };
      const all = { ...prev, [roleId]: next };
      document.documentElement.style.setProperty(
        `--type-${roleId}-${field.replace(/([A-Z])/g, "-$1").toLowerCase()}`,
        String(raw)
      );
      setPreset("Custom");
      setColorDeltas((prevColor) => {
        saveToStorage({ type: all, color: prevColor });
        return prevColor;
      });
      return all;
    });
  }, [BASELINE]);

  // ---- Color delta update handler ----
  const updateColorDelta = useCallback((
    tokenId: string,
    axis: "warm" | "tone",
    value: number
  ) => {
    setColorDeltas((prev) => {
      const cur = prev[tokenId] ?? { warm: 0, tone: 0 };
      const next = { ...cur, [axis]: value };
      const all = { ...prev, [tokenId]: next };
      // Find baseline hex for this token
      const token = COLOR_TOKENS.find((t) => t.id === tokenId);
      if (token) {
        document.documentElement.style.setProperty(
          `--color-${tokenId}`,
          toCssValue(token.baselineHex, next.warm, next.tone)
        );
      }
      setPreset("Custom");
      setTypeValues((prevType) => {
        saveToStorage({ type: prevType, color: all });
        return prevType;
      });
      return all;
    });
  }, []);

  const handleReset = useCallback(() => {
    switchPreset("Baseline");
  }, [switchPreset]);

  const handleCopyCSS = useCallback(async () => {
    const css = toCssBlock(typeValues, colorDeltas);
    await navigator.clipboard.writeText(css);
    setCopied("css");
    setTimeout(() => setCopied(null), 2000);
  }, [typeValues, colorDeltas]);

  const handleDownloadJSON = useCallback(() => {
    const json = JSON.stringify({ type: typeValues, color: colorDeltas }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "appex-type-config.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [typeValues, colorDeltas]);

  const handleShareURL = useCallback(async () => {
    const frag = toHashFragment(typeValues, colorDeltas);
    const url = `${window.location.origin}${window.location.pathname}#${frag}`;
    await navigator.clipboard.writeText(url);
    window.history.replaceState(null, "", `#${frag}`);
    setCopied("url");
    setTimeout(() => setCopied(null), 2000);
  }, [typeValues, colorDeltas]);

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

        /* ---- Section headers (Typography / Color) ---- */
        .panel-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px 6px;
          cursor: pointer;
          user-select: none;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 0;
        }
        .panel-section-header:hover {
          background: rgba(255,255,255,0.02);
        }
        .panel-section-title {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.45);
        }
        .panel-section-chevron {
          font-size: 9px;
          color: rgba(255,255,255,0.30);
          transition: transform 150ms ease;
        }
        .panel-section-chevron--open {
          transform: rotate(180deg);
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

        /* ---- Color token rows ---- */
        .panel-color-token {
          padding: 10px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .panel-color-token:last-child {
          border-bottom: none;
        }
        .panel-color-token__header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .panel-color-token__swatch {
          width: 14px;
          height: 14px;
          border-radius: 3px;
          border: 1px solid rgba(255,255,255,0.14);
          flex-shrink: 0;
        }
        .panel-color-token__label {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.88);
        }

        /* Step slider: 7 steps from -3 to +3 */
        .panel-step-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 5px;
          position: relative;
        }
        .panel-step-row__name {
          width: 52px;
          flex-shrink: 0;
          color: rgba(255,255,255,0.45);
          font-size: 10px;
        }
        .panel-step-row__slider-wrap {
          flex: 1;
          position: relative;
        }
        .panel-step-row__slider {
          width: 100%;
          -webkit-appearance: none;
          height: 3px;
          border-radius: 2px;
          background: rgba(255,255,255,0.12);
          outline: none;
          cursor: pointer;
        }
        .panel-step-row__slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #FED607;
          cursor: pointer;
        }
        .panel-step-row__slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #FED607;
          cursor: pointer;
          border: none;
        }
        /* Zero tick mark centered on the slider track */
        .panel-step-row__zero-tick {
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
          height: 5px;
          background: rgba(255,255,255,0.25);
          pointer-events: none;
        }
        .panel-step-row__zero-label {
          position: absolute;
          top: -16px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 8px;
          color: rgba(255,255,255,0.25);
          pointer-events: none;
          white-space: nowrap;
          font-family: system-ui, sans-serif;
        }
        .panel-step-row__value {
          width: 28px;
          text-align: right;
          color: rgba(255,255,255,0.6);
          font-size: 10px;
          font-variant-numeric: tabular-nums;
        }
        .panel-step-row__value--nonzero {
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

        {/* ---- Typography section ---- */}
        <div className="panel-section-header" role="heading" aria-level={2}>
          <span className="panel-section-title">Typography</span>
        </div>

        {TYPE_ROLES.map((role) => {
          const cur = typeValues[role.id] ?? role.baseline;
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

        {/* ---- Color section ---- */}
        <div
          className="panel-section-header"
          role="heading"
          aria-level={2}
          onClick={() => setColorOpen((v) => !v)}
          style={{ cursor: "pointer", marginTop: "8px" }}
        >
          <span className="panel-section-title">Color</span>
          <span className={`panel-section-chevron${colorOpen ? " panel-section-chevron--open" : ""}`}>
            &#9660;
          </span>
        </div>

        {colorOpen && COLOR_TOKENS.map((token) => {
          const delta = colorDeltas[token.id] ?? { warm: 0, tone: 0 };
          // Compute the live CSS value to use as swatch background
          const liveCss = toCssValue(token.baselineHex, delta.warm, delta.tone);

          return (
            <div key={token.id} className="panel-color-token">
              <div className="panel-color-token__header">
                <div
                  className="panel-color-token__swatch"
                  style={{ background: liveCss }}
                  aria-hidden="true"
                />
                <span className="panel-color-token__label">{token.label}</span>
              </div>

              {/* Temperature slider: warm (-3..+3) */}
              <div className="panel-step-row">
                <span className="panel-step-row__name">Warm</span>
                <div className="panel-step-row__slider-wrap">
                  <span className="panel-step-row__zero-label">0</span>
                  <span className="panel-step-row__zero-tick" />
                  <input
                    type="range"
                    className="panel-step-row__slider"
                    min={-3}
                    max={3}
                    step={1}
                    value={delta.warm}
                    onChange={(e) => updateColorDelta(token.id, "warm", parseInt(e.target.value, 10))}
                    aria-label={`${token.label} temperature`}
                  />
                </div>
                <span className={`panel-step-row__value${delta.warm !== 0 ? " panel-step-row__value--nonzero" : ""}`}>
                  {delta.warm > 0 ? `+${delta.warm}` : delta.warm}
                </span>
              </div>

              {/* Tone slider: lighter/darker (-3..+3) */}
              <div className="panel-step-row">
                <span className="panel-step-row__name">Tone</span>
                <div className="panel-step-row__slider-wrap">
                  <span className="panel-step-row__zero-label">0</span>
                  <span className="panel-step-row__zero-tick" />
                  <input
                    type="range"
                    className="panel-step-row__slider"
                    min={-3}
                    max={3}
                    step={1}
                    value={delta.tone}
                    onChange={(e) => updateColorDelta(token.id, "tone", parseInt(e.target.value, 10))}
                    aria-label={`${token.label} tone`}
                  />
                </div>
                <span className={`panel-step-row__value${delta.tone !== 0 ? " panel-step-row__value--nonzero" : ""}`}>
                  {delta.tone > 0 ? `+${delta.tone}` : delta.tone}
                </span>
              </div>
            </div>
          );
        })}

      </div>
    </aside>
  );
}
