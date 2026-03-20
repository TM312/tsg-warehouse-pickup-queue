<script setup lang="ts">
import {
  FOOTER_SECTIONS,
  CONTACT_EMAIL,
  SUPPORT_HOURS,
  SOCIAL_LINKS,
  COPYRIGHT_HOLDER,
} from '@/constants/footer'
import { Linkedin } from 'lucide-vue-next'

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer data-testid="landing-footer" class="border-t bg-muted/30">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="section in FOOTER_SECTIONS" :key="section.title" data-testid="footer-section">
          <h3 class="text-sm font-semibold text-foreground">{{ section.title }}</h3>
          <ul class="mt-4 space-y-3">
            <li v-for="link in section.links" :key="link.href">
              <a
                :href="link.href"
                class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                data-testid="footer-link"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>

        <div data-testid="footer-contact">
          <h3 class="text-sm font-semibold text-foreground">Contact</h3>
          <ul class="mt-4 space-y-3">
            <li>
              <a
                :href="`mailto:${CONTACT_EMAIL}`"
                class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                data-testid="contact-email"
              >
                {{ CONTACT_EMAIL }}
              </a>
            </li>
            <li>
              <p class="text-sm text-muted-foreground" data-testid="support-hours">
                {{ SUPPORT_HOURS }}
              </p>
            </li>
          </ul>
        </div>

        <div data-testid="footer-social">
          <h3 class="text-sm font-semibold text-foreground">Social</h3>
          <ul class="mt-4 space-y-3">
            <li v-for="link in SOCIAL_LINKS" :key="link.href">
              <a
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                data-testid="social-link"
              >
                <Linkedin v-if="link.icon === 'linkedin'" class="size-4" />
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-12 border-t pt-8">
        <p class="text-center text-sm text-muted-foreground" data-testid="copyright">
          &copy; {{ currentYear }} {{ COPYRIGHT_HOLDER }}. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>
