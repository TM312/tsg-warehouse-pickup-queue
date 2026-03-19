<script setup lang="ts">
import { SHORTCUT_DISPLAY } from '@/constants/keyboard-shortcuts'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const { isHelpVisible, hideHelp } = useKeyboardShortcuts()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isHelpVisible"
      data-testid="keyboard-shortcut-overlay"
      class="fixed bottom-4 left-4 z-50 rounded-lg border bg-popover/90 p-4 shadow-lg backdrop-blur-sm"
      @click="hideHelp"
    >
      <h3 class="mb-2 text-sm font-semibold text-foreground">Keyboard Shortcuts</h3>
      <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
        <template v-for="shortcut in SHORTCUT_DISPLAY" :key="shortcut.key">
          <kbd class="rounded border bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
            {{ shortcut.key }}
          </kbd>
          <span class="text-sm text-muted-foreground">{{ shortcut.description }}</span>
        </template>
      </div>
    </div>
  </Teleport>
</template>
