<template>
  <div class="space-y-6">
    <ArticleCard v-for="article in articles" :key="article.slug" :article="article" />

    <nav v-if="totalPages > 1" class="flex justify-center items-center gap-2 pt-4">
      <a
        v-if="currentPage > 1"
        :href="currentPage === 2 ? '/' : `${basePath}${currentPage - 1}`"
        class="px-3 py-1.5 rounded-lg text-sm"
        style="background: var(--color-surface); color: var(--color-text)"
        aria-label="Previous page"
      >
        &larr; Prev
      </a>
      <span class="text-sm" style="color: var(--color-text-secondary)">
        Page {{ currentPage }} / {{ totalPages }}
      </span>
      <a
        v-if="currentPage < totalPages"
        :href="`${basePath}${currentPage + 1}`"
        class="px-3 py-1.5 rounded-lg text-sm"
        style="background: var(--color-surface); color: var(--color-text)"
        aria-label="Next page"
      >
        Next &rarr;
      </a>
    </nav>
  </div>
</template>

<script setup lang="ts">
import type { CollectionEntry } from 'astro:content'
import ArticleCard from './ArticleCard.vue'

defineProps<{
  articles: CollectionEntry<'posts'>[]
  currentPage: number
  totalPages: number
  basePath: string
}>()
</script>
