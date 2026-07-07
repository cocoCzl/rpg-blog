import type { SiteConfig } from './src/lib/theme'

const config: SiteConfig = {
  siteUrl: process.env.SITE_URL || 'http://localhost:4321',
  locale: 'zh',
  title: {
    zh: '企鹅工会',
    en: 'Penguin Guild',
  },
  description: {
    zh: '一套像进入像素 RPG 公会菜单一样打开的个人博客模板。',
    en: 'A personal blog template that opens like a polished pixel RPG guild menu.',
  },
  author: {
    name: {
      zh: '未命名记录员',
      en: 'Unnamed Scribe',
    },
    avatar: '',
    bio: {
      zh: '在公会大厅、地图桌和道具栏之间整理见闻，把每次出发写成可以回看的冒险手札。',
      en: 'Collecting notes between the guild hall, map table, and inventory, then saving each departure as a journal entry.',
    },
  },
  social: {
    github: '',
    twitter: '',
    website: '',
  },
  home: {
    intro: {
      zh: '任务板显示置顶手札，存档栏收纳最近记录，指令菜单带你进入章节、线索和个人档案。',
      en: 'The quest board highlights a pinned entry, save slots hold recent notes, and the command menu opens chapters, clues, and profile paths.',
    },
    focus: [
      {
        title: {
          zh: '当前状态',
          en: 'Current Status',
        },
        detail: {
          zh: '整理新的冒险记录，打磨公会菜单的每个入口。',
          en: 'Sorting new journal entries and polishing every guild menu route.',
        },
      },
      {
        title: {
          zh: '章节路线',
          en: 'Chapter Routes',
        },
        detail: {
          zh: '技术、阅读、生活和项目被归入不同章节，方便回看。',
          en: 'Technology, reading, life, and projects are grouped into readable chapters.',
        },
      },
      {
        title: {
          zh: '下一份委托',
          en: 'Next Commission',
        },
        detail: {
          zh: '把道具栏里的方法、灵感和链接整理成下一篇手札。',
          en: 'Turning inventory methods, ideas, and links into the next journal entry.',
        },
      },
    ],
    toolbox: [
      {
        title: {
          zh: '羽笔与地图',
          en: 'Quill And Map',
        },
        detail: {
          zh: '记录草稿、复盘、路线图和发布节奏。',
          en: 'Drafts, retrospectives, route maps, and publishing rhythms.',
        },
      },
      {
        title: {
          zh: '工坊道具',
          en: 'Workshop Items',
        },
        detail: {
          zh: '存放正在打磨的作品、实验和可复用资源。',
          en: 'Works, experiments, and reusable resources currently being refined.',
        },
      },
    ],
  },
  theme: {
    preset: 'guild',
    backgroundImage: '',
    effects: ['embers', 'mist'],
  },
  display: {
    showAbout: true,
    showTags: true,
    showArchive: true,
    showToolbox: true,
  },
  postsPerPage: 6,
}

export default config
