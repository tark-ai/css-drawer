/**
 * Body scroll lock for drawers.
 *
 * Uses the position:fixed + negative-top technique (same as Vaul / Radix
 * Dialog / body-scroll-lock). The lock is owned by this module and driven
 * by the shared MutationObserver in `./observer.ts`, which calls
 * `updateScrollLockFromDrawers()` on every drawer open/close.
 *
 * The lock is counter-based — incremented per opt-in drawer that's open,
 * decremented when one closes. The body styles are only applied on the
 * 0 → positive transition and only restored on the positive → 0 transition.
 * That means a same-tick close-A + open-B keeps the count at 1 → 1 and the
 * lock is never released mid-transition. This is the fix for the
 * drawer-to-drawer scroll race that consumers used to work around with
 * their own `useEffect`-based locks.
 *
 * Drawers can opt out with `data-scroll-lock="false"`.
 */

interface Snapshot {
  scrollX: number
  scrollY: number
  bodyPosition: string
  bodyTop: string
  bodyLeft: string
  bodyRight: string
  bodyWidth: string
  htmlScrollBehavior: string
}

let snapshot: Snapshot | null = null
let prevDrawerCount = 0

function applyLock(): void {
  if (snapshot !== null) return
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const body = document.body
  const html = document.documentElement
  const scrollY = window.scrollY
  const scrollX = window.scrollX

  snapshot = {
    scrollX,
    scrollY,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
    bodyRight: body.style.right,
    bodyWidth: body.style.width,
    htmlScrollBehavior: html.style.scrollBehavior,
  }

  // `width: 100%` is required — without it the body collapses to content
  // width and the page visibly jumps horizontally on lock/unlock.
  body.style.position = 'fixed'
  body.style.top = `-${scrollY}px`
  body.style.left = `-${scrollX}px`
  body.style.right = '0'
  body.style.width = '100%'

  // Force instant scroll on release — a site-wide `scroll-behavior: smooth`
  // on <html> would otherwise animate the scrollTo restore.
  html.style.scrollBehavior = 'auto'
}

function releaseLock(): void {
  if (snapshot === null) return
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const { scrollX, scrollY, bodyPosition, bodyTop, bodyLeft, bodyRight, bodyWidth, htmlScrollBehavior } = snapshot
  const body = document.body
  const html = document.documentElement

  snapshot = null

  // Order matters: clear styles BEFORE scrollTo. scrollTo while
  // `position: fixed` is still set is a no-op.
  body.style.position = bodyPosition
  body.style.top = bodyTop
  body.style.left = bodyLeft
  body.style.right = bodyRight
  body.style.width = bodyWidth
  html.style.scrollBehavior = htmlScrollBehavior

  window.scrollTo({ top: scrollY, left: scrollX, behavior: 'instant' as ScrollBehavior })
}

/**
 * @internal
 * Called by the shared drawer observer on every open/close. Recomputes the
 * count of currently-open drawers that haven't opted out, and toggles the
 * lock on 0 → positive / positive → 0 transitions.
 */
export function updateScrollLockFromDrawers(): void {
  if (typeof document === 'undefined') return
  const count = document.querySelectorAll(
    'dialog.drawer[open]:not([data-scroll-lock="false"])'
  ).length

  if (prevDrawerCount === 0 && count > 0) {
    applyLock()
  } else if (prevDrawerCount > 0 && count === 0) {
    releaseLock()
  }
  prevDrawerCount = count
}
