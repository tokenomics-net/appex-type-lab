/**
 * app/(preview)/layout.tsx
 * Root layout for the preview iframe route group.
 * Owns its own <html> and <body> via Next.js route groups with multiple
 * root layouts. This eliminates the hydration mismatch caused by a nested
 * layout re-rendering <html>/<body> under the old single root layout.
 *
 * Loads the same fonts as (lab)/layout.tsx so the iframe has identical
 * typeface rendering. Body reset is handled by globals.css -- no inline
 * style on <body> to avoid React 19 shorthand-to-longhand normalization.
 */

import type { Viewport } from "next";
import localFont from "next/font/local";
import "../globals.css";

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
};

const tektur = localFont({
  src: [
    { path: "../../../public/fonts/tektur/Tektur-Regular.woff2",  weight: "400", style: "normal" },
    { path: "../../../public/fonts/tektur/Tektur-Medium.woff2",   weight: "500", style: "normal" },
    { path: "../../../public/fonts/tektur/Tektur-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../../public/fonts/tektur/Tektur-Bold.woff2",     weight: "700", style: "normal" },
  ],
  variable: "--font-tektur",
  display:  "swap",
  preload:  true,
  fallback: ["system-ui", "sans-serif"],
});

const hubotSans = localFont({
  src: [
    { path: "../../../public/fonts/hubot-sans/HubotSans-Regular.woff2",  weight: "400", style: "normal" },
    { path: "../../../public/fonts/hubot-sans/HubotSans-Medium.woff2",   weight: "500", style: "normal" },
    { path: "../../../public/fonts/hubot-sans/HubotSans-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../../public/fonts/hubot-sans/HubotSans-Bold.woff2",     weight: "700", style: "normal" },
  ],
  variable: "--font-hubot",
  display:  "swap",
  preload:  true,
  fallback: ["system-ui", "sans-serif"],
});

export default function PreviewRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${tektur.variable} ${hubotSans.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
