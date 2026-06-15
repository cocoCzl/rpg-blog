import type { Skill } from '../../src/lib/rpg-types'

const skills: Skill[] = [
  { key: 'writing', name: 'Writing', nameZh: '写作', description: 'Craft well-structured blog posts.', descriptionZh: '撰写结构清晰的博客文章。', icon: 'pen', level: 1, category: 'Active', sortOrder: 1 },
  { key: 'debugging', name: 'Debugging', nameZh: '调试', description: 'Find and fix bugs efficiently.', descriptionZh: '高效定位并修复问题。', icon: 'bug', level: 2, category: 'Active', sortOrder: 2 },
  { key: 'markdown_mastery', name: 'Markdown Mastery', nameZh: 'Markdown 精通', description: 'Format articles with advanced markdown.', descriptionZh: '用进阶 Markdown 组织文章格式。', icon: 'code', level: 3, category: 'Passive', sortOrder: 3 },
  { key: 'seo_sense', name: 'SEO Sense', nameZh: 'SEO 直觉', description: 'Rank higher in search results.', descriptionZh: '让内容更容易被搜索发现。', icon: 'search', level: 4, category: 'Passive', sortOrder: 4 },
  { key: 'speed_typing', name: 'Speed Typing', nameZh: '快速输入', description: 'Write faster with improved efficiency.', descriptionZh: '提升写作速度和产出效率。', icon: 'zap', level: 2, category: 'Active', sortOrder: 5 },
]

export default skills
