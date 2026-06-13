import type { Skill } from '../../src/lib/rpg-types'

const skills: Skill[] = [
  {
    key: 'writing',
    name: 'Writing',
    description: 'Craft well-structured blog posts that captivate readers.',
    icon: 'pen',
    level: 1,
    category: 'crafting',
  },
  {
    key: 'markdown_mastery',
    name: 'Markdown Mastery',
    description: 'Format articles with advanced markdown techniques.',
    icon: 'code',
    level: 2,
    category: 'crafting',
  },
  {
    key: 'seo_sense',
    name: 'SEO Sense',
    description: 'Optimize articles to rank higher in search results.',
    icon: 'search',
    level: 3,
    category: 'social',
  },
  {
    key: 'storytelling',
    name: 'Storytelling',
    description: 'Weave engaging narratives that keep readers coming back.',
    icon: 'book',
    level: 5,
    category: 'social',
  },
  {
    key: 'speed_typing',
    name: 'Speed Typing',
    description: 'Write articles faster with improved typing efficiency.',
    icon: 'zap',
    level: 2,
    category: 'combat',
  },
]

export default skills
