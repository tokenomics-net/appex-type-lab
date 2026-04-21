"use client";
/**
 * PreviewPane.tsx
 * "use client" justified: MutationObserver to mirror CSS var changes into
 * the iframe and iframe ref require browser APIs.
 *
 * One iframe only. Viewport prop (mobile | desktop) controls rendering:
 *
 *   Desktop: iframe fills 100% of the pane width. No fixed px cap, no
 *     margin: 0 auto. Pane width = browser width minus panel (400px).
 *     On a 1920px monitor the iframe is ~1520px wide. On 1280px it is
 *     ~880px wide. No right-side gap. No horizontal scroll inside the pane.
 *     Font sizes stay true to slider values because we normalised all type
 *     to fixed px vars (no clamp/vw); iframe width does not affect rendering.
 *
 *   Mobile: iframe is fixed 390px, centered with margin: 0 auto. The dead
 *     space left and right of the 390px window is styled as an intentional
 *     phone-frame: darker dotted background + 1px border on the iframe.
 *
 * Scroll design:
 *   Desktop: iframe = 100% of pane width, so horizontal scroll is never
 *     needed. Pane overflow-x: auto is still set but never triggers.
 *   Mobile: horizontal scroll only triggers if the pane is narrower than
 *     390px (very rare); handled by the parent .lab-preview overflow-x: auto.
 *
 * CSS var bridge: MutationObserver watches document.documentElement.style
 * for changes set by ControlPanel via setProperty. On change it posts
 * { type: "CSS_VARS", cssText } to the iframe. PreviewVarReceiver applies it.
 */

import { useEffect, useRef } from "react";

type Viewport = "mobile" | "desktop";

const MOBILE_WIDTH = 390;

interface PreviewPaneProps {
  viewport: Viewport;
}

export function PreviewPane({ viewport }: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isMobile = viewport === "mobile";

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
      // Always send -- even if cssText is empty. The iframe's inline init
      // script already applied baseline vars on first paint; this message
      // will sync any ControlPanel values set before the iframe loaded.
      const cssText = root.style.cssText;
      try {
        this.contentWindow?.postMessage({ type: "CSS_VARS", cssText }, window.location.origin);
      } catch { /* noop */ }
    }

    // PreviewVarReceiver sends CSS_VARS_REQUEST on mount (after hydration) to
    // cover the race condition where the initial postMessage arrived before the
    // iframe's useEffect registered its listener. Respond with current cssText.
    // Always respond -- even with empty cssText -- so PreviewVarReceiver can
    // call resolveBreakpointVars() and confirm the breakpoint alias is correct.
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!event.data || event.data.type !== "CSS_VARS_REQUEST") return;
      const cssText = root.style.cssText;
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

  const label = isMobile ? "Mobile -- 390px" : "Desktop -- fills pane";

  return (
    /*
     * Outer div: fills the .lab-preview flex cell completely.
     * Desktop: background #060a14, iframe is 100% width, no gaps.
     * Mobile: background slightly darker with dot pattern so the dead
     *   space flanking the 390px iframe reads as intentional phone-frame.
     */
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        minHeight:     "100vh",
        background:    isMobile
          ? "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px) 0 0 / 20px 20px #04070f"
          : "#060a14",
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
        Desktop wrapper:
          - width: 100%        fills the entire pane with no gaps
          - flex: 1 1 auto     grows vertically
          - no margin: 0 auto  not needed when width is 100%
          - no max-width cap   fills to 2560px if the pane is that wide

        Mobile wrapper:
          - width: 390px       fixed phone width
          - min-width: 390px   never collapses below phone width
          - margin: 0 auto     centers the 390px window in the pane
          - padding: 16px 0    breathing room above/below the iframe
      */}
      <div
        style={
          isMobile
            ? {
                width:    `${MOBILE_WIDTH}px`,
                minWidth: `${MOBILE_WIDTH}px`,
                flex:     "1 1 auto",
                margin:   "0 auto",
                padding:  "16px 0",
              }
            : {
                width:    "100%",
                flex:     "1 1 auto",
              }
        }
      >
        <iframe
          ref={iframeRef}
          src="/preview"
          style={{
            border:    isMobile ? "1px solid rgba(255,255,255,0.12)" : "none",
            display:   "block",
            width:     isMobile ? `${MOBILE_WIDTH}px` : "100%",
            height:    "100dvh",
            minHeight: "600px",
          }}
          title="Site preview"
        />
      </div>
    </div>
  );
}
