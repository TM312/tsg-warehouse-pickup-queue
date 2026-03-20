<script setup lang="ts">
import type { MockupQueueEntry } from '@/types/hero'
import { PRODUCT_MOCKUP_QUEUE_ENTRIES } from '@/constants/mockup'

const statusColor: Record<MockupQueueEntry['status'], string> = {
  loading: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400',
  called: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-400',
  waiting: 'bg-muted text-muted-foreground',
  complete: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400',
}
</script>

<template>
  <div
    class="w-full overflow-hidden rounded-lg border bg-background shadow-md"
    data-testid="product-mockup-browser"
  >
    <LandingBrowserChrome size="sm" />

    <!-- Dashboard content -->
    <div class="p-2.5">
      <div class="mb-1.5 text-[9px] font-semibold text-foreground">Live Queue</div>

      <table class="w-full text-left text-[8px]">
        <thead>
          <tr class="border-b text-muted-foreground">
            <th class="pb-1 font-medium">Customer</th>
            <th class="pb-1 font-medium">Status</th>
            <th class="pb-1 font-medium">Gate</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(entry, i) in PRODUCT_MOCKUP_QUEUE_ENTRIES"
            :key="entry.order"
            :class="i < PRODUCT_MOCKUP_QUEUE_ENTRIES.length - 1 ? 'border-b' : ''"
          >
            <td class="py-1 font-medium text-foreground">{{ entry.company }}</td>
            <td class="py-1">
              <span
                class="rounded-full px-1.5 py-0.5 text-[7px] font-medium"
                :class="statusColor[entry.status]"
              >
                {{ entry.status }}
              </span>
            </td>
            <td class="py-1" :class="entry.gate ? 'text-foreground' : 'text-muted-foreground'">
              {{ entry.gate ?? '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
