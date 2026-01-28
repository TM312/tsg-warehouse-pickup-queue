<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const user = useSupabaseUser()
</script>

<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-bold mb-6">Settings</h1>

    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Manage your account settings</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div>
          <Label class="text-muted-foreground">Email</Label>
          <p class="mt-1">{{ user?.email }}</p>
        </div>

        <div class="border-t pt-6">
          <h3 class="font-medium mb-4">Change Password</h3>
          <PasswordChangeForm />
        </div>
      </CardContent>
    </Card>
  </div>
</template>
