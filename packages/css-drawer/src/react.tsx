import {
  createContext,
  useContext,
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type ComponentPropsWithoutRef,
  type RefObject,
} from 'react'
import './drawer.css'
import { DRAWER_STATE_CHANGE } from './observer'

/* ===== Types ===== */
type Direction = 'bottom' | 'top' | 'left' | 'right' | 'modal'

interface DrawerContextValue {
  direction?: Direction
}

/* ===== Context ===== */
const DrawerContext = createContext<DrawerContextValue>({ direction: undefined })

function useDrawerContext() {
  return useContext(DrawerContext)
}

/* ===== Utilities ===== */

/**
 * Get all open drawers
 */
function getOpenDrawers(): HTMLDialogElement[] {
  if (typeof window === 'undefined') return []
  return Array.from(document.querySelectorAll<HTMLDialogElement>('dialog.drawer[open]'))
}

/**
 * Get the topmost open drawer
 */
export function getTopDrawer(): HTMLDialogElement | null {
  const open = getOpenDrawers()
  return open[open.length - 1] ?? null
}

/**
 * Hook to check if a drawer is the topmost open drawer
 * Useful for conditionally rendering content only in the top drawer
 */
export function useIsTopDrawer(ref: RefObject<HTMLDialogElement | null>): boolean {
  const [isTop, setIsTop] = useState(false)

  useEffect(() => {
    const checkIsTop = () => {
      const topDrawer = getTopDrawer()
      setIsTop(ref.current !== null && ref.current === topDrawer)
    }

    // Initial check
    checkIsTop()

    // Listen to shared drawer state change event (single observer, not N observers)
    window.addEventListener(DRAWER_STATE_CHANGE, checkIsTop)
    return () => window.removeEventListener(DRAWER_STATE_CHANGE, checkIsTop)
  }, [ref])

  return isTop
}

/* ===== Root ===== */
interface RootProps {
  children: ReactNode
  /** Direction the drawer opens from */
  direction?: Direction
}

function Root({ children, direction }: RootProps) {
  return (
    <DrawerContext.Provider value={{ direction }}>
      {children}
    </DrawerContext.Provider>
  )
}

/* ===== Content ===== */
interface ContentProps extends Omit<ComponentPropsWithoutRef<'dialog'>, 'open'> {
  /** Controlled open state */
  open?: boolean
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Close when clicking outside the drawer (default: true) */
  closeOnOutsideClick?: boolean
  /**
   * Lock body scroll while this drawer is open (default: true).
   *
   * Set to `false` for the rare side-panel-allows-scroll case. The CSS-only
   * fallback (`overflow: hidden`) is also disabled for opted-out drawers.
   */
  scrollLock?: boolean
}

const Content = forwardRef<HTMLDialogElement, ContentProps>(
  ({ children, className, open, onOpenChange, closeOnOutsideClick = true, scrollLock = true, ...props }, ref) => {
    const { direction } = useDrawerContext()
    const internalRef = useRef<HTMLDialogElement>(null)
    const dialogRef = (ref as React.RefObject<HTMLDialogElement>) || internalRef

    useEffect(() => {
      const dialog = dialogRef.current
      if (!dialog) return

      if (open && !dialog.open) {
        dialog.showModal()
        onOpenChange?.(true)
      } else if (open === false && dialog.open) {
        dialog.close()
      }
    }, [open])

    return (
      <dialog
        ref={dialogRef}
        className={`drawer ${className ?? ''}`.trim()}
        data-direction={direction}
        data-scroll-lock={scrollLock ? undefined : 'false'}
        onClose={(e) => {
          // Only handle close event if it originated from THIS dialog
          // This prevents nested dialogs from triggering parent dialog closes
          if (e.target !== e.currentTarget) return

          props.onClose?.(e)
          onOpenChange?.(false)
        }}
        onClick={(e) => {
          props.onClick?.(e)
          // Backdrop click - only if clicking the dialog element itself
          if (closeOnOutsideClick && e.target === e.currentTarget) {
            e.currentTarget.close()
          }
        }}
        {...props}
      >
        {children}
      </dialog>
    )
  }
)
Content.displayName = 'Drawer.Content'

/* ===== Handle ===== */
interface HandleProps extends ComponentPropsWithoutRef<'div'> {}

const Handle = forwardRef<HTMLDivElement, HandleProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`drawer-handle ${className ?? ''}`.trim()}
    aria-hidden="true"
    {...props}
  />
))
Handle.displayName = 'Drawer.Handle'

/* ===== Title ===== */
interface TitleProps extends ComponentPropsWithoutRef<'h2'> {}

const Title = forwardRef<HTMLHeadingElement, TitleProps>((props, ref) => (
  <h2 ref={ref} {...props} />
))
Title.displayName = 'Drawer.Title'

/* ===== Description ===== */
interface DescriptionProps extends ComponentPropsWithoutRef<'p'> {}

const Description = forwardRef<HTMLParagraphElement, DescriptionProps>((props, ref) => (
  <p ref={ref} {...props} />
))
Description.displayName = 'Drawer.Description'

/* ===== Namespace Export ===== */
export const Drawer = {
  Root,
  Content,
  Handle,
  Title,
  Description,
}

export type {
  RootProps as DrawerRootProps,
  ContentProps as DrawerContentProps,
  HandleProps as DrawerHandleProps,
  TitleProps as DrawerTitleProps,
  DescriptionProps as DrawerDescriptionProps,
  Direction as DrawerDirection,
}
