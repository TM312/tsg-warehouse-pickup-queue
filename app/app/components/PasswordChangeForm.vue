<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useForm } from 'vee-validate'

const supabase = useSupabaseClient()

const formSchema = toTypedSchema(z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
}))

const form = useForm({ validationSchema: formSchema })
const isLoading = ref(false)
const message = ref<{ type: 'success' | 'error', text: string } | null>(null)

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true
  message.value = null

  const { error } = await supabase.auth.updateUser({
    password: values.newPassword
  })

  isLoading.value = false

  if (error) {
    message.value = { type: 'error', text: 'Failed to update password. Please try again.' }
    return
  }

  message.value = { type: 'success', text: 'Password updated successfully!' }
  form.resetForm()
})
</script>

<template>
  <form @submit="onSubmit" class="space-y-4">
    <FormField v-slot="{ componentField }" name="newPassword">
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
        <FormLabel>Confirm New Password</FormLabel>
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

    <div
      v-if="message"
      :class="[
        'text-sm',
        message.type === 'success' ? 'text-green-600' : 'text-destructive'
      ]"
    >
      {{ message.text }}
    </div>

    <Button type="submit" :disabled="isLoading">
      {{ isLoading ? 'Updating...' : 'Update Password' }}
    </Button>
  </form>
</template>
