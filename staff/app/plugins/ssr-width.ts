import { provideSSRWidth } from '@vueuse/core'

export default defineNuxtPlugin((nuxtApp) => {
  // Provide consistent width during SSR to prevent hydration mismatch
  // 1024px is a reasonable default for desktop-first charts
  provideSSRWidth(1024, nuxtApp.vueApp)
})
