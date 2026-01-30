<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { weeklySchedule, pending, loadWeeklySchedule, saveWeeklySchedule } = useBusinessHoursSettings()

// Load on mount
onMounted(() => {
  loadWeeklySchedule()
})
</script>

<template>
  <div class="max-w-2xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Business Hours</h1>
      <Button @click="saveWeeklySchedule" :disabled="pending">
        {{ pending ? 'Saving...' : 'Save Changes' }}
      </Button>
    </div>

    <!-- Weekly Schedule Card -->
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
        <CardDescription>
          Set your regular business hours for each day of the week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <WeeklyScheduleEditor v-model="weeklySchedule" />
      </CardContent>
    </Card>
  </div>
</template>
