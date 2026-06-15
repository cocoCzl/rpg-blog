<template>
  <div class="space-y-6">
    <ArticleCard v-for="article in articles" :key="article.slug" :article="article" :locale="locale" />

    <nav v-if="totalPages > 1" class="flex justify-center items-center gap-2 pt-4">
      <a
        v-if="currentPage > 1"
        :href="currentPage === 2 ? '/' : `${basePath}${currentPage - 1}`"
        class="px-3 py-1.5 rounded-lg text-sm"
        style="background: var(--color-surface); color: var(--color-text)"
        :aria-label="copy.prevAria"
      >
        &larr; {{ copy.prev }}
      </a>
      <span class="text-sm" style="color: var(--color-text-secondary)">
        {{ copy.page }} {{ currentPage }} / {{ totalPages }}
      </span>
      <a
        v-if="currentPage < totalPages"
        :href="`${basePath}${currentPage + 1}`"
        class="px-3 py-1.5 rounded-lg text-sm"
        style="background: var(--color-surface); color: var(--color-text)"
        :aria-label="copy.nextAria"
      >
        {{ copy.next }} &rarr;
      </a>
    </nav>
  </div>
</template>

<script setup lang="ts">
import type { CollectionEntry } from 'astro:content'
import ArticleCard from './ArticleCard.vue'
import { t } from '../../lib/i18n'

const props = defineProps<{
  articles: CollectionEntry<'posts'>[]
  currentPage: number
  totalPages: number
  basePath: string
  locale?: 'en' | 'zh'
}>()

const locale = props.locale ?? 'en'
const copy = {
  prev: t('blog.prev', locale),
  next: t('blog.next', locale),
  page: t('blog.page', locale),
  prevAria: locale === 'zh' ? '上一页' : 'Previous page',
  nextAria: locale === 'zh' ? '下一页' : 'Next page',
}
</script>
