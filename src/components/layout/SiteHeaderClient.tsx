"use client";
/**
 * SiteHeaderClient.tsx
 * Ported from website-v2 exactly.
 * "use client" justified: scroll event listener, useState for drawer,
 * and data-scrolled attribute mutation require client-side code.
 *
 * Typography: nav link uses hardcoded 14px / rgba(255,255,255,0.88) from website-v2 globals.css.
 * Not a lab variable.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { MobileNavDrawer } from "./MobileNavDrawer";
import type { NavConfig } from "./nav-config";

interface SiteHeaderClientProps {
  config: NavConfig;
}

export function SiteHeaderClient({ config }: SiteHeaderClientProps) {
  const [scrolled, setScrolled]     = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hamburgerRef                = useRef<HTMLButtonElement>(null);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 80);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleClose = useCallback(() => {
    setDrawerOpen(false);
    hamburgerRef.current?.focus();
  }, []);

  return (
    <>
      <div
        className={`site-header${scrolled ? " is-scrolled" : ""}`}
        role="none"
      >
        <div className="site-header__inner">
          <a href="/" className="site-header__logo" aria-label="appeX, go to homepage">
            <img
              src="/brand/appex-mark.svg"
              alt="" aria-hidden="true"
              width={32}
              height={32}
              className="mark"
            />
            <img
              src="/brand/appex-wordmark.svg"
              alt="appeX"
              width={120}
              height={32}
              className="wordmark"
            />
          </a>

          <nav aria-label="Primary" className="site-header__nav">
            {config.primaryLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="header-nav-link"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="site-header__ctas" />

          <button
            ref={hamburgerRef}
            className="site-header__hamburger"
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setDrawerOpen(true)}
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {drawerOpen && (
        <MobileNavDrawer
          config={config}
          isOpen={drawerOpen}
          onClose={handleClose}
        />
      )}
    </>
  );
}
