import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import type { PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteConfig from './vite.config'

// Outside of Vite's dev server (i.e. under Vitest's SSR module runner),
// @vitejs/plugin-vue's default `transformAssetUrls` rewrites literal
// absolute template asset paths (e.g. `<img src="/images/foo.png">`, used
// for files in `public/`) into `new URL('/images/foo.png', import.meta.url)`.
// Vite-node then tries to resolve that as a real module import, which
// throws "ERR_INVALID_ARG_VALUE ... must be a file URL object" because the
// path isn't an actual importable asset — it's meant to be resolved by the
// browser at runtime, not bundled. We swap out vite.config.ts's `vue()`
// plugin instance for one with asset URL transformation disabled, instead
// of appending a second instance (which would run the template transform
// twice and corrupt the output).
const pluginsWithoutVue = ((viteConfig as { plugins?: PluginOption[] }).plugins ?? []).filter(
  (plugin) => !(plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === 'vite:vue'),
)

export default mergeConfig(
  defineConfig({
    ...viteConfig,
    plugins: [...pluginsWithoutVue, vue({ template: { transformAssetUrls: false } })],
  }),
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{vue,ts}'],
        exclude: [
          'src/**/__tests__/**',
          'src/main.ts',
          'src/**/*.d.ts',
        ],
      },
    },
  }),
)
