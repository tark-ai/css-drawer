# css-drawer

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
