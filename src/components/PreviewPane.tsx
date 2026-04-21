"use client";
/**
 * PreviewPane.tsx
 * "use client" justified: MutationObserver to mirror CSS var changes into
 * the iframe and iframe ref require browser APIs.
 *
 * One iframe only. Viewport prop (mobile | desktop) controls the iframe
 * width: 390px for Mobile, 1280px for Desktop. No scale transform ever --
 * the iframe renders at its native pixel dimensions so font sizes are TRUE
 * to the slider values. The wrapper scrolls (overflow: auto) when the
 * browser window is narrower than the iframe's native width.
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

    const iframe = iframeRef.current;
    iframe?.addEventListener("load", onLoad);
    return () => {
      obs.disconnect();
      iframe?.removeEventListener("load", onLoad);
    };
  }, []);

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
        Iframe wrapper -- overflow: auto so the pane scrolls when the browser
        window is narrower than the iframe's native width. No scale transform.
        The iframe renders at its true pixel dimensions (390 or 1280) always.
      */}
      <div
        style={{ flex: "1 1 auto", overflow: "auto" }}
      >
        <iframe
          ref={iframeRef}
          src="/preview"
          width={targetWidth}
          style={{
            border:   "none",
            display:  "block",
            height:   "100%",
            minHeight: "100vh",
          }}
          title="Site preview"
          scrolling="yes"
        />
      </div>
    </div>
  );
}
