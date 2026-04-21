/**
 * app/(preview)/preview/page.tsx
 * Server Component rendered inside the type-lab preview iframe.
 * Renders only the SiteHeader and HeroSection -- the above-fold view.
 * Token section, Stakeholders, and Footer are excluded.
 *
 * CSS var overrides from the outer ControlPanel are applied via
 * postMessage by PreviewVarReceiver.
 */

import { SiteHeader }       from "@/components/layout/SiteHeader";
import { HeroSection }      from "@/components/home/HeroSection";
import { PreviewVarReceiver } from "./PreviewVarReceiver";

export default function PreviewPage() {
  return (
    <>
      {/* Receives postMessage CSS var updates from the outer LabShell */}
      <PreviewVarReceiver />

      <SiteHeader />
      <main id="main" tabIndex={-1} style={{ outline: "none" }}>
        <HeroSection />
      </main>
    </>
  );
}
