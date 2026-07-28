<script setup lang="ts">
defineOptions({
  name: 'TheFooter',
})
</script>

<template>
  <footer class="the-footer">
    <div class="footer-content">
      <div class="brand-section">
        <div class="footer-brand">
          <span class="footer-brand__name">Kanbouri</span>
          <span class="footer-brand__tag">Psicología</span>
        </div>

        <p class="footer-person text-secondary">María B. Kanbouri</p>

        <div class="social-icons">
          <a href="#" aria-label="Facebook" class="social-link">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="social-icon"
            >
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
            </svg>
          </a>
          <a href="#" aria-label="Instagram" class="social-link">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="social-icon"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
          <a href="#" aria-label="LinkedIn" class="social-link">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="social-icon"
            >
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
        </div>
      </div>

      <div class="legal-links">
        <h3 class="legal-title text-secondary">Legal</h3>
        <ul>
          <li><router-link to="/politica-privacidad">Política de privacidad</router-link></li>
          <li><router-link to="/aviso-legal">Aviso legal</router-link></li>
          <li><router-link to="/politica-cookies">Política de cookies</router-link></li>
        </ul>
      </div>
    </div>

    <div class="footer-secondary">
      <div class="contact-line">
        <div class="contact-line__group">
          <p class="contact-line__label text-secondary">Dirección</p>
          <a
            class="contact-line__value contact-line__link"
            href="https://www.google.com/maps/search/?api=1&query=C%2F%20Sant%20Josep%2031%2C%20D%C3%A9nia%20(Alicante)"
            target="_blank"
            rel="noopener noreferrer"
          >
            C/ Sant Josep 31, Planta Baja Izquierda · Dénia (Alicante)
          </a>
        </div>

        <div class="contact-line__group">
          <p class="contact-line__label text-secondary">Teléfono</p>
          <a class="contact-line__value contact-line__link" href="tel:+34629538062">
            +34 629 538 062
          </a>
        </div>

        <div class="contact-line__group">
          <p class="contact-line__label text-secondary">Email</p>
          <a
            class="contact-line__value contact-line__link"
            href="mailto:gabinete@kanbouripsicologia.com"
          >
            gabinete@kanbouripsicologia.com
          </a>
        </div>

        <div class="contact-line__group">
          <p class="contact-line__label text-secondary">Horario</p>
          <p class="contact-line__value">
            Lunes a Viernes · 12:00 a 20:00 ·
            <router-link to="/pedir-cita" class="contact-line__link">Con cita previa</router-link>
          </p>
        </div>
      </div>

      <div class="footer-map" aria-hidden="true">
        <p class="footer-map__placeholder text-secondary">Mapa próximamente</p>
      </div>
    </div>

    <div class="footer-bottom text-footer">
      © {{ new Date().getFullYear() }} Kanbouri Psicología · Dénia
    </div>
  </footer>
</template>

<style scoped>
.the-footer {
  background: var(--color-paper-alt);
  border-top: 1px solid var(--color-line);
  padding: clamp(48px, 7vw, 72px) clamp(20px, 4vw, 48px) 28px;
  font-family: var(--font-body);
}

.footer-content {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: clamp(32px, 5vw, 64px);
  align-items: start;
}

/* ---------- Marca ---------- */
.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.footer-brand {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}

.footer-brand__name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 20px;
  color: var(--color-heading);
  letter-spacing: -0.01em;
}

.footer-brand__tag {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-rose-hover);
}

.footer-person {
  margin: 0 0 18px;
}

.social-icons {
  display: flex;
  gap: 12px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--color-rose-soft-wash);
  color: var(--color-rose-hover);
  transition: background-color var(--dur-base) var(--ease-base),
    color var(--dur-base) var(--ease-base), transform var(--dur-base) var(--ease-base);
}

.social-link:hover {
  background: var(--color-rose);
  color: var(--color-on-rose);
  transform: translateY(-2px);
}

.social-icon {
  width: 18px;
  height: 18px;
}

/* ---------- Enlaces legales ---------- */
.legal-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.legal-title {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  margin: 0 0 16px;
}

.legal-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legal-links a {
  text-decoration: none;
  color: var(--color-ink);
  font-size: 14px;
  transition: color var(--dur-base) var(--ease-base);
}

.legal-links a:hover {
  color: var(--color-rose-hover);
}

/* ---------- Contacto + mapa (fila inferior) ---------- */
.footer-secondary {
  max-width: var(--content-max-width);
  margin: clamp(32px, 5vw, 48px) auto 0;
  padding-top: clamp(28px, 4vw, 40px);
  border-top: 1px solid var(--color-line);
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: clamp(32px, 5vw, 64px);
  align-items: start;
}

.contact-line {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(20px, 3vw, 40px);
}

.contact-line__group {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}

.contact-line__label {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 12px;
}

.contact-line__value {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-ink);
  max-width: 26ch;
}

.contact-line__link {
  text-decoration: none;
  transition: color var(--dur-base) var(--ease-base);
}

.contact-line__link:hover {
  color: var(--color-rose-hover);
}

.footer-map {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  background: var(--color-paper);
  border: 1px dashed var(--color-line);
  border-radius: var(--radius-lg);
}

.footer-map__placeholder {
  font-size: 13px;
}

/* ---------- Línea inferior ---------- */
.footer-bottom {
  max-width: var(--content-max-width);
  margin: clamp(32px, 5vw, 48px) auto 0;
  padding-top: 20px;
  border-top: 1px solid var(--color-line);
  text-align: center;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .footer-secondary {
    grid-template-columns: 1fr;
  }

  .contact-line {
    flex-direction: column;
  }

  .contact-line__value {
    max-width: none;
  }
}
</style>
