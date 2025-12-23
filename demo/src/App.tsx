import { useRef } from 'react'
import { Drawer } from 'css-drawer/react'
import { useIsMobile } from './hooks/useMediaQuery'

export default function App() {
  const formRef = useRef<HTMLDialogElement>(null)
  const confirmRef = useRef<HTMLDialogElement>(null)
  const successRef = useRef<HTMLDialogElement>(null)
  const bottomRef = useRef<HTMLDialogElement>(null)
  const rightRef = useRef<HTMLDialogElement>(null)

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
            onClick={() => rightRef.current?.showModal()}
          >
            Right Drawer
          </button>
        </div>
      </main>

      {/* Form Drawer - direction is responsive */}
      <Drawer.Root direction={responsiveDirection}>
        <Drawer.Content ref={formRef}>
          <Drawer.Handle />
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
          <Drawer.Handle />
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

      {/* Right Drawer */}
      <Drawer.Root direction="right">
        <Drawer.Content ref={rightRef}>
          <div className="drawer-content">
            <Drawer.Title>Right Drawer</Drawer.Title>
            <Drawer.Description>
              Opens from the right. Great for desktop sidepanels.
            </Drawer.Description>
            <button
              className="btn btn--secondary btn--full"
              onClick={() => rightRef.current?.close()}
            >
              Close
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Root>
    </>
  )
}
