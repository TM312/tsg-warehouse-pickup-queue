<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useForm } from 'vee-validate'

definePageMeta({
  layout: 'auth',
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Redirect if already logged in (handled by middleware, but also watch for changes)
watch(user, (value) => {
  if (value) navigateTo('/')
}, { immediate: true })

const formSchema = toTypedSchema(z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
}))

const form = useForm({ validationSchema: formSchema })
const isLoading = ref(false)
const errorMessage = ref('')

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true
  errorMessage.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password
  })

  isLoading.value = false

  if (error) {
    errorMessage.value = 'Invalid email or password'
    return
  }

  await navigateTo('/')
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Staff Login</CardTitle>
        <CardDescription>Enter your credentials to access the warehouse dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit="onSubmit" class="space-y-4">
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

          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autocomplete="current-password"
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
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </Button>
        </form>

        <div class="mt-4 text-center">
          <NuxtLink to="/forgot-password" class="text-sm text-muted-foreground hover:underline">
            Forgot your password?
          </NuxtLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
