/**
 * app/preview/layout.tsx
 * Minimal layout for the preview iframe route.
 * Loads the same fonts as the root layout so the iframe has identical
 * typeface rendering. Body overflow is default (scrollable) so the
 * iframe's scrollbar handles content taller than the visible area.
 */

import localFont from "next/font/local";
import "../globals.css";

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

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${tektur.variable} ${hubotSans.variable}`}>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
