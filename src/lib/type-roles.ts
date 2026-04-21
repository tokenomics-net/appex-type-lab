/**
 * type-roles.ts
 *
 * Simplified role registry for the appeX Type Lab.
 * Each role exposes three controls: desktopSize (px), mobileSize (px),
 * and color (hex -- shared between both breakpoints).
 * No line-height, weight, letter-spacing, or preset builders beyond Baseline.
 */

export interface TypeRoleConfig {
  /** Font size for desktop (>= 768px) in px */
  desktopSize: number;
  /** Font size for mobile (< 768px) in px */
  mobileSize: number;
  /** Hex color shared across both breakpoints */
  color: string;
}

/**
 * Legacy shape from localStorage before the desktop/mobile split.
 * size was a single number.
 */
interface LegacyTypeRoleConfig {
  size?: number;
  desktopSize?: number;
  mobileSize?: number;
  color: string;
}

export interface TypeRole {
  /** kebab-case id, used as CSS var suffix */
  id: string;
  /** Plain English label shown in the panel */
  label: string;
  /** Baseline values */
  baseline: TypeRoleConfig;
}

export const TYPE_ROLES: TypeRole[] = [
  {
    id: "nav-link",
    label: "Nav link",
    baseline: { desktopSize: 14, mobileSize: 14, color: "#E0E0E0" },
  },
  {
    id: "hero-headline",
    label: "Hero headline",
    baseline: { desktopSize: 72, mobileSize: 32, color: "#E8EAF0" },
  },
  {
    id: "hero-subhead",
    label: "Hero subhead",
    baseline: { desktopSize: 18, mobileSize: 16, color: "#A892BD" },
  },
  {
    id: "hero-meta",
    label: "Yellow tagline line",
    baseline: { desktopSize: 16, mobileSize: 14, color: "#FED607" },
  },
  {
    id: "cta-btn",
    label: "CTA button",
    baseline: { desktopSize: 16, mobileSize: 16, color: "#0A0F1F" },
  },
];

/** The storage / state shape used throughout the lab */
export type RoleValues = Record<string, TypeRoleConfig>;

/** Build a fresh baseline record keyed by role id */
export function buildBaseline(): RoleValues {
  return Object.fromEntries(TYPE_ROLES.map((r) => [r.id, { ...r.baseline }]));
}

const STORAGE_KEY = "appex-type-lab-v3";

/**
 * Load from localStorage, migrating the old single-size shape if found.
 * Old shape: { size: number, color: string }
 * New shape: { desktopSize: number, mobileSize: number, color: string }
 */
export function loadFromStorage(): RoleValues | null {
  try {
    // Try new key first
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as RoleValues;
    }

    // Attempt migration from old v2 key
    const legacy = localStorage.getItem("appex-type-lab-v2");
    if (!legacy) return null;
    const parsed = JSON.parse(legacy) as Record<string, LegacyTypeRoleConfig>;
    const migrated: RoleValues = {};
    for (const [id, cfg] of Object.entries(parsed)) {
      if (typeof cfg.desktopSize === "number" && typeof cfg.mobileSize === "number") {
        // Already new shape -- shouldn't happen under v2 key but handle it
        migrated[id] = { desktopSize: cfg.desktopSize, mobileSize: cfg.mobileSize, color: cfg.color };
      } else if (typeof cfg.size === "number") {
        // Old single-size shape -- use size for both axes
        migrated[id] = { desktopSize: cfg.size, mobileSize: cfg.size, color: cfg.color };
      }
    }
    // Persist under new key and remove old
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    localStorage.removeItem("appex-type-lab-v2");
    return migrated;
  } catch {
    return null;
  }
}

export function saveToStorage(values: RoleValues): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch { /* noop */ }
}

/**
 * Build a :root + @media (max-width: 767px) :root CSS export block.
 * Desktop values in the base :root; mobile sizes in the media query block.
 * Colors are desktop only (shared -- no mobile override needed in the export).
 * Sizes exported as rem (base 16px); internal state stays in px.
 */
export function toCssBlock(values: RoleValues): string {
  const comment = "/* Based on html { font-size: 16px; }. Paste into globals.css :root. */";

  const desktopLines = TYPE_ROLES.flatMap((r) => {
    const cfg = values[r.id] ?? r.baseline;
    const remVal = (cfg.desktopSize / 16).toFixed(3).replace(/\.?0+$/, "");
    return [
      `  --type-${r.id}-size: ${remVal}rem;`,
      `  --color-${r.id}: ${cfg.color};`,
    ];
  });

  const mobileLines = TYPE_ROLES.map((r) => {
    const cfg = values[r.id] ?? r.baseline;
    const remVal = (cfg.mobileSize / 16).toFixed(3).replace(/\.?0+$/, "");
    return `    --type-${r.id}-size: ${remVal}rem;`;
  });

  return [
    comment,
    ":root {",
    desktopLines.join("\n"),
    "}",
    "@media (max-width: 767px) {",
    "  :root {",
    mobileLines.join("\n"),
    "  }",
    "}",
  ].join("\n");
}

/**
 * Apply all role values to the document :root via the -d / -m CSS var pattern.
 * ControlPanel writes --type-*-size-d and --type-*-size-m.
 * We also write --type-*-size directly (desktop value) so the outer lab page
 * always reflects the current desktop size. Tailwind v4 resolves var() chains
 * in :root at build time, so we cannot rely on the stylesheet cascade to bridge
 * -d/-m into the resolved var; we must set it explicitly.
 * Colors are written directly to --color-*.
 */
export function applyToRoot(values: RoleValues): void {
  const root = document.documentElement;
  for (const role of TYPE_ROLES) {
    const cfg = values[role.id] ?? role.baseline;
    root.style.setProperty(`--type-${role.id}-size-d`, `${cfg.desktopSize}px`);
    root.style.setProperty(`--type-${role.id}-size-m`, `${cfg.mobileSize}px`);
    // Write the resolved alias explicitly. The outer lab page is always desktop-
    // width so this is always the desktop value. PreviewVarReceiver in the iframe
    // re-resolves this to the correct breakpoint value based on window.innerWidth.
    root.style.setProperty(`--type-${role.id}-size`, `${cfg.desktopSize}px`);
    root.style.setProperty(`--color-${role.id}`, cfg.color);
  }
}
