<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const emit = defineEmits<{
  create: [data: { salesOrderNumber: string; email: string; phone: string }]
}>()

const open = ref(false)
const salesOrderNumber = ref('')
const email = ref('')
const phone = ref('')
const submitting = ref(false)

function resetForm() {
  salesOrderNumber.value = ''
  email.value = ''
  phone.value = ''
}

async function handleSubmit() {
  if (!salesOrderNumber.value.trim() || !email.value.trim()) {
    return
  }

  submitting.value = true
  try {
    emit('create', {
      salesOrderNumber: salesOrderNumber.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
    })
    open.value = false
    resetForm()
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="outline" size="sm">
        <Plus class="h-4 w-4 mr-2" />
        Add Order
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add Pickup Request</DialogTitle>
        <DialogDescription>
          Manually create a pickup request for a customer.
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="salesOrderNumber">Sales Order Number *</Label>
          <Input
            id="salesOrderNumber"
            v-model="salesOrderNumber"
            placeholder="SO-2024-001"
            required
          />
        </div>
        <div class="space-y-2">
          <Label for="email">Customer Email *</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="customer@example.com"
            required
          />
        </div>
        <div class="space-y-2">
          <Label for="phone">Phone (optional)</Label>
          <Input
            id="phone"
            v-model="phone"
            type="tel"
            placeholder="555-0100"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="open = false">
            Cancel
          </Button>
          <Button type="submit" :disabled="submitting || !salesOrderNumber.trim() || !email.trim()">
            {{ submitting ? 'Adding...' : 'Add Request' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
