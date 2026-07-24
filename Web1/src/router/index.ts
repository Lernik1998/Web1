import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'inicio',
      component: () => import('../views/InicioView.vue'),
    },
    {
      path: '/sobre-nosotras',
      name: 'sobre-nosotras',
      redirect: '/sobre-nosotras/quienes-somos',
      children: [
        {
          path: 'quienes-somos',
          name: 'quienes-somos',
          component: () => import('../views/sobre-nosotras/QuienesSomosView.vue'),
        },
        {
          path: 'nuestra-filosofia',
          name: 'nuestra-filosofia',
          component: () => import('../views/sobre-nosotras/NuestraFilosofiaView.vue'),
        },
      ],
    },
    {
      path: '/terapia-online',
      name: 'terapia-online',
      redirect: '/terapia-online/como-funciona',
      children: [
        {
          path: 'como-funciona',
          name: 'como-funciona',
          component: () => import('../views/terapia-online/ComoFuncionaView.vue'),
        },
        {
          path: 'servicios',
          name: 'servicios',
          component: () => import('../views/terapia-online/ServiciosView.vue'),
        },
      ],
    },
    {
      path: '/pedir-cita',
      name: 'pedir-cita',
      component: () => import('../views/PedirCitaView.vue'),
    },
    {
      path: '/contacto',
      name: 'contacto',
      component: () => import('../views/legal/ContactaConNosotrosView.vue'),
    },
    {
      path: '/politica-privacidad',
      name: 'politica-privacidad',
      component: () => import('../views/legal/PoliticaPrivacidadView.vue'),
    },
    {
      path: '/aviso-legal',
      name: 'aviso-legal',
      component: () => import('../views/legal/AvisoLegalView.vue'),
    },
    {
      path: '/politica-cookies',
      name: 'politica-cookies',
      component: () => import('../views/legal/PoliticaCookiesView.vue'),
    },
  ],
})

export default router
