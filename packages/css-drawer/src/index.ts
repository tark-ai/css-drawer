/**
 * CSS Drawer - Headless drawer component
 * Works with any framework: React, Vue, Svelte, vanilla JS
 */

export type DrawerElement = HTMLDialogElement

export type DrawerRef = string | DrawerElement | null | undefined

export interface CreateDrawerOptions {
  /** Drawer ID */
  id?: string
  /** HTML content for the drawer */
  content?: string
  /** Include drag handle (default: true) */
  handle?: boolean
  /** Additional CSS classes */
  className?: string
}

export interface DrawerEventHandlers {
  /** Called when drawer opens */
  onOpen?: () => void
  /** Called when drawer closes */
  onClose?: () => void
  /** Called when drawer is cancelled (backdrop click or Escape) */
  onCancel?: () => void
}

/**
 * Resolve a drawer reference to an element
 */
function resolve(drawer: DrawerRef): DrawerElement | null {
  if (!drawer) return null
  if (typeof drawer === 'string') {
    return document.getElementById(drawer) as DrawerElement | null
  }
  return drawer
}

/**
 * Open a drawer by ID or element reference
 */
export function open(drawer: DrawerRef): void {
  const el = resolve(drawer)
  el?.showModal()
}

/**
 * Close a drawer by ID or element reference
 */
export function close(drawer: DrawerRef): void {
  const el = resolve(drawer)
  el?.close()
}

/**
 * Close all open drawers (in reverse DOM order for proper animation)
 */
export function closeAll(): void {
  const drawers = Array.from(document.querySelectorAll<DrawerElement>('dialog.drawer[open]'))
  drawers.reverse().forEach((d) => d.close())
}

/**
 * Check if a drawer is open
 */
export function isOpen(drawer: DrawerRef): boolean {
  const el = resolve(drawer)
  return el?.open ?? false
}

/**
 * Get all open drawers
 */
export function getOpen(): DrawerElement[] {
  return Array.from(document.querySelectorAll<DrawerElement>('dialog.drawer[open]'))
}

/**
 * Get the topmost open drawer
 */
export function getTop(): DrawerElement | null {
  const open = getOpen()
  return open[open.length - 1] ?? null
}

/**
 * Create a drawer element programmatically
 */
export function create(options: CreateDrawerOptions = {}): DrawerElement {
  const { id, content = '', handle = true, className = '' } = options

  const dialog = document.createElement('dialog') as DrawerElement
  dialog.className = `drawer ${className}`.trim()
  if (id) dialog.id = id

  dialog.innerHTML = `
    ${handle ? '<div class="drawer-handle"></div>' : ''}
    <div class="drawer-content">${content}</div>
  `

  // Backdrop click to close
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close()
  })

  return dialog
}

/**
 * Mount a drawer to the DOM (appends to body)
 */
export function mount(drawer: DrawerElement): DrawerElement {
  document.body.appendChild(drawer)
  return drawer
}

/**
 * Unmount a drawer from the DOM
 */
export function unmount(drawer: DrawerRef): void {
  const el = resolve(drawer)
  el?.remove()
}

/**
 * Initialize global backdrop-click-to-close behavior
 * Alternative to adding onclick to each drawer
 */
export function init(): () => void {
  const handler = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.matches('dialog.drawer')) {
      ;(target as DrawerElement).close()
    }
  }

  document.addEventListener('click', handler)
  return () => document.removeEventListener('click', handler)
}

/**
 * Subscribe to drawer events
 * @returns Cleanup function
 */
export function subscribe(
  drawer: DrawerRef,
  handlers: DrawerEventHandlers
): () => void {
  const el = resolve(drawer)
  if (!el) return () => {}

  const { onOpen, onClose, onCancel } = handlers

  const handleClose = () => onClose?.()
  const handleCancel = () => onCancel?.()

  // Use MutationObserver to detect open attribute
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === 'open' && el.open) {
        onOpen?.()
      }
    }
  })

  el.addEventListener('close', handleClose)
  el.addEventListener('cancel', handleCancel)
  observer.observe(el, { attributes: true })

  return () => {
    el.removeEventListener('close', handleClose)
    el.removeEventListener('cancel', handleCancel)
    observer.disconnect()
  }
}

/**
 * React-friendly hook helper - returns props to spread on dialog
 * Usage: <dialog {...drawer.props('my-drawer')} />
 */
export function props(id: string) {
  return {
    id,
    className: 'drawer',
    onClick: (e: MouseEvent) => {
      if (e.target === e.currentTarget) {
        ;(e.currentTarget as DrawerElement).close()
      }
    },
  } as const
}

/**
 * Update inert state for all open drawers.
 * Only the topmost drawer should be interactive.
 */
function updateInertState(): void {
  const openDrawers = Array.from(
    document.querySelectorAll<DrawerElement>('dialog.drawer[open]')
  )

  // All but the last one should be inert
  openDrawers.forEach((drawer, index) => {
    const isTopmost = index === openDrawers.length - 1
    if (isTopmost) {
      drawer.removeAttribute('inert')
    } else {
      drawer.setAttribute('inert', '')
    }
  })
}

/**
 * Enable accessibility for stacked drawers.
 * Adds `inert` attribute to underlying drawers so only the top drawer is interactive.
 * This prevents keyboard navigation and screen readers from accessing stacked drawers.
 *
 * Call once at app startup:
 * ```js
 * import { enableAccessibility } from 'css-drawer'
 * enableAccessibility()
 * ```
 *
 * @returns Cleanup function to disable the behavior
 */
export function enableAccessibility(): () => void {
  // Initial state
  updateInertState()

  // Watch for open attribute changes on any drawer
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'open' &&
        (mutation.target as HTMLElement).classList.contains('drawer')
      ) {
        updateInertState()
        break
      }
    }
  })

  // Observe the entire document for drawer changes
  observer.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ['open'],
  })

  return () => {
    observer.disconnect()
    // Clean up inert attributes
    document.querySelectorAll<DrawerElement>('dialog.drawer[inert]').forEach((d) => {
      d.removeAttribute('inert')
    })
  }
}
