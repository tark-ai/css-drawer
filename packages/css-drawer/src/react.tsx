import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  type ReactNode,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type RefObject,
} from 'react'

/* ===== Types ===== */
type Direction = 'bottom' | 'top' | 'left' | 'right'

interface DrawerContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
  direction?: Direction
  dialogRef: RefObject<HTMLDialogElement | null>
}

/* ===== Context ===== */
const DrawerContext = createContext<DrawerContextValue | null>(null)

function useDrawerContext() {
  const ctx = useContext(DrawerContext)
  if (!ctx) throw new Error('Drawer components must be used within Drawer.Root')
  return ctx
}

/* ===== Root ===== */
interface RootProps {
  children: ReactNode
  /** Controlled open state */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean
  /** Direction the drawer opens from */
  direction?: Direction
  /** Whether to use modal behavior (default: true) */
  modal?: boolean
}

function Root({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultOpen = false,
  direction,
  modal = true,
}: RootProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const onOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!isControlled) setUncontrolledOpen(newOpen)
      controlledOnOpenChange?.(newOpen)
    },
    [isControlled, controlledOnOpenChange]
  )

  // Sync dialog state with open prop
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      modal ? dialog.showModal() : dialog.show()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open, modal])

  // Listen for native close events (Escape, form submission, backdrop click)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleClose = () => onOpenChange(false)
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onOpenChange])

  return (
    <DrawerContext.Provider value={{ open, onOpenChange, direction, dialogRef }}>
      {children}
    </DrawerContext.Provider>
  )
}

/* ===== Trigger ===== */
interface TriggerProps extends ComponentPropsWithoutRef<'button'> {}

const Trigger = forwardRef<HTMLButtonElement, TriggerProps>(
  ({ children, onClick, ...props }, ref) => {
    const { onOpenChange } = useDrawerContext()

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      onClick?.(e)
      if (!e.defaultPrevented) onOpenChange(true)
    }

    return (
      <button ref={ref} type="button" onClick={handleClick} {...props}>
        {children}
      </button>
    )
  }
)
Trigger.displayName = 'Drawer.Trigger'

/* ===== Content ===== */
interface ContentProps extends Omit<ComponentPropsWithoutRef<'dialog'>, 'open'> {
  /** Called when animation ends */
  onAnimationEnd?: () => void
}

const Content = forwardRef<HTMLDialogElement, ContentProps>(
  ({ children, className, onClick, ...props }, forwardedRef) => {
    const { dialogRef, direction, onOpenChange } = useDrawerContext()

    const handleClick = (e: MouseEvent<HTMLDialogElement>) => {
      onClick?.(e)
      // Backdrop click - only if clicking the dialog element itself
      if (e.target === e.currentTarget) {
        onOpenChange(false)
      }
    }

    return (
      <dialog
        ref={(node) => {
          // Handle forwarded ref
          if (typeof forwardedRef === 'function') forwardedRef(node)
          else if (forwardedRef) forwardedRef.current = node
          // Handle internal ref
          if (dialogRef && 'current' in dialogRef) {
            (dialogRef as { current: HTMLDialogElement | null }).current = node
          }
        }}
        className={`drawer ${className ?? ''}`.trim()}
        data-direction={direction}
        onClick={handleClick}
        {...props}
      >
        {children}
      </dialog>
    )
  }
)
Content.displayName = 'Drawer.Content'

/* ===== Close ===== */
interface CloseProps extends ComponentPropsWithoutRef<'button'> {}

const Close = forwardRef<HTMLButtonElement, CloseProps>(
  ({ children, onClick, ...props }, ref) => {
    const { onOpenChange } = useDrawerContext()

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      onClick?.(e)
      if (!e.defaultPrevented) onOpenChange(false)
    }

    return (
      <button ref={ref} type="button" onClick={handleClick} {...props}>
        {children}
      </button>
    )
  }
)
Close.displayName = 'Drawer.Close'

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
  Trigger,
  Content,
  Close,
  Handle,
  Title,
  Description,
}

export type {
  RootProps as DrawerRootProps,
  TriggerProps as DrawerTriggerProps,
  ContentProps as DrawerContentProps,
  CloseProps as DrawerCloseProps,
  HandleProps as DrawerHandleProps,
  TitleProps as DrawerTitleProps,
  DescriptionProps as DrawerDescriptionProps,
  Direction as DrawerDirection,
}
