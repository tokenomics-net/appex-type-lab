"use client";
/**
 * PreviewPane.tsx
 * "use client" justified: tab switching state, ResizeObserver for
 * responsive fallback, and dynamic preview width logic all require
 * browser APIs.
 *
 * Renders side-by-side mobile (390px) and desktop (1280px) preview columns.
 * On narrow screens (<1100px lab width) falls back to Mobile | Desktop tabs.
 *
 * Both previews are scaled divs with overflow:auto. CSS vars applied to
 * :root flow into the ported components automatically -- no re-render needed.
 */

import { useState, useEffect, useRef } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeroSection } from "@/components/home/HeroSection";
import { TokenSection } from "@/components/home/TokenSection";
import { ForStakeholdersSection } from "@/components/home/ForStakeholdersSection";

type Tab = "mobile" | "desktop";

function PreviewContent() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} style={{ outline: "none" }}>
        <HeroSection />
        <TokenSection />
        <ForStakeholdersSection />
      </main>
      <SiteFooter />
    </>
  );
}

function ScaledPreview({ targetWidth, label }: { targetWidth: number; label: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const available = entry.contentRect.width;
        setScale(Math.min(1, available / targetWidth));
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [targetWidth]);

  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        flex:          targetWidth >= 1280 ? "1 1 0" : "0 0 auto",
        minWidth:      0,
      }}
    >
      <div
        style={{
          fontSize:        "11px",
          color:           "rgba(255,255,255,0.45)",
          textAlign:       "center",
          padding:         "6px 0",
          fontFamily:      "system-ui, sans-serif",
          letterSpacing:   "0.08em",
          textTransform:   "uppercase",
          borderBottom:    "1px solid rgba(255,255,255,0.06)",
          flexShrink:      0,
        }}
      >
        {label} &mdash; {targetWidth}px
      </div>
      <div
        ref={wrapRef}
        style={{
          flex:      "1 1 auto",
          overflow:  "hidden",
          position:  "relative",
        }}
      >
        <div
          style={{
            width:           `${targetWidth}px`,
            transformOrigin: "top left",
            transform:       `scale(${scale})`,
            height:          `${100 / scale}%`,
            overflow:        "auto",
          }}
        >
          <PreviewContent />
        </div>
      </div>
    </div>
  );
}

export function PreviewPane({ panelWidth: _panelWidth }: { panelWidth: number }) {
  const [activeTab, setActiveTab] = useState<Tab>("desktop");
  const [narrow, setNarrow]       = useState(false);
  const containerRef              = useRef<HTMLDivElement>(null);

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
          <ScaledPreview targetWidth={390} label="Mobile" />
        )}
        {(!narrow || activeTab === "desktop") && (
          <ScaledPreview targetWidth={1280} label="Desktop" />
        )}
      </div>
    </div>
  );
}
