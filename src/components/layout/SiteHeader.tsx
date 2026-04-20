/**
 * SiteHeader.tsx
 * Ported from website-v2 exactly. Server Component shell.
 */

import { navConfig } from "./nav-config";
import { SiteHeaderClient } from "./SiteHeaderClient";

export function SiteHeader() {
  return (
    <header role="banner">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <div className="nav-gradient" aria-hidden="true" />
      <SiteHeaderClient config={navConfig} />
    </header>
  );
}
