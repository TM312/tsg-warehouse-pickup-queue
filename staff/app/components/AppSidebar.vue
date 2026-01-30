<script setup lang="ts">
import { House, DoorOpen, Calendar } from 'lucide-vue-next'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import NavUser from '@/components/NavUser.vue'

const items = [
  { title: 'Dashboard', url: '/', icon: House },
  { title: 'Gates', url: '/gates', icon: DoorOpen },
  { title: 'Schedule', url: '/settings/business-hours', icon: Calendar },
]

const route = useRoute()
const { setOpenMobile, isMobile } = useSidebar()

function handleNavigation() {
  if (isMobile.value) {
    setOpenMobile(false)
  }
}
</script>

<template>
  <Sidebar variant="inset" collapsible="icon">
    <SidebarHeader>
      <div class="flex items-center gap-2 px-2 py-2">
        <span class="font-semibold text-sm truncate">Warehouse Pickup Queue</span>
      </div>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in items" :key="item.title">
              <SidebarMenuButton
                as-child
                :is-active="route.path === item.url"
                @click="handleNavigation"
              >
                <NuxtLink :to="item.url">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
