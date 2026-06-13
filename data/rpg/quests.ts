import type { Quest } from '../../src/lib/rpg-types'

const quests: Quest[] = [
  {
    key: 'first_post',
    name: 'First Steps',
    description: 'Write and publish your first blog post.',
    objective: 'Publish 1 article',
    target: 1,
    reward: { experience: 100, title: 'apprentice_writer' },
  },
  {
    key: 'tag_master',
    name: 'Tag Master',
    description: 'Use at least 3 different tags across your articles.',
    objective: 'Use 3 unique tags',
    target: 3,
    reward: { experience: 150, skill: 'writing' },
  },
  {
    key: 'keyboard_warrior',
    name: 'Keyboard Warrior',
    description: 'Write a total of 5000 words across all articles.',
    objective: 'Write 5000 words',
    target: 5000,
    reward: { experience: 300, equipment: 'mechanical_keyboard' },
  },
]

export default quests
