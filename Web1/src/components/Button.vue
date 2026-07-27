<template>
  <router-link v-if="to" :to="to" class="kb-btn" :class="variantClass">
    <slot />
  </router-link>

  <a v-else-if="href" :href="href" class="kb-btn" :class="variantClass">
    <slot />
  </a>

  <button v-else type="button" class="kb-btn" :class="variantClass">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    to?: RouteLocationRaw | null
    href?: string | null
    variant?: 'primary' | 'outline'
  }>(),
  {
    to: null,
    href: null,
    variant: 'primary',
  },
)

const variantClass = computed(() => `kb-btn--${props.variant}`)
</script>

<style scoped>
.kb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 24px;
  border-radius: var(--radius-pill);
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color 320ms var(--ease-base),
    transform 320ms var(--ease-base),
    box-shadow 320ms var(--ease-base);
}

.kb-btn--primary {
  background: var(--color-rose);
  color: var(--color-on-rose);
  box-shadow: var(--shadow-cta);
}

.kb-btn--primary:hover {
  background: var(--color-rose-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-cta-hover);
}

.kb-btn--outline {
  background: transparent;
  color: var(--color-rose-hover);
  border: 1px solid var(--color-rose);
}

.kb-btn--outline:hover {
  background: var(--color-rose-soft-wash);
  transform: translateY(-1px);
}

.kb-btn:active {
  transform: translateY(0) scale(0.98);
}
</style>
