<template>
  <article class="glass-card p-6 hover:shadow-glass-hover transition-all duration-300 hover:translate-y-[-2px]">
    <a :href="`/posts/${article.slug}`" class="block space-y-3">
      <div v-if="article.data.cover" class="w-full h-48 overflow-hidden rounded-lg">
        <img
          :src="article.data.cover"
          :alt="article.data.title"
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div class="flex items-center gap-3 text-sm" style="color: var(--color-text-secondary)">
        <time :datetime="article.data.date.toISOString()">
          {{ formatDate(article.data.date) }}
        </time>
        <span v-if="article.data.tags.length" class="flex gap-1.5">
          <span
            v-for="tag in article.data.tags"
            :key="tag"
            class="px-2 py-0.5 rounded-full text-xs"
            style="background: var(--color-primary); color: var(--color-bg)"
          >
            {{ tag }}
          </span>
        </span>
      </div>
      <h2 class="text-xl font-bold" style="font-family: var(--font-heading); color: var(--color-text)">
        {{ article.data.title }}
      </h2>
      <p v-if="article.data.summary" class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">
        {{ article.data.summary }}
      </p>
    </a>
  </article>
</template>

<script setup lang="ts">
import type { CollectionEntry } from 'astro:content'
import config from '../../../site.config'

defineProps<{
  article: CollectionEntry<'posts'>
}>()

function formatDate(date: Date): string {
  const locale = config.locale === 'zh' ? 'zh-CN' : 'en-US'
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>
