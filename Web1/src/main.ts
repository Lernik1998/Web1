import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { animateOnScroll } from './directives/animateOnScroll'
import { spotlight } from './directives/spotlight'
import { ripple } from './directives/ripple'

import './styles/tokens.css'
import './styles/typography.css'
import './styles/global.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.directive('animate-on-scroll', animateOnScroll)
app.directive('spotlight', spotlight)
app.directive('ripple', ripple)

app.mount('#app')
