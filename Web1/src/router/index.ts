import { createRouter, createWebHistory } from 'vue-router'
import { ADULT_THERAPIES } from '../data/adultTherapies.mjs'

// Un componente por cada slug de `ADULT_THERAPIES` (../data/adultTherapies.mjs).
// No se genera dinámicamente a partir del slug porque `import()` necesita una
// ruta de fichero literal para que Vite pueda trocear cada vista en su propio
// chunk -- así que una terapia nueva sí requiere añadir su entrada aquí, además
// de la entrada en `ADULT_THERAPIES` y crear el fichero de la vista.
const ADULT_THERAPY_COMPONENTS = {
  ansiedad: () => import('../views/terapias/adultos/AnsiedadView.vue'),
  depresion: () => import('../views/terapias/adultos/DepresionView.vue'),
  autoestima: () => import('../views/terapias/adultos/AutoestimaView.vue'),
  duelo: () => import('../views/terapias/adultos/DueloView.vue'),
} as const

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
        ...ADULT_THERAPIES.map((therapy) => ({
          path: `adultos/${therapy.slug}`,
          name: therapy.slug,
          component:
            ADULT_THERAPY_COMPONENTS[therapy.slug as keyof typeof ADULT_THERAPY_COMPONENTS],
        })),
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
    // Prefijo propio ("pagina", con dos segmentos), no "/blog/:page(\\d+)":
    // así no hay ninguna ambigüedad posible con "/blog/:slug" de abajo (un
    // artículo real nunca tendrá como slug justo "pagina").
    {
      path: '/blog/pagina/:page(\\d+)',
      name: 'blog-pagina',
      component: () => import('../views/BlogView.vue'),
      props: true,
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
