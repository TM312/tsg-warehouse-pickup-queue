<script setup lang="ts">
import { computed } from 'vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const props = defineProps<{
  open: boolean
  salesOrderNumber: string
  companyName: string | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})
</script>

<template>
  <AlertDialog v-model:open="isOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Complete Pickup?</AlertDialogTitle>
        <AlertDialogDescription>
          Order <span class="font-mono font-semibold">{{ salesOrderNumber }}</span>
          for <span class="font-semibold">{{ companyName || 'Customer' }}</span>
          will be marked as complete.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel class="h-11">Cancel</AlertDialogCancel>
        <AlertDialogAction class="h-11" @click="emit('confirm')">
          Complete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
