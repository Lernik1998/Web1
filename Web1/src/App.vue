<template>
  <MaintenanceView v-if="maintenanceMode" />

  <template v-else>
    <!-- Antes del propio contenido, sin depender del ratón: invisible salvo
         al recibir el foco (tabulando desde el principio de la página).
         Sin esto, alguien navegando solo con teclado tiene que pasar por
         todo el menú -- incluidas las paradas del desplegable de Terapias
         -- en cada página antes de llegar al contenido real. -->
    <a href="#main-content" class="kb-skip-link">Saltar al contenido</a>
    <Header />
    <!-- `tabindex="-1"`: un <main> no es focuseable por defecto, así que sin
         esto el enlace de arriba solo desplazaba la página (scroll) sin
         mover realmente el foco -- quien usa lector de pantalla se quedaba
         igualmente al principio, sin ningún salto real. -->
    <main id="main-content" tabindex="-1">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <Footer />
    <WhatsAppButton />
    <CookieConsent />
  </template>
</template>

<script setup lang="ts">
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import CookieConsent from './components/CookieConsent.vue'
import WhatsAppButton from './components/WhatsAppButton.vue'
import MaintenanceView from './views/MaintenanceView.vue'

// Interruptor general de mantenimiento (ver .env, VITE_MAINTENANCE_MODE):
// activado, sustituye toda la web -- cualquier URL -- por el aviso, sin
// cabecera, pie ni el resto de la navegación normal.
const maintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true'
</script>

<style scoped>
.kb-skip-link {
  position: absolute;
  top: -100px;
  left: 12px;
  z-index: 300;
  padding: 12px 20px;
  border-radius: var(--radius-pill);
  background: var(--color-rose);
  color: var(--color-on-rose);
  text-decoration: none;
  box-shadow: var(--shadow-cta);
  transition: top var(--dur-base) var(--ease-base);
}

.kb-skip-link:focus {
  top: 12px;
}

/* Sin desplazamiento vertical (solo fundido) y algo más lento que antes:
   el translateY se notaba como un "salto" en vez de una transición
   tranquila, sobre todo entre páginas de alturas muy distintas. Misma
   duración/curva que la transición nativa de las navegaciones con recarga
   real (ver @view-transition en global.css), para que se sienta igual en
   toda la web. */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 420ms ease-in-out;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
