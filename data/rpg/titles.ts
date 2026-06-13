import type { Title } from '../../src/lib/rpg-types'

const titles: Title[] = [
  {
    key: 'apprentice_writer',
    name: 'Apprentice Writer',
    description: 'Published your first article!',
    requirement: 'Publish 1 article',
  },
  {
    key: 'prolific_author',
    name: 'Prolific Author',
    description: 'A growing body of work.',
    requirement: 'Publish 10 articles',
  },
  {
    key: 'wordsmith',
    name: 'Wordsmith',
    description: 'Master of the written word.',
    requirement: 'Publish 50 articles',
  },
]

export default titles
