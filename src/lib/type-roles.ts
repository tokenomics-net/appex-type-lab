/**
 * type-roles.ts
 *
 * Canonical list of typography roles for the appeX Type Lab.
 * Baseline values are sourced directly from the live site's CSS
 * (website-v2/src/app/globals.css + component inline styles).
 *
 * Each role maps to a set of CSS custom properties:
 *   --type-{roleId}-size
 *   --type-{roleId}-line-height
 *   --type-{roleId}-weight
 *   --type-{roleId}-letter-spacing
 *
 * The control panel reads this list to render one row per role.
 * The "Baseline" preset restores exactly these values.
 */

export interface FontRoleConfig {
  size: string;           // e.g. "14px"
  lineHeight: number;     // unitless, e.g. 1.4
  weight: number;         // 400 | 500 | 600 | 700
  letterSpacing: string;  // em value, e.g. "0.08em"
}

export interface TypeRole {
  id: string;             // kebab-case, used as CSS var suffix
  label: string;          // Plain English label shown in the panel
  baseline: FontRoleConfig;
  /** Font family hint -- which family this role uses */
  family: "display" | "body";
  /** Available weights for this family (discrete buttons) */
  availableWeights: number[];
}

// Tektur available weights: 400, 500, 600, 700
const DISPLAY_WEIGHTS = [400, 500, 600, 700];
// Hubot Sans available weights: 400, 500, 600, 700
const BODY_WEIGHTS    = [400, 500, 600, 700];

export const TYPE_ROLES: TypeRole[] = [
  // ---- Header ----
  {
    id: "nav-link",
    label: "Navigation link",
    family: "display",
    availableWeights: DISPLAY_WEIGHTS,
    baseline: { size: "14px", lineHeight: 1.4, weight: 500, letterSpacing: "0.08em" },
  },
  {
    id: "mobile-drawer-link",
    label: "Mobile drawer link",
    family: "display",
    availableWeights: DISPLAY_WEIGHTS,
    baseline: { size: "20px", lineHeight: 1.3, weight: 500, letterSpacing: "0.04em" },
  },

  // ---- Hero ----
  {
    id: "hero-headline",
    label: "Hero headline",
    family: "display",
    availableWeights: DISPLAY_WEIGHTS,
    // clamp(56px, 7.5vw, 112px) -- lab uses the min value for the baseline
    // We expose the base size; the clamp is preserved as-is in the component
    baseline: { size: "80px", lineHeight: 1.15, weight: 400, letterSpacing: "0em" },
  },
  {
    id: "hero-subhead",
    label: "Hero subhead",
    family: "body",
    availableWeights: BODY_WEIGHTS,
    // clamp(15px, 1.8vw, 18px) -- baseline ~16px
    baseline: { size: "16px", lineHeight: 1.6, weight: 400, letterSpacing: "0em" },
  },
  {
    id: "hero-meta",
    label: "Hero meta line",
    family: "body",
    availableWeights: BODY_WEIGHTS,
    baseline: { size: "12px", lineHeight: 1.4, weight: 400, letterSpacing: "0.05em" },
  },
  {
    id: "btn-primary",
    label: "CTA button (primary)",
    family: "body",
    availableWeights: BODY_WEIGHTS,
    baseline: { size: "14px", lineHeight: 1.4, weight: 500, letterSpacing: "0.02em" },
  },
  {
    id: "btn-secondary",
    label: "CTA button (secondary)",
    family: "body",
    availableWeights: BODY_WEIGHTS,
    baseline: { size: "14px", lineHeight: 1.4, weight: 500, letterSpacing: "0em" },
  },

  // ---- Token Section ($APPEX) ----
  {
    id: "section-eyebrow",
    label: "Section eyebrow",
    family: "display",
    availableWeights: DISPLAY_WEIGHTS,
    baseline: { size: "11px", lineHeight: 1.4, weight: 500, letterSpacing: "0.2em" },
  },
  {
    id: "section-headline",
    label: "Section headline",
    family: "display",
    availableWeights: DISPLAY_WEIGHTS,
    // clamp(28px, 4vw, 44px) -- baseline ~36px
    baseline: { size: "36px", lineHeight: 1.15, weight: 400, letterSpacing: "0em" },
  },
  {
    id: "section-subhead",
    label: "Section subhead",
    family: "body",
    availableWeights: BODY_WEIGHTS,
    baseline: { size: "15px", lineHeight: 1.6, weight: 400, letterSpacing: "0em" },
  },
  {
    id: "card-title",
    label: "Card title",
    family: "display",
    availableWeights: DISPLAY_WEIGHTS,
    baseline: { size: "15px", lineHeight: 1.4, weight: 500, letterSpacing: "0em" },
  },
  {
    id: "card-body",
    label: "Card body / caption",
    family: "body",
    availableWeights: BODY_WEIGHTS,
    baseline: { size: "13px", lineHeight: 1.55, weight: 400, letterSpacing: "0em" },
  },

  // ---- For Stakeholders Section ----
  {
    id: "tab-label",
    label: "Tab button label",
    family: "display",
    availableWeights: DISPLAY_WEIGHTS,
    baseline: { size: "12px", lineHeight: 1.4, weight: 500, letterSpacing: "0.15em" },
  },
  {
    id: "stakeholders-heading",
    label: "Stakeholders heading",
    family: "display",
    availableWeights: DISPLAY_WEIGHTS,
    // clamp(22px, 3vw, 34px) -- baseline ~28px
    baseline: { size: "28px", lineHeight: 1.15, weight: 400, letterSpacing: "0em" },
  },
  {
    id: "body",
    label: "Body paragraph",
    family: "body",
    availableWeights: BODY_WEIGHTS,
    baseline: { size: "15px", lineHeight: 1.65, weight: 400, letterSpacing: "0em" },
  },
  {
    id: "bullet",
    label: "Bullet list item",
    family: "body",
    availableWeights: BODY_WEIGHTS,
    baseline: { size: "14px", lineHeight: 1.5, weight: 400, letterSpacing: "0em" },
  },

  // ---- Footer ----
  {
    id: "footer-tagline",
    label: "Footer tagline",
    family: "display",
    availableWeights: DISPLAY_WEIGHTS,
    baseline: { size: "13px", lineHeight: 1.5, weight: 500, letterSpacing: "0.04em" },
  },
  {
    id: "footer-col-header",
    label: "Footer column label",
    family: "display",
    availableWeights: DISPLAY_WEIGHTS,
    baseline: { size: "12px", lineHeight: 1.4, weight: 600, letterSpacing: "0.12em" },
  },
  {
    id: "footer-link",
    label: "Footer nav link",
    family: "body",
    availableWeights: BODY_WEIGHTS,
    baseline: { size: "14px", lineHeight: 1.5, weight: 400, letterSpacing: "0em" },
  },
  {
    id: "footer-legal",
    label: "Footer legal / copyright",
    family: "body",
    availableWeights: BODY_WEIGHTS,
    baseline: { size: "12px", lineHeight: 1.6, weight: 400, letterSpacing: "0em" },
  },
  {
    id: "footer-disclaimer",
    label: "Footer disclaimer",
    family: "body",
    availableWeights: BODY_WEIGHTS,
    baseline: { size: "11px", lineHeight: 1.6, weight: 400, letterSpacing: "0em" },
  },
];

/** Produce the baseline Record<string, FontRoleConfig> keyed by role id */
export function buildBaseline(): Record<string, FontRoleConfig> {
  return Object.fromEntries(TYPE_ROLES.map((r) => [r.id, { ...r.baseline }]));
}

/** Produce the "Bump small text" preset: +15% on roles with baseline size < 16px */
export function buildBumpSmall(): Record<string, FontRoleConfig> {
  return Object.fromEntries(
    TYPE_ROLES.map((r) => {
      const baseSize = parseFloat(r.baseline.size);
      const newSize = baseSize < 16 ? `${Math.round(baseSize * 1.15 * 10) / 10}px` : r.baseline.size;
      return [r.id, { ...r.baseline, size: newSize }];
    })
  );
}

/** Produce the "Bump all" preset: +10% on every role */
export function buildBumpAll(): Record<string, FontRoleConfig> {
  return Object.fromEntries(
    TYPE_ROLES.map((r) => {
      const baseSize = parseFloat(r.baseline.size);
      const newSize = `${Math.round(baseSize * 1.1 * 10) / 10}px`;
      return [r.id, { ...r.baseline, size: newSize }];
    })
  );
}

/** Convert a values record into a CSS :root { --type-* } block */
export function toCssBlock(values: Record<string, FontRoleConfig>): string {
  const lines = Object.entries(values).flatMap(([id, cfg]) => [
    `  --type-${id}-size: ${cfg.size};`,
    `  --type-${id}-line-height: ${cfg.lineHeight};`,
    `  --type-${id}-weight: ${cfg.weight};`,
    `  --type-${id}-letter-spacing: ${cfg.letterSpacing};`,
  ]);
  return `:root {\n${lines.join("\n")}\n}`;
}

/** Convert a values record to a URL-safe base64 hash fragment */
export function toHashFragment(values: Record<string, FontRoleConfig>): string {
  const json = JSON.stringify(values);
  if (typeof window === "undefined") return "";
  return btoa(encodeURIComponent(json));
}

/** Parse a hash fragment back into a values record (returns null on error) */
export function fromHashFragment(hash: string): Record<string, FontRoleConfig> | null {
  try {
    const json = decodeURIComponent(atob(hash.replace(/^#/, "")));
    const parsed = JSON.parse(json) as Record<string, FontRoleConfig>;
    return parsed;
  } catch {
    return null;
  }
}
