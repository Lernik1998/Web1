<script setup lang="ts">
import Header from "./components/Header.vue";
import Footer from './components/Footer.vue';
import CookieConsent from './components/CookieConsent.vue';
import WhatsAppButton from './components/WhatsAppButton.vue';
</script>

<template>
  <Header />
  <main>
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

<style scoped>
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 240ms var(--ease-base), transform 240ms var(--ease-base);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
