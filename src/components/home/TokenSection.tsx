/**
 * TokenSection.tsx
 * Ported from website-v2 exactly. Server Component.
 * Typography: all hardcoded font-size / font-weight / line-height /
 * letter-spacing replaced with var(--type-*) CSS variable references.
 */

import Image from "next/image";

interface UtilityCardData {
  icon: string;
  iconAlt: string;
  title: string;
  body: string;
}

const UTILITY_CARDS: UtilityCardData[] = [
  {
    icon:    "/images/r22-util-liquidity-transparent.webp",
    iconAlt: "Liquidity utility -- backed by real market activity",
    title:   "Backed by real liquidity",
    body:    "Every payment through appeX is backed by $APPEX purchased on the open market.",
  },
  {
    icon:    "/images/r19-asset-yield-curve-wedge-transparent.webp",
    iconAlt: "Earn protocol fees utility",
    title:   "Earn protocol fees",
    body:    "LPs stake $APPEX to receive their share of protocol fees distributed to stakers.",
  },
  {
    icon:    "/images/r22-util-lower-fees-transparent.webp",
    iconAlt: "25% lower fees utility",
    title:   "25% lower fees",
    body:    "Protocol fees paid in $APPEX are 25% lower.",
  },
  {
    icon:    "/images/r39-asset-staking-lock-transparent.webp",
    iconAlt: "Literal lock -- staking rewards",
    title:   "Staking rewards",
    body:    "Stake $APPEX with LP tokens to receive staking emissions.",
  },
  {
    icon:    "/images/r22-util-governance-transparent.webp",
    iconAlt: "Governance rights utility",
    title:   "Governance rights",
    body:    "Staked token holders vote on vault parameters and protocol decisions.",
  },
];

export function TokenSection(): React.JSX.Element {
  return (
    <>
      <style>{`
        /* ---- Token section ---- */
        .token-section {
          position: relative;
          overflow: hidden;
          min-height: 720px;
          background: var(--ax-fortress);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .token-section__scene {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          pointer-events: none;
          z-index: 0;
          animation: axScenePulse 20s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .token-section__scene { animation: none; }
        }

        .token-section__tint {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg,
            rgba(10,15,31,0.50) 0%,
            rgba(10,15,31,0.30) 40%,
            rgba(10,15,31,0.50) 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        .token-section__content {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 80px 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        @media (max-width: 767px) {
          .token-section__content { padding: 48px 24px; }
        }

        .token-section__headline-glass {
          background: rgba(10,15,31,0.72);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: var(--radius-md);
          padding: 32px 40px;
          max-width: 640px;
          text-align: center;
          margin-bottom: 48px;
        }

        .token-section__eyebrow {
          font-family: var(--font-display-family);
          font-size: var(--type-section-eyebrow-size);
          font-weight: var(--type-section-eyebrow-weight);
          letter-spacing: var(--type-section-eyebrow-letter-spacing);
          line-height: var(--type-section-eyebrow-line-height);
          text-transform: uppercase;
          color: var(--ax-capital-yellow);
          opacity: 0.55;
          margin-bottom: 12px;
        }

        .token-section__heading {
          font-family: var(--font-display-family);
          font-size: var(--type-section-headline-size);
          font-weight: var(--type-section-headline-weight);
          line-height: var(--type-section-headline-line-height);
          letter-spacing: var(--type-section-headline-letter-spacing);
          color: var(--color-primary-text);
          margin-bottom: 16px;
        }

        .token-section__subhead {
          font-family: var(--font-body-family);
          font-size: var(--type-section-subhead-size);
          font-weight: var(--type-section-subhead-weight);
          line-height: var(--type-section-subhead-line-height);
          letter-spacing: var(--type-section-subhead-letter-spacing);
          color: var(--color-secondary-text);
        }

        .token-section__token-wrap {
          margin-bottom: 48px;
        }

        .token-section__token {
          filter:
            drop-shadow(0 4px 20px rgba(254,214,7,0.15))
            drop-shadow(0 8px 40px rgba(90,28,203,0.12))
            drop-shadow(0 16px 60px rgba(0,0,0,0.4));
        }

        .token-section__cards {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
          margin-bottom: 40px;
          width: 100%;
        }

        .token-section__card {
          flex: 0 1 calc(33.333% - 16px);
          max-width: 300px;
          min-width: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 28px 24px 24px;
          background: rgba(10,15,31,0.78);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--radius-md);
          transition:
            transform 300ms cubic-bezier(0.4,0,0.2,1),
            border-color 300ms cubic-bezier(0.4,0,0.2,1);
          opacity: 0;
          transform: translateY(24px);
          animation: tokenCardReveal 0.6s var(--ease-enter) forwards;
        }

        @keyframes tokenCardReveal {
          to { opacity: 1; transform: none; }
        }

        .token-section__card:hover {
          transform: translateY(-2px);
          border-color: rgba(254,214,7,0.25);
        }

        @media (prefers-reduced-motion: reduce) {
          .token-section__card {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }

        @media (max-width: 767px) {
          .token-section__card {
            flex: 0 1 calc(50% - 12px);
            min-width: 160px;
          }
        }
        @media (max-width: 480px) {
          .token-section__card {
            flex: 1 1 100%;
            max-width: 100%;
          }
        }

        .token-section__card-icon {
          margin-bottom: 16px;
          filter:
            drop-shadow(0 4px 12px rgba(0,0,0,0.3))
            drop-shadow(0 0 20px rgba(90,28,203,0.06));
        }

        .token-section__card-title {
          font-family: var(--font-display-family);
          font-size: var(--type-card-title-size);
          font-weight: var(--type-card-title-weight);
          letter-spacing: var(--type-card-title-letter-spacing);
          line-height: var(--type-card-title-line-height);
          color: var(--color-card-title);
          margin-bottom: 6px;
        }

        .token-section__card-body {
          font-family: var(--font-body-family);
          font-size: var(--type-card-body-size);
          font-weight: var(--type-card-body-weight);
          line-height: var(--type-card-body-line-height);
          letter-spacing: var(--type-card-body-letter-spacing);
          color: var(--color-card-body);
          margin: 0;
        }

        .token-section__cta {
          text-align: center;
        }
      `}</style>

      <section className="token-section" aria-labelledby="token-heading">
        <Image
          src="/images/r21-scene-token-apex.png"
          alt="" aria-hidden="true"
          fill
          className="token-section__scene"
          style={{ objectFit: "cover", objectPosition: "center center" }}
          loading="lazy"
          decoding="async"
        />
        <div className="token-section__tint" aria-hidden="true" />

        <div className="token-section__content">
          <div className="token-section__headline-glass">
            <div className="token-section__eyebrow">$APPEX</div>
            <h2 id="token-heading" className="token-section__heading">
              Demand from{" "}
              <span className="text-gold-gradient">real transactions.</span>
            </h2>
            <p className="token-section__subhead">
              $APPEX has structural demand tied to real economic activity, not farming or
              temporary emissions. Fixed supply. No minting.
            </p>
          </div>

          <div className="token-section__token-wrap">
            <Image
              src="/images/r22-appex-token-edited-transparent.webp"
              alt="appeX token with logomark"
              width={320}
              height={320}
              className="token-section__token"
              style={{
                width: "clamp(240px, 28vw, 360px)",
                height: "auto",
              }}
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="token-section__cards">
            {UTILITY_CARDS.map((card, i) => (
              <div
                key={card.title}
                className="token-section__card"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <Image
                  src={card.icon}
                  alt={card.iconAlt}
                  width={140}
                  height={140}
                  className="token-section__card-icon"
                  style={{ width: "clamp(120px, 12vw, 160px)", height: "auto" }}
                  loading="lazy"
                  decoding="async"
                />
                <h3 className="token-section__card-title">{card.title}</h3>
                <p className="token-section__card-body">{card.body}</p>
              </div>
            ))}
          </div>

          <div className="token-section__cta">
            <a href="/appex" className="ax-btn--secondary" style={{
              fontSize: "var(--type-btn-secondary-size)",
              fontWeight: "var(--type-btn-secondary-weight)" as unknown as number,
              lineHeight: "var(--type-btn-secondary-line-height)" as unknown as number,
              letterSpacing: "var(--type-btn-secondary-letter-spacing)",
            }}>
              About $APPEX
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
