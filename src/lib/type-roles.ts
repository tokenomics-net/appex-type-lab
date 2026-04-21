/**
 * type-roles.ts
 *
 * Simplified role registry for the appeX Type Lab.
 * Each role exposes exactly two controls: size (px) and color (hex).
 * No line-height, weight, letter-spacing, or preset builders beyond Baseline.
 */

export interface TypeRoleConfig {
  /** Font size in px, e.g. 14 */
  size: number;
  /** Hex color, e.g. "#FFFFFF" */
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
    baseline: { size: 14, color: "#E0E0E0" },
  },
  {
    id: "hero-headline",
    label: "Hero headline",
    baseline: { size: 80, color: "#E8EAF0" },
  },
  {
    id: "hero-subhead",
    label: "Hero subhead",
    baseline: { size: 16, color: "#A892BD" },
  },
  {
    id: "hero-meta",
    label: "Yellow tagline line",
    baseline: { size: 12, color: "#FED607" },
  },
  {
    id: "cta-btn",
    label: "CTA button",
    baseline: { size: 14, color: "#0A0F1F" },
  },
];

/** The storage / state shape used throughout the lab */
export type RoleValues = Record<string, TypeRoleConfig>;

/** Build a fresh baseline record keyed by role id */
export function buildBaseline(): RoleValues {
  return Object.fromEntries(TYPE_ROLES.map((r) => [r.id, { ...r.baseline }]));
}

const STORAGE_KEY = "appex-type-lab-v2";

export function loadFromStorage(): RoleValues | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RoleValues;
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
 * Build a :root { --type-*-size: ...rem; --color-*: #...; } CSS block
 * for only the live roles. Used by the Copy CSS button.
 * Sizes are exported as rem (base 16px); internal state stays in px.
 */
export function toCssBlock(values: RoleValues): string {
  const comment =
    "/* Based on html { font-size: 16px; }. Colors and sizes for appeX -- paste into globals.css :root. */";
  const lines = TYPE_ROLES.flatMap((r) => {
    const cfg = values[r.id] ?? r.baseline;
    const remVal = (cfg.size / 16).toFixed(3);
    return [
      `  --type-${r.id}-size: ${remVal}rem;`,
      `  --color-${r.id}: ${cfg.color};`,
    ];
  });
  return `${comment}\n:root {\n${lines.join("\n")}\n}`;
}

/** Apply all role values to the document :root (outer lab document). */
export function applyToRoot(values: RoleValues): void {
  const root = document.documentElement;
  for (const role of TYPE_ROLES) {
    const cfg = values[role.id] ?? role.baseline;
    root.style.setProperty(`--type-${role.id}-size`, `${cfg.size}px`);
    root.style.setProperty(`--color-${role.id}`, cfg.color);
  }
}
