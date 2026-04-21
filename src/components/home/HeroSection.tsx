/**
 * HeroSection.tsx
 * Ported from website-v2 exactly. Server Component.
 *
 * Typography variables updated to match the simplified role IDs:
 *   --type-hero-headline-size  -> --type-hero-headline-size  (same)
 *   --type-hero-subhead-size   -> --type-hero-subhead-size   (same)
 *   --type-hero-meta-size      -> --type-hero-meta-size      (same)
 *   --type-btn-primary-size    -> --type-cta-btn-size        (renamed)
 *   color vars updated to --color-{roleId}
 *
 * Font-size parity fix: all clamp() expressions and @media font-size
 * overrides replaced with single fixed values. Layout-only @media rules
 * (padding, display, column stacking) are preserved.
 */

import Image from "next/image";

export function HeroSection(): React.JSX.Element {
  return (
    <>
      <style>{`
        /* ---- Hero section ---- */
        .hero-bleed {
          position: relative;
          width: 100%;
          min-height: 100svh;
          display: flex;
          align-items: center;
          overflow: clip;
          overflow-clip-margin: 24px;
          background: var(--ax-fortress);
        }

        .hero-bleed__scene {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: left center;
          pointer-events: none;
          z-index: 0;
        }

        .hero-bleed__gradient-left {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg,
            rgba(10,15,31,0.72) 0%,
            rgba(10,15,31,0.40) 28%,
            transparent 55%
          );
          pointer-events: none;
          z-index: 1;
        }

        .hero-bleed__gradient-bottom {
          position: absolute;
          inset: 0;
          background: linear-gradient(0deg,
            rgba(10,15,31,0.6) 0%,
            transparent 35%
          );
          pointer-events: none;
          z-index: 1;
        }

        .hero-bleed__hairline {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(254,214,7,0.18);
          pointer-events: none;
          z-index: 2;
        }

        .hero-bleed__token-desktop {
          position: absolute;
          right: 8%;
          top: 50%;
          width: clamp(400px, 38vw, 550px);
          height: auto;
          z-index: 4;
          pointer-events: none;
          animation:
            axTokenFloat 6s ease-in-out infinite,
            axTokenRock 8s ease-in-out infinite,
            axTokenShadowPulse 4s ease-in-out infinite;
        }

        @keyframes axTokenFloat {
          0%, 100% { transform: translateY(calc(-50% - 8px)) translateX(0px); }
          25%       { transform: translateY(calc(-50% + 0px)) translateX(6px); }
          50%       { transform: translateY(calc(-50% + 8px)) translateX(0px); }
          75%       { transform: translateY(calc(-50% + 0px)) translateX(-6px); }
        }

        @keyframes axTokenRock {
          0%, 100% { rotate: -1.5deg; }
          50%       { rotate:  1.5deg; }
        }

        @keyframes axTokenShadowPulse {
          0%, 100% {
            filter:
              drop-shadow(0 0 18px rgba(254,214,7,0.28))
              drop-shadow(0 0 42px rgba(90,28,203,0.55))
              drop-shadow(0 0 90px rgba(90,28,203,0.28))
              drop-shadow(0 12px 60px rgba(0,0,0,0.50));
          }
          50% {
            filter:
              drop-shadow(0 0 22px rgba(254,214,7,0.42))
              drop-shadow(0 0 52px rgba(90,28,203,0.72))
              drop-shadow(0 0 110px rgba(90,28,203,0.40))
              drop-shadow(0 12px 70px rgba(0,0,0,0.50));
          }
        }

        @media (max-width: 767px) {
          .hero-bleed__token-desktop { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-bleed__token-desktop {
            animation: none;
            rotate: 0deg;
            transform: translateY(-50%);
            filter:
              drop-shadow(0 0 18px rgba(254,214,7,0.28))
              drop-shadow(0 0 42px rgba(90,28,203,0.55))
              drop-shadow(0 0 90px rgba(90,28,203,0.28))
              drop-shadow(0 12px 60px rgba(0,0,0,0.50));
          }
        }

        .hero-bleed__grid {
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 48px;
        }

        @media (max-width: 1023px) {
          .hero-bleed__grid { padding: 0 32px; }
        }
        @media (max-width: 767px) {
          .hero-bleed__grid { padding: 0 24px; }
        }

        .hero-bleed__content {
          max-width: 640px;
          padding-top: 128px;
          padding-bottom: 64px;
          animation: axFadeUp 800ms var(--ease-enter) both;
        }

        @media (max-width: 767px) {
          .hero-bleed__content {
            padding-top: 96px;
            padding-bottom: 48px;
            max-width: 100%;
          }
        }

        .hero-bleed__token-mobile {
          display: none;
        }

        @media (max-width: 767px) {
          .hero-bleed__token-mobile {
            display: block;
            width: clamp(200px, 55vw, 250px);
            height: auto;
            margin: 0 auto 28px;
            animation:
              axTokenFloatMobile 6s ease-in-out infinite,
              axTokenRock 8s ease-in-out infinite,
              axTokenShadowPulse 4s ease-in-out infinite;
          }

          @keyframes axTokenFloatMobile {
            0%, 100% { transform: translateY(-8px); }
            50%       { transform: translateY(8px); }
          }
        }

        @media (max-width: 767px) and (prefers-reduced-motion: reduce) {
          .hero-bleed__token-mobile {
            animation: none;
            rotate: 0deg;
          }
        }

        /*
          H1: font-size driven by --type-hero-headline-size.
          Single fixed value -- no clamp, no @media font-size override.
          The preview width shrinks; the font does not.
        */
        .hero-bleed__h1 {
          font-family: var(--font-display-family);
          font-size: var(--type-hero-headline-size);
          font-weight: 400;
          line-height: 1.15;
          letter-spacing: 0em;
          color: var(--color-hero-headline);
          margin: 0 0 24px 0;
        }

        .hero-bleed__h1-line {
          display: block;
          padding-bottom: 0.08em;
        }

        .hero-bleed__h1-line--gradient {
          display: inline-block;
          padding-bottom: 0.12em;
          background-image: linear-gradient(
            90deg,
            var(--ax-capital-yellow) 0%,
            var(--ax-glint-yellow) 30%,
            var(--ax-ether-mist) 60%,
            var(--ax-node-purple-light) 80%,
            var(--ax-capital-yellow) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: axShimmer 8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-bleed__h1-line--gradient {
            animation: none;
            background-position: 0% 50%;
          }
        }

        /*
          Subhead: single fixed font-size, no clamp.
        */
        .hero-bleed__subhead {
          font-family: var(--font-body-family);
          font-size: var(--type-hero-subhead-size);
          font-weight: 400;
          line-height: 1.6;
          letter-spacing: 0em;
          color: var(--color-hero-subhead);
          margin: 0 0 12px 0;
          max-width: 520px;
        }

        /*
          Meta line: single fixed font-size, no clamp.
        */
        .hero-bleed__meta {
          font-family: var(--font-mono-family);
          font-size: var(--type-hero-meta-size);
          font-weight: 400;
          line-height: 1.4;
          letter-spacing: 0.05em;
          color: var(--color-hero-meta);
          opacity: 0.65;
          margin: 0 0 40px 0;
        }

        .hero-bleed__ctas {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 20px;
        }

        .hero-bleed__socials-inline {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hero-social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          color: var(--color-hero-subhead);
          transition: color 250ms ease, border-color 250ms ease, background 250ms ease;
        }

        .hero-social-icon:hover {
          color: var(--ax-capital-yellow);
          border-color: rgba(254,214,7,0.4);
          background: rgba(254,214,7,0.08);
        }

        @media (max-width: 480px) {
          .hero-bleed__ctas { gap: 16px; }
        }

        .hero-bleed__content > * {
          animation: axFadeUp 800ms var(--ease-enter) both;
        }
        .hero-bleed__token-mobile { animation-delay: 0ms; }
        .hero-bleed__h1           { animation-delay: 100ms; }
        .hero-bleed__subhead      { animation-delay: 250ms; }
        .hero-bleed__meta         { animation-delay: 350ms; }
        .hero-bleed__ctas         { animation-delay: 450ms; }

        @media (prefers-reduced-motion: reduce) {
          .hero-bleed__content,
          .hero-bleed__content > * {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }

        /*
          CTA button: overrides the global .ax-btn--primary font-size
          with the lab-controlled --type-cta-btn-size variable.
          Single fixed value -- no clamp.
        */
        .hero-bleed__cta-override {
          font-size: var(--type-cta-btn-size) !important;
          color: var(--color-cta-btn) !important;
        }
      `}</style>

      <section className="hero-bleed" aria-label="Hero">
        <Image
          src="/images/r24-hero-home-vault-door.webp"
          alt="" aria-hidden="true"
          role="presentation"
          fill
          priority
          sizes="100vw"
          quality={85}
          className="hero-bleed__scene"
          style={{ objectFit: "cover", objectPosition: "left center" }}
        />

        <div className="hero-bleed__gradient-left" aria-hidden="true" />
        <div className="hero-bleed__gradient-bottom" aria-hidden="true" />
        <div className="hero-bleed__hairline" aria-hidden="true" />

        <Image
          src="/images/r22-appex-token-edited-transparent.webp"
          alt="appeX token with logomark"
          width={550}
          height={400}
          className="hero-bleed__token-desktop"
          priority
          sizes="clamp(400px, 38vw, 550px)"
        />

        <div className="hero-bleed__grid">
          <div className="hero-bleed__content">
            <Image
              src="/images/r22-appex-token-edited-transparent.webp"
              alt="appeX token with logomark"
              width={250}
              height={250}
              className="hero-bleed__token-mobile"
              priority
            />

            <h1 className="hero-bleed__h1">
              <span className="hero-bleed__h1-line">Onchain financing</span>
              <span className="hero-bleed__h1-line">
                <span className="hero-bleed__h1-line--gradient">infrastructure.</span>
              </span>
            </h1>

            <p className="hero-bleed__subhead">
              appeX Protocol is an onchain vault where liquidity providers deposit USDC and
              credit-reviewed borrowers draw working capital against verified receivables.
              Fees from each advance accrue to net asset value, increasing LP token value directly.
            </p>

            <p className="hero-bleed__meta">$APPEX | Liquidity at every settlement</p>

            <div className="hero-bleed__ctas">
              <a href="/protocol" className="ax-btn--primary hero-bleed__cta-override">
                See how the protocol works
              </a>
              <div className="hero-bleed__socials-inline">
                <a href="https://x.com/appexprotocol" target="_blank" rel="noopener noreferrer" aria-label="Follow appeX on X" className="hero-social-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://www.linkedin.com/company/appex-protocol/" target="_blank" rel="noopener noreferrer" aria-label="Follow appeX on LinkedIn" className="hero-social-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="mailto:support@appex.finance" aria-label="Email appeX" className="hero-social-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
