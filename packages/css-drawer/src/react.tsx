import {
  createContext,
  useContext,
  forwardRef,
  type ReactNode,
  type ComponentPropsWithoutRef,
} from 'react'
import './drawer.css'

/* ===== Auto-enable accessibility for stacked drawers ===== */
if (typeof window !== 'undefined') {
  const updateInertState = () => {
    const openDrawers = Array.from(
      document.querySelectorAll<HTMLDialogElement>('dialog.drawer[open]')
    )
    openDrawers.forEach((drawer, index) => {
      const isTopmost = index === openDrawers.length - 1
      if (isTopmost) {
        drawer.removeAttribute('inert')
      } else {
        drawer.setAttribute('inert', '')
      }
    })
  }

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

  observer.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ['open'],
  })
}

/* ===== Types ===== */
type Direction = 'bottom' | 'top' | 'left' | 'right'

interface DrawerContextValue {
  direction?: Direction
}

/* ===== Context ===== */
const DrawerContext = createContext<DrawerContextValue>({ direction: undefined })

function useDrawerContext() {
  return useContext(DrawerContext)
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
interface ContentProps extends Omit<ComponentPropsWithoutRef<'dialog'>, 'open'> {}

const Content = forwardRef<HTMLDialogElement, ContentProps>(
  ({ children, className, ...props }, ref) => {
    const { direction } = useDrawerContext()

    return (
      <dialog
        ref={ref}
        className={`drawer ${className ?? ''}`.trim()}
        data-direction={direction}
        onClick={(e) => {
          props.onClick?.(e)
          // Backdrop click - only if clicking the dialog element itself
          if (e.target === e.currentTarget) {
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
