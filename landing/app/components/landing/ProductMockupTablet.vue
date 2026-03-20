<template>
  <div
    class="w-full overflow-hidden rounded-2xl border bg-background shadow-md"
    style="aspect-ratio: 4 / 3"
    data-testid="product-mockup-tablet"
  >
    <!-- Tablet content - gate operator view -->
    <div class="flex h-full flex-col p-3">
      <!-- Top bar -->
      <div class="mb-2 flex items-center justify-between">
        <div class="text-[9px] font-semibold text-foreground">Gate 1 — Operator View</div>
        <div class="rounded bg-green-100 px-1.5 py-0.5 text-[7px] font-medium text-green-700 dark:bg-green-900 dark:text-green-400">
          Active
        </div>
      </div>

      <!-- Current truck -->
      <div class="flex-1 rounded-lg border border-green-200 bg-green-50 p-2.5 dark:border-green-800 dark:bg-green-950">
        <div class="text-[8px] font-medium text-green-700 dark:text-green-400">Now Loading</div>
        <div class="mt-0.5 text-sm font-bold text-green-700 dark:text-green-400">Acme Corp</div>
        <div class="mt-0.5 text-[8px] text-green-600 dark:text-green-500">Order #4471 · 12 pallets</div>
      </div>

      <!-- Next up -->
      <div class="mt-2 rounded border border-border bg-muted/50 p-2">
        <div class="text-[7px] font-medium text-muted-foreground">Up Next</div>
        <div class="mt-0.5 text-[9px] font-semibold text-foreground">BuildRight LLC</div>
      </div>
    </div>
  </div>
</template>
