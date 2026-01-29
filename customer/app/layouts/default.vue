<template>
  <div class="min-h-screen bg-background">
    <!-- Simple header for mobile -->
    <header class="border-b bg-card">
      <div class="px-4 py-4 text-center">
        <h1 class="text-lg font-semibold">Warehouse Pickup</h1>
      </div>
    </header>

    <!-- Main content area - mobile-first centered layout -->
    <main class="px-4 py-6 md:px-8 md:py-12">
      <div class="mx-auto w-full max-w-md">
        <slot />
      </div>
    </main>

    <!-- Footer with minimal info -->
    <footer class="border-t py-4 text-center text-sm text-muted-foreground">
      <p>Need help? Contact the warehouse staff.</p>
    </footer>
  </div>
</template>
