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
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        height:        "100%",
        background:    "#060a14",
        overflow:      "hidden",
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
        Iframe wrapper:
          - overflow-x: auto  -- horizontal scroll only when the browser is
            narrower than the iframe's native width (390 or 1280px)
          - overflow-y: hidden -- the iframe owns vertical scroll; this
            wrapper must never create a second vertical scrollbar
        The iframe's height fills this wrapper (100%). Its internal document
        scrolls vertically as a normal webpage. No minHeight override needed:
        the iframe document's own content height drives its internal scroll.
      */}
      <div
        style={{
          flex:       "1 1 auto",
          overflowX:  "auto",
          overflowY:  "hidden",
          minHeight:  0,
        }}
      >
        <iframe
          ref={iframeRef}
          src="/preview"
          width={targetWidth}
          style={{
            border:  "none",
            display: "block",
            height:  "100%",
          }}
          title="Site preview"
        />
      </div>
    </div>
  );
}
