import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { animateOnScroll } from './directives/animateOnScroll'
import { spotlight } from './directives/spotlight'
import { ripple } from './directives/ripple'

// Tipografías alojadas localmente (antes se pedían a fonts.googleapis.com):
// evita esa petición externa bloqueante y su ida y vuelta de red aparte, que
// Lighthouse señalaba como el mayor origen de retraso en el primer pintado.
// Solo se importan los pesos/estilos que de verdad usa typography.css.
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/fraunces/400.css'
import '@fontsource/fraunces/600.css'
import '@fontsource/fraunces/400-italic.css'
import './styles/fonts-override.css'

import './styles/tokens.css'
import './styles/typography.css'
import './styles/global.css'

const app = createApp(App)

app.use(router)
app.directive('animate-on-scroll', animateOnScroll)
app.directive('spotlight', spotlight)
app.directive('ripple', ripple)

// Si este HTML viene del pre-renderizado (scripts/prerender.mjs), ya trae
// incrustados los datos que se pidieron a la API al generarlo: se leen aquí,
// de forma síncrona y antes de montar, para que useHydratedAsync() pueda
// arrancar cada vista ya con el contenido real en el primer render, sin
// volver a pedirlo. Ver src/utils/hydration.ts.
const hydrationEl = document.getElementById('kb-hydration-data')
if (hydrationEl?.textContent) {
  try {
    window.__KB_HYDRATION__ = JSON.parse(hydrationEl.textContent)
  } catch {
    // HTML corrupto o manipulado: se ignora y la app hace fetch normal, como siempre.
  }
}

// Todas las rutas son "lazy" (`() => import(...)`, ver router/index.ts): sin
// esperar aquí, app.mount() sustituye de golpe el HTML ya pintado del
// pre-renderizado por un <router-view> todavía vacío (el chunk de la vista
// real aún no ha terminado de descargarse), y solo segundos después ese
// chunk llega y el contenido aparece de golpe -- un salto de layout aparte,
// mayor que cualquier otro, y evitable: router.isReady() no resuelve hasta
// que la navegación inicial (con su chunk) esté lista, así que esperarlo
// aquí hace que el primer pintado real del cliente ya salga completo.
//
// El `.catch()`: router.isReady() puede rechazar (p. ej. el chunk de la
// ruta ya no existe en el servidor porque hay un despliegue más reciente --
// alguien tenía la pestaña abierta desde antes de esa actualización). Sin
// este manejo, app.mount() nunca se llegaba a ejecutar: la página se
// quedaba congelada mostrando solo el HTML pre-renderizado, sin ninguna
// interactividad, sin ningún aviso visible para nadie. Recargar una vez
// trae el index.html actual (con las referencias a los chunks correctas);
// si el fallo persistiera igualmente, se monta la app tal cual antes que
// dejarla muerta del todo.
const RELOAD_ONCE_FLAG = 'kb-reload-after-router-error'
router
  .isReady()
  .then(() => {
    sessionStorage.removeItem(RELOAD_ONCE_FLAG)
    app.mount('#app')
  })
  .catch((err) => {
    console.error('Error preparando la navegación inicial:', err)
    if (!sessionStorage.getItem(RELOAD_ONCE_FLAG)) {
      sessionStorage.setItem(RELOAD_ONCE_FLAG, '1')
      location.reload()
    } else {
      app.mount('#app')
    }
  })
