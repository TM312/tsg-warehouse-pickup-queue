import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  modules: ['shadcn-nuxt', '@pinia/nuxt'],
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        'lucide-vue-next',
        'vue-sonner',
        'clsx',
        'tailwind-merge',
        '@vueuse/core',
        'class-variance-authority',
        'reka-ui',
        'sortablejs',
        '@tanstack/vue-table',
      ],
    },
  },
  components: {
    dirs: [
      {
        path: '~/components',
        ignore: ['**/index.ts'],
      },
    ],
  },
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },
})
