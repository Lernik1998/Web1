<template>
  <nav class="kb-breadcrumbs" aria-label="Ruta de navegación">
    <ol class="kb-breadcrumbs__list">
      <li v-for="(item, index) in items" :key="item.path" class="kb-breadcrumbs__item">
        <router-link v-if="index < items.length - 1" :to="item.path" class="kb-breadcrumbs__link">
          {{ item.name }}
        </router-link>
        <span v-else class="kb-breadcrumbs__current" aria-current="page">{{ item.name }}</span>
        <span v-if="index < items.length - 1" class="kb-breadcrumbs__sep" aria-hidden="true">/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
export interface BreadcrumbItem {
  name: string
  /** Ruta interna, p. ej. "/equipo": la construye cada vista, ver useBreadcrumbSchema.ts. */
  path: string
}

defineOptions({
  name: 'TheBreadcrumbs',
})

defineProps<{ items: BreadcrumbItem[] }>()
</script>

<style scoped>
.kb-breadcrumbs {
  max-width: 760px;
  margin: 0 auto clamp(20px, 3vw, 28px);
}

.kb-breadcrumbs__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.875rem;
  color: var(--color-secondary);
}

.kb-breadcrumbs__item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.kb-breadcrumbs__link {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: color var(--dur-base) var(--ease-base), border-color var(--dur-base) var(--ease-base);
}

@media (hover: hover) and (pointer: fine) {
  .kb-breadcrumbs__link:hover {
    color: var(--color-rose-hover);
    border-color: var(--color-rose-hover);
  }
}

.kb-breadcrumbs__current {
  color: var(--color-heading);
  font-weight: 500;
}

.kb-breadcrumbs__sep {
  color: var(--color-line);
}
</style>
