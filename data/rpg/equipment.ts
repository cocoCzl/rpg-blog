import type { Equipment } from '../../src/lib/rpg-types'

const equipment: Equipment[] = [
  {
    key: 'mechanical_keyboard',
    name: 'Mechanical Keyboard',
    description: 'A satisfying clicky keyboard for productive writing sessions.',
    icon: 'keyboard',
    slot: 'weapon',
    stats: { attack: 5, speed: 3 },
  },
  {
    key: 'noise_cancelling',
    name: 'Noise-Cancelling Headphones',
    description: 'Block out distractions and focus on writing.',
    icon: 'headphones',
    slot: 'accessory',
    stats: { defense: 4, magic: 2 },
  },
  {
    key: 'ergonomic_chair',
    name: 'Ergonomic Chair',
    description: 'Write for hours without back pain.',
    icon: 'armchair',
    slot: 'armor',
    stats: { defense: 6 },
  },
]

export default equipment
