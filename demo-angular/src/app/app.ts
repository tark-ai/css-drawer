import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  template: `
    <main class="demo">
      <h1>CSS Drawer - Angular</h1>
      <p>Using the vanilla JS API with Angular</p>

      <div class="demo-buttons">
        <button class="btn btn--primary" (click)="openDrawer(bottomDrawer)">
          Bottom Drawer
        </button>
        <button class="btn btn--secondary" (click)="openDrawer(modalDrawer)">
          Modal
        </button>
        <button class="btn btn--secondary" (click)="openDrawer(rightDrawer)">
          Right Drawer
        </button>
        <button class="btn btn--secondary" (click)="openDrawer(shareDialog)">
          Share (DOM Nested)
        </button>
      </div>
    </main>

    <!-- Bottom Drawer -->
    <dialog #bottomDrawer class="drawer">
      <div class="drawer-handle"></div>
      <div class="drawer-content">
        <h2>Bottom Drawer</h2>
        <p>This drawer opens from the bottom (default direction).</p>
        <button class="btn btn--secondary btn--full" (click)="closeDrawer(bottomDrawer)">
          Close
        </button>
      </div>
    </dialog>

    <!-- Modal -->
    <dialog #modalDrawer class="drawer" data-direction="modal">
      <div class="drawer-content">
        <h2>Centered Modal</h2>
        <p>Uses direction="modal" to open as a centered dialog with scale animation.</p>
        <div class="actions">
          <button class="btn btn--primary btn--full" (click)="openDrawer(nestedModal)">
            Open Nested Modal
          </button>
          <button class="btn btn--secondary btn--full" (click)="closeDrawer(modalDrawer)">
            Close
          </button>
        </div>
      </div>
    </dialog>

    <!-- Nested Modal (sibling) -->
    <dialog #nestedModal class="drawer" data-direction="modal">
      <div class="drawer-content">
        <h2>Nested Modal</h2>
        <p>Modals can stack just like drawers.</p>
        <button class="btn btn--primary btn--full" (click)="closeDrawer(nestedModal)">
          Close
        </button>
      </div>
    </dialog>

    <!-- DOM-Nested Test: Child dialog inside parent dialog -->
    <dialog #shareDialog class="drawer" data-direction="modal" (close)="onShareClose()">
      <div class="drawer-content">
        <h2>Share</h2>
        <p>Share this item with others.</p>
        <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: #f5f5f5; border-radius: 8px; margin-bottom: 1rem;">
          <input type="text" readonly value="https://example.com/share/abc123" style="flex: 1; border: none; background: transparent; font-size: 0.875rem; color: #666;" />
          <button class="btn btn--primary" style="padding: 0.5rem 1rem;" (click)="openDrawer(copyConfirmDialog)">
            Copy
          </button>
        </div>
        <button class="btn btn--secondary btn--full" (click)="closeDrawer(shareDialog)">
          Done
        </button>

        <!-- Child dialog - DOM nested inside parent -->
        <dialog #copyConfirmDialog class="drawer" data-direction="modal" (close)="onCopyConfirmClose()">
          <div class="drawer-content" style="text-align: center;">
            <div style="width: 48px; height: 48px; margin: 0 auto 1rem; display: grid; place-items: center; border-radius: 50%; background: rgba(34, 197, 94, 0.1); color: rgb(34, 197, 94);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2>Link Copied!</h2>
            <p>The share link has been copied to your clipboard.</p>
            <button class="btn btn--primary btn--full" (click)="closeDrawer(copyConfirmDialog)">
              OK
            </button>
          </div>
        </dialog>
      </div>
    </dialog>

    <!-- Right Drawer -->
    <dialog #rightDrawer class="drawer" data-direction="right">
      <div class="drawer-content">
        <h2>Right Drawer</h2>
        <p>This drawer opens from the right.</p>
        <button class="btn btn--secondary btn--full" (click)="closeDrawer(rightDrawer)">
          Close
        </button>
      </div>
    </dialog>
  `,
  styles: [`
    .demo {
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
    }

    h1 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    p {
      color: #666;
      margin-bottom: 2rem;
    }

    .demo-buttons {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }

    .btn--primary {
      background: #0066ff;
      color: white;
    }

    .btn--primary:hover {
      background: #0052cc;
    }

    .btn--secondary {
      background: #f0f0f0;
      color: #333;
    }

    .btn--secondary:hover {
      background: #e0e0e0;
    }

    .btn--full {
      width: 100%;
    }

    .drawer-content {
      padding: 1.5rem;
    }

    .drawer-content h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .drawer-content p {
      color: #666;
      margin-bottom: 1.5rem;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  `],
})
export class App {
  openDrawer(dialog: HTMLDialogElement) {
    dialog.showModal();
  }

  closeDrawer(dialog: HTMLDialogElement) {
    dialog.close();
  }

  onShareClose() {
    console.log('[SHARE/PARENT] close event fired');
  }

  onCopyConfirmClose() {
    console.log('[COPY CONFIRM/CHILD] close event fired');
  }
}
