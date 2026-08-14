<template>
  <div class="kb-related" v-animate-on-scroll>
    <h2 class="kb-related__title text-h2">Terapias relacionadas</h2>
    <ul class="kb-related__pills">
      <li v-for="link in links" :key="link.href">
        <router-link :to="link.href" class="kb-related__pill">
          {{ link.label }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'RelatedTherapies',
})

defineProps<{
  links: { label: string; href: string }[]
}>()
</script>

<style scoped>
.kb-related__title {
  margin-bottom: 14px;
}

.kb-related__pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  /* Reset del <ul>: aquí es una lista real (antes era un <div> con enlaces
     sueltos, sin estructura), pero visualmente sigue siendo una fila de
     píldoras, no una lista con topos. */
  list-style: none;
  margin: 0;
  padding: 0;
}

.kb-related__pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  font-size: 14px;
  color: var(--color-ink);
  background: var(--color-rose-soft-wash);
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--dur-base) var(--ease-base),
    border-color var(--dur-base) var(--ease-base), color var(--dur-base) var(--ease-base),
    transform var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-related__pill:hover {
    background: var(--color-rose);
    border-color: var(--color-rose);
    color: var(--color-on-rose);
    transform: translateY(-1px);
  }
}
</style>
