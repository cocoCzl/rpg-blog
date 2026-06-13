import type { Skill } from '../../src/lib/rpg-types'

const skills: Skill[] = [
  { key: 'writing', name: 'Writing', description: 'Craft well-structured blog posts.', icon: 'pen', level: 1, category: 'Active', sortOrder: 1 },
  { key: 'debugging', name: 'Debugging', description: 'Find and fix bugs efficiently.', icon: 'bug', level: 2, category: 'Active', sortOrder: 2 },
  { key: 'markdown_mastery', name: 'Markdown Mastery', description: 'Format articles with advanced markdown.', icon: 'code', level: 3, category: 'Passive', sortOrder: 3 },
  { key: 'seo_sense', name: 'SEO Sense', description: 'Rank higher in search results.', icon: 'search', level: 4, category: 'Passive', sortOrder: 4 },
  { key: 'speed_typing', name: 'Speed Typing', description: 'Write faster with improved efficiency.', icon: 'zap', level: 2, category: 'Active', sortOrder: 5 },
]

export default skills
