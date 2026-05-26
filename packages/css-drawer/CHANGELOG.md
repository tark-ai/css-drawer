# css-drawer

## 0.4.0

### Minor Changes

- Added an observer to handle background scroll issue when transitioning from one drawer to another
- Built-in body scroll lock that handles drawer-to-drawer transitions correctly

  Previously the package shipped only a CSS-only `overflow: hidden` rule on `body:has(.drawer[open])`, which forced consumers to roll their own `useEffect`-based scroll lock. That consumer-side cleanup races with drawer transitions: closing one css-drawer + opening another in the same synchronous handler (e.g. mobile menu drawer → `@commercengine/checkout` drawer) caused the cleanup to fire mid-swap, leaving the page at the wrong scroll position.

  This release ships a JS-driven `position: fixed` + negative-top lock (same technique as Vaul, Radix Dialog, and the archived `body-scroll-lock` package), owned by a module-level counter of open drawers. A same-tick close-A + open-B keeps the count at `1 → 1` — it never crosses zero, so the lock is never released mid-transition.

  **If you're upgrading from 0.3.x and have your own consumer-side `useEffect` scroll lock, remove it.**

  This is additive and backwards-compatible. Old consumers get the fix automatically with no API changes.

  **New API**

  - `<Drawer.Content scrollLock={false}>` — opt out for the rare side-panel-allows-scroll case (vanilla: `create({ scrollLock: false })`, or `data-scroll-lock="false"` on the dialog).

  **Verified in Chromium mobile emulation** (`e2e/scroll-lock.spec.ts`), drawer-to-drawer transition at `scrollY=800`:

  ```
  during swap:  body.position=fixed body.top=-800px   ← lock NEVER released
  final scrollY after close = 800                      ← restored to original
  ```

  **Implementation notes**

  - Lock is nest-aware — only the outermost open drawer applies the lock; nested drawers don't re-snapshot.
  - `<html>`'s `scroll-behavior` is flipped to `auto` during the lock so a site-wide `scroll-behavior: smooth` doesn't animate the restore.
  - The CSS `overflow: hidden` rule stays as defense-in-depth for older browsers, and now respects the `data-scroll-lock="false"` opt-out.
  - The shared observer also watches `childList` so removing an open drawer from the DOM (e.g. React unmount without an explicit close) still releases the lock.
  - 15 unit tests (vitest + happy-dom) cover the lock; 3 Playwright tests cover the end-to-end behavior in Chromium mobile emulation, including the drawer-to-drawer transition case.

## 0.4.0

### Minor Changes

- Built-in body scroll lock that handles drawer-to-drawer transitions correctly.

  Previously the package shipped only a CSS-only `overflow: hidden` rule on `body:has(.drawer[open])`, which forced consumers to roll their own `useEffect`-based scroll lock. That consumer-side cleanup races with drawer transitions: closing one css-drawer + opening another in the same synchronous handler (e.g. mobile menu drawer → `@commercengine/checkout` drawer) caused the cleanup to fire mid-swap, leaving the page at the wrong scroll position.

  This release ships a JS-driven `position: fixed` + negative-top lock (same technique as Vaul, Radix Dialog, and the archived `body-scroll-lock` package), owned by a module-level counter of open drawers. A same-tick close-A + open-B keeps the count at `1 → 1` — it never crosses zero, so the lock is never released mid-transition.

  **If you're upgrading from 0.3.x and have your own consumer-side `useEffect` scroll lock, remove it.**

  This is additive and backwards-compatible. Old consumers get the fix automatically with no API changes.

  **New API**

  - `<Drawer.Content scrollLock={false}>` — opt out for the rare side-panel-allows-scroll case (vanilla: `create({ scrollLock: false })`, or `data-scroll-lock="false"` on the dialog).

  **Verified in Chromium mobile emulation** (`e2e/scroll-lock.spec.ts`), drawer-to-drawer transition at `scrollY=800`:

  ```
  during swap:  body.position=fixed body.top=-800px   ← lock NEVER released
  final scrollY after close = 800                      ← restored to original
  ```

  **Implementation notes**

  - Lock is nest-aware — only the outermost open drawer applies the lock; nested drawers don't re-snapshot.
  - `<html>`'s `scroll-behavior` is flipped to `auto` during the lock so a site-wide `scroll-behavior: smooth` doesn't animate the restore.
  - The CSS `overflow: hidden` rule stays as defense-in-depth for older browsers, and now respects the `data-scroll-lock="false"` opt-out.
  - The shared observer also watches `childList` so removing an open drawer from the DOM (e.g. React unmount without an explicit close) still releases the lock.
  - 15 unit tests (vitest + happy-dom) cover the lock; 3 Playwright tests cover the end-to-end behavior in Chromium mobile emulation, including the drawer-to-drawer transition case.

## 0.3.2

### Patch Changes

- Updated dependencies

## 0.3.1

### Patch Changes

- Dependencies updated for vulnerable packages

## 0.3.0

### Minor Changes

- Added topmost drawer detection APIs and optimized observer performance

  **React:**

  - Added `useIsTopDrawer(ref)` hook - returns `true` if the drawer is topmost
  - Added `getTopDrawer()` utility function

  **Performance:**

  - Extracted MutationObserver to shared module - prevents duplicate observers when both vanilla and React packages are imported
  - `subscribe()` now uses shared event instead of per-subscription observers
  - Single `drawer:statechange` event for all state change listeners

## 0.2.2

### Patch Changes

- Added additional variables to overwrite width, height, max-width and max-height

## 0.2.1

### Patch Changes

- Fixed close event propagation bug in React component where closing a DOM-nested child dialog would incorrectly trigger the parent dialog's onClose/onOpenChange handlers

## 0.2.0

### Minor Changes

- Added `modal` direction for centered dialogs with scale animation. CSS is now auto-injected for both vanilla JS and React imports. Updated documentation with Angular usage guide.

## 0.1.4

### Patch Changes

- Chore: Updated ReadMe to document controlled state

## 0.1.3

### Patch Changes

- Added controlled mode to react package

## 0.1.2

### Patch Changes

- Fixed bug that prevented scroll in drawer content

## 0.1.1

### Patch Changes

- Updated CSS to add additional variables and remove hard coded values
