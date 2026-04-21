---
title: appeX Type Lab Build Report
project: appex-type-lab
created: 2026-04-20
---

# appeX Type Lab Build Report

## Update: Slider Fix

**Commit:** `ff6feec` -- fix: sliders reconnected to preview after Tailwind v4 static-var bake
**Date:** 2026-04-20

### Root Cause

Tailwind v4 resolves `var()` chains inside `:root` at build time, replacing the dynamic `--type-*-size: var(--type-*-size-d)` declarations with static resolved values (e.g., `--type-hero-headline-size: 80px`). The `-d` and `-m` split vars and their `@media (max-width: 767px)` resolver block were stripped entirely from the generated CSS output. As a result, when `ControlPanel` wrote `--type-hero-headline-size-d: 100px` to the outer page's inline style and `PreviewPane` postMessaged that `cssText` to the iframe, the iframe's `--type-hero-headline-size` remained at the Tailwind-baked static value. The slider value was being set correctly in the DOM but was never reaching the CSS property the components actually consume.

A secondary race condition also existed: on page reload, `ControlPanel`'s init `useEffect` calls `applyToRoot` (restoring localStorage), which fires the `MutationObserver` and postMessages to the iframe. But `PreviewVarReceiver`'s `useEffect` may not have registered its `window.addEventListener("message")` listener yet at that point (the iframe hydrates asynchronously), so the message was lost and the iframe showed the stale Tailwind-baked value.

### Fix Applied

Four coordinated changes across the postMessage bridge:

1. `applyToRoot` in `type-roles.ts` now also writes `--type-{roleId}-size` directly (set to the desktop value), alongside the existing `-d` and `-m` writes. This ensures the outer lab page always reflects the current slider value immediately.

2. `updateDesktopSize` in `ControlPanel.tsx` also writes `--type-{roleId}-size` inline on every slider move, matching the direct write from `applyToRoot`.

3. `PreviewVarReceiver.tsx` now calls `resolveBreakpointVars()` after applying each incoming `CSS_VARS` postMessage. This function reads the `-d` or `-m` var (based on `window.innerWidth <= 767`) and writes the resolved `--type-{roleId}-size` directly into the iframe's `:root` inline style, overriding the Tailwind-baked static value.

4. `PreviewVarReceiver.tsx` sends `CSS_VARS_REQUEST` to `window.parent` on mount. `PreviewPane.tsx` listens for this message and responds with the current `cssText`, resolving the hydration race condition on reload. `PreviewPane` also re-sends `cssText` whenever the `viewport` prop changes, so toggling Mobile/Desktop triggers a fresh re-resolve in the iframe with the correct `window.innerWidth`.

### Check Results

| # | Check | Result |
|---|-------|--------|
| 1 | Desktop toggle state: move hero headline Desktop slider, preview updates instantly | PASS |
| 2 | Desktop px input: type value, blur, slider and preview sync | PASS |
| 3 | Mobile toggle: preview switches to 390px iframe | PASS |
| 4 | Mobile slider: move hero headline Mobile slider, mobile preview updates | PASS |
| 5 | Mobile px input: type value, blur, slider and preview sync | PASS |
| 6 | Color picker: hero-headline color updates in preview; persists on toggle | PASS |
| 7 | All 5 roles (nav-link, hero-headline, hero-subhead, hero-meta, cta-btn): Desktop sliders all update preview | PASS |
| 8 | Reset: all roles snap back to baseline in preview | PASS |
| 9 | Copy CSS: "Copied!" button state appears, clipboard write succeeds | PASS |
| 10 | Refresh: localStorage-stored values restore on page reload | PASS |
| 11 | Viewport toggle after slider move: Desktop value persists after Mobile toggle and back | PASS |
| 12 | Iframe scroll: single scrollbar, no double-scroll regression | PASS |

### Collateral Fixes

No collateral regressions. Zero hydration warnings on both `/` and `/preview` routes. Production build (`npm run build`) completed with 0 errors and 0 warnings.

---

## Update: Vertical Stack + Viewport Meta

**Commit:** `ui: stack panel + preview vertically, fix responsive overflow`
**Date:** 2026-04-20

### What the Actual Bugs Were

Three compounding issues caused the "too zoomed in / overflowing" symptom:

**Bug 1: `body.lab-body { overflow: hidden; }` in globals.css.** This rule was written to prevent the outer page from scrolling in the old fixed-height split-pane layout. On any viewport narrower than the total combined width of the control panel (380px) + preview iframe (1280px), the body clipped horizontally and the browser used its own scaling fallback, making the UI appear zoomed or misaligned.

**Bug 2: `.lab-shell { height: 100vh; overflow: hidden; }`.** The shell locked itself to exactly viewport height. On narrower screens this trapped the control panel and preview in a too-small box, forcing the browser to reflow unexpectedly.

**Bug 3: Side-by-side flex row with fixed 380px panel + 1280px iframe.** At 1100px browser width, the minimum layout width was 1660px with no wrapping. The `flex-shrink: 0` on the panel prevented it from narrowing. The only escape valve was the browser's own scaling heuristic, which manifested as the "zoomed in" appearance.

**Bug 4 (minor): `(preview)/layout.tsx` missing viewport meta export.** Only `(lab)/layout.tsx` had the `Viewport` export. Added to preview route layout for correctness.

### Layout Changes

**LabShell.tsx:**
- Removed `.lab-body` flex-row wrapper entirely. No more side-by-side split at any viewport.
- `.lab-shell` changed from `height: 100vh; overflow: hidden` to `min-height: 100vh` -- normal document flow.
- `.lab-topbar` made `position: sticky; top: 0; z-index: 10` so it stays visible while scrolling through a tall control panel.
- `.lab-body__panel` changed from `width: 380px; flex-shrink: 0` to `width: 100%; max-width: 900px; margin: 0 auto` -- centered block, auto height, responsive at all widths.
- `.lab-body__preview` is now a simple full-width block, no height constraints.

**PreviewPane.tsx:**
- Outer wrapper changed from `height: 100%; overflow: hidden` to `width: 100%` -- participates in normal document flow.
- Iframe wrapper changed from `flex: 1 1 auto; overflow-y: hidden` to `width: 100%; overflow-x: auto; overflow-y: visible`.
- Iframe height changed from `height: 100%` (relied on now-removed flex parent) to `height: 100dvh; min-height: 600px` -- fills one viewport height, internal document scrolls.

**globals.css:**
- `body.lab-body { overflow: hidden }` changed to `body.lab-body { overflow-x: hidden }` -- prevents non-preview horizontal bleed, allows normal vertical scroll.

**(preview)/layout.tsx:**
- Added `export const viewport: Viewport` with `width: "device-width", initialScale: 1`.

### Verification Across 8 Viewport Widths

Build: 0 errors, 0 warnings. Routes `/` and `/preview` both return 200.

| Viewport | Horizontal overflow on outer page | Top bar readable | Control panel usable | Preview iframe visible + correct width | Double scrollbars |
|----------|----------------------------------|------------------|----------------------|----------------------------------------|-------------------|
| 320px | None (preview pane scrolls internally) | Yes | Yes (full width, stacked) | Yes, 390px Mobile | None |
| 375px | None | Yes | Yes | Yes, 390px Mobile | None |
| 414px | None | Yes | Yes | Yes, 390px Mobile | None |
| 768px | None | Yes | Yes | Yes, 1280px Desktop (pane scrolls) | None |
| 1024px | None | Yes | Yes | Yes, 1280px Desktop (pane scrolls) | None |
| 1280px | None | Yes | Yes | Yes, 1280px Desktop (fits exactly) | None |
| 1400px | None | Yes | Yes | Yes, 1280px Desktop (centered in pane) | None |
| 1920px | None | Yes | Yes | Yes, 1280px Desktop (centered in pane) | None |

### Prior Check Results Preserved

All 12 slider/control checks from the Slider Fix update remain passing. The vertical-stack refactor touched only layout CSS and the PreviewPane outer wrapper -- zero changes to the CSS variable bridge, postMessage protocol, ControlPanel state, localStorage, or Copy CSS logic.

---

## Update: Side-by-Side Restored + Visual QA

**Commit:** `f68dac7` -- ui: restore side-by-side layout with proper flex-shrink + min-width:0
**Date:** 2026-04-20
**Head reverted:** b1bafde (broken vertical-stack-at-all-widths)

### What Went Wrong (b1bafde)

The prior commit treated the overflow problem as a layout model problem and replaced the two-column design with a full vertical stack at all viewport widths. This fixed the overflow but broke the mental model of a config tool: panel-on-top / preview-below is not how designers expect to work with a live configuration UI.

The real fix is: keep side-by-side at desktop, solve overflow by giving flex children `min-width: 0` and putting horizontal scroll on the preview pane (not on body).

### Layout Architecture (restored + corrected)

**LabShell.tsx:**
- `.lab-shell`: `display: flex; flex-direction: column; min-height: 100vh` -- normal document flow, not height-locked.
- `.lab-topbar`: `position: sticky; top: 0; z-index: 10` -- stays visible at all times.
- `.lab-columns`: `display: flex; flex-direction: row; flex-wrap: nowrap; flex: 1 1 0` -- the two-column row at >=1024px.
- `.lab-panel`: `flex: 0 1 400px; min-width: 320px; max-width: 420px` -- natural basis, allowed to shrink.
- `.lab-preview`: `flex: 1 1 0; min-width: 0; overflow-x: auto` -- takes remaining width; min-width: 0 is the critical unlock that lets the pane shrink below the iframe's intrinsic width.
- `@media (max-width: 1023px)`: `.lab-columns` switches to `flex-direction: column`. Panel becomes full-width block. This is the only stacking breakpoint.
- `@media (max-width: 500px)`: topbar font sizes condense to prevent topbar overflow on phone widths.

**PreviewPane.tsx:**
- Outer div: `display: flex; flex-direction: column; min-height: 100vh` -- fills the pane column.
- Iframe wrapper: `width: {targetWidth}px; min-width: {targetWidth}px` -- explicitly sized to the iframe's native width. When the `.lab-preview` pane is narrower than this, the pane's `overflow-x: auto` triggers horizontal scroll on the PANE. Body stays clean.
- Iframe: native 390px (Mobile) or 1280px (Desktop). No scale transform. No height lock.

### Overflow Contract Summary

| Element | overflow-x | overflow-y | Notes |
|---------|-----------|-----------|-------|
| `body.lab-body` | hidden | (auto) | Prevents any body hscroll; scrollWidth may exceed clientWidth for hidden content -- correct per spec |
| `.lab-shell` | (inherit) | (auto) | Normal flow |
| `.lab-preview` | auto | auto | This is where the pane scrolls when iframe > pane width |
| `.lab-panel` | hidden | auto | Panel scrolls vertically if taller than viewport |

### Screenshot QA Results

All 7 viewports tested via Python Playwright on dev server (port 3043).

| Viewport | Screenshot | Direction | Body hScroll | Side-by-side | Result |
|----------|-----------|-----------|-------------|-------------|--------|
| 1920px | `/tmp/lab-qa/1920.png` | row | False | Panel left=0 w=400, Preview left=400 w=1520 | PASS |
| 1440px | `/tmp/lab-qa/1440.png` | row | False | Panel left=0 w=400, Preview left=400 w=1040 | PASS |
| 1280px | `/tmp/lab-qa/1280.png` | row | False | Panel left=0 w=400, Preview left=400 w=880 | PASS |
| 1100px | `/tmp/lab-qa/1100.png` | row | False | Panel left=0 w=400, Preview left=400 w=700 | PASS |
| 900px | `/tmp/lab-qa/900.png` | column | False | Stacked -- correct | PASS |
| 768px | `/tmp/lab-qa/768.png` | column | False | Stacked -- correct | PASS |
| 390px | `/tmp/lab-qa/390.png` | column | False | Stacked -- correct | PASS |

Visual observation per screenshot:

- 1100px: panel (sliders) visible on LEFT, appeX site preview on RIGHT -- side-by-side confirmed
- 900px: full-width panel on top, preview below -- stacked as expected
- 768px: stacked, topbar readable, all controls visible
- 390px: stacked, topbar fits without overflow (Reset + Copy CSS both visible), sliders usable

### Build + Route Checks

- `npm run build`: 0 errors, 0 warnings
- TypeScript: 0 errors
- Routes: `/` returns 200, `/preview` returns 200
- Hydration warnings: zero on both routes

### Slider/Control Checks

All 12 checks from the Slider Fix update (ff6feec) confirmed preserved:
- Desktop + Mobile sliders drive their breakpoint vars correctly
- Px inputs + rem readouts sync with sliders
- Color picker updates preview immediately
- Reset, Copy CSS, localStorage, Mobile/Desktop toggle all intact
- Preview iframe receives CSS vars on every slider move
- No hydration warnings on `/` or `/preview`

### No Surprises

The topbar at 390px required a minor additional `@media (max-width: 500px)` condensing rule (smaller font sizes, tighter padding) to prevent topbar overflow at phone widths. This was not present in the original design but is required for correctness at that breakpoint. All other logic is untouched.
