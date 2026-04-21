/**
 * app/preview/page.tsx
 * Server Component rendered inside the type-lab preview iframes.
 * No interaction here -- the outer ControlPanel pushes CSS var
 * overrides to this document via postMessage, which a thin client
 * listener applies to :root.
 *
 * This route is loaded inside two iframes (width=390 and width=1280).
 * The iframe viewport width is what @media queries evaluate against,
 * so mobile layout triggers correctly at 390px regardless of the
 * outer browser window size.
 */

import { SiteHeader }              from "@/components/layout/SiteHeader";
import { SiteFooter }              from "@/components/layout/SiteFooter";
import { HeroSection }             from "@/components/home/HeroSection";
import { TokenSection }            from "@/components/home/TokenSection";
import { ForStakeholdersSection }  from "@/components/home/ForStakeholdersSection";
import { PreviewVarReceiver }      from "./PreviewVarReceiver";

export default function PreviewPage() {
  return (
    <>
      {/* Receives postMessage CSS var updates from the outer LabShell */}
      <PreviewVarReceiver />

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
