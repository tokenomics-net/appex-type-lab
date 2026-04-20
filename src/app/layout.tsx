/**
 * app/layout.tsx
 * Root layout for the appeX Typography Lab.
 * Loads Tektur (display) and Hubot Sans (body) via next/font/local
 * from /public/fonts/ -- identical to website-v2.
 */

import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const tektur = localFont({
  src: [
    { path: "../../public/fonts/tektur/Tektur-Regular.woff2",  weight: "400", style: "normal" },
    { path: "../../public/fonts/tektur/Tektur-Medium.woff2",   weight: "500", style: "normal" },
    { path: "../../public/fonts/tektur/Tektur-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/tektur/Tektur-Bold.woff2",     weight: "700", style: "normal" },
  ],
  variable: "--font-tektur",
  display:  "swap",
  preload:  true,
  fallback: ["system-ui", "sans-serif"],
});

const hubotSans = localFont({
  src: [
    { path: "../../public/fonts/hubot-sans/HubotSans-Regular.woff2",  weight: "400", style: "normal" },
    { path: "../../public/fonts/hubot-sans/HubotSans-Medium.woff2",   weight: "500", style: "normal" },
    { path: "../../public/fonts/hubot-sans/HubotSans-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/hubot-sans/HubotSans-Bold.woff2",     weight: "700", style: "normal" },
  ],
  variable: "--font-hubot",
  display:  "swap",
  preload:  true,
  fallback: ["system-ui", "sans-serif"],
});

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  themeColor:   "#0A0F1F",
};

export const metadata: Metadata = {
  title: "appeX Typography Lab",
  description: "Live typography tuning sandbox for the appeX Protocol home page.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${tektur.variable} ${hubotSans.variable}`}>
      <body style={{ margin: 0, padding: 0, overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
