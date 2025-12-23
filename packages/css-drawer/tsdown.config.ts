import { defineConfig } from 'tsdown'
import injectCssPlugin from '@bosh-code/tsdown-plugin-inject-css'

export default defineConfig({
  entry: ['src/index.ts', 'src/react.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  plugins: [injectCssPlugin()],
})
