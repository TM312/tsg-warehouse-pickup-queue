<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { NAV_LINKS, PRODUCT_NAME, CTA_LABEL, CTA_HREF } from '@/constants/navigation'
import { scrollToHash } from '@/composables/useSmoothScroll'
import { Menu } from 'lucide-vue-next'

defineProps<{
  isScrolled: boolean
}>()

const mobileOpen = ref(false)

function handleMobileNavClick(href: string) {
  mobileOpen.value = false
  nextTick(() => {
    scrollToHash(href)
  })
}
</script>

<template>
  <header
    data-testid="landing-nav"
    class="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
    :class="isScrolled ? 'bg-background/95 backdrop-blur-sm border-b' : 'bg-transparent'"
  >
    <nav class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <a href="/" class="text-xl font-bold" data-testid="product-name">
        {{ PRODUCT_NAME }}
      </a>

      <div class="hidden md:flex md:items-center md:gap-8">
        <a
          v-for="link in NAV_LINKS"
          :key="link.href"
          :href="link.href"
          class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          data-testid="nav-link"
        >
          {{ link.label }}
        </a>
      </div>

      <div class="flex items-center gap-4">
        <Button as="a" :href="CTA_HREF" size="sm" class="hidden md:inline-flex" data-testid="cta-button">
          {{ CTA_LABEL }}
        </Button>

        <Sheet v-model:open="mobileOpen">
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon" class="md:hidden" data-testid="mobile-toggle">
              <Menu class="size-5" />
              <span class="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="w-72">
            <SheetTitle class="sr-only">Navigation</SheetTitle>
            <div class="flex flex-col gap-6 pt-8">
              <a
                v-for="link in NAV_LINKS"
                :key="link.href"
                :href="link.href"
                class="text-lg font-medium text-foreground"
                data-testid="mobile-nav-link"
                @click.prevent="handleMobileNavClick(link.href)"
              >
                {{ link.label }}
              </a>
              <Button as="a" :href="CTA_HREF" class="w-full" data-testid="mobile-cta-button">
                {{ CTA_LABEL }}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  </header>
</template>
