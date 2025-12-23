import { useState } from 'react'
import { Drawer } from 'css-drawer/react'
import { useIsMobile } from './hooks/useMediaQuery'
import 'css-drawer/styles'

export default function App() {
  const [formOpen, setFormOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)

  const isMobile = useIsMobile(768)
  const responsiveDirection = isMobile ? undefined : 'right'

  return (
    <>
      <main className="demo">
        <h1>CSS Drawer</h1>
        <p>Vaul-like API with zero JS animations. Try nested drawers.</p>
        <div className="demo-buttons">
          {/* Using compound component API */}
          <Drawer.Root open={formOpen} onOpenChange={setFormOpen} direction={responsiveDirection}>
            <Drawer.Trigger className="btn btn--primary">
              Open Form
            </Drawer.Trigger>
            <Drawer.Content>
              <Drawer.Handle />
              <div className="drawer-content">
                <Drawer.Title>Create Issue</Drawer.Title>
                <Drawer.Description>
                  Fill out the form. Opens from right on desktop, bottom on mobile.
                </Drawer.Description>
                <form onSubmit={(e) => { e.preventDefault(); setConfirmOpen(true) }}>
                  <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input type="text" id="title" placeholder="Issue title..." />
                  </div>
                  <div className="form-group">
                    <label htmlFor="desc">Description</label>
                    <textarea id="desc" placeholder="Describe the issue..." />
                  </div>
                  <div className="actions">
                    <Drawer.Close className="btn btn--secondary">
                      Cancel
                    </Drawer.Close>
                    <button type="submit" className="btn btn--primary" style={{ flex: 1 }}>
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </Drawer.Content>
          </Drawer.Root>

          {/* Simple drawer with default direction */}
          <Drawer.Root>
            <Drawer.Trigger className="btn btn--secondary">
              Bottom Drawer
            </Drawer.Trigger>
            <Drawer.Content>
              <Drawer.Handle />
              <div className="drawer-content">
                <Drawer.Title>Simple Drawer</Drawer.Title>
                <Drawer.Description>
                  This drawer opens from the bottom (default direction).
                </Drawer.Description>
                <Drawer.Close className="btn btn--secondary btn--full">
                  Close
                </Drawer.Close>
              </div>
            </Drawer.Content>
          </Drawer.Root>

          {/* Right drawer */}
          <Drawer.Root direction="right">
            <Drawer.Trigger className="btn btn--secondary">
              Right Drawer
            </Drawer.Trigger>
            <Drawer.Content>
              <div className="drawer-content">
                <Drawer.Title>Right Drawer</Drawer.Title>
                <Drawer.Description>
                  Opens from the right. Great for desktop sidepanels.
                </Drawer.Description>
                <Drawer.Close className="btn btn--secondary btn--full">
                  Close
                </Drawer.Close>
              </div>
            </Drawer.Content>
          </Drawer.Root>
        </div>
      </main>

      {/* Nested Confirm Drawer */}
      <Drawer.Root open={confirmOpen} onOpenChange={setConfirmOpen} direction={responsiveDirection}>
        <Drawer.Content>
          <Drawer.Handle />
          <div className="drawer-content" style={{ textAlign: 'center', paddingTop: '1rem' }}>
            <Drawer.Title>Confirm Submission?</Drawer.Title>
            <Drawer.Description>
              This will create a new issue in the system.
            </Drawer.Description>
            <div className="actions" style={{ flexDirection: 'column' }}>
              <button
                className="btn btn--primary btn--full"
                onClick={() => {
                  setConfirmOpen(false)
                  setFormOpen(false)
                  setSuccessOpen(true)
                }}
              >
                Yes, Create Issue
              </button>
              <Drawer.Close className="btn btn--secondary btn--full">
                Go Back
              </Drawer.Close>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Root>

      {/* Success Drawer */}
      <Drawer.Root open={successOpen} onOpenChange={setSuccessOpen} direction={responsiveDirection}>
        <Drawer.Content>
          <Drawer.Handle />
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
            <Drawer.Close className="btn btn--primary btn--full" style={{ marginTop: '1rem' }}>
              Done
            </Drawer.Close>
          </div>
        </Drawer.Content>
      </Drawer.Root>
    </>
  )
}
