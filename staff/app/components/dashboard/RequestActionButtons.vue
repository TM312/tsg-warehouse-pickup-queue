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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check, X, Loader2, MoreVertical, RotateCcw } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import type { PickupStatus } from '#shared/types/pickup-request'
import { PICKUP_STATUS } from '#shared/types/pickup-request'

const props = defineProps<{
  status: PickupStatus
  loading?: boolean
}>()

const emit = defineEmits<{
  complete: []
  cancel: []
  revert: []
}>()

const showCancelDialog = ref(false)

const isProcessing = computed(() => props.status === PICKUP_STATUS.PROCESSING)
const showComplete = computed(() => ([PICKUP_STATUS.IN_QUEUE, PICKUP_STATUS.PROCESSING] as PickupStatus[]).includes(props.status))
const showCancel = computed(() => ([PICKUP_STATUS.PENDING, PICKUP_STATUS.APPROVED, PICKUP_STATUS.IN_QUEUE, PICKUP_STATUS.PROCESSING] as PickupStatus[]).includes(props.status))
</script>

<template>
  <!-- Processing state: Primary Complete button + dropdown for secondary actions -->
  <template v-if="isProcessing">
    <div class="flex gap-2">
      <!-- Complete Button with Confirmation (PRIMARY) -->
      <AlertDialog>
        <AlertDialogTrigger as-child>
          <Button size="sm" :disabled="loading" @click.stop>
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

      <!-- Dropdown for secondary actions -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="sm" :disabled="loading" @click.stop>
            <MoreVertical class="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click="emit('revert')">
            <RotateCcw class="h-4 w-4 mr-2" />
            Return to Queue
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" @click="showCancelDialog = true">
            <X class="h-4 w-4 mr-2" />
            Cancel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- Cancel confirmation dialog (controlled by ref) -->
    <AlertDialog :open="showCancelDialog" @update:open="showCancelDialog = $event">
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
  </template>

  <!-- Non-processing state: Existing inline button pattern -->
  <template v-else>
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
</template>
