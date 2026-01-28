<script setup lang="ts">
const supabase = useSupabaseClient()

async function logout() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <header class="border-b">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <h1 class="text-lg font-semibold">Warehouse Pickup Queue</h1>
        <div class="flex items-center gap-4">
          <NuxtLink to="/settings" class="text-sm text-muted-foreground hover:underline">
            Settings
          </NuxtLink>
          <Button variant="ghost" size="sm" @click="logout">
            Logout
          </Button>
        </div>
      </div>
    </header>
    <main class="container mx-auto px-4 py-6">
      <slot />
    </main>
  </div>
</template>
