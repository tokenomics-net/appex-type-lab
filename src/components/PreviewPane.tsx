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
 * Scroll design (single scrollbar):
 *   - Outer wrapper: overflow-x auto (horizontal scroll when browser is
 *     narrower than the iframe), overflow-y hidden -- the iframe owns
 *     vertical scroll entirely.
 *   - Iframe: height 100% of the wrapper (fills the pane), no minHeight
 *     override that would fight the wrapper's height and create a second
 *     scrollbar. The iframe document scrolls vertically on its own.
 *
 * CSS var bridge: MutationObserver watches document.documentElement.style
 * for changes set by ControlPanel via setProperty. On change it posts
 * { type: "CSS_VARS", cssText } to the iframe. PreviewVarReceiver applies it.
 */

import { useEffect, useRef } from "react";

type Viewport = "mobile" | "desktop";

const VIEWPORT_WIDTH: Record<Viewport, number> = {
  mobile: 390,
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
     * Outer wrapper: full width, natural document flow.
     * No height lock -- the section grows with its content.
     */
    <div
      style={{
        width:      "100%",
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
        }}
      >
        {label}
      </div>

      {/*
        Iframe scroll wrapper:
          - overflow-x: auto  -- horizontal scroll when the browser window is
            narrower than the iframe (e.g. 1280px Desktop on a 1100px monitor)
          - overflow-y: visible -- the iframe expands to its content height;
            the outer page scrolls vertically, no double scrollbar
        The iframe has no explicit height: it sizes to its content via the
        scrolling="no" + CSS height trick is NOT used here. Instead the iframe
        renders at a tall fixed height (100dvh) so the user sees a full-page
        preview. The iframe's own document scrolls internally.
      */}
      <div
        style={{
          width:     "100%",
          overflowX: "auto",
          overflowY: "visible",
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
