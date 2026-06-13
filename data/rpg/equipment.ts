import type { Equipment } from '../../src/lib/rpg-types'

const equipment: Equipment[] = [
  { key: 'mechanical_keyboard', name: 'Mechanical Keyboard', description: 'Satisfying clicky keys for productive writing.', icon: 'keyboard', slot: 'WEAPON', level: 5 },
  { key: 'noise_cancelling', name: 'Noise-Cancelling Headphones', description: 'Block out distractions.', icon: 'headphones', slot: 'ACCESSORY_1', level: 3 },
  { key: 'ergonomic_chair', name: 'Ergonomic Chair', description: 'Write for hours without back pain.', icon: 'armchair', slot: 'BODY', level: 4 },
]

export default equipment
