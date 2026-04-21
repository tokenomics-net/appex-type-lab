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
