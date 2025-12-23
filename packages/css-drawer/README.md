# CSS Drawer

A near drop-in replacement for [Vaul](https://vaul.emilkowal.ski) using native `<dialog>` and pure CSS animations.

**Zero JavaScript animations.** The only JS: `dialog.showModal()` and `dialog.close()`.

## Why?

| Feature | Vaul | CSS Drawer |
|---------|------|------------|
| Bundle size | ~12KB | **1.4KB** JS + 8KB CSS (gzip: ~2.5KB total) |
| Animation engine | JavaScript | Pure CSS |
| Nesting | Manual setup | Automatic (CSS `:has()`) |
| Accessibility | Built-in | Automatic (native `<dialog>` + `inert`) |
| API | Controlled state | Native refs or controlled state |

## Installation

```bash
npm install css-drawer
```

---

## Quick Start

### React (Recommended)

```tsx
import { useRef } from 'react'
import { Drawer } from 'css-drawer/react'

function App() {
  const ref = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button onClick={() => ref.current?.showModal()}>
        Open
      </button>

      <Drawer.Root>
        <Drawer.Content ref={ref}>
          <Drawer.Handle />
          <div className="drawer-content">
            <Drawer.Title>Title</Drawer.Title>
            <Drawer.Description>Description</Drawer.Description>
            <button onClick={() => ref.current?.close()}>Close</button>
          </div>
        </Drawer.Content>
      </Drawer.Root>
    </>
  )
}
```

### Vanilla JS

```ts
import { open, close } from 'css-drawer'
import 'css-drawer/styles'

document.querySelector('#open-btn').onclick = () => open('my-drawer')
```

```html
<button id="open-btn">Open</button>

<dialog class="drawer" id="my-drawer">
  <div class="drawer-handle"></div>
  <div className="drawer-content">
    <h2>Title</h2>
    <p>Description</p>
    <button onclick="this.closest('dialog').close()">Close</button>
  </div>
</dialog>
```

---

## React API

### Installation

```tsx
import { Drawer } from 'css-drawer/react'
// Styles are auto-injected
```

### Drawer.Root

Provides context for direction. Wrap your drawer content.

```tsx
<Drawer.Root direction="right">
  <Drawer.Content ref={ref}>...</Drawer.Content>
</Drawer.Root>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'bottom' \| 'top' \| 'left' \| 'right'` | `'bottom'` | Direction the drawer opens from |
| `children` | `ReactNode` | - | Drawer content |

### Drawer.Content

The dialog element. Supports both uncontrolled (refs) and controlled (state) modes.

> **Note:** `open`/`onOpenChange` props are on `Content`, not `Root`. This is intentional - `Content` wraps the native `<dialog>` element, so open/close control lives where the element lives. `Root` only provides configuration (direction).

#### Uncontrolled Mode (Refs)

```tsx
const ref = useRef<HTMLDialogElement>(null)

// Open
ref.current?.showModal()

// Close
ref.current?.close()

<Drawer.Content ref={ref}>...</Drawer.Content>
```

#### Controlled Mode (State)

```tsx
const [isOpen, setIsOpen] = useState(false)

<Drawer.Content open={isOpen} onOpenChange={setIsOpen}>
  ...
</Drawer.Content>

// Open programmatically
<button onClick={() => setIsOpen(true)}>Open</button>
```

The `onOpenChange` callback fires when:
- User presses Escape
- User clicks the backdrop (if `closeOnOutsideClick` is true)
- You call `setIsOpen(false)`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ref` | `Ref<HTMLDialogElement>` | - | Ref to control the dialog (uncontrolled mode) |
| `open` | `boolean` | - | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | - | Called when open state changes |
| `closeOnOutsideClick` | `boolean` | `true` | Close when clicking outside the drawer |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `DialogHTMLAttributes` | - | All native dialog props |

### Drawer.Handle

Visual drag handle indicator.

```tsx
<Drawer.Handle />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |

### Drawer.Title

Semantic heading for accessibility.

```tsx
<Drawer.Title>Create Issue</Drawer.Title>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `...props` | `HTMLAttributes<HTMLHeadingElement>` | - | All native h2 props |

### Drawer.Description

Semantic description for accessibility.

```tsx
<Drawer.Description>Fill out the form below.</Drawer.Description>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `...props` | `HTMLAttributes<HTMLParagraphElement>` | - | All native p props |

---

## Vanilla JS API

### Installation

```ts
import { open, close, closeAll } from 'css-drawer'
import 'css-drawer/styles'
```

### open(drawer)

Opens a drawer by ID or element reference.

```ts
open('my-drawer')
open(document.getElementById('my-drawer'))
```

| Param | Type | Description |
|-------|------|-------------|
| `drawer` | `string \| HTMLDialogElement` | Drawer ID or element |

### close(drawer)

Closes a drawer by ID or element reference.

```ts
close('my-drawer')
```

| Param | Type | Description |
|-------|------|-------------|
| `drawer` | `string \| HTMLDialogElement` | Drawer ID or element |

### closeAll()

Closes all open drawers in reverse order (top to bottom).

```ts
closeAll()
```

### isOpen(drawer)

Returns whether a drawer is open.

```ts
if (isOpen('my-drawer')) {
  // ...
}
```

| Param | Type | Description |
|-------|------|-------------|
| `drawer` | `string \| HTMLDialogElement` | Drawer ID or element |

**Returns:** `boolean`

### getOpen()

Returns all currently open drawers.

```ts
const openDrawers = getOpen()
```

**Returns:** `HTMLDialogElement[]`

### getTop()

Returns the topmost open drawer.

```ts
const topDrawer = getTop()
topDrawer?.close()
```

**Returns:** `HTMLDialogElement | null`

### create(options)

Creates a drawer element programmatically.

```ts
const drawer = create({
  id: 'my-drawer',
  content: '<h2>Hello</h2>',
  handle: true,
  className: 'custom-class'
})

mount(drawer)
open(drawer)
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `string` | - | Drawer ID |
| `content` | `string` | `''` | HTML content |
| `handle` | `boolean` | `true` | Include drag handle |
| `className` | `string` | `''` | Additional CSS classes |
| `closeOnOutsideClick` | `boolean` | `true` | Close when clicking outside |

**Returns:** `HTMLDialogElement`

### mount(drawer)

Appends a drawer to the document body.

```ts
const drawer = create({ id: 'my-drawer' })
mount(drawer)
```

| Param | Type | Description |
|-------|------|-------------|
| `drawer` | `HTMLDialogElement` | Drawer element |

**Returns:** `HTMLDialogElement`

### unmount(drawer)

Removes a drawer from the DOM.

```ts
unmount('my-drawer')
```

| Param | Type | Description |
|-------|------|-------------|
| `drawer` | `string \| HTMLDialogElement` | Drawer ID or element |

### subscribe(drawer, handlers)

Subscribe to drawer events.

```ts
const unsubscribe = subscribe('my-drawer', {
  onOpen: () => console.log('Opened'),
  onClose: () => console.log('Closed'),
  onCancel: () => console.log('Cancelled (Escape/backdrop)')
})

// Later
unsubscribe()
```

| Param | Type | Description |
|-------|------|-------------|
| `drawer` | `string \| HTMLDialogElement` | Drawer ID or element |
| `handlers.onOpen` | `() => void` | Called when drawer opens |
| `handlers.onClose` | `() => void` | Called when drawer closes |
| `handlers.onCancel` | `() => void` | Called on Escape or backdrop click |

**Returns:** `() => void` (cleanup function)

---

## Directions

### React

```tsx
<Drawer.Root direction="right">
  <Drawer.Content ref={ref}>...</Drawer.Content>
</Drawer.Root>
```

### Vanilla

```html
<dialog class="drawer" data-direction="right">...</dialog>
```

### Responsive Direction

```tsx
const isMobile = useMediaQuery('(max-width: 768px)')

<Drawer.Root direction={isMobile ? 'bottom' : 'right'}>
  ...
</Drawer.Root>
```

| Direction | Description |
|-----------|-------------|
| `bottom` | Opens from bottom (default) |
| `top` | Opens from top |
| `left` | Opens from left |
| `right` | Opens from right |

---

## Auto-Nesting

Drawers automatically stack when opened. No configuration needed.

### With Refs

```tsx
const drawer1 = useRef<HTMLDialogElement>(null)
const drawer2 = useRef<HTMLDialogElement>(null)

// Open drawer1
drawer1.current?.showModal()

// Open drawer2 on top
drawer2.current?.showModal()
// drawer1 automatically scales down and dims
```

### With Controlled State

```tsx
const [settingsOpen, setSettingsOpen] = useState(false)
const [confirmOpen, setConfirmOpen] = useState(false)

<>
  <button onClick={() => setSettingsOpen(true)}>Settings</button>

  <Drawer.Root>
    <Drawer.Content open={settingsOpen} onOpenChange={setSettingsOpen}>
      <button onClick={() => setConfirmOpen(true)}>Delete Account</button>
    </Drawer.Content>
  </Drawer.Root>

  <Drawer.Root>
    <Drawer.Content open={confirmOpen} onOpenChange={setConfirmOpen}>
      <button onClick={() => {
        setConfirmOpen(false)
        setSettingsOpen(false)
      }}>
        Confirm
      </button>
    </Drawer.Content>
  </Drawer.Root>
</>
```

Works up to 5 levels. CSS `:has()` selectors handle the visual stacking.

---

## Accessibility

Accessibility is automatic:

- **Focus trapping**: Native `<dialog>` traps focus
- **Escape to close**: Native `<dialog>` behavior
- **Stacked drawers**: Underlying drawers get `inert` attribute automatically
- **Screen readers**: Only the top drawer is accessible

No setup required.

---

## Preventing Outside Click Close

By default, clicking the backdrop closes the drawer. Disable this for forms or when accidental dismissal could cause data loss.

### React

```tsx
<Drawer.Content ref={ref} closeOnOutsideClick={false}>
  {/* Form content - won't close on backdrop click */}
</Drawer.Content>
```

### Vanilla JS

```ts
const drawer = create({
  id: 'form-drawer',
  closeOnOutsideClick: false
})
```

### Vanilla HTML

```html
<dialog class="drawer" data-close-on-outside-click="false">
  <!-- Won't close on backdrop click -->
</dialog>
```

> **Note:** Users can still close with Escape key (native dialog behavior) or explicit close buttons.

---

## Theming

### CSS Custom Properties

Override any of these CSS custom properties to customize the drawer:

```css
:root {
  /* Visual */
  --drawer-bg: #fff;
  --drawer-radius: 24px;
  --drawer-backdrop: hsl(0 0% 0% / 0.4);
  --drawer-backdrop-blur: 4px;

  /* Sizing */
  --drawer-max-width: 500px;
  --drawer-max-height: 96dvh;

  /* Handle */
  --drawer-handle-bg: hsl(0 0% 80%);
  --drawer-handle-bg-hover: hsl(0 0% 60%);
  --drawer-handle-width: 48px;
  --drawer-handle-width-hover: 56px;
  --drawer-handle-height: 5px;
  --drawer-handle-padding-block: 1rem 0.5rem;
  --drawer-handle-padding-inline: 0;

  /* Shadows */
  --drawer-shadow-bottom: 0 -10px 60px hsl(0 0% 0% / 0.12), 0 -4px 20px hsl(0 0% 0% / 0.08);
  --drawer-shadow-top: 0 10px 60px hsl(0 0% 0% / 0.12), 0 4px 20px hsl(0 0% 0% / 0.08);
  --drawer-shadow-right: -10px 0 60px hsl(0 0% 0% / 0.12), -4px 0 20px hsl(0 0% 0% / 0.08);
  --drawer-shadow-left: 10px 0 60px hsl(0 0% 0% / 0.12), 4px 0 20px hsl(0 0% 0% / 0.08);

  /* Animation */
  --drawer-duration: 0.5s;
  --drawer-duration-close: 0.35s;
  --drawer-ease: cubic-bezier(0.32, 0.72, 0, 1);

  /* Nesting effects */
  --drawer-nested-scale: 0.94;
  --drawer-nested-offset: 20px;
  --drawer-nested-brightness: 0.92;
  --drawer-nested-backdrop: hsl(0 0% 0% / 0.15);
}
```

### All Variables Reference

#### Visual

| Variable | Default (Light) | Default (Dark) | Description |
|----------|-----------------|----------------|-------------|
| `--drawer-bg` | `#fff` | `hsl(0 0% 12%)` | Background color |
| `--drawer-radius` | `24px` | Same | Base border radius value |
| `--drawer-border-radius` | Direction-based | Same | Full border-radius override (e.g., `16px 16px 0 0`) |
| `--drawer-backdrop` | `hsl(0 0% 0% / 0.4)` | Same | Backdrop overlay color |
| `--drawer-backdrop-blur` | `4px` | Same | Backdrop blur amount |

#### Sizing

| Variable | Default | Description |
|----------|---------|-------------|
| `--drawer-max-width` | `500px` | Maximum width |
| `--drawer-max-height` | `96dvh` | Maximum height (uses dynamic viewport) |

#### Handle

| Variable | Default (Light) | Default (Dark) | Description |
|----------|-----------------|----------------|-------------|
| `--drawer-handle-bg` | `hsl(0 0% 80%)` | `hsl(0 0% 35%)` | Handle background color |
| `--drawer-handle-bg-hover` | `hsl(0 0% 60%)` | `hsl(0 0% 50%)` | Handle hover color |
| `--drawer-handle-width` | `48px` | Same | Handle width |
| `--drawer-handle-width-hover` | `56px` | Same | Handle width on hover |
| `--drawer-handle-height` | `5px` | Same | Handle height/thickness |
| `--drawer-handle-padding-block` | `1rem 0.5rem` | Same | Handle vertical padding |
| `--drawer-handle-padding-inline` | `0` | Same | Handle horizontal padding |

#### Shadows

| Variable | Default (Light) | Default (Dark) |
|----------|-----------------|----------------|
| `--drawer-shadow-bottom` | `0 -10px 60px hsl(0 0% 0% / 0.12), ...` | Darker |
| `--drawer-shadow-top` | `0 10px 60px hsl(0 0% 0% / 0.12), ...` | Darker |
| `--drawer-shadow-left` | `10px 0 60px hsl(0 0% 0% / 0.12), ...` | Darker |
| `--drawer-shadow-right` | `-10px 0 60px hsl(0 0% 0% / 0.12), ...` | Darker |

#### Animation

| Variable | Default | Description |
|----------|---------|-------------|
| `--drawer-duration` | `0.5s` | Open animation duration |
| `--drawer-duration-close` | `0.35s` | Close animation duration |
| `--drawer-ease` | `cubic-bezier(0.32, 0.72, 0, 1)` | Animation easing curve |

#### Nesting Effects

| Variable | Default | Description |
|----------|---------|-------------|
| `--drawer-nested-scale` | `0.94` | Scale factor for stacked drawers |
| `--drawer-nested-offset` | `20px` | Vertical offset per nesting level |
| `--drawer-nested-brightness` | `0.92` | Brightness multiplier for stacked drawers |
| `--drawer-nested-backdrop` | `hsl(0 0% 0% / 0.15)` | Backdrop color for nested drawers |

### Dark Mode

Dark mode is automatic via `prefers-color-scheme`. Override for manual control:

```css
/* Force dark mode */
.dark .drawer,
[data-theme="dark"] .drawer {
  --drawer-bg: hsl(0 0% 12%);
  --drawer-handle-bg: hsl(0 0% 35%);
  --drawer-handle-bg-hover: hsl(0 0% 50%);
  --drawer-shadow-bottom: 0 -10px 60px hsl(0 0% 0% / 0.4), 0 -4px 20px hsl(0 0% 0% / 0.3);
}
```

### Tailwind CSS v4

CSS Drawer works with Tailwind v4. Use CSS custom properties in your theme:

```css
@import "tailwindcss";

@layer base {
  :root {
    --drawer-bg: var(--color-white);
    --drawer-radius: var(--radius-2xl);
    --drawer-handle-bg: var(--color-zinc-300);
    --drawer-backdrop: oklch(0% 0 0 / 0.4);
  }

  .dark {
    --drawer-bg: var(--color-zinc-900);
    --drawer-handle-bg: var(--color-zinc-600);
  }
}
```

You can also pass Tailwind classes directly to components:

```tsx
<Drawer.Content ref={ref} className="bg-white dark:bg-zinc-900">
  <Drawer.Handle className="bg-zinc-300 dark:bg-zinc-600" />
  <div className="drawer-content">
    <Drawer.Title className="text-xl font-semibold">Title</Drawer.Title>
  </div>
</Drawer.Content>
```

> **Note:** Base drawer styles have equal specificity to Tailwind utilities. For guaranteed overrides, use CSS custom properties or increase specificity with a wrapper class.

### Tailwind CSS v3

For Tailwind v3, use the `theme()` function in your CSS:

```css
@layer base {
  :root {
    --drawer-bg: theme('colors.white');
    --drawer-radius: theme('borderRadius.2xl');
    --drawer-handle-bg: theme('colors.zinc.300');
  }

  .dark {
    --drawer-bg: theme('colors.zinc.900');
    --drawer-handle-bg: theme('colors.zinc.600');
  }
}
```

### Per-Drawer Customization

Override variables on individual drawers:

```tsx
<Drawer.Content
  ref={ref}
  style={{
    '--drawer-bg': '#f0f0f0',
    '--drawer-radius': '16px',
    '--drawer-max-width': '400px'
  } as React.CSSProperties}
>
  ...
</Drawer.Content>
```

```html
<!-- Vanilla HTML -->
<dialog
  class="drawer"
  style="--drawer-bg: #f0f0f0; --drawer-radius: 16px;"
>
  ...
</dialog>
```

### Custom Border Radius

By default, border radius is direction-aware (e.g., bottom drawer rounds top corners). Override with `--drawer-border-radius` for full control:

```tsx
{/* Round all corners */}
<Drawer.Content
  ref={ref}
  style={{ '--drawer-border-radius': '16px' } as React.CSSProperties}
>

{/* Asymmetric corners */}
<Drawer.Content
  ref={ref}
  style={{ '--drawer-border-radius': '24px 24px 8px 8px' } as React.CSSProperties}
>
```

```html
<!-- No rounded corners -->
<dialog class="drawer" style="--drawer-border-radius: 0;">
  ...
</dialog>
```

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.drawer` | Required on the dialog element |
| `.drawer-handle` | Visual drag handle |
| `.drawer-content` | Scrollable content area (structural only - add your own padding) |

> **Note:** The `.drawer-content` class is intentionally unopinionated - it only provides scroll behavior (`overflow-y: auto`, `overscroll-behavior: contain`). Add your own padding to match your design system.

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 117+ |
| Safari | 17.5+ |
| Firefox | 129+ |

Uses `@starting-style`, `:has()`, `allow-discrete`, and `dvh` units.

---

## TypeScript

Full TypeScript support included.

```tsx
import {
  Drawer,
  type DrawerRootProps,
  type DrawerContentProps,
  type DrawerDirection
} from 'css-drawer/react'

import {
  open,
  close,
  type DrawerElement,
  type DrawerRef
} from 'css-drawer'
```

---

## License

MIT
