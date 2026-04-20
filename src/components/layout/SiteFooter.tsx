/**
 * SiteFooter.tsx
 * Ported from website-v2 exactly. Server Component.
 * Typography: hardcoded font-size / font-weight / letter-spacing replaced
 * with var(--type-footer-*) references.
 */

import { footerConfig } from "./footer-config";

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      style={{ display: "inline", marginLeft: "4px", verticalAlign: "middle", opacity: 0.4 }}
    >
      <path
        d="M3.5 1H1v8h8V6.5M5.5 1H9v3.5M9 1L4.5 5.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteFooter() {
  const { brand, columns, legal } = footerConfig;

  return (
    <footer
      role="contentinfo"
      style={{
        position:    "relative",
        overflow:    "hidden",
        background:  "linear-gradient(180deg, #0A0F1F 0%, #050812 100%)",
        borderTop:   "1px solid rgba(90, 28, 203, 0.28)",
        boxShadow:   "0 -1px 24px rgba(90, 28, 203, 0.18)",
      }}
    >
      {/* Texture underlayment */}
      <div
        aria-hidden="true"
        style={{
          position:           "absolute",
          inset:              0,
          backgroundImage:    "url('/images/r17-texture-grounding.webp')",
          backgroundSize:     "cover",
          backgroundPosition: "center bottom",
          opacity:            0.14,
          mixBlendMode:       "screen",
          pointerEvents:      "none",
        }}
      />

      <div
        className="site-footer__inner"
        style={{
          position: "relative",
          zIndex:   1,
          maxWidth: "1280px",
          margin:   "0 auto",
          padding:  "96px 48px 0",
        }}
      >
        {/* Main grid */}
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
            gap:                 "48px",
            alignItems:          "start",
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div
            style={{ display: "flex", flexDirection: "column", minHeight: "320px" }}
            className="footer-brand-col"
          >
            <img
              src={brand.wordmarkSrc}
              alt={brand.wordmarkAlt}
              width={140}
              height={40}
              style={{ display: "block", marginBottom: "16px" }}
            />
            <p
              style={{
                fontFamily:    "var(--font-display-family)",
                fontSize:      "var(--type-footer-tagline-size)",
                fontWeight:    "var(--type-footer-tagline-weight)" as unknown as number,
                letterSpacing: "var(--type-footer-tagline-letter-spacing)",
                lineHeight:    "var(--type-footer-tagline-line-height)" as unknown as number,
                color:         "var(--color-footer-heading)",
                marginBottom:  "20px",
                maxWidth:      "240px",
              }}
            >
              {brand.mission}
            </p>

            <div style={{ display: "flex", gap: "4px", marginLeft: 0 }} className="footer-socials">
              {brand.socials.map((s) => (
                <a
                  key={s.platform}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    width:          "44px",
                    height:         "44px",
                    color:          "var(--color-footer-heading)",
                    textDecoration: "none",
                    borderRadius:   "8px",
                    transition:     "color 200ms ease-out",
                  }}
                  className="footer-social"
                >
                  {s.iconKey === "x" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* 3 link columns */}
          <div className="footer-nav-grid">
            {columns.map((col) => (
              <nav key={col.header} aria-label={col.header}>
                <h2
                  style={{
                    fontFamily:    "var(--font-display-family)",
                    fontSize:      "var(--type-footer-col-header-size)",
                    fontWeight:    "var(--type-footer-col-header-weight)" as unknown as number,
                    letterSpacing: "var(--type-footer-col-header-letter-spacing)",
                    lineHeight:    "var(--type-footer-col-header-line-height)" as unknown as number,
                    textTransform: "uppercase",
                    color:         "var(--color-footer-heading)",
                    marginBottom:  "20px",
                  }}
                >
                  {col.header}
                </h2>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        style={{
                          fontFamily:     "var(--font-body-family)",
                          fontSize:       "var(--type-footer-link-size)",
                          fontWeight:     "var(--type-footer-link-weight)" as unknown as number,
                          letterSpacing:  "var(--type-footer-link-letter-spacing)",
                          lineHeight:     "var(--type-footer-link-line-height)" as unknown as number,
                          color:          "var(--color-footer-legal)",
                          textDecoration: "none",
                          transition:     "color 200ms ease-out",
                        }}
                        className="footer-link"
                      >
                        {link.label}
                        {link.href.startsWith("http") && <ExternalLinkIcon />}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Hairline divider */}
        <div
          aria-hidden="true"
          style={{
            height:     "1px",
            background: "rgba(255, 255, 255, 0.06)",
            margin:     "48px 0 0",
          }}
        />

        {/* Legal region */}
        <div
          style={{
            display:        "flex",
            alignItems:     "flex-start",
            justifyContent: "space-between",
            gap:            "24px",
            padding:        "32px 0 48px",
            flexWrap:       "wrap",
          }}
          className="footer-legal"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p
              style={{
                fontFamily:  "var(--font-body-family)",
                fontSize:    "var(--type-footer-legal-size)",
                fontWeight:  "var(--type-footer-legal-weight)" as unknown as number,
                lineHeight:  "var(--type-footer-legal-line-height)" as unknown as number,
                letterSpacing: "var(--type-footer-legal-letter-spacing)",
                color:       "var(--color-footer-legal)",
              }}
            >
              {legal.copyright}
            </p>
            <p
              style={{
                fontFamily:   "var(--font-body-family)",
                fontSize:     "var(--type-footer-disclaimer-size)",
                fontWeight:   "var(--type-footer-disclaimer-weight)" as unknown as number,
                lineHeight:   "var(--type-footer-disclaimer-line-height)" as unknown as number,
                letterSpacing:"var(--type-footer-disclaimer-letter-spacing)",
                color:        "var(--color-footer-legal)",
                opacity:      0.8,
                maxWidth:     "560px",
              }}
            >
              {legal.disclaimer}
            </p>
          </div>

          <nav aria-label="Legal" style={{ flexShrink: 0 }}>
            <ul
              style={{
                listStyle:  "none",
                display:    "flex",
                flexWrap:   "wrap",
                gap:        "16px",
                alignItems: "center",
              }}
            >
              {legal.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    style={{
                      fontFamily:     "var(--font-body-family)",
                      fontSize:       "var(--type-footer-legal-size)",
                      fontWeight:     "var(--type-footer-legal-weight)" as unknown as number,
                      lineHeight:     "var(--type-footer-legal-line-height)" as unknown as number,
                      letterSpacing:  "var(--type-footer-legal-letter-spacing)",
                      color:          "var(--color-footer-legal)",
                      textDecoration: "none",
                      transition:     "color 200ms ease-out",
                    }}
                    className="footer-link"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <style>{`
        .footer-link:hover { color: var(--ax-node-purple) !important; }
        .footer-social:hover { color: var(--ax-capital-yellow) !important; }

        @media (max-width: 1279px) {
          .site-footer__inner { padding: 96px 32px 0 !important; }
        }
        @media (max-width: 1023px) {
          .site-footer__inner { padding: 80px 24px 0 !important; }
        }
        @media (max-width: 767px) {
          .site-footer__inner { padding: 64px 16px 0 !important; }
        }

        .footer-nav-grid {
          display: contents;
        }

        @media (max-width: 1279px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 40px !important;
          }
        }

        @media (max-width: 767px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
          .footer-nav-grid {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            margin-top: 40px;
          }
          .footer-brand-col {
            min-height: unset !important;
          }
          .footer-socials {
            justify-content: flex-start !important;
            margin-left: 0 !important;
          }
          .footer-legal {
            flex-direction: column;
          }
          .footer-legal nav ul {
            justify-content: flex-start;
          }
        }

        @media (min-width: 480px) and (max-width: 767px) {
          .footer-nav-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px 24px !important;
          }
        }
      `}</style>
    </footer>
  );
}
