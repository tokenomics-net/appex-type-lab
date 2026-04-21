"use client";
/**
 * PreviewPane.tsx
 * "use client" justified: tab switching state, ResizeObserver for
 * responsive fallback, MutationObserver to mirror CSS var changes
 * into the iframe documents, and iframe refs all require browser APIs.
 *
 * Fix: scaled divs caused @media queries to evaluate against the outer
 * browser viewport, not the preview width. Replaced with iframes --
 * each iframe has its own document and viewport, so @media (max-width: 767px)
 * triggers correctly at 390px regardless of outer window size.
 *
 * CSS var bridge: MutationObserver watches document.documentElement.style
 * for changes (set by ControlPanel via setProperty). On change it posts
 * { type: "CSS_VARS", cssText } to both iframes. PreviewVarReceiver inside
 * each iframe applies the properties to its own :root.
 */

import { useState, useEffect, useRef } from "react";

type Tab = "mobile" | "desktop";


export function PreviewPane({ panelWidth: _panelWidth }: { panelWidth: number }) {
  const [activeTab,   setActiveTab]   = useState<Tab>("desktop");
  const [narrow,      setNarrow]      = useState(false);
  const containerRef                  = useRef<HTMLDivElement>(null);
  const mobileRef                     = useRef<HTMLIFrameElement>(null);
  const desktopRef                    = useRef<HTMLIFrameElement>(null);

  // Scale the mobile iframe column to fit its container width
  const mobileColRef  = useRef<HTMLDivElement>(null);
  const [mobileScale, setMobileScale] = useState(1);

  // ---- Narrow breakpoint detection ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setNarrow(entry.contentRect.width < 700);
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ---- Scale mobile column to fit available width ----
  useEffect(() => {
    const el = mobileColRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const available = entry.contentRect.width;
        setMobileScale(Math.min(1, available / 390));
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ---- CSS var bridge: mirror outer :root inline style to both iframes ----
  useEffect(() => {
    const root = document.documentElement;

    function postVarsToIframes() {
      const cssText = root.style.cssText;
      const msg = { type: "CSS_VARS", cssText };
      for (const ref of [mobileRef, desktopRef]) {
        try {
          ref.current?.contentWindow?.postMessage(msg, window.location.origin);
        } catch {
          // iframe may not be loaded yet; next change will retry
        }
      }
    }

    // Watch for any inline style change on documentElement (ControlPanel
    // calls setProperty on it for every slider move).
    const obs = new MutationObserver(postVarsToIframes);
    obs.observe(root, { attributes: true, attributeFilter: ["style"] });

    // Also re-send when iframes finish loading so initial state is applied
    function onIframeLoad(this: HTMLIFrameElement) {
      const cssText = root.style.cssText;
      if (!cssText) return;
      try {
        this.contentWindow?.postMessage({ type: "CSS_VARS", cssText }, window.location.origin);
      } catch { /* noop */ }
    }

    const mobile  = mobileRef.current;
    const desktop = desktopRef.current;
    mobile?.addEventListener("load", onIframeLoad);
    desktop?.addEventListener("load", onIframeLoad);

    return () => {
      obs.disconnect();
      mobile?.removeEventListener("load", onIframeLoad);
      desktop?.removeEventListener("load", onIframeLoad);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        height:        "100vh",
        display:       "flex",
        flexDirection: "column",
        background:    "#060a14",
        overflow:      "hidden",
      }}
    >
      <style>{`
        .preview-tab-bar {
          display: flex;
          gap: 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: #0a0e1a;
          flex-shrink: 0;
        }
        .preview-tab {
          padding: 8px 20px;
          font-size: 11px;
          font-family: system-ui, sans-serif;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: color 150ms, border-color 150ms;
        }
        .preview-tab:hover {
          color: rgba(255,255,255,0.75);
        }
        .preview-tab--active {
          color: #FED607;
          border-bottom-color: #FED607;
        }
        .preview-cols {
          display: flex;
          flex: 1;
          overflow: hidden;
          gap: 1px;
          background: rgba(255,255,255,0.06);
        }
      `}</style>

      {/* Tab bar -- shown on narrow screens only */}
      {narrow && (
        <div className="preview-tab-bar" role="tablist" aria-label="Preview viewport">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "mobile"}
            className={`preview-tab${activeTab === "mobile" ? " preview-tab--active" : ""}`}
            onClick={() => setActiveTab("mobile")}
          >
            Mobile
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "desktop"}
            className={`preview-tab${activeTab === "desktop" ? " preview-tab--active" : ""}`}
            onClick={() => setActiveTab("desktop")}
          >
            Desktop
          </button>
        </div>
      )}

      <div className="preview-cols">
        {(!narrow || activeTab === "mobile") && (
          <div
            ref={mobileColRef}
            style={{
              display:       "flex",
              flexDirection: "column",
              flex:          "0 0 auto",
              minWidth:      0,
              // Column width: scaled 390px
              width:         `${390 * mobileScale}px`,
            }}
          >
            <div
              style={{
                fontSize:       "11px",
                color:          "rgba(255,255,255,0.45)",
                textAlign:      "center",
                padding:        "6px 0",
                fontFamily:     "system-ui, sans-serif",
                letterSpacing:  "0.08em",
                textTransform:  "uppercase",
                borderBottom:   "1px solid rgba(255,255,255,0.06)",
                flexShrink:     0,
              }}
            >
              Mobile &mdash; 390px
            </div>
            <div
              style={{
                flex:     "1 1 auto",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <iframe
                ref={mobileRef}
                src="/preview"
                width={390}
                style={{
                  border:          "none",
                  height:          "100%",
                  display:         "block",
                  transformOrigin: "top left",
                  transform:       `scale(${mobileScale})`,
                  // Maintain visual height after scale
                  // When scaled down, the iframe's rendered height shrinks
                  // visually. We compensate by expanding the frame height.
                  ...(mobileScale < 1 ? { height: `${100 / mobileScale}%` } : {}),
                }}
                title="Mobile preview"
                scrolling="yes"
              />
            </div>
          </div>
        )}
        {(!narrow || activeTab === "desktop") && (
          <div
            style={{
              display:       "flex",
              flexDirection: "column",
              flex:          "1 1 0",
              minWidth:      0,
            }}
          >
            <div
              style={{
                fontSize:       "11px",
                color:          "rgba(255,255,255,0.45)",
                textAlign:      "center",
                padding:        "6px 0",
                fontFamily:     "system-ui, sans-serif",
                letterSpacing:  "0.08em",
                textTransform:  "uppercase",
                borderBottom:   "1px solid rgba(255,255,255,0.06)",
                flexShrink:     0,
              }}
            >
              Desktop &mdash; 1280px
            </div>
            <div
              style={{
                flex:     "1 1 auto",
                overflow: "auto",
                position: "relative",
              }}
            >
              <DesktopIframeScaled iframeRef={desktopRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * DesktopIframeScaled
 * Scales the 1280px-wide desktop iframe to fit its container column.
 * Uses its own ResizeObserver so the scale tracks the column width.
 */
function DesktopIframeScaled({ iframeRef }: { iframeRef: React.RefObject<HTMLIFrameElement | null> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setScale(Math.min(1, entry.contentRect.width / 1280));
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
      <iframe
        ref={iframeRef}
        src="/preview"
        width={1280}
        style={{
          border:          "none",
          display:         "block",
          transformOrigin: "top left",
          transform:       `scale(${scale})`,
          height:          scale < 1 ? `${100 / scale}%` : "100%",
        }}
        title="Desktop preview"
        scrolling="yes"
      />
    </div>
  );
}
