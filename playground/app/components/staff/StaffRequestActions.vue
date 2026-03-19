<script setup lang="ts">
import { computed } from 'vue'
import { PICKUP_STATUS } from '@/constants/status'
import { isValidTransition } from '@/constants/transitions'
import { RESPONSIVE } from '@/constants/responsive'
import { useSimulationActions } from '@/composables/useSimulationActions'
import { Button } from '@/components/ui/button'
import type { PickupRequest } from '@/types/pickup-request'

const props = defineProps<{
  request: PickupRequest
}>()

const actions = useSimulationActions()
const tapTarget = `${RESPONSIVE.TAP_TARGET_MIN_PX}px`

const canApprove = computed(() => isValidTransition(props.request.status, PICKUP_STATUS.APPROVED))
const canStartProcessing = computed(() => isValidTransition(props.request.status, PICKUP_STATUS.PROCESSING))
const canComplete = computed(() => isValidTransition(props.request.status, PICKUP_STATUS.COMPLETED))
const canCancel = computed(() => isValidTransition(props.request.status, PICKUP_STATUS.CANCELLED))
</script>

<template>
  <div class="flex items-center gap-1" data-testid="staff-request-actions">
    <Button
      v-if="canApprove"
      size="sm"
      variant="outline"
      @click="actions.approveRequest(request.id)"
    >
      Approve
    </Button>
    <Button
      v-if="canStartProcessing"
      size="sm"
      variant="outline"
      @click="actions.startProcessing(request.id)"
    >
      Start Processing
    </Button>
    <Button
      v-if="canComplete"
      size="sm"
      variant="outline"
      data-walkthrough="complete-button"
      @click="actions.completeRequest(request.id)"
    >
      Complete
    </Button>
    <Button
      v-if="canCancel"
      size="sm"
      variant="ghost"
      class="text-destructive"
      @click="actions.cancelRequest(request.id)"
    >
      Cancel
    </Button>
  </div>
</template>

<style scoped>
@media (pointer: coarse) {
  [data-testid="staff-request-actions"] :deep(button) {
    min-height: v-bind(tapTarget);
  }
}
</style>
