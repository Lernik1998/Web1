<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPedirCitaPage } from '../services/dataService'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const route = useRoute()

defineOptions({
  name: 'PedirCitaView',
})

const pageLoading = ref(true)

onMounted(async () => {
  try {
    await fetchPedirCitaPage()
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
  { value: 'tarde', label: 'Tarde', hint: '15:00 – 21:00' },
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

const form = reactive({
  nombre: '',
  apellidos: '',
  email: '',
  telefono: '',
  servicio: initialServicio,
  profesional: 'sin-preferencia',
  dias: [] as string[],
  horarios: [] as string[],
  comoNosConociste: '',
  mensaje: '',
  privacidad: false,
})

const submitting = ref(false)
const submitted = ref(false)
const errorMsg = ref('')
const attempted = ref(false)

// María B. Kanbouri solo atiende de 9:00 a 14:00, no puede trabajar por la tarde.
const isMariaSelected = computed(() => form.profesional === 'maria')

function isSlotDisabled(slotValue: string) {
  return isMariaSelected.value && slotValue === 'tarde'
}

watch(isMariaSelected, (selected) => {
  if (selected) {
    form.horarios = form.horarios.filter((slot) => slot !== 'tarde')
  }
})

const nombreInvalid = computed(() => attempted.value && !form.nombre.trim())
const apellidosInvalid = computed(() => attempted.value && !form.apellidos.trim())
const emailInvalid = computed(() => attempted.value && !form.email.trim())
const telefonoInvalid = computed(() => attempted.value && !form.telefono.trim())
const servicioInvalid = computed(() => attempted.value && !form.servicio)
const diasInvalid = computed(() => attempted.value && form.dias.length === 0)
const horariosInvalid = computed(() => attempted.value && form.horarios.length === 0)
const privacidadInvalid = computed(() => attempted.value && !form.privacidad)

const hasErrors = computed(
  () =>
    nombreInvalid.value ||
    apellidosInvalid.value ||
    emailInvalid.value ||
    telefonoInvalid.value ||
    servicioInvalid.value ||
    diasInvalid.value ||
    horariosInvalid.value ||
    privacidadInvalid.value,
)

async function handleSubmit() {
  attempted.value = true
  errorMsg.value = ''

  if (hasErrors.value) {
    errorMsg.value = 'Falta completar algún campo obligatorio. Revisa los campos marcados en rojo.'
    return
  }

  submitting.value = true
  try {
    // TODO: conectar con el endpoint real de envío (WordPress) cuando esté disponible.
    await new Promise((resolve) => setTimeout(resolve, 500))
    submitted.value = true
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
      <h1 class="kb-appointment__title text-h1">Reserva tu primera sesión</h1>
      <p class="kb-appointment__lead text-body">
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

          <p v-if="isMariaSelected" class="kb-field-note text-secondary">
            María B. Kanbouri atiende de 9:00 a 14:00 y no tiene disponibilidad
            por las tardes.
          </p>
        </fieldset>

        <!-- Días de la semana -->
        <fieldset class="kb-field-group">
          <legend class="kb-field-group__title text-h3">Días de la semana</legend>

          <div class="kb-pill-group">
            <label
              v-for="day in weekdays"
              :key="day.value"
              class="kb-pill"
              :class="{ 'is-selected': form.dias.includes(day.value) }"
            >
              <input
                v-model="form.dias"
                type="checkbox"
                name="dias"
                :value="day.value"
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
                'is-selected': form.horarios.includes(slot.value),
                'is-disabled': isSlotDisabled(slot.value),
              }"
            >
              <input
                v-model="form.horarios"
                type="checkbox"
                name="horarios"
                :value="slot.value"
                :disabled="isSlotDisabled(slot.value)"
                class="kb-pill__input"
              />
              <span class="kb-pill__label">{{ slot.label }}</span>
              <span class="kb-pill__hint">{{ slot.hint }}</span>
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
            <router-link to="/politica-privacidad">política de privacidad</router-link>.
          </span>
        </label>
        <span v-if="privacidadInvalid" class="kb-field-error">
          Debes aceptar la política de privacidad para continuar.
        </span>

        <p v-if="errorMsg" class="kb-appointment__error">{{ errorMsg }}</p>

        <button type="submit" class="kb-appointment__submit text-cta" :disabled="submitting">
          {{ submitting ? 'Enviando...' : 'Enviar solicitud' }}
        </button>
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

.kb-field-error {
  color: #b23c3c;
  font-size: 13px;
}

.kb-field-count {
  align-self: flex-end;
  font-size: 12px;
}

.kb-field-note {
  color: var(--color-rose-hover);
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
