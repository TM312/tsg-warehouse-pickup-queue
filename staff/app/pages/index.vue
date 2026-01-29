<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const user = useSupabaseUser()
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
    <Card>
      <CardContent class="pt-6">
        <p class="text-muted-foreground">
          Welcome, {{ user?.email }}
        </p>
        <p class="text-muted-foreground mt-2">
          The pickup queue dashboard will be built in Phase 4.
        </p>
        <div class="mt-4">
          <NuxtLink to="/settings" class="text-primary hover:underline">
            Go to Settings
          </NuxtLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
