import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface DanmakuItem {
  id: string
  content: string
  color: string
  _track: number
  _startTime: number
}

export const useDanmakuStore = defineStore('danmaku', () => {
  const enabled = ref(true)
  const items = ref<DanmakuItem[]>([])
  const usedIds = ref(new Set<string>())

  function add(item: DanmakuItem) {
    if (usedIds.value.has(item.id)) return
    usedIds.value.add(item.id)
    items.value.push(item)
    if (usedIds.value.size > 500) {
      const arr = Array.from(usedIds.value).slice(-100)
      usedIds.value = new Set(arr)
    }
  }

  function remove(id: string) {
    items.value = items.value.filter(i => i.id !== id)
  }

  return { enabled, items, add, remove }
})
