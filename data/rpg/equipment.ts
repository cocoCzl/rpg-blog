import type { Equipment } from '../../src/lib/rpg-types'

const equipment: Equipment[] = [
  { key: 'mechanical_keyboard', name: 'Mechanical Keyboard', nameZh: '机械键盘', description: 'Satisfying clicky keys for productive writing.', descriptionZh: '清脆手感带来更顺畅的写作节奏。', icon: 'keyboard', slot: 'WEAPON', level: 5 },
  { key: 'noise_cancelling', name: 'Noise-Cancelling Headphones', nameZh: '降噪耳机', description: 'Block out distractions.', descriptionZh: '隔绝干扰，保持专注。', icon: 'headphones', slot: 'ACCESSORY_1', level: 3 },
  { key: 'ergonomic_chair', name: 'Ergonomic Chair', nameZh: '人体工学椅', description: 'Write for hours without back pain.', descriptionZh: '长时间写作也能保持舒适。', icon: 'armchair', slot: 'BODY', level: 4 },
]

export default equipment
