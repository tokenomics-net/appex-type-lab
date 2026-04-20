/**
 * nav-config.ts
 * Ported from website-v2 -- standalone copy, no runtime imports from live site.
 */

import { siteConfig } from "@/lib/site-config";

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface NavCTA {
  label: string;
  href: string;
  variant: "solid" | "ghost";
  external?: boolean;
}

export interface NavConfig {
  logo: {
    wordmarkSrc: string;
    markSrc: string;
    alt: string;
    href: string;
  };
  primaryLinks: NavLink[];
  ctas: NavCTA[];
  mobileDrawerOrder: "ctasFirst" | "linksFirst";
  socials: { platform: string; href: string; iconKey: string }[];
}

export const navConfig: NavConfig = {
  logo: {
    wordmarkSrc: "/brand/appex-wordmark.svg",
    markSrc:     "/brand/appex-mark.svg",
    alt:         "appeX",
    href:        "/",
  },
  primaryLinks: [
    { label: "Protocol",  href: "/protocol"  },
    { label: "LPs",       href: "/lps"       },
    { label: "Borrowers", href: "/borrowers" },
    { label: "$APPEX",    href: "/appex"     },
    { label: "About",     href: "/about"     },
    { label: "Blog",      href: "/blog"      },
    { label: "Docs",      href: "https://docs.appex.finance", external: true },
  ],
  ctas: [
    { label: "Contact", href: `mailto:${siteConfig.supportEmail}`, variant: "solid" },
  ],
  mobileDrawerOrder: "ctasFirst",
  socials: [
    { platform: "X",        href: siteConfig.socials.x,        iconKey: "x"        },
    { platform: "LinkedIn", href: siteConfig.socials.linkedin,  iconKey: "linkedin" },
  ],
};
