<script setup lang="ts">
import { ref, watch } from 'vue'
import { Pencil } from 'lucide-vue-next'
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

interface Gate {
  id: string
  gate_number: number
}

const props = defineProps<{
  gate: Gate
}>()

const emit = defineEmits<{
  rename: [gateId: string, newNumber: number]
}>()

const open = ref(false)
const newGateNumber = ref<number>(props.gate.gate_number)

// Reset form when dialog opens/closes or gate changes
watch([open, () => props.gate], ([isOpen, gate]) => {
  if (isOpen) {
    newGateNumber.value = gate.gate_number
  }
})

function handleRename() {
  if (newGateNumber.value && newGateNumber.value > 0) {
    emit('rename', props.gate.id, newGateNumber.value)
    open.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="ghost" size="icon">
        <Pencil class="h-4 w-4" />
        <span class="sr-only">Edit gate {{ gate.gate_number }}</span>
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Rename Gate {{ gate.gate_number }}</DialogTitle>
        <DialogDescription>
          Enter a new gate number.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="new-gate-number" class="text-right">Gate Number</Label>
          <Input
            id="new-gate-number"
            v-model.number="newGateNumber"
            type="number"
            min="1"
            class="col-span-3"
            @keyup.enter="handleRename"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="open = false">Cancel</Button>
        <Button
          :disabled="!newGateNumber || newGateNumber < 1 || newGateNumber === gate.gate_number"
          @click="handleRename"
        >
          Rename Gate
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
