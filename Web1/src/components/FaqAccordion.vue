<template>
  <div class="kb-faq">
    <div v-for="(item, index) in items" :key="item.question" class="kb-faq__item">
      <button
        type="button"
        class="kb-faq__question"
        :aria-expanded="openIndex === index"
        @click="toggle(index)"
      >
        <span>{{ item.question }}</span>
        <span class="kb-faq__icon" :class="{ 'is-open': openIndex === index }" aria-hidden="true">
          +
        </span>
      </button>

      <div class="kb-faq__answer-wrapper" :class="{ 'is-open': openIndex === index }">
        <p class="kb-faq__answer">{{ item.answer }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  items: Array<{ question: string; answer: string }>
}>()

const openIndex = ref<number | null>(0)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<style scoped>
.kb-faq {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
}

.kb-faq__item {
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.kb-faq__question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 14px 18px;
  border: none;
  background: var(--color-paper);
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-heading);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--dur-base) var(--ease-base),
    transform var(--dur-fast) var(--ease-base);
}

.kb-faq__question:hover {
  background: var(--color-rose-soft-wash);
}

.kb-faq__question:active {
  transform: scale(0.99);
}

.kb-faq__icon {
  flex-shrink: 0;
  color: var(--color-rose-hover);
  font-size: 18px;
  line-height: 1;
  transition: transform var(--dur-base) var(--ease-base);
}

.kb-faq__icon.is-open {
  transform: rotate(90deg);
}

.kb-faq__answer-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  background: var(--color-paper);
  transition: grid-template-rows 320ms var(--ease-base), opacity 240ms var(--ease-base);
}

.kb-faq__answer-wrapper.is-open {
  grid-template-rows: 1fr;
  opacity: 1;
}

.kb-faq__answer {
  min-height: 0;
  overflow: hidden;
  padding: 0 18px 16px;
  color: var(--color-ink);
  line-height: 1.6;
}
</style>
