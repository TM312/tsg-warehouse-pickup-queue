<script setup lang="ts">
import { ChevronsUpDown, LogOut } from 'lucide-vue-next'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

async function logout() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}

const initials = computed(() => {
  const email = user.value?.email ?? ''
  return email.substring(0, 2).toUpperCase()
})

const displayName = computed(() => {
  // Prefer user metadata name if available
  if (user.value?.user_metadata?.name) {
    return user.value.user_metadata.name
  }
  // Fall back to email username portion
  const email = user.value?.email ?? ''
  const username = email.split('@')[0] ?? ''
  // Convert to title case: john.doe -> John Doe
  return username
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
})
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton size="lg">
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarFallback class="rounded-lg">{{ initials }}</AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">{{ displayName }}</span>
              <span class="truncate text-xs text-muted-foreground">{{ user?.email }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="end"
          :side-offset="4"
          class="w-56 rounded-lg"
        >
          <DropdownMenuItem @click="logout">
            <LogOut class="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
