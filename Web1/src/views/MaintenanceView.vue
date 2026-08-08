<template>
  <div class="kb-maintenance">
    <div class="kb-maintenance__inner">
      <img
        src="/images/logo_kanbouri_2023.png"
        alt="Kanbouri Psicología"
        class="kb-maintenance__logo"
      />

      <p class="kb-maintenance__eyebrow text-secondary">Mantenimiento en curso</p>
      <h1 class="kb-maintenance__title text-h1">Estamos mejorando la web</h1>
      <p class="kb-maintenance__lead text-body">
        Estamos haciendo ajustes para ofrecerte una mejor experiencia. Volveremos
        a estar disponibles en breve, gracias por tu paciencia.
      </p>

      <div class="kb-maintenance__contact">
        <p class="kb-maintenance__contact-label text-secondary">
          ¿Lo necesitas con urgencia? Puedes contactar directamente
        </p>
        <div class="kb-maintenance__contact-actions">
          <a :href="PHONE_HREF" class="kb-maintenance__cta kb-glare text-cta">
            Llamar · {{ PHONE_DISPLAY }}
          </a>
          <a
            :href="WHATSAPP_HREF"
            target="_blank"
            rel="noopener noreferrer"
            class="kb-maintenance__link"
          >
            WhatsApp
          </a>
          <a :href="`mailto:${EMAIL}`" class="kb-maintenance__link">
            {{ EMAIL }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSeoMeta } from '../composables/useSeoMeta'

defineOptions({
  name: 'MaintenanceView',
})

useSeoMeta(() => ({
  title: 'Mantenimiento en curso',
  description: 'Estamos haciendo ajustes en la web. Volveremos a estar disponibles en breve.',
  noindex: true,
}))

// Mismos datos de contacto que footer/WhatsAppButton: aunque la web esté
// caída, quien necesite el centro con urgencia tiene que poder localizarlo.
const PHONE_DISPLAY = '+34 629 538 062'
const PHONE_HREF = 'tel:+34629538062'
const WHATSAPP_HREF =
  'https://wa.me/34629538062?text=' +
  encodeURIComponent('Hola, he visto que la web está en mantenimiento y necesito contactar.')
const EMAIL = 'gabinete@kanbouripsicologia.com'
</script>

<style scoped>
.kb-maintenance {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-paper-alt);
  padding: clamp(32px, 6vw, 56px);
}

.kb-maintenance__inner {
  max-width: 480px;
  text-align: center;
}

.kb-maintenance__logo {
  display: block;
  height: 72px;
  width: auto;
  margin: 0 auto 28px;
}

.kb-maintenance__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 12px;
  margin-bottom: 10px;
}

.kb-maintenance__title {
  margin-bottom: 14px;
}

.kb-maintenance__lead {
  color: var(--color-ink);
  margin-bottom: 36px;
}

.kb-maintenance__contact {
  padding-top: 28px;
  border-top: 1px solid var(--color-line);
}

.kb-maintenance__contact-label {
  margin-bottom: 16px;
}

.kb-maintenance__contact-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.kb-maintenance__cta {
  display: inline-flex;
  align-items: center;
  padding: 13px 30px;
  border-radius: var(--radius-pill);
  background: var(--color-rose);
  color: var(--color-on-rose);
  text-decoration: none;
  box-shadow: var(--shadow-cta);
  transition: background-color var(--dur-base) var(--ease-base),
    transform var(--dur-base) var(--ease-base), box-shadow var(--dur-base) var(--ease-base);
}

.kb-maintenance__cta:hover {
  background: var(--color-rose-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-cta-hover);
}

.kb-maintenance__link {
  color: var(--color-heading);
  text-decoration: none;
  border-bottom: 1px solid var(--color-line);
  padding-bottom: 2px;
  transition: color var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
}

.kb-maintenance__link:hover {
  color: var(--color-rose-hover);
  border-color: var(--color-rose-hover);
}
</style>
