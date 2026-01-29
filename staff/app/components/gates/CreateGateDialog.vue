<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus } from 'lucide-vue-next'
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
import { Button } from '@/components/ui/button'

const emit = defineEmits<{
  create: [gateNumber: number]
}>()

const open = ref(false)
const gateNumber = ref<number | undefined>(undefined)

// Reset form when dialog closes
watch(open, (isOpen) => {
  if (!isOpen) {
    gateNumber.value = undefined
  }
})

function handleCreate() {
  if (gateNumber.value && gateNumber.value > 0) {
    emit('create', gateNumber.value)
    open.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="outline" size="sm">
        <Plus class="h-4 w-4 mr-2" />
        Add Gate
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Gate</DialogTitle>
        <DialogDescription>
          Enter a gate number. This will be displayed to customers.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="gate-number" class="text-right">Gate Number</Label>
          <Input
            id="gate-number"
            v-model.number="gateNumber"
            type="number"
            min="1"
            class="col-span-3"
            placeholder="e.g., 5"
            @keyup.enter="handleCreate"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="open = false">Cancel</Button>
        <Button :disabled="!gateNumber || gateNumber < 1" @click="handleCreate">
          Create Gate
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
