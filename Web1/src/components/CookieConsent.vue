<template>
  <div>
    <transition name="kb-cookie-fade">
      <div
        v-if="visible && bannerEnabled"
        class="kb-cookie"
        role="region"
        aria-label="Consentimiento de cookies"
        aria-describedby="kb-cookie-desc"
      >
        <button type="button" class="kb-cookie__close" aria-label="Rechazar y cerrar" @click="rejectAll">
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              fill="none"
            />
          </svg>
        </button>

        <!-- Nada de <h2>/<h3> aquí: el banner se repite igual en las 35
             páginas, así que cualquier nivel de encabezado compite con el
             esquema real de cada página (un <h3> incluso puede saltarse un
             nivel entero en páginas sin su propio <h2>, un fallo real
             detectado con axe-core). El propio contenedor ya lleva
             role="region" aria-label="Consentimiento de cookies", así que
             quien navega con lector de pantalla ya identifica esta zona sin
             necesitar además un encabezado; esto se queda como rótulo
             visual (<p>). -->
        <p class="kb-cookie__title text-h3 text-h3--strong">{{ title }}</p>
        <p id="kb-cookie-desc" class="kb-cookie__text text-body">{{ description }}</p>

        <div v-if="showDetails" class="kb-cookie__categories">
          <div v-for="category in categories" :key="category.key" class="kb-cookie__category">
            <div class="kb-cookie__category-row">
              <span class="kb-cookie__category-title">{{ category.label }}</span>
              <button
                type="button"
                class="kb-cookie__toggle"
                role="switch"
                :aria-checked="draft[category.key]"
                :aria-label="category.label"
                :class="{ 'is-on': draft[category.key] }"
                @click="draft[category.key] = !draft[category.key]"
              >
                <span class="kb-cookie__toggle-knob" aria-hidden="true"></span>
              </button>
            </div>
            <p class="kb-cookie__category-desc text-secondary">{{ category.description }}</p>
          </div>
        </div>

        <div class="kb-cookie__actions">
          <template v-if="!showDetails">
            <button type="button" class="kb-cookie__btn kb-cookie__btn--ghost" @click="rejectAll">
              {{ denyLabel }}
            </button>
            <button
              type="button"
              class="kb-cookie__btn kb-cookie__btn--ghost"
              @click="showDetails = true"
            >
              Ver preferencias
            </button>
            <button type="button" class="kb-cookie__btn kb-cookie__btn--primary" @click="acceptAll">
              {{ acceptLabel }}
            </button>
          </template>
          <template v-else>
            <button type="button" class="kb-cookie__btn kb-cookie__btn--ghost" @click="acceptAll">
              {{ acceptLabel }}
            </button>
            <button
              type="button"
              class="kb-cookie__btn kb-cookie__btn--primary"
              @click="savePreferences"
            >
              {{ saveLabel }}
            </button>
          </template>
        </div>

        <div class="kb-cookie__legal-links">
          <router-link to="/politica-cookies" class="kb-cookie__link text-secondary" @click="close">
            Política de cookies
          </router-link>
          <router-link to="/politica-privacidad" class="kb-cookie__link text-secondary" @click="close">
            Política de privacidad
          </router-link>
          <router-link to="/aviso-legal" class="kb-cookie__link text-secondary" @click="close">
            Aviso Legal
          </router-link>
        </div>
      </div>
    </transition>

    <div v-if="!visible && hasDecided && bannerEnabled" class="kb-cookie-reopen-slot">
      <button
        type="button"
        class="kb-cookie-reopen"
        aria-label="Configurar preferencias de cookies"
        @click="openPreferences"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M12 3a9 9 0 100 18 9 9 0 000-18zm-2.2 3.6a1.1 1.1 0 110 2.2 1.1 1.1 0 010-2.2zM15 8.6a1 1 0 110 2 1 1 0 010-2zm-6.4 4a1.1 1.1 0 110 2.2 1.1 1.1 0 010-2.2zm4.6 3.4a1 1 0 110 2 1 1 0 010-2zM12 5a7 7 0 016.93 6.03A3 3 0 0116 14a2.98 2.98 0 01-1.34-.32A3 3 0 0111 17a3 3 0 01-2.83-2 3 3 0 01-3.08-3.9A7 7 0 0112 5z"
            fill="currentColor"
          />
        </svg>
        <span class="kb-cookie-reopen__label">Cookies</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { fetchCookieSetting } from '../services/dataService'
import { useCookieConsent } from '../composables/useCookieConsent'
import type { ConsentCategory } from '../composables/useCookieConsent'

defineOptions({
  name: 'CookieConsent',
})

interface CategoryContent {
  key: ConsentCategory
  label: string
  description: string
}

const {
  consent,
  hasDecided,
  bannerVisible: visible,
  showBanner,
  hideBanner,
  acceptAll: acceptAllConsent,
  rejectAll: rejectAllConsent,
  savePreferences: savePreferencesConsent,
} = useCookieConsent()

// Textos por defecto (se muestran de inmediato y se sustituyen, si llegan,
// por los que gestiona la clínica desde WordPress vía fetchCookieSetting).
const title = ref('Usamos cookies')
const description = ref(
  'Utilizamos cookies propias y de terceros para que la web funcione correctamente, entender cómo se usa y, si nos das tu permiso, ofrecerte contenido más relevante.',
)
const acceptLabel = ref('Aceptar todas')
const denyLabel = ref('Rechazar')
const saveLabel = ref('Guardar preferencias')
const bannerEnabled = ref(true)

const categories = ref<CategoryContent[]>([
  {
    key: 'statistics',
    label: 'Estadísticas',
    description:
      'Nos ayudan a entender, de forma agregada y anónima, cómo se usa la web para poder mejorarla.',
  },
  {
    key: 'marketing',
    label: 'Marketing',
    description: 'Se usan para mostrarte contenido y publicidad más relevante según tus intereses.',
  },
])

const showDetails = ref(false)

// Borrador editable de los toggles del panel "Personalizar": no se guarda en
// la cookie hasta pulsar "Guardar preferencias".
const draft = reactive<Record<ConsentCategory, boolean>>({
  statistics: false,
  marketing: false,
})

function syncDraftFromConsent() {
  draft.statistics = consent.value?.statistics === true
  draft.marketing = consent.value?.marketing === true
}

function close() {
  hideBanner()
  showDetails.value = false
}

function acceptAll() {
  acceptAllConsent()
  close()
}

function rejectAll() {
  rejectAllConsent()
  close()
}

function savePreferences() {
  savePreferencesConsent({ statistics: draft.statistics, marketing: draft.marketing })
  close()
}

function openPreferences() {
  syncDraftFromConsent()
  showDetails.value = true
  showBanner()
}

function trimmed(value: string | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

// Si la persona navega a otra página (enlace del menú/footer, ver
// Header.vue) antes de que responda fetchCookieSetting(), el navegador
// cancela esa petición en marcha al descargar este componente -- algo
// normal y sin ningún efecto real (el banner se queda con los valores por
// defecto), pero sin este flag se registraba igualmente como
// "AxiosError: Network Error" en la consola.
let isMounted = true
onBeforeUnmount(() => {
  isMounted = false
})

onMounted(async () => {
  // El banner ya arranca visible si toca (ver useCookieConsent.ts): aquí
  // solo queda preparar el borrador de "Personalizar" para cuando se abra.
  if (!hasDecided.value) {
    syncDraftFromConsent()
  }

  try {
    const setting = await fetchCookieSetting()
    if (!isMounted) return
    const acf = setting?.acf
    if (!acf) return

    bannerEnabled.value = acf.cookie_banner_enabled !== false
    if (acf.cookie_title) title.value = trimmed(acf.cookie_title)
    if (acf.cookie_description) description.value = trimmed(acf.cookie_description)
    if (acf.accept_button_label) acceptLabel.value = trimmed(acf.accept_button_label)
    if (acf.deny_button_label) denyLabel.value = trimmed(acf.deny_button_label)
    if (acf.save_button_label) saveLabel.value = trimmed(acf.save_button_label)

    categories.value = [
      {
        key: 'statistics',
        label: acf.statistics_title ? trimmed(acf.statistics_title) : categories.value[0]!.label,
        description: acf.statistics_description
          ? trimmed(acf.statistics_description)
          : categories.value[0]!.description,
      },
      {
        key: 'marketing',
        label: acf.marketing_title ? trimmed(acf.marketing_title) : categories.value[1]!.label,
        description: acf.marketing_description
          ? trimmed(acf.marketing_description)
          : categories.value[1]!.description,
      },
    ]

    if (!bannerEnabled.value) {
      hideBanner()
    }
  } catch (err) {
    if (isMounted) {
      console.error('Error fetching cookie banner settings:', err)
    }
  }
})
</script>

<style scoped>
.kb-cookie {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: min(400px, calc(100vw - 48px));
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover);
  padding: 22px 24px 24px;
  z-index: 200;
}

.kb-cookie__close {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-secondary);
  cursor: pointer;
  transition: background-color var(--dur-base) var(--ease-base),
    color var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-cookie__close:hover {
    background: var(--color-rose-soft-wash);
    color: var(--color-rose-hover);
  }
}

.kb-cookie__title {
  margin: 0 28px 10px 0;
}

.kb-cookie__text {
  margin: 0 0 18px;
}

.kb-cookie__categories {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 18px;
  padding-top: 6px;
  border-top: 1px solid var(--color-line);
}

.kb-cookie__category {
  padding-top: 14px;
}

.kb-cookie__category:first-child {
  padding-top: 14px;
}

.kb-cookie__category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}

.kb-cookie__category-title {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 14.5px;
  color: var(--color-heading);
}

.kb-cookie__category-desc {
  margin: 0;
}

.kb-cookie__toggle {
  position: relative;
  flex-shrink: 0;
  width: 38px;
  height: 21px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--color-line);
  cursor: pointer;
  transition: background-color var(--dur-base) var(--ease-base);
}

.kb-cookie__toggle.is-on {
  background: var(--color-rose);
}

.kb-cookie__toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: var(--color-paper);
  box-shadow: 0 1px 3px rgba(50, 61, 68, 0.3);
  transition: transform var(--dur-base) var(--ease-base);
}

.kb-cookie__toggle.is-on .kb-cookie__toggle-knob {
  transform: translateX(17px);
}

.kb-cookie__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 14px;
}

.kb-cookie__btn {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 13.5px;
  padding: 9px 16px;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color var(--dur-base) var(--ease-base),
    border-color var(--dur-base) var(--ease-base), color var(--dur-base) var(--ease-base),
    transform var(--dur-base) var(--ease-base);
}

/*
 * Botón secundario "de texto": sin fondo ni borde propio, en un tono apagado
 * (como "Denegar" / "Ver preferencias" en el banner real de la clínica) para
 * que solo el botón primario ("Aceptar cookies") destaque visualmente.
 */
.kb-cookie__btn--ghost {
  background: transparent;
  border-color: transparent;
  color: var(--color-secondary);
  padding-left: 8px;
  padding-right: 8px;
}

@media (hover: hover) and (pointer: fine) {
  .kb-cookie__btn--ghost:hover {
    color: var(--color-rose-hover);
  }
}

.kb-cookie__btn--primary {
  background: var(--color-rose);
  color: var(--color-on-rose);
  box-shadow: var(--shadow-cta);
}

@media (hover: hover) and (pointer: fine) {
  .kb-cookie__btn--primary:hover {
    background: var(--color-rose-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-cta-hover);
  }
}

.kb-cookie__legal-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 6px 14px;
}

.kb-cookie__link {
  position: relative;
  text-decoration: underline;
  text-underline-offset: 2px;
}

@media (hover: hover) and (pointer: fine) {
  .kb-cookie__link:hover {
    color: var(--color-rose-hover);
  }
}

.kb-cookie__legal-links .kb-cookie__link:not(:last-child)::after {
  content: '·';
  position: absolute;
  right: -10px;
  text-decoration: none;
  color: var(--color-line);
}

.kb-cookie-fade-enter-active,
.kb-cookie-fade-leave-active {
  transition: opacity 320ms var(--ease-base), transform 320ms var(--ease-base);
}

.kb-cookie-fade-enter-from,
.kb-cookie-fade-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

/*
 * Caja invisible de ancho fijo, del mismo ancho que WhatsAppButton.vue, para
 * que ambos botones flotantes queden centrados entre sí aunque tengan formas
 * y tamaños distintos (píldora con texto vs. círculo de icono).
 */
.kb-cookie-reopen-slot {
  position: fixed;
  left: 32px;
  /* Va por debajo del botón flotante de WhatsApp (WhatsAppButton.vue): ese
     es la acción principal de contacto y debe verse primero. */
  bottom: 20px;
  width: 64px;
  display: flex;
  justify-content: center;
  z-index: 150;
}

.kb-cookie-reopen {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px 10px 14px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: var(--color-paper);
  color: var(--color-rose-hover);
  box-shadow: var(--shadow-popover);
  cursor: pointer;
  transition: transform var(--dur-base) var(--ease-base),
    background-color var(--dur-base) var(--ease-base),
    border-color var(--dur-base) var(--ease-base);
}

.kb-cookie-reopen__label {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 13.5px;
  color: var(--color-ink);
}

@media (hover: hover) and (pointer: fine) {
  .kb-cookie-reopen:hover {
    background: var(--color-rose-soft-wash);
    border-color: var(--color-rose-soft);
    transform: translateY(-2px);
  }
}

@media (max-width: 640px) {
  .kb-cookie {
    left: 12px;
    right: 12px;
    bottom: 12px;
    width: auto;
    padding: 20px 20px 22px;
  }

  .kb-cookie__actions {
    justify-content: stretch;
  }

  .kb-cookie__btn {
    flex: 1 1 auto;
    text-align: center;
  }

  .kb-cookie-reopen-slot {
    left: 24px;
    bottom: 16px;
  }
}
</style>
