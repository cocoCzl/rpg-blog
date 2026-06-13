import { defineCollection, z } from 'astro:content'

const posts = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    summary: z.string().optional(),
  }),
})

export const collections = { posts }
