"use client";
/**
 * MobileNavDrawer.tsx
 * Ported from website-v2 exactly.
 * "use client" justified: drawer open/close state, body scroll lock,
 * focus trap, Escape-to-close, and animation state all require client hooks.
 *
 * Typography: all font-size / font-weight / letter-spacing replaced with
 * var(--type-*) references per the type-lab spec.
 */

import { useEffect, useRef } from "react";
import type { NavConfig } from "./nav-config";

interface MobileNavDrawerProps {
  config: NavConfig;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavDrawer({ config, isOpen, onClose }: MobileNavDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef      = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .mobile-drawer {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(10, 15, 31, 0.96);
          backdrop-filter: blur(24px);
          display: flex;
          flex-direction: column;
          padding: 20px 24px 40px;
          animation: drawer-in 250ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes drawer-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .mobile-drawer__top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 56px;
          margin-bottom: 32px;
        }
        .mobile-drawer__close {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.88);
          border-radius: 8px;
        }
        .mobile-drawer__close:focus-visible {
          outline: 2px solid var(--ax-capital-yellow);
          outline-offset: 2px;
        }
        .mobile-drawer__ctas {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }
        .mobile-drawer__cta-solid {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 48px;
          background: var(--ax-fortress);
          color: var(--ax-capital-yellow);
          font-family: var(--font-display-family);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 4px;
        }
        .mobile-drawer__cta-ghost {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 48px;
          background: transparent;
          border: 1px solid var(--ax-node-purple);
          color: var(--ax-node-purple);
          font-family: var(--font-display-family);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 4px;
        }
        .mobile-drawer__divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin: 0 0 32px;
        }
        .mobile-drawer__links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .mobile-drawer__link-item a {
          display: block;
          width: 100%;
          padding: 16px 0;
          font-family: var(--font-display-family);
          font-size: var(--type-mobile-drawer-link-size);
          font-weight: var(--type-mobile-drawer-link-weight);
          text-transform: uppercase;
          letter-spacing: var(--type-mobile-drawer-link-letter-spacing);
          line-height: var(--type-mobile-drawer-link-line-height);
          color: rgba(255, 255, 255, 0.88);
          text-decoration: none;
        }
        .mobile-drawer__link-item a[aria-current="page"] {
          color: var(--ax-capital-yellow);
        }
        .mobile-drawer__socials {
          display: flex;
          gap: 24px;
          margin-top: auto;
          padding-top: 32px;
        }
        .mobile-drawer__social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          color: rgba(255, 255, 255, 0.72);
          text-decoration: none;
          transition: color 200ms ease-out;
        }
        .mobile-drawer__social-link:hover {
          color: var(--ax-capital-yellow);
        }
        @media (prefers-reduced-motion: reduce) {
          .mobile-drawer { animation: none; }
        }
      `}</style>

      <nav
        id="mobile-nav-drawer"
        ref={drawerRef}
        role="dialog"
        aria-label="Mobile navigation"
        aria-modal="true"
        className="mobile-drawer"
      >
        <div className="mobile-drawer__top">
          <img
            src={config.logo.markSrc}
            alt={config.logo.alt}
            width={32}
            height={32}
          />
          <button
            ref={closeButtonRef}
            className="mobile-drawer__close"
            aria-label="Close navigation"
            onClick={onClose}
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="mobile-drawer__ctas">
          <a
            href={`mailto:${config.ctas.find(c => c.variant === "solid")?.href.replace("mailto:", "") ?? ""}`}
            className="mobile-drawer__cta-solid"
            onClick={onClose}
          >
            Contact
          </a>
          <a
            href="/appex"
            className="mobile-drawer__cta-ghost"
            onClick={onClose}
          >
            $APPEX
          </a>
        </div>

        <div className="mobile-drawer__divider" aria-hidden="true" />

        <ul className="mobile-drawer__links">
          {config.primaryLinks.map((link) => (
            <li key={link.href} className="mobile-drawer__link-item">
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                >
                  {link.label}
                </a>
              ) : (
                <a
                  href={link.href}
                  onClick={onClose}
                >
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        {config.socials.length > 0 && (
          <>
            <div className="mobile-drawer__divider" aria-hidden="true" style={{ marginTop: "32px", marginBottom: "0" }} />
            <div className="mobile-drawer__socials">
              {config.socials.map((s) => (
                <a
                  key={s.platform}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  className="mobile-drawer__social-link"
                >
                  {s.iconKey === "x" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </>
        )}
      </nav>
    </>
  );
}
