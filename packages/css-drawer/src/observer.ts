/**
 * Shared drawer state observer
 * Single MutationObserver that dispatches events for all drawer state changes
 */
import { updateScrollLockFromDrawers } from './scroll-lock'

export const DRAWER_STATE_CHANGE = 'drawer:statechange'

let initialized = false

export function initDrawerObserver(): void {
  if (typeof window === 'undefined' || initialized) return
  initialized = true

  const updateInertState = () => {
    const openDrawers = Array.from(
      document.querySelectorAll<HTMLDialogElement>('dialog.drawer[open]')
    )
    openDrawers.forEach((drawer, index) => {
      if (index === openDrawers.length - 1) {
        drawer.removeAttribute('inert')
      } else {
        drawer.setAttribute('inert', '')
      }
    })
  }

  const handleStateChange = (target: Node) => {
    updateInertState()
    updateScrollLockFromDrawers()
    window.dispatchEvent(new CustomEvent(DRAWER_STATE_CHANGE, {
      detail: { target }
    }))
  }

  const isDrawerElement = (node: Node): node is HTMLElement =>
    node.nodeType === 1 && (node as HTMLElement).matches?.('dialog.drawer')

  const containsOpenDrawer = (node: Node): boolean => {
    if (node.nodeType !== 1) return false
    const el = node as HTMLElement
    if (el.matches?.('dialog.drawer[open]')) return true
    return !!el.querySelector?.('dialog.drawer[open]')
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'open' &&
        (mutation.target as HTMLElement).classList?.contains('drawer')
      ) {
        handleStateChange(mutation.target)
        return
      }

      if (mutation.type === 'childList') {
        // Catch the case where an open drawer is removed from the DOM
        // (e.g. React unmount without explicit close) — the `open` attribute
        // change never fires, so the scroll lock would otherwise leak.
        for (const node of mutation.removedNodes) {
          if (isDrawerElement(node) || containsOpenDrawer(node)) {
            handleStateChange(node)
            return
          }
        }
      }
    }
  })

  observer.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ['open'],
    childList: true,
  })
}

// NOTE: Auto-init from this module's body was removed intentionally —
// rolldown treats observer.ts as side-effect-free (it's not in the package's
// `sideEffects` whitelist, and intentionally so to keep the public surface
// per-entry), so a top-level call here gets tree-shaken when consumers only
// reach DRAWER_STATE_CHANGE without actually invoking initDrawerObserver.
// Each entry file (src/index.ts, src/react.tsx) calls initDrawerObserver()
// explicitly; the `initialized` guard above makes that safe + idempotent.
