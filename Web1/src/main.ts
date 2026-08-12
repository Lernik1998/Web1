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

import './styles/tokens.css'
import './styles/typography.css'
import './styles/global.css'

const app = createApp(App)

app.use(router)
app.directive('animate-on-scroll', animateOnScroll)
app.directive('spotlight', spotlight)
app.directive('ripple', ripple)

app.mount('#app')
