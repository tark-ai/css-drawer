import { useEffect, useRef, useState, type RefObject } from 'react'
import { Drawer, useIsTopDrawer } from 'css-drawer/react'
import { useIsMobile } from './hooks/useMediaQuery'

/**
 * Live readout of `window.scrollY` + body lock state. Polls every animation
 * frame; lock state is inferred from `document.body.style.position` since
 * the lock is internal to css-drawer.
 */
function ScrollDebugger() {
  const [scrollY, setScrollY] = useState(0)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      setScrollY(Math.round(window.scrollY))
      setLocked(document.body.style.position === 'fixed')
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '0.75rem',
        left: '0.75rem',
        zIndex: 9999,
        padding: '0.5rem 0.75rem',
        background: 'hsl(0 0% 10% / 0.85)',
        color: 'white',
        fontSize: '0.75rem',
        fontFamily: 'ui-monospace, monospace',
        borderRadius: '6px',
        lineHeight: 1.6,
        pointerEvents: 'none',
      }}
    >
      scrollY: {scrollY}
      <br />
      locked: {locked ? 'true' : 'false'}
    </div>
  )
}

/** Demo component showing useIsTopDrawer hook */
function TopDrawerBadge({ drawerRef }: { drawerRef: RefObject<HTMLDialogElement | null> }) {
  const isTop = useIsTopDrawer(drawerRef)

  if (!isTop) return null

  return (
    <div style={{
      position: 'absolute',
      top: '0.75rem',
      right: '0.75rem',
      padding: '0.25rem 0.5rem',
      background: 'hsl(200 98% 39%)',
      color: 'white',
      fontSize: '0.75rem',
      fontWeight: 500,
      borderRadius: '4px',
    }}>
      Top Drawer
    </div>
  )
}

export default function App() {
  const formRef = useRef<HTMLDialogElement>(null)
  const confirmRef = useRef<HTMLDialogElement>(null)
  const successRef = useRef<HTMLDialogElement>(null)
  const bottomRef = useRef<HTMLDialogElement>(null)
  const modalRef = useRef<HTMLDialogElement>(null)
  const nestedModalRef = useRef<HTMLDialogElement>(null)
  const fullscreenModalRef = useRef<HTMLDialogElement>(null)

  // Controlled mode example
  const [rightOpen, setRightOpen] = useState(false)

  // Nested controlled mode example
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const settingsRef = useRef<HTMLDialogElement>(null)
  const deleteConfirmRef = useRef<HTMLDialogElement>(null)

  // DOM-nested dialogs (child rendered inside parent)
  const [shareOpen, setShareOpen] = useState(false)
  const [copyConfirmOpen, setCopyConfirmOpen] = useState(false)

  // Scroll-lock test scenarios
  const lockTestRef = useRef<HTMLDialogElement>(null)
  const noLockRef = useRef<HTMLDialogElement>(null)

  // Drawer → drawer transition (e.g. menu drawer → checkout drawer, both
  // built on css-drawer — the actual @commercengine/checkout shape).
  const menuRef = useRef<HTMLDialogElement>(null)
  const checkoutRef = useRef<HTMLDialogElement>(null)
  const [drawerSwapResult, setDrawerSwapResult] = useState<{
    snapshot: number
    duringSwap: { position: string; top: string }
    final: number
  } | null>(null)

  const isMobile = useIsMobile(768)
  const responsiveDirection = isMobile ? undefined : 'right'

  function handleConfirm() {
    confirmRef.current?.close()
    formRef.current?.close()
    successRef.current?.showModal()
  }

  return (
    <>
      <main className="demo">
        <h1>CSS Drawer</h1>
        <p>Zero React state. Native dialog refs only. Try nested drawers.</p>
        <div className="demo-buttons">
          <button
            className="btn btn--primary"
            onClick={() => formRef.current?.showModal()}
          >
            Open Form
          </button>

          <button
            className="btn btn--secondary"
            onClick={() => bottomRef.current?.showModal()}
          >
            Bottom Drawer
          </button>

          <button
            className="btn btn--secondary"
            onClick={() => modalRef.current?.showModal()}
          >
            Modal
          </button>

          <button
            className="btn btn--secondary"
            onClick={() => fullscreenModalRef.current?.showModal()}
          >
            Fullscreen Modal
          </button>

          <button
            className="btn btn--secondary"
            onClick={() => setRightOpen(true)}
          >
            Right Drawer (Controlled)
          </button>

          <button
            className="btn btn--secondary"
            onClick={() => setSettingsOpen(true)}
          >
            Nested (Controlled)
          </button>

          <button
            className="btn btn--secondary"
            onClick={() => setShareOpen(true)}
          >
            Share (DOM Nested)
          </button>
        </div>

        <section
          style={{
            marginTop: '3rem',
            padding: '1.5rem',
            border: '1.5px dashed hsl(0 0% 70%)',
            borderRadius: '12px',
            textAlign: 'left',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Scroll-lock test cases
          </h2>
          <p style={{ color: 'hsl(0 0% 40%)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Scroll the page first (use the long content below). Open a drawer
            and try to drag/scroll the page underneath — the standard drawer
            must lock it; the opt-out drawer must NOT. Close to verify the
            page restores to the same scroll position.
          </p>
          <div className="demo-buttons" style={{ justifyContent: 'flex-start' }}>
            <button
              className="btn btn--primary"
              onClick={() => lockTestRef.current?.showModal()}
            >
              Standard drawer (locks)
            </button>
            <button
              className="btn btn--secondary"
              onClick={() => noLockRef.current?.showModal()}
            >
              Opt-out drawer (scrollLock=false)
            </button>
          </div>
        </section>

        <section
          style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            border: '1.5px dashed hsl(220 90% 60%)',
            background: 'hsl(220 90% 97%)',
            borderRadius: '12px',
            textAlign: 'left',
          }}
          data-testid="drawer-swap-section"
        >
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Drawer → another drawer (the @commercengine/checkout case)
          </h2>
          <p style={{ color: 'hsl(0 0% 40%)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            When both modals are css-drawer instances (mobile menu drawer +
            checkout drawer, both built on this package), the same-tick
            close+open is handled automatically. The internal counter goes
            <code> 1 → 1</code> (no zero crossing), so the body lock never
            releases. No helper needed. No race possible.
          </p>
          <button
            className="btn btn--primary"
            data-testid="open-menu-drawer"
            onClick={() => {
              window.scrollTo({ top: 800, behavior: 'instant' as ScrollBehavior })
              requestAnimationFrame(() => menuRef.current?.showModal())
            }}
          >
            Open menu drawer (auto-scrolls to 800)
          </button>
          {drawerSwapResult && (
            <div
              data-testid="drawer-swap-result"
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                background: 'hsl(0 0% 100%)',
                border: '1px solid hsl(220 90% 80%)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontFamily: 'ui-monospace, monospace',
                lineHeight: 1.5,
              }}
            >
              snapshot scrollY: <strong>{drawerSwapResult.snapshot}</strong>
              <br />
              body during swap: position=
              <strong data-testid="drawer-swap-during-position">
                {drawerSwapResult.duringSwap.position || '(empty)'}
              </strong>{' '}
              top=
              <strong data-testid="drawer-swap-during-top">
                {drawerSwapResult.duringSwap.top || '(empty)'}
              </strong>
              <br />
              final scrollY after closing checkout:{' '}
              <strong data-testid="drawer-swap-final-scroll">
                {drawerSwapResult.final}
              </strong>
            </div>
          )}
        </section>

        <section style={{ marginTop: '2rem' }}>
          <p style={{ color: 'hsl(0 0% 50%)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            Filler content so the page is actually scrollable
          </p>
          {Array.from({ length: 40 }, (_, i) => (
            <p
              key={i}
              style={{
                padding: '1rem',
                marginBottom: '0.5rem',
                background: 'hsl(0 0% 100% / 0.5)',
                border: '1px solid hsl(0 0% 90%)',
                borderRadius: '8px',
                color: 'hsl(0 0% 30%)',
                fontSize: '0.9rem',
              }}
            >
              Filler block #{i + 1} — scrollY here is roughly {i * 80}px.
            </p>
          ))}
        </section>
      </main>

      <ScrollDebugger />

      {/* Form Drawer - direction is responsive */}
      <Drawer.Root direction={responsiveDirection}>
        <Drawer.Content ref={formRef} closeOnOutsideClick={false}>
          {isMobile && <Drawer.Handle />}
          <div className="drawer-content">
            <Drawer.Title>Create Issue</Drawer.Title>
            <Drawer.Description>
              Fill out the form. Opens from right on desktop, bottom on mobile.
            </Drawer.Description>
            <form onSubmit={(e) => {
              e.preventDefault()
              confirmRef.current?.showModal()
            }}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" placeholder="Issue title..." />
              </div>
              <div className="form-group">
                <label htmlFor="desc">Description</label>
                <textarea id="desc" placeholder="Describe the issue..." />
              </div>
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select id="priority">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="assignee">Assignee</label>
                <input type="text" id="assignee" placeholder="Enter assignee name..." />
              </div>
              <div className="form-group">
                <label htmlFor="labels">Labels</label>
                <input type="text" id="labels" placeholder="bug, feature, docs..." />
              </div>
              <div className="form-group">
                <label htmlFor="due-date">Due Date</label>
                <input type="date" id="due-date" />
              </div>
              <div className="form-group">
                <label htmlFor="estimate">Time Estimate (hours)</label>
                <input type="number" id="estimate" placeholder="4" min="0" />
              </div>
              <div className="form-group">
                <label htmlFor="notes">Additional Notes</label>
                <textarea id="notes" placeholder="Any extra context..." />
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => formRef.current?.close()}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" style={{ flex: 1 }}>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </Drawer.Content>
      </Drawer.Root>

      {/* Confirm Drawer - nested on top of form */}
      <Drawer.Root direction={responsiveDirection}>
        <Drawer.Content ref={confirmRef}>
          {isMobile && <Drawer.Handle />}
          <div className="drawer-content" style={{ textAlign: 'center', paddingTop: '1rem' }}>
            <Drawer.Title>Confirm Submission?</Drawer.Title>
            <Drawer.Description>
              This will create a new issue in the system.
            </Drawer.Description>
            <div className="actions" style={{ flexDirection: 'column' }}>
              <button
                className="btn btn--primary btn--full"
                onClick={handleConfirm}
              >
                Yes, Create Issue
              </button>
              <button
                className="btn btn--secondary btn--full"
                onClick={() => confirmRef.current?.close()}
              >
                Go Back
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Root>

      {/* Success Drawer */}
      <Drawer.Root direction={responsiveDirection}>
        <Drawer.Content ref={successRef}>
          {isMobile && <Drawer.Handle />}
          <div className="drawer-content" style={{ textAlign: 'center', paddingTop: '1rem' }}>
            <div style={{
              width: 56,
              height: 56,
              margin: '0 auto 1rem',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
              background: 'hsl(142 71% 45% / 0.1)',
              color: 'hsl(142 71% 45%)'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <Drawer.Title>Issue Created!</Drawer.Title>
            <Drawer.Description>
              Your issue has been submitted successfully.
            </Drawer.Description>
            <button
              className="btn btn--primary btn--full"
              style={{ marginTop: '1rem' }}
              onClick={() => successRef.current?.close()}
            >
              Done
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Root>

      {/* Simple Bottom Drawer */}
      <Drawer.Root>
        <Drawer.Content ref={bottomRef}>
          <Drawer.Handle />
          <div className="drawer-content">
            <Drawer.Title>Simple Drawer</Drawer.Title>
            <Drawer.Description>
              This drawer opens from the bottom (default direction).
            </Drawer.Description>
            <button
              className="btn btn--secondary btn--full"
              onClick={() => bottomRef.current?.close()}
            >
              Close
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Root>

      {/* Modal */}
      <Drawer.Root direction="modal">
        <Drawer.Content ref={modalRef}>
          <div className="drawer-content" style={{ textAlign: 'center', paddingTop: '1rem' }}>
            <Drawer.Title>Centered Modal</Drawer.Title>
            <Drawer.Description>
              Uses direction="modal" to open as a centered dialog with scale animation.
            </Drawer.Description>
            <div className="actions" style={{ flexDirection: 'column' }}>
              <button
                className="btn btn--primary btn--full"
                onClick={() => nestedModalRef.current?.showModal()}
              >
                Open Nested Modal
              </button>
              <button
                className="btn btn--secondary btn--full"
                onClick={() => modalRef.current?.close()}
              >
                Close
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Root>

      {/* Nested Modal */}
      <Drawer.Root direction="modal">
        <Drawer.Content ref={nestedModalRef}>
          <div className="drawer-content" style={{ textAlign: 'center', paddingTop: '1rem' }}>
            <Drawer.Title>Nested Modal</Drawer.Title>
            <Drawer.Description>
              Modals can stack just like drawers.
            </Drawer.Description>
            <button
              className="btn btn--primary btn--full"
              onClick={() => nestedModalRef.current?.close()}
            >
              Close
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Root>

      {/* Fullscreen Modal */}
      <Drawer.Root direction="modal">
        <Drawer.Content
          ref={fullscreenModalRef}
          style={{
            '--drawer-modal-width': '90%',
            '--drawer-modal-height': '90%',
          } as React.CSSProperties}
        >
          <div className="drawer-content" style={{ textAlign: 'center', paddingTop: '2rem' }}>
            <Drawer.Title>Fullscreen Modal</Drawer.Title>
            <Drawer.Description>
              Uses --drawer-width: 100% and --drawer-height: 100% for fullscreen.
            </Drawer.Description>
            <button
              className="btn btn--primary btn--full"
              onClick={() => fullscreenModalRef.current?.close()}
            >
              Close
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Root>

      {/* Right Drawer - Controlled Mode */}
      <Drawer.Root direction="right">
        <Drawer.Content open={rightOpen} onOpenChange={setRightOpen}>
          <div className="drawer-content">
            <Drawer.Title>Right Drawer (Controlled)</Drawer.Title>
            <Drawer.Description>
              Uses React state instead of refs. Open: {rightOpen ? 'true' : 'false'}
            </Drawer.Description>
            <button
              className="btn btn--secondary btn--full"
              onClick={() => setRightOpen(false)}
            >
              Close
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Root>

      {/* Nested Drawers - Controlled Mode with useIsTopDrawer demo */}
      <Drawer.Root direction={responsiveDirection}>
        <Drawer.Content ref={settingsRef} open={settingsOpen} onOpenChange={setSettingsOpen}>
          {isMobile && <Drawer.Handle />}
          <TopDrawerBadge drawerRef={settingsRef} />
          <div className="drawer-content">
            <Drawer.Title>Settings</Drawer.Title>
            <Drawer.Description>
              Nested drawers using controlled mode. Notice the badge only shows on the topmost drawer.
            </Drawer.Description>
            <div className="actions" style={{ flexDirection: 'column' }}>
              <button
                className="btn btn--secondary btn--full"
                onClick={() => setDeleteConfirmOpen(true)}
                style={{ color: 'hsl(0 84% 60%)' }}
              >
                Delete Account
              </button>
              <button
                className="btn btn--secondary btn--full"
                onClick={() => setSettingsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Root>

      <Drawer.Root direction={responsiveDirection}>
        <Drawer.Content ref={deleteConfirmRef} open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          {isMobile && <Drawer.Handle />}
          <TopDrawerBadge drawerRef={deleteConfirmRef} />
          <div className="drawer-content" style={{ textAlign: 'center', paddingTop: '1rem' }}>
            <Drawer.Title>Are you sure?</Drawer.Title>
            <Drawer.Description>
              This action cannot be undone.
            </Drawer.Description>
            <div className="actions" style={{ flexDirection: 'column' }}>
              <button
                className="btn btn--full"
                style={{ background: 'hsl(0 84% 60%)', color: 'white' }}
                onClick={() => {
                  setDeleteConfirmOpen(false)
                  setSettingsOpen(false)
                }}
              >
                Yes, Delete
              </button>
              <button
                className="btn btn--secondary btn--full"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Root>

      {/* DOM-Nested: Child dialog rendered inside parent dialog */}
      <Drawer.Root direction="modal">
        <Drawer.Content open={shareOpen} onOpenChange={setShareOpen}>
          <div className="drawer-content" style={{ textAlign: 'center', paddingTop: '1rem' }}>
            <Drawer.Title>Share</Drawer.Title>
            <Drawer.Description>
              Share this item with others.
            </Drawer.Description>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              background: 'hsl(0 0% 95%)',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <input
                type="text"
                readOnly
                value="https://example.com/share/abc123"
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: '0.875rem',
                  color: 'hsl(0 0% 40%)'
                }}
              />
              <button
                className="btn btn--primary"
                style={{ padding: '0.5rem 1rem' }}
                onClick={() => setCopyConfirmOpen(true)}
              >
                Copy
              </button>
            </div>
            <button
              className="btn btn--secondary btn--full"
              onClick={() => setShareOpen(false)}
            >
              Done
            </button>

            {/* Confirmation toast - DOM nested inside share dialog */}
            <Drawer.Root direction="modal">
              <Drawer.Content open={copyConfirmOpen} onOpenChange={setCopyConfirmOpen}>
                <div className="drawer-content" style={{ textAlign: 'center', paddingTop: '1rem' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    margin: '0 auto 1rem',
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '50%',
                    background: 'hsl(142 71% 45% / 0.1)',
                    color: 'hsl(142 71% 45%)'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <Drawer.Title>Link Copied!</Drawer.Title>
                  <Drawer.Description>
                    The share link has been copied to your clipboard.
                  </Drawer.Description>
                  <button
                    className="btn btn--primary btn--full"
                    onClick={() => setCopyConfirmOpen(false)}
                  >
                    OK
                  </button>
                </div>
              </Drawer.Content>
            </Drawer.Root>
          </div>
        </Drawer.Content>
      </Drawer.Root>

      {/* Scroll-lock test: standard drawer */}
      <Drawer.Root>
        <Drawer.Content ref={lockTestRef}>
          <Drawer.Handle />
          <div className="drawer-content">
            <Drawer.Title>Standard drawer</Drawer.Title>
            <Drawer.Description>
              Body scroll is locked while this is open. Try dragging inside the
              drawer or near its edges — the page underneath must NOT scroll.
              Close to restore the original scroll position.
            </Drawer.Description>
            <button
              className="btn btn--secondary btn--full"
              style={{ marginTop: '1rem' }}
              onClick={() => lockTestRef.current?.close()}
            >
              Close
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Root>

      {/* Scroll-lock test: opt-out */}
      <Drawer.Root>
        <Drawer.Content ref={noLockRef} scrollLock={false}>
          <Drawer.Handle />
          <div className="drawer-content">
            <Drawer.Title>Opt-out drawer</Drawer.Title>
            <Drawer.Description>
              <code>scrollLock=&#123;false&#125;</code>. The body is NOT locked
              — you can scroll the page underneath. Use this for side panels
              where scrolling the underlying content makes sense.
            </Drawer.Description>
            <button
              className="btn btn--secondary btn--full"
              style={{ marginTop: '1rem' }}
              onClick={() => noLockRef.current?.close()}
            >
              Close
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Root>

      {/* Drawer → drawer transition (the @commercengine/checkout pattern).
          Mobile menu closes + checkout opens same tick. Counter stays at 1
          throughout. Body stays position:fixed at top:-800. No race. */}
      <Drawer.Root>
        <Drawer.Content ref={menuRef}>
          <Drawer.Handle />
          <div className="drawer-content">
            <Drawer.Title>Mobile menu</Drawer.Title>
            <Drawer.Description>
              Click "Sign in" to close this and open the (also-css-drawer-based)
              checkout drawer in the same synchronous tick.
            </Drawer.Description>
            <button
              className="btn btn--primary btn--full"
              data-testid="menu-sign-in"
              style={{ marginTop: '1rem' }}
              onClick={() => {
                const snapshot = Math.round(window.scrollY)
                menuRef.current?.close()
                checkoutRef.current?.showModal()
                // Snapshot body state during the swap (after both calls,
                // before the next paint). If the lock held throughout this
                // tick, position should still be 'fixed' and top still
                // '-800px'.
                const duringSwap = {
                  position: document.body.style.position,
                  top: document.body.style.top,
                }
                // Set a partial result now (final scroll measured later).
                setDrawerSwapResult({
                  snapshot,
                  duringSwap,
                  final: -1, // placeholder; updated after checkout closes
                })
              }}
            >
              Sign in (close menu + open checkout)
            </button>
            <button
              className="btn btn--secondary btn--full"
              style={{ marginTop: '0.5rem' }}
              onClick={() => menuRef.current?.close()}
            >
              Just close
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Root>

      <Drawer.Root>
        <Drawer.Content ref={checkoutRef}>
          <Drawer.Handle />
          <div className="drawer-content">
            <Drawer.Title>Checkout drawer (css-drawer)</Drawer.Title>
            <Drawer.Description>
              This represents <code>@commercengine/checkout</code>. Closing
              this drawer should restore scroll to the original{' '}
              <code>scrollY=800</code> the menu drawer was opened at.
            </Drawer.Description>
            <button
              className="btn btn--secondary btn--full"
              data-testid="checkout-close"
              style={{ marginTop: '1rem' }}
              onClick={() => {
                checkoutRef.current?.close()
                // Measure scroll restoration after cleanup + scrollTo land.
                requestAnimationFrame(() =>
                  requestAnimationFrame(() =>
                    setDrawerSwapResult((prev) =>
                      prev
                        ? { ...prev, final: Math.round(window.scrollY) }
                        : prev,
                    ),
                  ),
                )
              }}
            >
              Close checkout
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Root>

    </>
  )
}
