<template>
  <div
    class="relative w-32 overflow-hidden rounded-[1.75rem] border bg-background shadow-md"
    style="aspect-ratio: 9 / 19"
    data-testid="product-mockup-phone"
  >
    <!-- Notch -->
    <div class="mx-auto mt-2 h-3.5 w-14 rounded-full bg-muted" />

    <!-- Screen content -->
    <div class="flex flex-col items-center px-3 pt-3">
      <!-- Header -->
      <div class="mb-3 w-full rounded bg-muted px-2 py-1 text-center text-[9px] font-semibold text-foreground">
        Queue Status
      </div>

      <!-- Position -->
      <div class="text-3xl font-bold text-foreground">#2</div>
      <div class="mt-1 text-[8px] text-muted-foreground">Estimated wait: ~4 min</div>

      <!-- Gate card -->
      <div class="mt-3 w-full rounded border border-green-200 bg-green-50 px-2 py-1.5 text-center dark:border-green-800 dark:bg-green-950">
        <div class="text-[8px] font-medium text-green-700 dark:text-green-400">Assigned Gate</div>
        <div class="text-sm font-bold text-green-700 dark:text-green-400">Gate 2</div>
      </div>
    </div>
  </div>
</template>
