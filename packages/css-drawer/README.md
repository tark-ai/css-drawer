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
| API | Controlled state | Native refs |

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

The dialog element. Pass a ref to control open/close.

```tsx
const ref = useRef<HTMLDialogElement>(null)

// Open
ref.current?.showModal()

// Close
ref.current?.close()

<Drawer.Content ref={ref}>...</Drawer.Content>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ref` | `Ref<HTMLDialogElement>` | - | Ref to control the dialog |
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

```tsx
const drawer1 = useRef<HTMLDialogElement>(null)
const drawer2 = useRef<HTMLDialogElement>(null)

// Open drawer1
drawer1.current?.showModal()

// Open drawer2 on top
drawer2.current?.showModal()
// drawer1 automatically scales down and dims
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

## CSS Customization

Override CSS custom properties:

```css
:root {
  --drawer-bg: #fff;
  --drawer-radius: 24px;
  --drawer-max-width: 500px;
  --drawer-max-height: 96dvh;
  --drawer-backdrop: hsl(0 0% 0% / 0.4);
  --drawer-handle: hsl(0 0% 80%);
  --drawer-duration: 0.5s;
  --drawer-duration-close: 0.35s;
  --drawer-ease: cubic-bezier(0.32, 0.72, 0, 1);
}
```

| Variable | Default | Description |
|----------|---------|-------------|
| `--drawer-bg` | `#fff` | Background color |
| `--drawer-radius` | `24px` | Border radius |
| `--drawer-max-width` | `500px` | Maximum width |
| `--drawer-max-height` | `96dvh` | Maximum height |
| `--drawer-backdrop` | `hsl(0 0% 0% / 0.4)` | Backdrop color |
| `--drawer-handle` | `hsl(0 0% 80%)` | Handle color |
| `--drawer-duration` | `0.5s` | Open animation duration |
| `--drawer-duration-close` | `0.35s` | Close animation duration |
| `--drawer-ease` | `cubic-bezier(0.32, 0.72, 0, 1)` | Animation easing |

Dark mode is automatic via `prefers-color-scheme`.

---

## CSS Classes

| Class | Description |
|-------|-------------|
| `.drawer` | Required on the dialog element |
| `.drawer-handle` | Visual drag handle |
| `.drawer-content` | Scrollable content area |

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
