<template>
  <div class="flex h-screen flex-col bg-background text-foreground">
    <LayoutPlaygroundHeader />
    <main class="min-h-0 flex-1 overflow-hidden">
      <slot />
    </main>
  </div>
</template>
