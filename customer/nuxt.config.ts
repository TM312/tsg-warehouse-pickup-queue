import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', 'shadcn-nuxt', 'nuxt-api-shield'],
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
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
  supabase: {
    // Customer app uses anonymous access only - disable all auth redirects
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: undefined,
      exclude: [],
      cookieRedirect: false,
    }
  },
  nuxtApiShield: {
    limit: {
      max: 5,           // 5 attempts per window
      duration: 60,     // 60 second window
      ban: 300          // 5 minute ban after exceeding
    },
    routes: [
      { path: '/api/submit', max: 5, duration: 60 }
    ],
    errorMessage: 'Too many attempts. Please wait a few minutes.',
    retryAfterHeader: true
  },
  nitro: {
    storage: {
      shield: { driver: 'memory' }  // Use memory for dev, redis in production
    }
  }
})
