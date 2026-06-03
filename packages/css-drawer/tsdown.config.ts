import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/react.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  minify: true,
  // Mirror the source structure in dist/ instead of letting rolldown create
  // shared content-hashed chunks (e.g. observer-XXXXX.mjs). With a shared
  // chunk, tsdown hoists the `import "./drawer.css"` from both entry files
  // into that chunk to dedupe — but the chunk isn't in package.json's
  // `sideEffects` whitelist, so consumers who only use named exports that
  // don't reach the chunk's body get the CSS tree-shaken away. Keeping each
  // module standalone leaves the CSS import in the entry files themselves,
  // which ARE whitelisted, so every consumer reliably gets the styles.
  // CssOptions.splitting auto-flips to true under unbundle, keeping CSS
  // emission per-entry as well.
  unbundle: true,
  css: {
    inject: true,
  },
})
