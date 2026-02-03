import { ref, type Ref } from 'vue'

type ReorderState = 'idle' | 'grabbed'

interface UseKeyboardReorderOptions<T extends { id: string }> {
  items: Ref<T[]>
  onReorder: (newOrder: string[]) => void
}

export function useKeyboardReorder<T extends { id: string; sales_order_number?: string }>(
  options: UseKeyboardReorderOptions<T>
) {
  const reorderState = ref<ReorderState>('idle')
  const grabbedIndex = ref<number | null>(null)
  const announcement = ref('')

  function announceGrab(index: number) {
    const item = options.items.value[index]
    announcement.value = `${item.sales_order_number || 'Item'} grabbed. Position ${index + 1} of ${options.items.value.length}. Use arrow keys to move, Space to drop, Escape to cancel.`
  }

  function announceMove(newIndex: number) {
    announcement.value = `Moved to position ${newIndex + 1} of ${options.items.value.length}`
  }

  function announceDrop(index: number) {
    announcement.value = `Dropped at position ${index + 1}`
    // Emit the new order
    options.onReorder(options.items.value.map(i => i.id))
  }

  function announceCancel() {
    announcement.value = 'Reorder cancelled'
  }

  function moveItem(fromIndex: number, toIndex: number) {
    const items = [...options.items.value]
    const [moved] = items.splice(fromIndex, 1)
    items.splice(toIndex, 0, moved)
    options.items.value = items
    return toIndex
  }

  function handleKeydown(e: KeyboardEvent, index: number): number | null {
    const items = options.items.value
    const isMeta = e.metaKey || e.ctrlKey

    if (reorderState.value === 'idle') {
      if (e.key === ' ') {
        e.preventDefault()
        reorderState.value = 'grabbed'
        grabbedIndex.value = index
        announceGrab(index)
        return index
      }
    } else if (reorderState.value === 'grabbed' && grabbedIndex.value !== null) {
      const currentIndex = grabbedIndex.value

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        const newIndex = isMeta ? 0 : Math.max(0, currentIndex - 1)
        if (newIndex !== currentIndex) {
          moveItem(currentIndex, newIndex)
          grabbedIndex.value = newIndex
          announceMove(newIndex)
        }
        return newIndex
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const newIndex = isMeta ? items.length - 1 : Math.min(items.length - 1, currentIndex + 1)
        if (newIndex !== currentIndex) {
          moveItem(currentIndex, newIndex)
          grabbedIndex.value = newIndex
          announceMove(newIndex)
        }
        return newIndex
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        const finalIndex = grabbedIndex.value
        reorderState.value = 'idle'
        announceDrop(finalIndex)
        grabbedIndex.value = null
        return finalIndex
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        reorderState.value = 'idle'
        grabbedIndex.value = null
        announceCancel()
        // Note: caller should restore original order on Escape
        return null
      }
    }
    return null
  }

  return {
    reorderState,
    grabbedIndex,
    announcement,
    handleKeydown,
  }
}
