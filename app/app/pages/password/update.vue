<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useForm } from 'vee-validate'

definePageMeta({
  layout: 'auth',
  middleware: 'auth'
})

const supabase = useSupabaseClient()

const formSchema = toTypedSchema(z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
}))

const form = useForm({ validationSchema: formSchema })
const isLoading = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true
  errorMessage.value = ''

  const { error } = await supabase.auth.updateUser({
    password: values.password
  })

  isLoading.value = false

  if (error) {
    errorMessage.value = 'Failed to update password. Please try again or request a new reset link.'
    return
  }

  isSuccess.value = true
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Set New Password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="isSuccess" class="text-center space-y-4">
          <p class="text-muted-foreground">
            Your password has been updated successfully.
          </p>
          <Button @click="navigateTo('/')" class="w-full">
            Go to Dashboard
          </Button>
        </div>

        <form v-else @submit="onSubmit" class="space-y-4">
          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autocomplete="new-password"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="confirmPassword">
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autocomplete="new-password"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <div v-if="errorMessage" class="text-sm text-destructive">
            {{ errorMessage }}
          </div>

          <Button type="submit" class="w-full" :disabled="isLoading">
            {{ isLoading ? 'Updating...' : 'Update Password' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
