<script setup lang="ts">
import MainHeader from './components/Header.vue'
import Footer from './components/Footer.vue';
</script>

<template>
  <MainHeader />
  <main>
    <router-view />
  </main>
  <Footer />
</template>

<style scoped>

</style>
