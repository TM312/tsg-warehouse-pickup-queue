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
  email: z.string().email('Please enter a valid email address')
}))

const form = useForm({ validationSchema: formSchema })
const isLoading = ref(false)
const isSubmitted = ref(false)
const errorMessage = ref('')

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true
  errorMessage.value = ''

  // Must use absolute URL for redirect
  const redirectUrl = `${window.location.origin}/password/update`

  const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
    redirectTo: redirectUrl
  })

  isLoading.value = false

  if (error) {
    errorMessage.value = 'Failed to send reset email. Please try again.'
    return
  }

  isSubmitted.value = true
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>Enter your email to receive a password reset link</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="isSubmitted" class="text-center space-y-4">
          <p class="text-muted-foreground">
            If an account exists with that email, you will receive a password reset link shortly.
          </p>
          <NuxtLink to="/login" class="text-primary hover:underline">
            Return to login
          </NuxtLink>
        </div>

        <form v-else @submit="onSubmit" class="space-y-4">
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="staff@example.com"
                  autocomplete="email"
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
            {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
          </Button>
        </form>

        <div class="mt-4 text-center">
          <NuxtLink to="/login" class="text-sm text-muted-foreground hover:underline">
            Back to login
          </NuxtLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
