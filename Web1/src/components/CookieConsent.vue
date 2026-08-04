<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

defineOptions({
  name: 'CookieConsent',
})

const STORAGE_KEY = 'kb-cookie-consent'

type CategoryKey = 'preferences' | 'statistics' | 'marketing'

interface StoredConsent {
  preferences: boolean
  statistics: boolean
  marketing: boolean
}

const categories: Array<{ key: CategoryKey; label: string; description: string }> = [
  {
    key: 'preferences',
    label: 'Preferencias',
    description:
      'Permiten recordar tus opciones (como el idioma o la región) para ofrecerte una experiencia más personalizada.',
  },
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
]

const visible = ref(false)
const showDetails = ref(false)
const hasDecided = ref(false)

const preferences = reactive<StoredConsent>({
  preferences: false,
  statistics: false,
  marketing: false,
})

function persist() {
  hasDecided.value = true
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...preferences, decidedAt: new Date().toISOString() }),
    )
  } catch (err) {
    console.error('Error saving cookie preferences:', err)
  }
}

function close() {
  visible.value = false
  showDetails.value = false
}

function acceptAll() {
  preferences.preferences = true
  preferences.statistics = true
  preferences.marketing = true
  persist()
  close()
}

function rejectAll() {
  preferences.preferences = false
  preferences.statistics = false
  preferences.marketing = false
  persist()
  close()
}

function savePreferences() {
  persist()
  close()
}

function openPreferences() {
  showDetails.value = true
  visible.value = true
}

onMounted(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      visible.value = true
      return
    }
    const parsed = JSON.parse(stored) as Partial<StoredConsent>
    preferences.preferences = Boolean(parsed.preferences)
    preferences.statistics = Boolean(parsed.statistics)
    preferences.marketing = Boolean(parsed.marketing)
    hasDecided.value = true
  } catch (err) {
    console.error('Error reading cookie preferences:', err)
    visible.value = true
  }
})
</script>

<template>
  <div>
    <transition name="kb-cookie-fade">
      <div
        v-if="visible"
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

        <h2 class="kb-cookie__title text-h3 text-h3--strong">Usamos cookies</h2>
        <p id="kb-cookie-desc" class="kb-cookie__text text-body">
          Utilizamos cookies propias y de terceros para que la web funcione correctamente, entender
          cómo se usa y, si nos das tu permiso, ofrecerte contenido más relevante.
        </p>

        <div v-if="showDetails" class="kb-cookie__categories">
          <div class="kb-cookie__category">
            <div class="kb-cookie__category-row">
              <span class="kb-cookie__category-title">Necesarias</span>
              <span class="kb-cookie__locked text-secondary">Siempre activas</span>
            </div>
            <p class="kb-cookie__category-desc text-secondary">
              Imprescindibles para la navegación y la seguridad del sitio, y para recordar tus
              propias preferencias de cookies. No se pueden desactivar.
            </p>
          </div>

          <div v-for="category in categories" :key="category.key" class="kb-cookie__category">
            <div class="kb-cookie__category-row">
              <span class="kb-cookie__category-title">{{ category.label }}</span>
              <button
                type="button"
                class="kb-cookie__toggle"
                role="switch"
                :aria-checked="preferences[category.key]"
                :aria-label="category.label"
                :class="{ 'is-on': preferences[category.key] }"
                @click="preferences[category.key] = !preferences[category.key]"
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
              Rechazar
            </button>
            <button
              type="button"
              class="kb-cookie__btn kb-cookie__btn--ghost"
              @click="showDetails = true"
            >
              Personalizar
            </button>
            <button type="button" class="kb-cookie__btn kb-cookie__btn--primary" @click="acceptAll">
              Aceptar todas
            </button>
          </template>
          <template v-else>
            <button type="button" class="kb-cookie__btn kb-cookie__btn--ghost" @click="acceptAll">
              Aceptar todas
            </button>
            <button
              type="button"
              class="kb-cookie__btn kb-cookie__btn--primary"
              @click="savePreferences"
            >
              Guardar preferencias
            </button>
          </template>
        </div>

        <router-link to="/politica-cookies" class="kb-cookie__link text-secondary" @click="close">
          Más información en nuestra política de cookies
        </router-link>
      </div>
    </transition>

    <div v-if="!visible && hasDecided" class="kb-cookie-reopen-slot">
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

.kb-cookie__close:hover {
  background: var(--color-rose-soft-wash);
  color: var(--color-rose-hover);
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

.kb-cookie__locked {
  flex-shrink: 0;
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

.kb-cookie__btn--ghost {
  background: transparent;
  border-color: var(--color-line);
  color: var(--color-ink);
}

.kb-cookie__btn--ghost:hover {
  background: var(--color-rose-soft-wash);
  border-color: var(--color-rose-soft);
}

.kb-cookie__btn--primary {
  background: var(--color-rose);
  color: var(--color-on-rose);
  box-shadow: var(--shadow-cta);
}

.kb-cookie__btn--primary:hover {
  background: var(--color-rose-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-cta-hover);
}

.kb-cookie__link {
  display: block;
  text-align: center;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.kb-cookie__link:hover {
  color: var(--color-rose-hover);
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
  /* Deja hueco debajo para el botón flotante de WhatsApp (WhatsAppButton.vue). */
  bottom: 96px;
  width: 56px;
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

.kb-cookie-reopen:hover {
  background: var(--color-rose-soft-wash);
  border-color: var(--color-rose-soft);
  transform: translateY(-2px);
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
    bottom: 88px;
  }
}
</style>
