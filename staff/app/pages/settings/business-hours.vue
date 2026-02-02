<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const {
  weeklySchedule,
  closures,
  override,
  pending,
  loadAllSettings,
  saveWeeklySchedule,
  addClosure,
  deleteClosure,
  toggleOverride
} = useBusinessHoursSettings()

// Load all settings on mount
onMounted(() => {
  loadAllSettings()
})
</script>

<template>
  <div class="max-w-2xl space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Business Hours</h1>
      <Button @click="saveWeeklySchedule" :disabled="pending">
        {{ pending ? 'Saving...' : 'Save Changes' }}
      </Button>
    </div>

    <!-- Manual Override Toggle at top -->
    <BusinessHoursManualOverrideToggle
      :model-value="override"
      :pending="pending"
      @toggle="toggleOverride"
    />

    <!-- Weekly Schedule Card -->
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
        <CardDescription>
          Set your regular business hours for each day of the week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BusinessHoursWeeklyScheduleEditor v-model="weeklySchedule" />
      </CardContent>
    </Card>

    <!-- Scheduled Closures Card -->
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Closures</CardTitle>
        <CardDescription>
          Holidays and special closure dates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BusinessHoursClosureScheduler
          :closures="closures"
          :pending="pending"
          @add="addClosure"
          @delete="deleteClosure"
        />
      </CardContent>
    </Card>
  </div>
</template>
