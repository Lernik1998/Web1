<script setup lang="ts">
defineOptions({
  name: 'TheFooter',
})
</script>

<template>
  <footer class="the-footer">
    <div class="footer-content">
      <div class="brand-section">
        <div class="logo-icon">
          <svg viewBox="0 0 100 100" class="brain-logo">
            <path
              d="M50 10 C30 10 15 25 15 45 C15 55 20 65 30 72 C25 78 25 85 30 90 C35 95 45 95 50 90 C55 95 65 95 70 90 C75 85 75 78 70 72 C80 65 85 55 85 45 C85 25 70 10 50 10 Z"
              fill="currentColor"
            />
            <path
              d="M35 30 C35 28 37 26 40 26 C43 26 45 28 45 30 C45 32 43 34 40 34 C37 34 35 32 35 30 Z"
              fill="#fce4ec"
            />
            <path
              d="M55 30 C55 28 57 26 60 26 C63 26 65 28 65 30 C65 32 63 34 60 34 C57 34 55 32 55 30 Z"
              fill="#fce4ec"
            />
            <path
              d="M40 45 C40 43 42 41 45 41 C48 41 50 43 50 45 C50 47 48 49 45 49 C42 49 40 47 40 45 Z"
              fill="#fce4ec"
            />
            <path
              d="M50 55 C50 53 52 51 55 51 C58 51 60 53 60 55 C60 57 58 59 55 59 C52 59 50 57 50 55 Z"
              fill="#fce4ec"
            />
          </svg>
        </div>
        <p class="brand-name">MARÍA B. KANBOURI</p>
        <div class="contact-info">
          <p>Psicología Clínica</p>
          <p>Terapia Online</p>
        </div>
        <div class="social-icons">
          <a href="#" aria-label="Facebook" class="social-link">
            <svg viewBox="0 0 24 24" fill="currentColor" class="social-icon">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
            </svg>
          </a>
          <a href="#" aria-label="Instagram" class="social-link">
            <svg viewBox="0 0 24 24" fill="currentColor" class="social-icon">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
          <a href="#" aria-label="LinkedIn" class="social-link">
            <svg viewBox="0 0 24 24" fill="currentColor" class="social-icon">
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
        </div>
      </div>

      <div class="legal-links">
        <h3 class="legal-title">Legal</h3>
        <ul>
          <li><router-link to="/contacto">Contacto</router-link></li>
          <li><router-link to="/politica-privacidad">Política de privacidad</router-link></li>
          <li><router-link to="/aviso-legal">Aviso legal</router-link></li>
          <li><router-link to="/politica-cookies">Política de cookies</router-link></li>
        </ul>
      </div>

      <div class="placeholder-box"></div>
    </div>
  </footer>
</template>

<style scoped>
.the-footer {
  background-color: #fce4ec;
  padding: 3rem 2rem;
  color: #333;
  font-family: 'Georgia', serif;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.brand-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.logo-icon {
  width: 60px;
  height: 60px;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.brain-logo {
  width: 100%;
  height: 100%;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.5rem 0;
  letter-spacing: 1px;
}

.contact-info {
  margin: 1rem 0;
  font-size: 0.9rem;
  line-height: 1.6;
}

.contact-info p {
  margin: 0.25rem 0;
}

.social-icons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.social-link {
  color: #1a1a1a;
  transition: color 0.3s;
}

.social-link:hover {
  color: #4a4a4a;
}

.social-icon {
  width: 24px;
  height: 24px;
}

.legal-links {
  display: flex;
  flex-direction: column;
}

.legal-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  margin-top: 0;
}

.legal-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.legal-links li {
  margin-bottom: 0.75rem;
}

.legal-links a {
  text-decoration: none;
  color: #333;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.legal-links a:hover {
  color: #1a1a1a;
  text-decoration: underline;
}

.placeholder-box {
  background-color: #f8bbd0;
  height: 150px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .brand-section {
    align-items: center;
    text-align: center;
  }

  .legal-links {
    align-items: center;
  }

  .placeholder-box {
    display: none;
  }
}
</style>
