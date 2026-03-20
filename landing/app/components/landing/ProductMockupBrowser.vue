<template>
  <div
    class="w-full overflow-hidden rounded-lg border bg-background shadow-md"
    data-testid="product-mockup-browser"
  >
    <!-- Browser chrome -->
    <div class="flex items-center gap-1.5 border-b bg-muted/50 px-2.5 py-1.5">
      <span class="size-2 rounded-full bg-red-400" />
      <span class="size-2 rounded-full bg-yellow-400" />
      <span class="size-2 rounded-full bg-green-400" />
      <div class="ml-1.5 flex-1 rounded bg-background px-2 py-0.5 text-[8px] text-muted-foreground">
        app.pickupqueue.com/dashboard
      </div>
    </div>

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
          <tr class="border-b">
            <td class="py-1 font-medium text-foreground">Acme Corp</td>
            <td class="py-1">
              <span class="rounded-full bg-green-100 px-1.5 py-0.5 text-[7px] font-medium text-green-700 dark:bg-green-900 dark:text-green-400">loading</span>
            </td>
            <td class="py-1 text-foreground">Gate 1</td>
          </tr>
          <tr class="border-b">
            <td class="py-1 font-medium text-foreground">BuildRight</td>
            <td class="py-1">
              <span class="rounded-full bg-amber-100 px-1.5 py-0.5 text-[7px] font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-400">called</span>
            </td>
            <td class="py-1 text-foreground">Gate 2</td>
          </tr>
          <tr>
            <td class="py-1 font-medium text-foreground">FastHaul</td>
            <td class="py-1">
              <span class="rounded-full bg-muted px-1.5 py-0.5 text-[7px] font-medium text-muted-foreground">waiting</span>
            </td>
            <td class="py-1 text-muted-foreground">—</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
