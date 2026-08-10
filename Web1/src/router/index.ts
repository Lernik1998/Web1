import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/sobre-mi',
      name: 'sobre-mi',
      component: () => import('../views/About/AboutView.vue'),
    },
    {
      path: '/equipo',
      name: 'equipo',
      component: () => import('../views/EquipoView.vue'),
    },
    {
      path: '/equipo/:slug',
      name: 'team-member',
      component: () => import('../views/TeamMemberView.vue'),
      props: true,
    },
    {
      path: '/terapias',
      name: 'terapias',
      redirect: '/terapias/infantil',
      children: [
        {
          path: 'infantil',
          name: 'infantil',
          component: () => import('../views/terapias/InfantilView.vue'),
        },
        {
          path: 'adolescentes',
          name: 'adolescentes',
          component: () => import('../views/terapias/AdolescentesView.vue'),
        },
        {
          path: 'adultos',
          name: 'adultos',
          component: () => import('../views/terapias/AdultosView.vue'),
        },
        {
          path: 'adultos/ansiedad',
          name: 'ansiedad',
          component: () => import('../views/terapias/adultos/AnsiedadView.vue'),
        },
        {
          path: 'adultos/depresion',
          name: 'depresion',
          component: () => import('../views/terapias/adultos/DepresionView.vue'),
        },
        {
          path: 'adultos/autoestima',
          name: 'autoestima',
          component: () => import('../views/terapias/adultos/AutoestimaView.vue'),
        },
        {
          path: 'adultos/duelo',
          name: 'duelo',
          component: () => import('../views/terapias/adultos/DueloView.vue'),
        },
        {
          path: 'padres-familia',
          name: 'padres-familia',
          component: () => import('../views/terapias/PadresFamiliaView.vue'),
        },
      ],
    },
    {
      path: '/para-psicologos',
      name: 'para-psicologos',
      component: () => import('../views/ParaPsicologosView.vue'),
    },
    {
      path: '/blog',
      name: 'blog',
      component: () => import('../views/BlogView.vue'),
    },
    {
      path: '/blog/:slug',
      name: 'blog-post',
      component: () => import('../views/BlogPostView.vue'),
      props: true,
    },
    {
      path: '/pedir-cita',
      name: 'pedir-cita',
      component: () => import('../views/PedirCitaView.vue'),
    },
    {
      path: '/politica-privacidad',
      name: 'politica-privacidad',
      component: () => import('../views/Legal/PoliticaPrivacidadView.vue'),
    },
    {
      path: '/aviso-legal',
      name: 'aviso-legal',
      component: () => import('../views/Legal/AvisoLegalView.vue'),
    },
    {
      path: '/politica-cookies',
      name: 'politica-cookies',
      component: () => import('../views/Legal/PoliticaCookiesView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

export default router
