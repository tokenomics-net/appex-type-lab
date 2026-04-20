"use client";
/**
 * ForStakeholdersSection.tsx
 * Ported from website-v2 exactly.
 * "use client" justified: useState for active tab, useEffect for
 * keyboard navigation (Arrow keys, Home, End), onClick handlers on tab buttons.
 *
 * Typography: all hardcoded font-size / font-weight / line-height /
 * letter-spacing replaced with var(--type-*) CSS variable references.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface TabData {
  id: string;
  label: string;
  asset: string;
  assetAlt: string;
  accentVar: string;
  eyebrow: string;
  heading: string;
  body: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
}

const TABS: TabData[] = [
  {
    id: "lps",
    label: "For Liquidity Providers",
    asset: "/images/r22-asset-lp-yield-transparent.webp",
    assetAlt: "Floating LP yield asset representing fee accrual into NAV",
    accentVar: "var(--ax-capital-yellow)",
    eyebrow: "For Liquidity Providers",
    heading: "Yield from real borrower fees.",
    body: "LPs earn from fees charged on real advances, not from emissions or temporary incentives. Deposit permissionlessly from 1 USDC. Fees accrue to NAV per advance, not annually. Optional staking for $APPEX rewards.",
    bullets: [
      "Permissionless deposits from 1 USDC",
      "Fees accrue to NAV per advance",
      "Optional staking for $APPEX rewards",
    ],
    ctaLabel: "LP details",
    ctaHref: "/lps",
  },
  {
    id: "borrowers",
    label: "For Borrowers",
    asset: "/images/r22-asset-borrower-forward-transparent.webp",
    assetAlt: "Borrower forward asset representing capital access and forward payment",
    accentVar: "var(--ax-ether-mist)",
    eyebrow: "For Borrowers",
    heading: "Borrow from the vault. Forward funds to your customers.",
    body: "Approved borrowers draw capital from the vault to pay their own customers faster. No more waiting Net-30 to Net-180 for revenue to arrive before forwarding it downstream. Fees are individually negotiated based on margins, velocity, and creditworthiness. Choose payout in USDC or $APPEX. Protocol fees paid in $APPEX cost 25% less.",
    bullets: [
      "Terms tied to margins, velocity, and creditworthiness",
      "Choose payout in USDC or $APPEX",
      "25% lower fees when paying in $APPEX",
    ],
    ctaLabel: "Borrower details",
    ctaHref: "/borrowers",
  },
];

export function ForStakeholdersSection(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<number>(0);
  const tablistRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activateTab = useCallback((idx: number): void => {
    setActiveTab(idx);
  }, []);

  useEffect(() => {
    const tablist = tablistRef.current;
    if (!tablist) return;
    const handleKey = (e: KeyboardEvent): void => {
      const btns = btnRefs.current.filter((b): b is HTMLButtonElement => b !== null);
      const cur = btns.indexOf(document.activeElement as HTMLButtonElement);
      if (cur < 0) return;
      let next = cur;
      if (e.key === "ArrowRight")     next = (cur + 1) % btns.length;
      else if (e.key === "ArrowLeft") next = (cur - 1 + btns.length) % btns.length;
      else if (e.key === "Home")      next = 0;
      else if (e.key === "End")       next = btns.length - 1;
      else return;
      e.preventDefault();
      activateTab(next);
      btns[next]?.focus();
    };
    tablist.addEventListener("keydown", handleKey);
    return () => tablist.removeEventListener("keydown", handleKey);
  }, [activateTab]);

  return (
    <>
      <style>{`
        /* ---- For Stakeholders (tabbed) section ---- */
        .stakeholders {
          position: relative;
          overflow: hidden;
          background: var(--ax-fortress);
          padding: 80px 0;
        }

        @media (max-width: 767px) {
          .stakeholders { padding: 48px 0; }
        }

        .stakeholders__texture {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.20;
          pointer-events: none;
          z-index: 0;
        }

        .stakeholders__gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg,
            rgba(10,15,31,0.85) 0%,
            rgba(10,15,31,0.70) 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        .stakeholders__hairline {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(180deg, rgba(254,214,7,0.14) 0%, transparent 100%);
          pointer-events: none;
          z-index: 2;
        }

        .stakeholders__content {
          position: relative;
          z-index: 3;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 48px;
        }

        @media (max-width: 1023px) {
          .stakeholders__content { padding: 0 32px; }
        }
        @media (max-width: 767px) {
          .stakeholders__content { padding: 0 24px; }
        }

        .stakeholders__tablist {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-bottom: 48px;
          flex-wrap: wrap;
        }

        .stakeholders__tab-btn {
          font-family: var(--font-display-family);
          font-size: var(--type-tab-label-size);
          font-weight: var(--type-tab-label-weight);
          letter-spacing: var(--type-tab-label-letter-spacing);
          line-height: var(--type-tab-label-line-height);
          text-transform: uppercase;
          padding: 10px 24px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition:
            background 250ms ease,
            border-color 250ms ease,
            color 250ms ease,
            box-shadow 250ms ease;
          white-space: nowrap;
        }

        .stakeholders__tab-btn--active {
          background: rgba(254,214,7,0.12);
          color: var(--ax-capital-yellow);
          border: 1px solid rgba(254,214,7,0.40);
          box-shadow: 0 0 20px rgba(254,214,7,0.10);
        }

        .stakeholders__tab-btn--inactive {
          background: transparent;
          color: var(--color-muted-text);
          border: 1px solid var(--border-hairline);
        }

        .stakeholders__tab-btn--inactive:hover {
          color: var(--color-secondary-text);
          border-color: rgba(255,255,255,0.20);
          background: rgba(255,255,255,0.03);
        }

        .stakeholders__tab-btn:focus-visible {
          outline: 2px solid var(--ax-capital-yellow);
          outline-offset: 3px;
        }

        .stakeholders__panel {
          animation: axTabFade 300ms cubic-bezier(0.4,0,0.2,1);
        }

        .stakeholders__panel-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }

        @media (max-width: 1023px) {
          .stakeholders__panel-grid { gap: 40px; }
        }
        @media (max-width: 767px) {
          .stakeholders__panel-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }

        .stakeholders__asset-col {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stakeholders__asset {
          width: clamp(240px, 50%, 320px);
          height: auto;
          filter:
            drop-shadow(0 4px 20px rgba(254,214,7,0.12))
            drop-shadow(0 8px 40px rgba(90,28,203,0.10))
            drop-shadow(0 16px 60px rgba(0,0,0,0.38));
        }

        @media (max-width: 767px) {
          .stakeholders__asset { width: clamp(200px, 60%, 280px); }
        }

        .stakeholders__eyebrow {
          font-family: var(--font-display-family);
          font-size: var(--type-section-eyebrow-size);
          font-weight: var(--type-section-eyebrow-weight);
          letter-spacing: var(--type-section-eyebrow-letter-spacing);
          line-height: var(--type-section-eyebrow-line-height);
          text-transform: uppercase;
          opacity: 0.55;
          margin-bottom: 12px;
        }

        .stakeholders__heading {
          font-family: var(--font-display-family);
          font-size: var(--type-stakeholders-heading-size);
          font-weight: var(--type-stakeholders-heading-weight);
          line-height: var(--type-stakeholders-heading-line-height);
          letter-spacing: var(--type-stakeholders-heading-letter-spacing);
          color: var(--color-primary-text);
          margin-bottom: 16px;
        }

        .stakeholders__body {
          font-family: var(--font-body-family);
          font-size: var(--type-body-size);
          font-weight: var(--type-body-weight);
          line-height: var(--type-body-line-height);
          letter-spacing: var(--type-body-letter-spacing);
          color: var(--color-secondary-text);
          margin-bottom: 20px;
        }

        .stakeholders__bullets {
          list-style: none;
          padding: 0;
          margin: 0 0 28px 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .stakeholders__bullet {
          font-family: var(--font-body-family);
          font-size: var(--type-bullet-size);
          font-weight: var(--type-bullet-weight);
          line-height: var(--type-bullet-line-height);
          letter-spacing: var(--type-bullet-letter-spacing);
          color: var(--color-secondary-text);
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
      `}</style>

      <section className="stakeholders" aria-labelledby="stakeholders-heading">
        <Image
          src="/images/r17-texture-calm.png"
          alt="" aria-hidden="true"
          fill
          className="stakeholders__texture"
          style={{ objectFit: "cover" }}
          loading="lazy"
          decoding="async"
        />
        <div className="stakeholders__gradient" aria-hidden="true" />
        <div className="stakeholders__hairline" aria-hidden="true" />

        <div className="stakeholders__content">
          <div
            ref={tablistRef}
            className="stakeholders__tablist"
            role="tablist"
            aria-label="Stakeholder perspectives"
          >
            {TABS.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => { btnRefs.current[i] = el; }}
                className={`stakeholders__tab-btn ${activeTab === i ? "stakeholders__tab-btn--active" : "stakeholders__tab-btn--inactive"}`}
                role="tab"
                aria-selected={activeTab === i}
                aria-controls={`stakeholders-panel-${t.id}`}
                id={`stakeholders-tab-${t.id}`}
                onClick={() => { activateTab(i); }}
                type="button"
                tabIndex={activeTab === i ? 0 : -1}
              >
                {t.label}
              </button>
            ))}
          </div>

          {TABS.map((t, i) => (
            <div
              key={t.id}
              id={`stakeholders-panel-${t.id}`}
              role="tabpanel"
              aria-labelledby={`stakeholders-tab-${t.id}`}
              hidden={activeTab !== i}
            >
              {activeTab === i && (
                <div className="stakeholders__panel">
                  <div className="stakeholders__panel-grid">
                    <div className="stakeholders__asset-col">
                      <Image
                        src={t.asset}
                        alt={t.assetAlt}
                        width={320}
                        height={320}
                        className="stakeholders__asset"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    <div>
                      <div
                        className="stakeholders__eyebrow"
                        style={{ color: t.accentVar }}
                      >
                        {t.eyebrow}
                      </div>
                      <h2
                        id={i === 0 ? "stakeholders-heading" : undefined}
                        className="stakeholders__heading"
                      >
                        {t.heading}
                      </h2>
                      <p className="stakeholders__body">{t.body}</p>
                      <ul className="stakeholders__bullets">
                        {t.bullets.map((b) => (
                          <li key={b} className="stakeholders__bullet">
                            <span
                              aria-hidden="true"
                              style={{
                                display:      "inline-block",
                                width:        "4px",
                                height:       "4px",
                                borderRadius: "50%",
                                marginTop:    "7px",
                                flexShrink:   0,
                                background:   t.accentVar,
                                opacity:      0.7,
                              }}
                            />
                            {b}
                          </li>
                        ))}
                      </ul>
                      <a
                        href={t.ctaHref}
                        className="ax-btn--secondary"
                        style={{
                          fontSize: "var(--type-btn-secondary-size)",
                          fontWeight: "var(--type-btn-secondary-weight)" as unknown as number,
                          lineHeight: "var(--type-btn-secondary-line-height)" as unknown as number,
                          letterSpacing: "var(--type-btn-secondary-letter-spacing)",
                          borderColor:
                            t.id === "borrowers"
                              ? "rgba(185,160,204,0.35)"
                              : undefined,
                          color:
                            t.id === "borrowers"
                              ? "var(--ax-ether-mist)"
                              : undefined,
                        }}
                      >
                        {t.ctaLabel}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
