<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 h-4" />
        <span class="font-semibold">Warehouse Pickup Queue</span>
      </header>
      <main class="flex-1 overflow-auto">
        <div class="container mx-auto px-4 py-6">
          <slot />
        </div>
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
