/**
 * site-config.ts
 * Standalone copy for the type-lab -- no external runtime imports.
 */

export const BASE_URL      = "https://appex.finance";
export const BUSINESS_NAME = "appeX Protocol";
export const DEFAULT_DESCRIPTION =
  "appeX Typography Lab -- tune every font on the appeX home page in real time.";
export const THEME_COLOR = "#0A0F1F";

export const siteConfig = {
  name:         BUSINESS_NAME,
  supportEmail: "support@appex.finance",
  socials: {
    x:        "https://x.com/appexprotocol",
    linkedin: "https://www.linkedin.com/company/appex-protocol/",
  },
  docs: {
    home:     "https://docs.appex.finance",
    faq:      "https://docs.appex.finance/faq",
    glossary: "https://docs.appex.finance/glossary",
  },
} as const;
