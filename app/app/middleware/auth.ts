export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/forgot-password', '/confirm', '/password/update']

  // Allow access to public pages
  if (publicPaths.some(path => to.path.startsWith(path))) {
    // If logged in and trying to access login, redirect to dashboard
    if (user.value && to.path === '/login') {
      return navigateTo('/')
    }
    return
  }

  // Redirect unauthenticated users to login
  if (!user.value) {
    return navigateTo('/login')
  }
})
