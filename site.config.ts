import type { SiteConfig } from './src/lib/theme'

const config: SiteConfig = {
  siteUrl: process.env.SITE_URL || 'http://localhost:4321',
  title: 'Starter Blog',
  description: 'A deploy-ready blog template with optional comments and RPG features.',
  home: {
    intro: 'Use this space for a short site introduction, publishing focus, or editorial note.',
  },
  author: {
    name: 'Site Owner',
    avatar: '',
    bio: 'Write a short introduction so readers know what this site is about.',
  },
  social: {
    github: '',
    twitter: '',
    website: '',
  },
  theme: {
    preset: 'twilight',
    backgroundImages: [],
  },
  locale: 'en',
  i18n: {
    en: {
      title: 'Starter Blog',
      description: 'A deploy-ready blog template with optional comments and RPG features.',
      homeIntro: 'Use this space for a short site introduction, publishing focus, or editorial note.',
      authorName: 'Site Owner',
      authorBio: 'Write a short introduction so readers know what this site is about.',
    },
    zh: {
      title: '起步博客',
      description: '一个可直接部署的博客模板，内置可选评论和 RPG 功能。',
      homeIntro: '在这里写下站点简介、发布方向或编辑说明。',
      authorName: '站点作者',
      authorBio: '写一段简短介绍，让读者了解这个站点关注什么。',
    },
  },
  postsPerPage: 6,
  features: {
    comments: true,
    githubOAuth: true,
    rpg: true,
  },
  security: {
    csp: {
      scriptSrc: [],
      styleSrc: [],
      imgSrc: ['https:'],
      connectSrc: [],
      fontSrc: [],
      frameSrc: [],
    },
  },
}

export default config
