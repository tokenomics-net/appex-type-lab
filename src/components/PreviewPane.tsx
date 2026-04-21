"use client";
/**
 * PreviewPane.tsx
 * "use client" justified: MutationObserver to mirror CSS var changes into
 * the iframe and iframe ref require browser APIs.
 *
 * One iframe only. Viewport prop (mobile | desktop) controls the iframe
 * width: 390px for Mobile, 1280px for Desktop. No scale transform ever --
 * the iframe renders at its native pixel dimensions so font sizes are TRUE
 * to the slider values.
 *
 * Scroll design:
 *   The PreviewPane component fills its parent (.lab-preview) which has:
 *     flex: 1 1 0; min-width: 0; overflow-x: auto
 *
 *   This component's outer div uses height: 100% to fill the flex column.
 *   The iframe-wrap div is sized to exactly the iframe's native width
 *   (min-width: max-content), so when the pane is narrower than the iframe,
 *   the pane's overflow-x: auto kicks in and scrolls horizontally.
 *   The BODY never scrolls horizontally. The outer page never shows a
 *   horizontal scrollbar. Only the preview pane scrolls sideways.
 *
 * CSS var bridge: MutationObserver watches document.documentElement.style
 * for changes set by ControlPanel via setProperty. On change it posts
 * { type: "CSS_VARS", cssText } to the iframe. PreviewVarReceiver applies it.
 */

import { useEffect, useRef } from "react";

type Viewport = "mobile" | "desktop";

const VIEWPORT_WIDTH: Record<Viewport, number> = {
  mobile:  390,
  desktop: 1280,
};

interface PreviewPaneProps {
  viewport: Viewport;
}

export function PreviewPane({ viewport }: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const targetWidth = VIEWPORT_WIDTH[viewport];

  // CSS var bridge: mirror outer :root inline style to the iframe
  useEffect(() => {
    const root = document.documentElement;

    function postVarsToIframe() {
      const cssText = root.style.cssText;
      try {
        iframeRef.current?.contentWindow?.postMessage(
          { type: "CSS_VARS", cssText },
          window.location.origin
        );
      } catch { /* iframe not yet loaded */ }
    }

    const obs = new MutationObserver(postVarsToIframe);
    obs.observe(root, { attributes: true, attributeFilter: ["style"] });

    function onLoad(this: HTMLIFrameElement) {
      const cssText = root.style.cssText;
      if (!cssText) return;
      try {
        this.contentWindow?.postMessage({ type: "CSS_VARS", cssText }, window.location.origin);
      } catch { /* noop */ }
    }

    // PreviewVarReceiver sends CSS_VARS_REQUEST on mount (after hydration) to
    // cover the race condition where the initial postMessage arrived before the
    // iframe's useEffect registered its listener. Respond with current cssText.
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!event.data || event.data.type !== "CSS_VARS_REQUEST") return;
      const cssText = root.style.cssText;
      if (!cssText) return;
      try {
        iframeRef.current?.contentWindow?.postMessage(
          { type: "CSS_VARS", cssText },
          window.location.origin
        );
      } catch { /* noop */ }
    }

    const iframe = iframeRef.current;
    iframe?.addEventListener("load", onLoad);
    window.addEventListener("message", onMessage);
    return () => {
      obs.disconnect();
      iframe?.removeEventListener("load", onLoad);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  // Re-send current vars whenever viewport changes so PreviewVarReceiver
  // re-resolves --type-*-size to the correct -d or -m value for the new width.
  useEffect(() => {
    const cssText = document.documentElement.style.cssText;
    if (!cssText) return;
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "CSS_VARS", cssText },
        window.location.origin
      );
    } catch { /* noop */ }
  }, [viewport]);

  const label = viewport === "mobile" ? "Mobile -- 390px" : "Desktop -- 1280px";

  return (
    /*
     * Outer div: fills the .lab-preview flex cell completely.
     * height: 100% is important -- without it the flex child collapses to 0
     * height when the columns are side-by-side and nothing forces a height.
     * min-height: 100vh ensures the pane is always at least one screen tall
     * even if the parent flex row isn't tall enough yet.
     */
    <div
      style={{
        display:    "flex",
        flexDirection: "column",
        minHeight:  "100vh",
        background: "#060a14",
      }}
    >
      {/* Viewport label */}
      <div
        style={{
          fontSize:      "11px",
          color:         "rgba(255,255,255,0.45)",
          textAlign:     "center",
          padding:       "6px 0",
          fontFamily:    "system-ui, sans-serif",
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          borderBottom:  "1px solid rgba(255,255,255,0.06)",
          flexShrink:    0,
        }}
      >
        {label}
      </div>

      {/*
        Iframe scroll wrapper:
          - width: fit-content   makes this div exactly as wide as its child
                                 (the iframe). When the parent (.lab-preview)
                                 has overflow-x: auto + min-width: 0, a
                                 fit-content child that is wider than the pane
                                 triggers the horizontal scroll on the PANE,
                                 not on the body.
          - flex: 1 1 auto       grows vertically to fill the pane
          - min-width: {targetWidth}px explicitly sets the floor so the div
                                 never collapses below the iframe width
      */}
      <div
        style={{
          width:    `${targetWidth}px`,
          flex:     "1 1 auto",
          minWidth: `${targetWidth}px`,
        }}
      >
        <iframe
          ref={iframeRef}
          src="/preview"
          width={targetWidth}
          style={{
            border:    "none",
            display:   "block",
            height:    "100dvh",
            minHeight: "600px",
          }}
          title="Site preview"
        />
      </div>
    </div>
  );
}
