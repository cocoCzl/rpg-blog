import type { SiteConfig } from './src/lib/theme'

const config: SiteConfig = {
  siteUrl: process.env.SITE_URL || 'http://localhost:4321',
  title: 'RPG Blog',
  description: 'A personal blog with RPG-style gamification',
  author: {
    name: 'Blog Author',
    avatar: '/avatar.jpg',
    bio: 'An adventurer documenting the journey through the digital wilderness.',
  },
  social: {
    github: 'https://github.com/yourusername',
    twitter: 'https://twitter.com/yourusername',
    website: 'https://yourwebsite.com',
  },
  theme: {
    preset: 'twilight',
    backgroundImages: [],
  },
  locale: 'en',
  postsPerPage: 6,
}

export default config
