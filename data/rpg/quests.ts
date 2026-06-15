import type { Quest } from '../../src/lib/rpg-types'

const quests: Quest[] = [
  {
    key: 'first_post',
    name: 'First Steps',
    nameZh: '第一步',
    description: 'Write and publish your first blog post.',
    descriptionZh: '撰写并发布你的第一篇博客文章。',
    objective: 'Publish 1 article',
    objectiveZh: '发布 1 篇文章',
    target: 1,
    reward: { experience: 100, title: 'apprentice_writer' },
  },
  {
    key: 'tag_master',
    name: 'Tag Master',
    nameZh: '标签达人',
    description: 'Use at least 3 different tags across your articles.',
    descriptionZh: '在文章中使用至少 3 个不同标签。',
    objective: 'Use 3 unique tags',
    objectiveZh: '使用 3 个不同标签',
    target: 3,
    reward: { experience: 150, skill: 'writing' },
  },
  {
    key: 'keyboard_warrior',
    name: 'Keyboard Warrior',
    nameZh: '键盘战士',
    description: 'Write a total of 5000 words across all articles.',
    descriptionZh: '累计写下 5000 字内容。',
    objective: 'Write 5000 words',
    objectiveZh: '写作 5000 字',
    target: 5000,
    reward: { experience: 300, equipment: 'mechanical_keyboard' },
  },
]

export default quests
