# CSS Drawer

Vaul-quality drawer/bottom-sheet using native `<dialog>` and pure CSS animations.

- **Zero runtime positioning** - no JS in the animation path
- **Auto-nesting** - stacks up to 5 levels with no configuration
- **Mobile keyboard friendly** - uses `dvh` units, no transform positioning bugs
- **~3KB JS + ~5KB CSS** - tree-shakeable, framework-agnostic

## Install

```bash
pnpm add css-drawer
```

## Usage

### Import styles

```ts
import 'css-drawer/styles'
// or
import 'css-drawer/drawer.css'
```

### Vanilla JS

```ts
import { open, close } from 'css-drawer'

// Open by ID
open('my-drawer')

// Close
close('my-drawer')
```

```html
<dialog class="drawer" id="my-drawer">
  <div class="drawer-handle"></div>
  <div class="drawer-content">
    <h2>Hello</h2>
    <button onclick="this.closest('dialog').close()">Close</button>
  </div>
</dialog>
```

### React

```tsx
import { useRef } from 'react'
import { open, close, props } from 'css-drawer'
import 'css-drawer/styles'

function MyDrawer() {
  const ref = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button onClick={() => ref.current?.showModal()}>Open</button>

      <dialog ref={ref} {...props('my-drawer')}>
        <div className="drawer-handle" />
        <div className="drawer-content">
          <h2>Hello from React</h2>
          <button onClick={() => ref.current?.close()}>Close</button>
        </div>
      </dialog>
    </>
  )
}
```

### Vue

```vue
<script setup lang="ts">
import { ref } from 'vue'
import 'css-drawer/styles'

const drawer = ref<HTMLDialogElement>()
</script>

<template>
  <button @click="drawer?.showModal()">Open</button>

  <dialog ref="drawer" class="drawer" @click.self="drawer?.close()">
    <div class="drawer-handle" />
    <div class="drawer-content">
      <h2>Hello from Vue</h2>
    </div>
  </dialog>
</template>
```

## Auto-Nesting

Drawers automatically stack when opened. No `data-level` attributes needed.

```html
<!-- Just make them siblings, CSS handles the rest -->
<dialog class="drawer" id="drawer-1">...</dialog>
<dialog class="drawer" id="drawer-2">...</dialog>
<dialog class="drawer" id="drawer-3">...</dialog>
```

When drawer-2 opens while drawer-1 is open, drawer-1 scales down and dims. Works up to 5 levels.

## API

```ts
// Open/close
open(idOrElement)
close(idOrElement)
closeAll()

// State
isOpen(idOrElement): boolean
getOpen(): HTMLDialogElement[]
getTop(): HTMLDialogElement | null

// Create programmatically
create({ id?, content?, handle?, className? }): HTMLDialogElement
mount(drawer): HTMLDialogElement
unmount(idOrElement)

// Events
subscribe(drawer, { onOpen?, onClose?, onCancel? }): () => void

// Global backdrop-click-to-close
init(): () => void

// React helper
props(id): { id, className, onClick }
```

## CSS Custom Properties

```css
:root {
  --drawer-bg: #fff;
  --drawer-radius: 24px;
  --drawer-max-width: 500px;
  --drawer-max-height: 96dvh;
  --drawer-backdrop: hsl(0 0% 0% / 0.4);
  --drawer-handle: hsl(0 0% 80%);
  --drawer-shadow: 0 -10px 60px hsl(0 0% 0% / 0.12);
  --drawer-duration: 0.5s;
  --drawer-duration-close: 0.35s;
  --drawer-ease: cubic-bezier(0.32, 0.72, 0, 1);
}
```

## Browser Support

- Chrome 117+
- Safari 17.5+
- Firefox 129+

Uses `@starting-style`, `:has()`, `allow-discrete`, and `dvh` units.

## License

MIT
