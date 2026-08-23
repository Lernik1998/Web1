/**
 * Única fuente de datos de las terapias específicas dentro de "Psicología
 * para adultos" (Ansiedad, Depresión, Autoestima, Duelo). De aquí se derivan
 * automáticamente: el desplegable del menú (Header.vue), las rutas
 * (router/index.ts), los enlaces "relacionadas" de cada ficha, las tarjetas
 * de la portada (HomeView.vue), el sitemap, el pre-renderizado y el
 * llms.txt -- así que añadir una terapia nueva es: crear su vista (copiando
 * el patrón de una existente), añadir aquí una entrada, y registrar su
 * componente en `ADULT_THERAPY_COMPONENTS` (router/index.ts). Nada más
 * necesita tocarse a mano.
 *
 * JS liso (no .ts): así los scripts de build en Node (prerender.mjs,
 * generate-sitemap.mjs, generate-llms-txt.mjs), que se ejecutan directamente
 * con `node` sin pasar por Vite/tsc, pueden importar este mismo fichero sin
 * necesitar un compilador aparte. El lado Vue/TS lo importa igual gracias a
 * `allowJs` en tsconfig.app.json.
 *
 * @typedef {Object} AdultTherapy
 * @property {string} slug - Slug de la ruta ("/terapias/adultos/<slug>") y del `name` de la ruta en vue-router.
 * @property {string} wpSlug - Slug del custom post type "therapie" en WordPress (puede diferir del de la ruta).
 * @property {string} label - Texto mostrado en el menú, en "relacionadas" y en llms.txt.
 * @property {string} [imagePosition] - `object-position` CSS para su tarjeta en la portada, solo si la foto lo necesita.
 */

/** @type {AdultTherapy[]} */
export const ADULT_THERAPIES = [
  { slug: 'ansiedad', wpSlug: 'ansiedad', label: 'Ansiedad' },
  {
    slug: 'depresion',
    wpSlug: 'depresion-y-estado-de-animo',
    label: 'Depresión y estado de ánimo',
  },
  {
    slug: 'autoestima',
    wpSlug: 'autoestima-y-desarrollo-personal',
    label: 'Autoestima y desarrollo personal',
  },
  {
    slug: 'duelo',
    wpSlug: 'duelo-y-perdidas',
    label: 'Duelo y pérdidas',
    // Su foto en WordPress es vertical, con el punto de interés (las manos
    // entrelazadas) en la parte baja: con el recorte por defecto de la
    // tarjeta ("center 20%", pensado para fotos horizontales) las manos
    // quedaban fuera del encuadre.
    imagePosition: 'center 85%',
  },
]

/** @param {string} slug */
export function adultTherapyPath(slug) {
  return `/terapias/adultos/${slug}`
}

/**
 * Las terapias de adultos "hermanas" de `currentSlug` (todas menos ella
 * misma), en el mismo orden que `ADULT_THERAPIES` -- para la sección
 * "También te puede interesar" de cada ficha.
 * @param {string} currentSlug
 */
export function getRelatedAdultTherapies(currentSlug) {
  return ADULT_THERAPIES.filter((therapy) => therapy.slug !== currentSlug).map((therapy) => ({
    label: therapy.label,
    href: adultTherapyPath(therapy.slug),
  }))
}
