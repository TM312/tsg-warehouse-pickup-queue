<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const user = useSupabaseUser()

// The @nuxtjs/supabase module automatically handles the token exchange
// from the URL hash. We just need to wait for the user to be set.
onMounted(() => {
  // Check if this is a password recovery redirect
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const type = hashParams.get('type')

  if (type === 'recovery') {
    // Redirect to password update page for password reset
    navigateTo('/password/update')
    return
  }
})

watch(user, (value) => {
  if (value) {
    navigateTo('/')
  }
}, { immediate: true })
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p class="text-muted-foreground">Confirming your session...</p>
    </div>
  </div>
</template>
