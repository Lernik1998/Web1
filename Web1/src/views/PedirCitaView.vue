<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPedirCitaPage, submitAppointmentRequest } from '../services/dataService'
import { processWordPressContent } from '../utils/contentProcessor'
import { useInternalLinks } from '../composables/useInternalLinks'
import { getRecaptchaToken } from '../utils/recaptcha'
import type { WordPressPage } from '../types/api'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const route = useRoute()

defineOptions({
  name: 'PedirCitaView',
})

const pageLoading = ref(true)
const pageData = ref<WordPressPage | null>(null)
const leadEl = ref<HTMLElement | null>(null)

useInternalLinks(leadEl)

const processedLead = computed(() => {
  if (!pageData.value?.content.rendered) return ''
  return processWordPressContent(pageData.value.content.rendered)
})

onMounted(async () => {
  try {
    pageData.value = await fetchPedirCitaPage()
  } catch (err) {
    console.error('Error fetching pedir cita:', err)
  } finally {
    pageLoading.value = false
  }
})

const services = [
  { value: 'infantil', label: 'Psicología infantil' },
  { value: 'adolescentes', label: 'Psicología para adolescentes' },
  { value: 'adultos', label: 'Psicología para adultos' },
  { value: 'padres-familia', label: 'Psicología para padres y familia' },
  { value: 'profesionales', label: 'Supervisión para profesionales' },
]

const modalityOptions = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'online', label: 'Online' },
]

const professionals = [
  { value: 'sin-preferencia', label: 'Sin preferencia' },
  { value: 'maria', label: 'María B. Kanbouri' },
  { value: 'beatriz', label: 'Beatriz Donet' },
  { value: 'ester', label: 'Ester Pinedo Gil' },
]

const weekdays = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
]

const timeSlots = [
  { value: 'manana', label: 'Mañana', hint: '9:00 – 12:00' },
  { value: 'mediodia', label: 'Mediodía', hint: '12:00 – 15:00' },
  { value: 'tarde', label: 'Tarde', hint: '15:00 – 20:00' },
]

const howFoundOptions = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'internet', label: 'Internet' },
  { value: 'familiar', label: 'Un familiar' },
]

const MENSAJE_MAX_LENGTH = 500

const initialServicio = services.some((service) => service.value === route.query.servicio)
  ? (route.query.servicio as string)
  : ''

/**
 * Recordamos lo que el cliente ya ha escrito mientras dura la pestaña: es
 * habitual que entre a Pedir Cita, se vaya a mirar otra sección y vuelva, y
 * no queremos que tenga que rellenar todo de nuevo.
 */
const STORAGE_KEY = 'kb-pedir-cita-form'

type PedirCitaForm = {
  nombre: string
  apellidos: string
  email: string
  telefono: string
  servicio: string
  modalidad: string
  profesional: string
  dia: string
  horario: string
  comoNosConociste: string
  mensaje: string
  privacidad: boolean
  contacto: boolean
}

function loadSavedForm(): Partial<PedirCitaForm> | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Partial<PedirCitaForm>) : null
  } catch {
    return null
  }
}

const savedForm = loadSavedForm()

const form = reactive<PedirCitaForm>({
  nombre: savedForm?.nombre ?? '',
  apellidos: savedForm?.apellidos ?? '',
  email: savedForm?.email ?? '',
  telefono: savedForm?.telefono ?? '',
  servicio: savedForm?.servicio || initialServicio,
  modalidad: savedForm?.modalidad ?? '',
  profesional: savedForm?.profesional ?? 'sin-preferencia',
  dia: savedForm?.dia ?? '',
  horario: savedForm?.horario ?? '',
  comoNosConociste: savedForm?.comoNosConociste ?? '',
  mensaje: savedForm?.mensaje ?? '',
  privacidad: savedForm?.privacidad ?? false,
  contacto: savedForm?.contacto ?? false,
})

watch(
  form,
  (value) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // Almacenamiento no disponible (modo privado, cuota llena, etc.): no es crítico.
    }
  },
  { deep: true },
)

function clearSavedForm() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignorar si sessionStorage no está disponible.
  }
}

const submitting = ref(false)
const submitted = ref(false)
const errorMsg = ref('')
const attempted = ref(false)

// Trampa anti-bot: campo invisible para personas (oculto por CSS, sin
// tabindex y con aria-hidden) que los bots que rellenan formularios a
// ciegas sí completan. No forma parte de `form`/`PedirCitaForm` a propósito
// para que no se guarde en sessionStorage.
const honeypot = ref('')

// María B. Kanbouri no atiende jueves ni viernes, ni por las tardes, y los
// mediodías solo hasta las 13:30.
const isMariaSelected = computed(() => form.profesional === 'maria')

function isSlotDisabled(slotValue: string) {
  return isMariaSelected.value && slotValue === 'tarde'
}

function isDayDisabled(dayValue: string) {
  return isMariaSelected.value && (dayValue === 'jueves' || dayValue === 'viernes')
}

function slotHint(slot: { value: string; hint: string }) {
  if (isMariaSelected.value && slot.value === 'mediodia') return '12:00 – 13:30'
  return slot.hint
}

watch(isMariaSelected, (selected) => {
  if (selected) {
    if (form.horario === 'tarde') form.horario = ''
    if (form.dia === 'jueves' || form.dia === 'viernes') form.dia = ''
  }
})

const nombreInvalid = computed(() => attempted.value && !form.nombre.trim())
const apellidosInvalid = computed(() => attempted.value && !form.apellidos.trim())
const emailInvalid = computed(() => attempted.value && !form.email.trim())
const telefonoInvalid = computed(() => attempted.value && !form.telefono.trim())
const servicioInvalid = computed(() => attempted.value && !form.servicio)
const modalidadInvalid = computed(() => attempted.value && !form.modalidad)
const diasInvalid = computed(() => attempted.value && !form.dia)
const horariosInvalid = computed(() => attempted.value && !form.horario)
const privacidadInvalid = computed(() => attempted.value && !form.privacidad)
const contactoInvalid = computed(() => attempted.value && !form.contacto)

const hasErrors = computed(
  () =>
    nombreInvalid.value ||
    apellidosInvalid.value ||
    emailInvalid.value ||
    telefonoInvalid.value ||
    servicioInvalid.value ||
    modalidadInvalid.value ||
    diasInvalid.value ||
    horariosInvalid.value ||
    privacidadInvalid.value ||
    contactoInvalid.value,
)

async function handleSubmit() {
  attempted.value = true
  errorMsg.value = ''

  if (hasErrors.value) {
    errorMsg.value = 'Falta completar algún campo obligatorio. Revisa los campos marcados en rojo.'
    return
  }

  if (honeypot.value) {
    // Un bot ha rellenado el campo trampa: simulamos un envío correcto sin
    // procesar nada, para no delatar que fue detectado.
    submitted.value = true
    clearSavedForm()
    return
  }

  submitting.value = true
  try {
    const recaptchaToken = await getRecaptchaToken('pedir_cita')
    await submitAppointmentRequest({
      name: form.nombre,
      surname: form.apellidos,
      email: form.email,
      phone: form.telefono,
      // El backend solo guarda/muestra el texto tal cual (no conoce los
      // slugs internos del formulario), así que se envía la etiqueta
      // legible de cada opción en vez del value ("adultos" -> "Psicología
      // para adultos").
      therapy: services.find((service) => service.value === form.servicio)?.label ?? form.servicio,
      appointment_type:
        modalityOptions.find((modality) => modality.value === form.modalidad)?.label ??
        form.modalidad,
      psychologist:
        professionals.find((pro) => pro.value === form.profesional)?.label ?? form.profesional,
      weekdays: [weekdays.find((day) => day.value === form.dia)?.label ?? form.dia],
      schedule: [timeSlots.find((slot) => slot.value === form.horario)?.label ?? form.horario],
      source:
        howFoundOptions.find((option) => option.value === form.comoNosConociste)?.label ??
        form.comoNosConociste,
      message: form.mensaje,
      recaptcha_token: recaptchaToken,
    })
    submitted.value = true
    clearSavedForm()
  } catch {
    errorMsg.value = 'No se ha podido enviar la solicitud. Inténtalo de nuevo en unos minutos.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="kb-appointment">
    <LoadingSpinner v-if="pageLoading" message="Cargando..." />

    <template v-else>
    <div class="kb-appointment__header">
      <h1 class="kb-appointment__title text-h1">
        {{ pageData?.title.rendered || 'Reserva tu primera sesión' }}
      </h1>
      <div
        v-if="pageData?.content.rendered"
        ref="leadEl"
        class="kb-appointment__lead text-body"
        v-html="processedLead"
      ></div>
      <p v-else class="kb-appointment__lead text-body">
        Cuéntanos un poco sobre ti y tu disponibilidad. Te contactaremos para
        confirmar el día y la hora que mejor os encajen.
      </p>
    </div>

    <div class="kb-appointment__inner">
      <div v-if="submitted" class="kb-appointment__success">
        <h2 class="text-h2">¡Solicitud enviada!</h2>
        <p class="text-body">
          Gracias, {{ form.nombre }}. Hemos recibido tu solicitud y te
          contactaremos muy pronto para confirmar la cita.
        </p>
      </div>

      <form v-else class="kb-appointment__form" novalidate @submit.prevent="handleSubmit">
        <!-- Campo trampa anti-bot: invisible y no navegable por teclado para
             personas; los bots que rellenan formularios a ciegas sí lo
             completan. -->
        <div class="kb-honeypot" aria-hidden="true">
          <label for="kb-website">No rellenar este campo</label>
          <input
            id="kb-website"
            v-model="honeypot"
            type="text"
            name="website"
            tabindex="-1"
            autocomplete="off"
          />
        </div>

        <!-- Datos de contacto -->
        <fieldset class="kb-field-group">
          <legend class="kb-field-group__title text-h3">Tus datos</legend>

          <div class="kb-field-row">
            <label class="kb-field">
              <span class="kb-field__label text-secondary">Nombre</span>
              <input
                v-model="form.nombre"
                type="text"
                name="nombre"
                placeholder="Ana"
                required
                :class="{ 'is-invalid': nombreInvalid }"
              />
              <span v-if="nombreInvalid" class="kb-field-error">Este campo es obligatorio.</span>
            </label>

            <label class="kb-field">
              <span class="kb-field__label text-secondary">Apellidos</span>
              <input
                v-model="form.apellidos"
                type="text"
                name="apellidos"
                placeholder="García López"
                required
                :class="{ 'is-invalid': apellidosInvalid }"
              />
              <span v-if="apellidosInvalid" class="kb-field-error">Este campo es obligatorio.</span>
            </label>
          </div>

          <div class="kb-field-row">
            <label class="kb-field">
              <span class="kb-field__label text-secondary">Email</span>
              <input
                v-model="form.email"
                type="email"
                name="email"
                placeholder="ana@ejemplo.com"
                required
                :class="{ 'is-invalid': emailInvalid }"
              />
              <span v-if="emailInvalid" class="kb-field-error">Este campo es obligatorio.</span>
            </label>

            <label class="kb-field">
              <span class="kb-field__label text-secondary">Teléfono</span>
              <input
                v-model="form.telefono"
                type="tel"
                name="telefono"
                placeholder="600 000 000"
                required
                :class="{ 'is-invalid': telefonoInvalid }"
              />
              <span v-if="telefonoInvalid" class="kb-field-error">Este campo es obligatorio.</span>
            </label>
          </div>
        </fieldset>

        <!-- Servicio -->
        <fieldset class="kb-field-group">
          <legend class="kb-field-group__title text-h3">¿En qué servicio estás interesado/a?</legend>

          <label class="kb-field">
            <select
              v-model="form.servicio"
              name="servicio"
              required
              :class="{ 'is-invalid': servicioInvalid }"
            >
              <option value="" disabled>Selecciona una opción</option>
              <option v-for="service in services" :key="service.value" :value="service.value">
                {{ service.label }}
              </option>
            </select>
            <span v-if="servicioInvalid" class="kb-field-error">Selecciona una opción.</span>
          </label>
        </fieldset>

        <!-- Modalidad -->
        <fieldset class="kb-field-group">
          <legend class="kb-field-group__title text-h3">¿Prefieres la cita presencial u online?</legend>

          <div class="kb-pill-group">
            <label
              v-for="modality in modalityOptions"
              :key="modality.value"
              class="kb-pill"
              :class="{ 'is-selected': form.modalidad === modality.value }"
            >
              <input
                v-model="form.modalidad"
                type="radio"
                name="modalidad"
                :value="modality.value"
                class="kb-pill__input"
              />
              <span>{{ modality.label }}</span>
            </label>
          </div>
          <span v-if="modalidadInvalid" class="kb-field-error">Selecciona una opción.</span>
        </fieldset>

        <!-- Preferencia por profesional -->
        <fieldset class="kb-field-group">
          <legend class="kb-field-group__title text-h3">
            ¿Tienes preferencia por alguna de las profesionales?
          </legend>

          <div class="kb-pill-group">
            <label
              v-for="pro in professionals"
              :key="pro.value"
              class="kb-pill"
              :class="{ 'is-selected': form.profesional === pro.value }"
            >
              <input
                v-model="form.profesional"
                type="radio"
                name="profesional"
                :value="pro.value"
                class="kb-pill__input"
              />
              <span>{{ pro.label }}</span>
            </label>
          </div>
        </fieldset>

        <!-- Días de la semana -->
        <fieldset class="kb-field-group">
          <legend class="kb-field-group__title text-h3">Días de la semana</legend>

          <div class="kb-pill-group">
            <label
              v-for="day in weekdays"
              :key="day.value"
              class="kb-pill"
              :class="{
                'is-selected': form.dia === day.value,
                'is-disabled': isDayDisabled(day.value),
              }"
            >
              <input
                v-model="form.dia"
                type="radio"
                name="dias"
                :value="day.value"
                :disabled="isDayDisabled(day.value)"
                class="kb-pill__input"
              />
              <span>{{ day.label }}</span>
            </label>
          </div>
          <span v-if="diasInvalid" class="kb-field-error">Selecciona al menos un día.</span>
        </fieldset>

        <!-- Disponibilidad horaria -->
        <fieldset class="kb-field-group">
          <legend class="kb-field-group__title text-h3">Disponibilidad horaria</legend>

          <div class="kb-pill-group">
            <label
              v-for="slot in timeSlots"
              :key="slot.value"
              class="kb-pill kb-pill--stacked"
              :class="{
                'is-selected': form.horario === slot.value,
                'is-disabled': isSlotDisabled(slot.value),
              }"
            >
              <input
                v-model="form.horario"
                type="radio"
                name="horarios"
                :value="slot.value"
                :disabled="isSlotDisabled(slot.value)"
                class="kb-pill__input"
              />
              <span class="kb-pill__label">{{ slot.label }}</span>
              <span class="kb-pill__hint">{{ slotHint(slot) }}</span>
            </label>
          </div>
          <span v-if="horariosInvalid" class="kb-field-error">Selecciona al menos una franja horaria.</span>
        </fieldset>

        <!-- Cómo nos conociste -->
        <fieldset class="kb-field-group">
          <legend class="kb-field-group__title text-h3">¿Cómo nos has conocido?</legend>

          <div class="kb-pill-group">
            <label
              v-for="option in howFoundOptions"
              :key="option.value"
              class="kb-pill"
              :class="{ 'is-selected': form.comoNosConociste === option.value }"
            >
              <input
                v-model="form.comoNosConociste"
                type="radio"
                name="comoNosConociste"
                :value="option.value"
                class="kb-pill__input"
              />
              <span>{{ option.label }}</span>
            </label>
          </div>
        </fieldset>

        <!-- Motivo de consulta -->
        <fieldset class="kb-field-group">
          <legend class="kb-field-group__title text-h3">Cuéntanos brevemente el motivo de tu consulta</legend>

          <label class="kb-field">
            <textarea
              v-model="form.mensaje"
              name="mensaje"
              rows="4"
              placeholder="Cuéntanos qué te preocupa o qué te ha llevado a buscar ayuda psicológica."
              :maxlength="MENSAJE_MAX_LENGTH"
            ></textarea>
            <span class="kb-field-count text-secondary">
              {{ form.mensaje.length }}/{{ MENSAJE_MAX_LENGTH }}
            </span>
          </label>
        </fieldset>

        <!-- Privacidad -->
        <label class="kb-checkbox">
          <input
            v-model="form.privacidad"
            type="checkbox"
            name="privacidad"
            required
            :class="{ 'is-invalid': privacidadInvalid }"
          />
          <span class="text-secondary">
            He leído y acepto la
            <router-link to="/politica-privacidad">Política de Privacidad</router-link>.
          </span>
        </label>
        <span v-if="privacidadInvalid" class="kb-field-error">
          Debes aceptar la política de privacidad para continuar.
        </span>

        <label class="kb-checkbox">
          <input
            v-model="form.contacto"
            type="checkbox"
            name="contacto"
            required
            :class="{ 'is-invalid': contactoInvalid }"
          />
          <span class="text-secondary">
            Acepto que el centro pueda contactar conmigo por teléfono o correo
            electrónico para gestionar mi solicitud de cita.
          </span>
        </label>
        <span v-if="contactoInvalid" class="kb-field-error">
          Debes aceptar el contacto para gestionar tu solicitud.
        </span>

        <p v-if="errorMsg" class="kb-appointment__error">{{ errorMsg }}</p>

        <button
          type="submit"
          class="kb-appointment__submit text-cta"
          v-ripple
          :disabled="submitting"
        >
          {{ submitting ? 'Enviando...' : 'Enviar solicitud' }}
        </button>

        <p class="kb-appointment__recaptcha-note text-secondary">
          Este sitio está protegido por reCAPTCHA y se aplican la
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
            >Política de Privacidad</a
          >
          y los
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer"
            >Términos del Servicio</a
          >
          de Google.
        </p>
      </form>
    </div>
    </template>
  </section>
</template>

<style scoped>
.kb-appointment {
  background: var(--color-paper-alt);
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px);
}

.kb-appointment__header {
  max-width: 640px;
  margin: 0 auto 40px;
  text-align: center;
}

.kb-appointment__title {
  margin-bottom: 14px;
}

.kb-appointment__lead {
  color: var(--color-ink);
}

.kb-appointment__inner {
  max-width: 720px;
  margin: 0 auto;
}

.kb-appointment__success {
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover);
  padding: clamp(28px, 5vw, 48px);
  text-align: center;
}

.kb-appointment__success p {
  margin-top: 12px;
}

.kb-appointment__form {
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover);
  padding: clamp(24px, 5vw, 44px);
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.kb-field-group {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.kb-honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.kb-appointment__recaptcha-note {
  font-size: 12px;
  line-height: 1.5;
}

.kb-appointment__recaptcha-note a {
  color: var(--color-rose-hover);
  text-decoration: underline;
}

.kb-field-group__title {
  padding: 0;
}

.kb-field-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.kb-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kb-field__label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.kb-field__label--spaced {
  margin-top: 6px;
}

.kb-field input,
.kb-field select,
.kb-field textarea {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--color-ink);
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  transition: border-color var(--dur-base) var(--ease-base);
}

.kb-field input:focus,
.kb-field select:focus,
.kb-field textarea:focus {
  outline: none;
  border-color: var(--color-rose);
}

.kb-field textarea {
  resize: vertical;
}

.kb-field input.is-invalid,
.kb-field select.is-invalid,
.kb-field textarea.is-invalid,
.kb-checkbox input.is-invalid {
  border-color: #d32f2f;
}

@keyframes kb-error-fade-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.kb-field-error {
  color: #b23c3c;
  font-size: 13px;
  animation: kb-error-fade-in 220ms var(--ease-base) both;
}

.kb-field-count {
  align-self: flex-end;
  font-size: 12px;
}

.kb-pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.kb-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  font-size: 14px;
  color: var(--color-ink);
  cursor: pointer;
  transition: border-color var(--dur-base) var(--ease-base),
    background-color var(--dur-base) var(--ease-base), color var(--dur-base) var(--ease-base);
}

.kb-pill--stacked {
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2px;
  padding: 8px 18px;
}

.kb-pill__hint {
  font-size: 12px;
  color: var(--color-secondary);
}

.kb-pill.is-selected {
  border-color: var(--color-rose);
  background: var(--color-rose-soft-wash);
  color: var(--color-rose-hover);
}

.kb-pill.is-selected .kb-pill__hint {
  color: var(--color-rose-hover);
}

.kb-pill.is-disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.kb-pill__input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.kb-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.kb-checkbox input {
  margin-top: 3px;
}

.kb-checkbox a {
  color: var(--color-rose-hover);
  text-decoration: underline;
}

.kb-appointment__error {
  color: #b23c3c;
  font-size: 14px;
  animation: kb-error-fade-in 220ms var(--ease-base) both;
}

.kb-appointment__submit {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  padding: 13px 30px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--color-rose);
  color: var(--color-on-rose);
  cursor: pointer;
  box-shadow: var(--shadow-cta);
  transition: background-color var(--dur-base) var(--ease-base),
    transform var(--dur-base) var(--ease-base), box-shadow var(--dur-base) var(--ease-base);
}

.kb-appointment__submit:hover:not(:disabled) {
  background: var(--color-rose-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-cta-hover);
}

.kb-appointment__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ---------- Responsive ---------- */
@media (max-width: 620px) {
  .kb-field-row {
    grid-template-columns: 1fr;
  }
}
</style>
