<script setup lang="ts">
import { computed } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'

interface Gate {
  id: string
  gate_number: number
}

const props = defineProps<{
  gate: Gate
  hasCustomers: boolean
}>()

const emit = defineEmits<{
  delete: [gateId: string]
}>()

const canDelete = computed(() => !props.hasCustomers)

function handleDelete() {
  if (canDelete.value) {
    emit('delete', props.gate.id)
  }
}
</script>

<template>
  <AlertDialog>
    <AlertDialogTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        :disabled="hasCustomers"
        :class="{ 'opacity-50 cursor-not-allowed': hasCustomers }"
      >
        <Trash2 class="h-4 w-4" />
        <span class="sr-only">Delete gate {{ gate.gate_number }}</span>
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Gate {{ gate.gate_number }}?</AlertDialogTitle>
        <AlertDialogDescription v-if="hasCustomers">
          This gate cannot be deleted because it has customers in the queue.
          Please move or complete all customers before deleting.
        </AlertDialogDescription>
        <AlertDialogDescription v-else>
          This action cannot be undone. The gate will be permanently removed.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          v-if="canDelete"
          :class="buttonVariants({ variant: 'destructive' })"
          @click="handleDelete"
        >
          Delete Gate
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
