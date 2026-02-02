<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const user = useSupabaseUser()
</script>

<template>
  <div class="space-y-6">
    <!-- Render child routes (e.g., /settings/business-hours) -->
    <NuxtPage />
  </div>
</template>
