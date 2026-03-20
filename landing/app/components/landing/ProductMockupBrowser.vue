<script setup lang="ts">
import { HERO_STATUS_COLORS } from '@/constants/hero'
import { PRODUCT_MOCKUP_BROWSER_ENTRIES } from '@/constants/product'
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
            v-for="(entry, i) in PRODUCT_MOCKUP_BROWSER_ENTRIES"
            :key="entry.company"
            :class="i < PRODUCT_MOCKUP_BROWSER_ENTRIES.length - 1 ? 'border-b' : ''"
          >
            <td class="py-1 font-medium text-foreground">{{ entry.company }}</td>
            <td class="py-1">
              <span
                class="rounded-full px-1.5 py-0.5 text-[7px] font-medium"
                :class="HERO_STATUS_COLORS[entry.status]"
              >{{ entry.status }}</span>
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
