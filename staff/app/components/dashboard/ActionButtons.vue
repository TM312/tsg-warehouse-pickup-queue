<script setup lang="ts">
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
import { Button, buttonVariants } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-vue-next'
import { computed } from 'vue'
import type { PickupStatus } from '#shared/types/pickup-request'
import { PICKUP_STATUS } from '#shared/types/pickup-request'

const props = defineProps<{
  status: PickupStatus
  loading?: boolean
}>()

const emit = defineEmits<{
  complete: []
  cancel: []
}>()

const showComplete = computed(() => [PICKUP_STATUS.IN_QUEUE, PICKUP_STATUS.PROCESSING].includes(props.status))
const showCancel = computed(() => [PICKUP_STATUS.PENDING, PICKUP_STATUS.APPROVED, PICKUP_STATUS.IN_QUEUE, PICKUP_STATUS.PROCESSING].includes(props.status))
</script>

<template>
  <div class="flex gap-2">
    <!-- Complete Button with Confirmation -->
    <AlertDialog v-if="showComplete">
      <AlertDialogTrigger as-child>
        <Button variant="outline" size="sm" :disabled="loading" @click.stop>
          <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
          <Check v-else class="h-4 w-4" />
          Complete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark pickup as complete?</AlertDialogTitle>
          <AlertDialogDescription>
            This will complete the pickup and remove it from the active queue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="emit('complete')">
            Mark Complete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Cancel Button with Confirmation -->
    <AlertDialog v-if="showCancel">
      <AlertDialogTrigger as-child>
        <Button variant="ghost" size="sm" :disabled="loading" @click.stop>
          <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
          <X v-else class="h-4 w-4" />
          Cancel
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this pickup request?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the customer from the queue. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No, keep it</AlertDialogCancel>
          <AlertDialogAction :class="buttonVariants({ variant: 'destructive' })" @click="emit('cancel')">
            Yes, cancel
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
