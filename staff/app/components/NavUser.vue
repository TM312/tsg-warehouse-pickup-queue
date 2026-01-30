<script setup lang="ts">
import { ChevronUp, LogOut } from 'lucide-vue-next'
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
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton>
            <Avatar class="h-6 w-6">
              <AvatarFallback class="text-xs">{{ initials }}</AvatarFallback>
            </Avatar>
            <span class="truncate">{{ user?.email }}</span>
            <ChevronUp class="ml-auto h-4 w-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          class="w-[--reka-popper-anchor-width]"
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
