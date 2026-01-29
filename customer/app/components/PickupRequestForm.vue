<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useForm } from 'vee-validate'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface SubmitResponse {
  success: boolean
  requestId: string
  message: string
}

const formSchema = toTypedSchema(z.object({
  salesOrderNumber: z
    .string()
    .min(1, 'Sales order number is required')
    .max(50, 'Sales order number is too long')
    .regex(/^[A-Za-z0-9-]+$/i, 'Invalid sales order number format'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .optional()
    .refine(val => !val || /^[0-9+\-() ]+$/.test(val), 'Invalid phone number format')
}))

const form = useForm({ validationSchema: formSchema })
const isLoading = ref(false)
const errorMessage = ref('')
const successData = ref<SubmitResponse | null>(null)

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await useFetch<SubmitResponse>('/api/submit', {
      method: 'POST',
      body: values
    })

    if (error.value) {
      // Extract message from error response
      const errData = error.value.data as { message?: string } | undefined
      errorMessage.value = errData?.message || 'Failed to submit request. Please try again.'
      return
    }

    if (data.value?.success) {
      successData.value = data.value
    }
  } catch (err) {
    errorMessage.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
})

const resetForm = () => {
  successData.value = null
  errorMessage.value = ''
  form.resetForm()
}
</script>

<template>
  <!-- Success State -->
  <Card v-if="successData">
    <CardHeader class="text-center space-y-2">
      <CardTitle class="text-xl md:text-2xl text-primary">Request Submitted</CardTitle>
    </CardHeader>
    <CardContent class="text-center space-y-4">
      <p class="text-muted-foreground">
        {{ successData.message }}
      </p>
      <p class="text-sm text-muted-foreground">
        You can close this page. You'll receive updates about your pickup status.
      </p>
      <Button variant="outline" class="h-12 w-full" @click="resetForm">
        Submit Another Request
      </Button>
    </CardContent>
  </Card>

  <!-- Form State -->
  <Card v-else>
    <CardHeader class="text-center space-y-2">
      <CardTitle class="text-xl md:text-2xl">Request Pickup</CardTitle>
      <CardDescription>
        Enter your sales order information to join the pickup queue.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit="onSubmit" class="space-y-4">
        <FormField v-slot="{ componentField }" name="salesOrderNumber">
          <FormItem>
            <FormLabel>Sales Order Number</FormLabel>
            <FormControl>
              <Input
                placeholder="SO-12345"
                autocomplete="off"
                class="h-12 text-base"
                v-bind="componentField"
              />
            </FormControl>
            <FormDescription>Found on your order confirmation email</FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
                class="h-12 text-base"
                v-bind="componentField"
              />
            </FormControl>
            <FormDescription>The email used for your order</FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="phone">
          <FormItem>
            <FormLabel>Phone (Optional)</FormLabel>
            <FormControl>
              <Input
                type="tel"
                placeholder="(555) 123-4567"
                autocomplete="tel"
                class="h-12 text-base"
                v-bind="componentField"
              />
            </FormControl>
            <FormDescription>Get SMS updates when your turn is approaching</FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <div v-if="errorMessage" class="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {{ errorMessage }}
        </div>

        <Button type="submit" class="w-full h-12 text-base" :disabled="isLoading">
          {{ isLoading ? 'Submitting...' : 'Submit Request' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
