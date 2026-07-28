<script setup lang="ts">
import AppHeader from "./components/AppHeader.vue";
import Footer from './components/Footer.vue';
</script>

<template>
  <AppHeader />
  <main>
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
  <Footer />
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
