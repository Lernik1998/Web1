<template>
  <div class="kb-newsletter">
    <div class="kb-newsletter__intro">
      <h2 class="text-h2">{{ title }}</h2>
      <p class="kb-newsletter__lead text-body">{{ description }}</p>
      <p class="kb-newsletter__extra text-body">{{ extra }}</p>
    </div>

    <div class="kb-newsletter__panel">
      <div v-if="submitted" class="kb-newsletter__success">
        <h3 class="text-h3">¡Listo!</h3>
        <p class="text-body">Revisa tu email: te hemos enviado el enlace de descarga.</p>
      </div>

      <form v-else class="kb-newsletter__form" novalidate @submit.prevent="handleSubmit">
        <label class="kb-newsletter__field">
          <span class="kb-newsletter__label">Nombre</span>
          <input
            v-model="form.nombre"
            type="text"
            name="nombre"
            autocomplete="given-name"
            placeholder="Ana"
            required
            :class="{ 'is-invalid': nombreInvalid }"
          />
        </label>

        <label class="kb-newsletter__field">
          <span class="kb-newsletter__label">Email</span>
          <input
            v-model="form.email"
            type="email"
            name="email"
            autocomplete="email"
            placeholder="ana@ejemplo.com"
            required
            :class="{ 'is-invalid': emailInvalid }"
          />
        </label>

        <label class="kb-newsletter__checkbox">
          <input
            v-model="form.privacidad"
            type="checkbox"
            name="privacidad"
            required
            :class="{ 'is-invalid': privacidadInvalid }"
          />
          <span>
            He leído y acepto la
            <router-link to="/politica-privacidad">política de privacidad</router-link>.
          </span>
        </label>

        <p v-if="errorMsg" class="kb-newsletter__error">{{ errorMsg }}</p>

        <button type="submit" class="kb-newsletter__submit text-cta" v-ripple :disabled="submitting">
          {{ submitting ? 'Enviando...' : buttonText }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { subscribeToNewsletter } from '../services/dataService'

withDefaults(
  defineProps<{
    title?: string
    description?: string
    extra?: string
    buttonText?: string
  }>(),
  {
    title: 'Recursos para profesionales',
    description:
      'Descarga gratis nuestra guía "Claves para derivar y colaborar con otros profesionales": un documento breve con ideas prácticas para construir una red de derivación de confianza.',
    extra: 'Además recibirás nuestra newsletter con recursos y novedades para profesionales de la psicología.',
    buttonText: 'Quiero descargarlo',
  },
)

const form = reactive({
  nombre: '',
  email: '',
  privacidad: false,
})

const submitting = ref(false)
const submitted = ref(false)
const errorMsg = ref('')
const attempted = ref(false)

const nombreInvalid = computed(() => attempted.value && !form.nombre.trim())
const emailInvalid = computed(() => attempted.value && !form.email.trim())
const privacidadInvalid = computed(() => attempted.value && !form.privacidad)

const hasErrors = computed(() => nombreInvalid.value || emailInvalid.value || privacidadInvalid.value)

async function handleSubmit() {
  attempted.value = true
  errorMsg.value = ''

  if (hasErrors.value) {
    errorMsg.value = 'Falta completar algún campo obligatorio.'
    return
  }

  submitting.value = true
  try {
    await subscribeToNewsletter(form.nombre, form.email)
    submitted.value = true
  } catch {
    errorMsg.value = 'No se ha podido enviar la solicitud. Inténtalo de nuevo en unos minutos.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.kb-newsletter__intro {
  text-align: center;
  max-width: 56ch;
  margin: 0 auto 28px;
}

.kb-newsletter__intro h2 {
  margin-bottom: 14px;
}

.kb-newsletter__lead {
  color: var(--color-ink);
  margin-bottom: 12px;
}

.kb-newsletter__extra {
  color: var(--color-secondary);
}

.kb-newsletter__panel {
  max-width: 480px;
  margin: 0 auto;
  background: var(--color-rose);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-cta);
  padding: clamp(24px, 5vw, 36px);
}

.kb-newsletter__form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.kb-newsletter__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.kb-newsletter__label {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-on-rose);
}

.kb-newsletter__field input {
  font-family: var(--font-body);
  /* Por debajo de 16px, Safari en iOS hace zoom automático sobre toda la
     página al tocar el campo -- un salto brusco que rompe la experiencia
     en móvil. 16px es el mínimo que evita ese comportamiento. */
  font-size: 16px;
  color: var(--color-on-rose);
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  transition: border-color var(--dur-base) var(--ease-base),
    background-color var(--dur-base) var(--ease-base);
}

.kb-newsletter__field input::placeholder {
  color: rgba(255, 255, 255, 0.65);
}

.kb-newsletter__field input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.2);
  border-color: var(--color-on-rose);
}

.kb-newsletter__field input.is-invalid,
.kb-newsletter__checkbox input.is-invalid {
  border-color: #ffe1e1;
}

.kb-newsletter__checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  text-align: left;
  font-size: 14px;
  color: var(--color-on-rose);
  cursor: pointer;
}

.kb-newsletter__checkbox input {
  margin-top: 3px;
}

.kb-newsletter__checkbox a {
  color: var(--color-on-rose);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.kb-newsletter__error {
  color: #ffe1e1;
  font-size: 14px;
}

.kb-newsletter__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 13px 30px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--color-paper);
  color: var(--color-rose-hover);
  cursor: pointer;
  transition: background-color var(--dur-base) var(--ease-base),
    transform var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-newsletter__submit:hover:not(:disabled) {
    background: #ffffff;
    transform: translateY(-1px);
  }
}

.kb-newsletter__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.kb-newsletter__success {
  text-align: center;
  color: var(--color-on-rose);
}

.kb-newsletter__success h3 {
  color: var(--color-on-rose);
  margin-bottom: 8px;
}
</style>
