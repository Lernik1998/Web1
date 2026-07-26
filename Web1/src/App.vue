<script setup lang="ts">
import AppHeader from "./components/AppHeader.vue";
import Footer from './components/Footer.vue';
</script>

<template>
  <AppHeader />
  <main>
    <router-view />
  </main>
  <Footer />
</template>

<style scoped>

</style>
