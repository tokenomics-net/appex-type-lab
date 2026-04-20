"use client";
/**
 * LabShell.tsx
 * "use client" justified: manages panel open/close state and
 * passes the panel width to PreviewPane for margin offset.
 */

import { useState } from "react";
import { ControlPanel } from "@/components/ControlPanel";
import { PreviewPane }  from "@/components/PreviewPane";

const PANEL_WIDTH = 320; // px -- matches .type-lab-panel width in ControlPanel.tsx

export function LabShell() {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <ControlPanel
        isOpen={panelOpen}
        onToggle={() => setPanelOpen((v) => !v)}
      />
      {/* On wide screens the panel is always visible via CSS -- margin is always applied.
          On narrow screens the panel overlays, so the preview takes full width. */}
      <style>{`
        @media (min-width: 1100px) {
          .lab-preview-wrapper { margin-left: ${PANEL_WIDTH}px !important; }
        }
        @media (max-width: 1099px) {
          .lab-preview-wrapper { margin-left: 0 !important; }
        }
      `}</style>
      <div className="lab-preview-wrapper" style={{ marginLeft: `${PANEL_WIDTH}px` }}>
        <PreviewPane panelWidth={0} />
      </div>
    </>
  );
}
