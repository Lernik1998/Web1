import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Todo el CSS del sitio pesa muy poco (unos 25KB comprimido) repartido
    // en más de 20 archivos, uno por cada vista/componente cargado de
    // forma diferida. Cada archivo es una petición de red bloqueante más
    // antes de poder pintar la página -- con un sitio tan ligero, unirlos
    // en un único archivo (una sola petición) sale a cuenta frente a
    // ahorrarse el CSS de rutas no visitadas.
    cssCodeSplit: false,
  },
})
