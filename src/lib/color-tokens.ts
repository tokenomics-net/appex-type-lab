/**
 * color-tokens.ts
 *
 * Canonical color token definitions for the appeX Type Lab color tuning system.
 *
 * Baseline hex values are sampled directly from the ported section components
 * (Hero, Token, ForStakeholders, Footer). They do NOT come from DESIGN.md --
 * the ported components are the source of truth.
 *
 * Token intent descriptions and the roles that consume each token are documented
 * below. Tokens describe intent, not role.
 *
 * HSL delta model
 * ---------------
 * Each token stores its baseline as a hex string. At runtime the control panel
 * converts to HSL, applies integer deltas, and writes a computed hsl(...) value
 * to a CSS custom property on :root.
 *
 *   warm delta:  ΔH = warmDelta * 8   (degrees on hue wheel, ±3 = ±24°)
 *   tone delta:  ΔL = toneDelta * 4   (lightness percentage points, ±3 = ±12%)
 *   saturation S is left unchanged.
 *   lightness is clamped to [0, 100].
 *
 * CSS property name: --color-<tokenId>
 *
 * Roles using each token
 * ----------------------
 * primary-text     hero H1, section headlines (Token section), stakeholders heading
 * secondary-text   hero subhead, hero subhead text, stakeholders body paragraphs, bullet list items
 * muted-text       tab button labels (inactive state), tertiary copy
 * card-title       card title text in the Token ($APPEX) section utility cards
 * card-body        card body/caption text in the Token section utility cards
 * footer-heading   footer tagline (brand col), footer column header labels, footer social icons
 * footer-legal     footer copyright line, footer legal nav links
 */

export interface ColorToken {
  /** kebab-case id; CSS var will be --color-{id} */
  id: string;
  /** Plain English label shown in the panel */
  label: string;
  /**
   * Baseline color as hex. RGBA values from the live components are stored here
   * as their effective hex approximation. The alpha channel is baked into the
   * hex by blending against the dark background (#0A0F1F = navy).
   * The HSL conversion uses only the effective visible color.
   */
  baselineHex: string;
  /** Roles that consume this token */
  roles: string[];
}

export const COLOR_TOKENS: ColorToken[] = [
  {
    id: "primary-text",
    label: "Primary text",
    // rgba(255,255,255,0.92) blended onto #0A0F1F
    // effective: near-white with very slight warmth from background
    baselineHex: "#E8EAF0",
    roles: [
      "hero headline (.hero-bleed__h1)",
      "token section heading (.token-section__heading)",
      "stakeholders heading (.stakeholders__heading)",
    ],
  },
  {
    id: "secondary-text",
    label: "Secondary text",
    // rgba(185,160,204,0.78) -- mist purple, moderately bright
    baselineHex: "#A892BD",
    roles: [
      "hero subhead (.hero-bleed__subhead)",
      "token section subhead (.token-section__subhead)",
      "stakeholders body paragraph (.stakeholders__body)",
      "stakeholders bullet items (.stakeholders__bullet)",
    ],
  },
  {
    id: "muted-text",
    label: "Muted text",
    // rgba(185,160,204,0.50) -- mist purple, dimmed
    baselineHex: "#6E5E80",
    roles: [
      "inactive tab button label (.stakeholders__tab-btn--inactive)",
    ],
  },
  {
    id: "card-title",
    label: "Card title",
    // rgba(240,236,216,0.92) -- warm cream-white
    baselineHex: "#DDD9C5",
    roles: [
      "token section card title (.token-section__card-title)",
    ],
  },
  {
    id: "card-body",
    label: "Card body",
    // rgba(185,160,204,0.65) -- mist purple, mid-dim
    baselineHex: "#8A7499",
    roles: [
      "token section card body/caption (.token-section__card-body)",
    ],
  },
  {
    id: "footer-heading",
    label: "Footer heading",
    // rgba(255,255,255,0.88) -- near-white, slightly dimmer than primary
    baselineHex: "#DCDDE3",
    roles: [
      "footer tagline (brand col)",
      "footer column header labels",
      "footer social icon color base",
    ],
  },
  {
    id: "footer-legal",
    label: "Footer legal",
    // rgba(255,255,255,0.52) -- mid-dim white
    baselineHex: "#7E8090",
    roles: [
      "footer copyright line",
      "footer legal nav links",
      "footer nav links (.footer-link base color is rgba(255,255,255,0.64) -- close enough to share this token)",
    ],
  },
];

// ---- HSL conversion helpers ----

interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

/** Convert a hex color string (#RRGGBB or #RGB) to HSL. */
export function hexToHsl(hex: string): HSL {
  // Expand #RGB to #RRGGBB
  const normalized = hex.replace(
    /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/,
    "#$1$1$2$2$3$3"
  );
  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / delta + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / delta + 2) / 6; break;
      case b: h = ((r - g) / delta + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Compute the final CSS hsl() value for a token given its baseline hex
 * and integer warm/tone delta steps.
 *
 * Temperature step = 8 degrees per step (±3 = ±24 degrees)
 * Tone step        = 4 lightness percentage points per step (±3 = ±12pp)
 * Saturation S is unchanged.
 * Lightness is clamped to [0, 100].
 */
export function toCssValue(baselineHex: string, warmDelta: number, toneDelta: number): string {
  const { h, s, l } = hexToHsl(baselineHex);
  const newH = ((h + warmDelta * 8) % 360 + 360) % 360;
  const newL = Math.max(0, Math.min(100, l + toneDelta * 4));
  return `hsl(${newH}, ${s}%, ${newL}%)`;
}

// ---- Color delta record type ----

export interface ColorDeltaMap {
  [tokenId: string]: { warm: number; tone: number };
}

/** Build a baseline delta map: all zeros */
export function buildBaselineColorDeltas(): ColorDeltaMap {
  return Object.fromEntries(COLOR_TOKENS.map((t) => [t.id, { warm: 0, tone: 0 }]));
}
