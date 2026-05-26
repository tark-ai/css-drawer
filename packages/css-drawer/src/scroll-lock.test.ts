import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { updateScrollLockFromDrawers } from './scroll-lock'

/**
 * The scroll-lock module holds internal state (snapshot, prevDrawerCount).
 * To isolate tests we reset by clearing the DOM and calling
 * updateScrollLockFromDrawers() so the internal counter catches up to a
 * clean DOM (returning to 0). If that returns us to 0, the body styles get
 * cleared as part of the positive → 0 transition.
 */
function resetState() {
  document.body.innerHTML = ''
  document.body.removeAttribute('style')
  document.documentElement.removeAttribute('style')
  updateScrollLockFromDrawers()
}

function setScrollY(y: number, x = 0) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y })
  Object.defineProperty(window, 'scrollX', { configurable: true, value: x })
}

function makeDrawer(opts: { open?: boolean; scrollLock?: boolean | null } = {}) {
  const dialog = document.createElement('dialog')
  dialog.classList.add('drawer')
  if (opts.open) dialog.setAttribute('open', '')
  if (opts.scrollLock === false) dialog.setAttribute('data-scroll-lock', 'false')
  document.body.appendChild(dialog)
  return dialog
}

describe('scroll-lock', () => {
  let scrollToSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    setScrollY(0)
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    resetState()
    scrollToSpy.mockClear()
  })

  afterEach(() => {
    resetState()
    scrollToSpy.mockRestore()
  })

  describe('basic open / close', () => {
    it('opening the first drawer pins the body at the snapshot scrollY', () => {
      setScrollY(300)
      makeDrawer({ open: true })
      updateScrollLockFromDrawers()

      expect(document.body.style.position).toBe('fixed')
      expect(document.body.style.top).toBe('-300px')
      expect(document.body.style.width).toBe('100%')
      expect(document.body.style.right).toBe('0px')
    })

    it('flips html scroll-behavior to auto during the lock and restores on release', () => {
      document.documentElement.style.scrollBehavior = 'smooth'
      setScrollY(300)
      const drawer = makeDrawer({ open: true })
      updateScrollLockFromDrawers()
      expect(document.documentElement.style.scrollBehavior).toBe('auto')

      drawer.removeAttribute('open')
      updateScrollLockFromDrawers()
      expect(document.documentElement.style.scrollBehavior).toBe('smooth')
    })

    it('closing the last drawer restores body styles and scrolls back', () => {
      setScrollY(500)
      const drawer = makeDrawer({ open: true })
      updateScrollLockFromDrawers()

      drawer.removeAttribute('open')
      updateScrollLockFromDrawers()

      expect(document.body.style.position).toBe('')
      expect(document.body.style.top).toBe('')
      expect(document.body.style.width).toBe('')
      expect(scrollToSpy).toHaveBeenCalledWith({ top: 500, left: 0, behavior: 'instant' })
    })

    it('uses behavior: "instant" on scrollTo so a site-wide smooth scroll-behavior cannot animate the restore', () => {
      setScrollY(123)
      const drawer = makeDrawer({ open: true })
      updateScrollLockFromDrawers()
      drawer.removeAttribute('open')
      updateScrollLockFromDrawers()

      const call = scrollToSpy.mock.calls[0][0] as ScrollToOptions
      expect(call.behavior).toBe('instant')
    })

    it('snapshots horizontal scroll too', () => {
      setScrollY(500, 200)
      const drawer = makeDrawer({ open: true })
      updateScrollLockFromDrawers()
      drawer.removeAttribute('open')
      updateScrollLockFromDrawers()

      expect(scrollToSpy).toHaveBeenCalledWith({ top: 500, left: 200, behavior: 'instant' })
    })

    it('preserves pre-existing inline body styles on restore', () => {
      document.body.style.position = 'relative'
      document.body.style.top = '10px'
      setScrollY(500)
      const drawer = makeDrawer({ open: true })
      updateScrollLockFromDrawers()
      expect(document.body.style.position).toBe('fixed')

      drawer.removeAttribute('open')
      updateScrollLockFromDrawers()
      expect(document.body.style.position).toBe('relative')
      expect(document.body.style.top).toBe('10px')
    })
  })

  describe('drawer-to-drawer transition (the @commercengine/checkout case)', () => {
    it('closing one drawer + opening another in the same tick keeps the lock held', () => {
      setScrollY(800)
      const menu = makeDrawer({ open: true })
      updateScrollLockFromDrawers()
      expect(document.body.style.position).toBe('fixed')
      expect(document.body.style.top).toBe('-800px')

      // Same-tick close + open. The MutationObserver would normally fire
      // once for this whole batch; we model that by calling update once
      // after both mutations.
      menu.removeAttribute('open')
      makeDrawer({ open: true })
      updateScrollLockFromDrawers()

      // Lock is still held at the ORIGINAL snapshot — the counter went
      // 1 → 1 across the swap and never crossed zero.
      expect(document.body.style.position).toBe('fixed')
      expect(document.body.style.top).toBe('-800px')
      expect(scrollToSpy).not.toHaveBeenCalled()
    })

    it('closing the second drawer restores scroll to the ORIGINAL snapshot', () => {
      setScrollY(800)
      const menu = makeDrawer({ open: true })
      updateScrollLockFromDrawers()

      menu.removeAttribute('open')
      const checkout = makeDrawer({ open: true })
      updateScrollLockFromDrawers()

      checkout.removeAttribute('open')
      updateScrollLockFromDrawers()

      expect(document.body.style.position).toBe('')
      // Restores to 800 (where the menu drawer was opened), NOT to whatever
      // scroll position might have existed when the checkout was opened.
      expect(scrollToSpy).toHaveBeenCalledWith(
        expect.objectContaining({ top: 800 })
      )
    })
  })

  describe('nested drawers', () => {
    it('opening a nested drawer does NOT re-snapshot', () => {
      setScrollY(300)
      makeDrawer({ open: true })
      updateScrollLockFromDrawers()

      setScrollY(900) // can't actually scroll because body is fixed; just prove the snapshot doesn't change
      makeDrawer({ open: true })
      updateScrollLockFromDrawers()

      expect(document.body.style.top).toBe('-300px')
    })

    it('closing the inner of two open drawers does NOT release the lock', () => {
      setScrollY(300)
      const a = makeDrawer({ open: true })
      updateScrollLockFromDrawers()
      const b = makeDrawer({ open: true })
      updateScrollLockFromDrawers()

      b.removeAttribute('open')
      updateScrollLockFromDrawers()

      expect(document.body.style.position).toBe('fixed')
      expect(scrollToSpy).not.toHaveBeenCalled()
      expect(a.hasAttribute('open')).toBe(true)
    })

    it('closing the last open drawer releases at the original snapshot', () => {
      setScrollY(300)
      const a = makeDrawer({ open: true })
      updateScrollLockFromDrawers()
      const b = makeDrawer({ open: true })
      updateScrollLockFromDrawers()

      b.removeAttribute('open')
      updateScrollLockFromDrawers()
      a.removeAttribute('open')
      updateScrollLockFromDrawers()

      expect(document.body.style.position).toBe('')
      expect(scrollToSpy).toHaveBeenCalledWith(
        expect.objectContaining({ top: 300 })
      )
    })
  })

  describe('opt-out', () => {
    it('drawer with data-scroll-lock="false" does NOT trigger the lock', () => {
      setScrollY(300)
      makeDrawer({ open: true, scrollLock: false })
      updateScrollLockFromDrawers()

      expect(document.body.style.position).toBe('')
    })

    it('opt-out drawer alongside a regular drawer — lock follows the regular one only', () => {
      setScrollY(300)
      const optOut = makeDrawer({ open: true, scrollLock: false })
      updateScrollLockFromDrawers()
      expect(document.body.style.position).toBe('')

      const regular = makeDrawer({ open: true })
      updateScrollLockFromDrawers()
      expect(document.body.style.position).toBe('fixed')

      regular.removeAttribute('open')
      updateScrollLockFromDrawers()
      expect(document.body.style.position).toBe('')

      // Closing the opt-out drawer must NOT call scrollTo
      scrollToSpy.mockClear()
      optOut.removeAttribute('open')
      updateScrollLockFromDrawers()
      expect(scrollToSpy).not.toHaveBeenCalled()
    })
  })

  describe('DOM removal', () => {
    it('removing an open drawer from the DOM releases the lock', () => {
      setScrollY(300)
      const drawer = makeDrawer({ open: true })
      updateScrollLockFromDrawers()

      drawer.remove()
      updateScrollLockFromDrawers()

      expect(document.body.style.position).toBe('')
      expect(scrollToSpy).toHaveBeenCalledWith(
        expect.objectContaining({ top: 300 })
      )
    })
  })

  describe('rapid open/close', () => {
    it('a synchronous open + close that nets to zero is a no-op', () => {
      setScrollY(300)
      const drawer = makeDrawer({ open: true })
      drawer.removeAttribute('open')
      updateScrollLockFromDrawers()

      expect(document.body.style.position).toBe('')
      expect(scrollToSpy).not.toHaveBeenCalled()
    })
  })
})
