import { defineCollection, z } from 'astro:content'

const posts = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    locale: z.enum(['en', 'zh']).default('en'),
    baseSlug: z.string().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),
    cover: z.string().optional(),
    summary: z.string().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    canonicalUrl: z.string().url().optional(),
  }),
})

export const collections = { posts }
