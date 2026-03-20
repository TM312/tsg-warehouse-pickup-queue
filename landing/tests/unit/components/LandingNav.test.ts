import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import LandingNav from '@/components/LandingNav.vue'
import { NAV_LINKS, PRODUCT_NAME, CTA_LABEL } from '@/constants/navigation'
import * as smoothScroll from '@/composables/useSmoothScroll'

describe('LandingNav', () => {
  const stubs = {
    Button: { template: '<a v-bind="$attrs"><slot /></a>', props: ['variant', 'size', 'as'] },
    Sheet: { template: '<div><slot /></div>', props: ['open'] },
    SheetContent: { template: '<div><slot /></div>', props: ['side'] },
    SheetTrigger: { template: '<button v-bind="$attrs"><slot /></button>', props: ['asChild'] },
    SheetTitle: { template: '<h2><slot /></h2>' },
    Menu: { template: '<svg />' },
  }

  function factory(props = {}) {
    return mount(LandingNav, {
      props: { isScrolled: false, ...props },
      global: { stubs },
    })
  }

  it('renders the product name', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="product-name"]').text()).toBe(PRODUCT_NAME)
  })

  it('renders all nav links', () => {
    const wrapper = factory()
    const links = wrapper.findAll('[data-testid="nav-link"]')
    expect(links).toHaveLength(NAV_LINKS.length)
    links.forEach((link, i) => {
      expect(link.text()).toBe(NAV_LINKS[i].label)
      expect(link.attributes('href')).toBe(NAV_LINKS[i].href)
    })
  })

  it('renders CTA button with correct text', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="cta-button"]').text()).toBe(CTA_LABEL)
  })

  it('renders mobile toggle', () => {
    const wrapper = factory()
    expect(wrapper.find('[data-testid="mobile-toggle"]').exists()).toBe(true)
  })

  it('applies scrolled styles when isScrolled is true', () => {
    const wrapper = factory({ isScrolled: true })
    const nav = wrapper.find('[data-testid="landing-nav"]')
    expect(nav.classes()).toContain('backdrop-blur-sm')
  })

  it('applies transparent background when not scrolled', () => {
    const wrapper = factory({ isScrolled: false })
    const nav = wrapper.find('[data-testid="landing-nav"]')
    expect(nav.classes()).toContain('bg-transparent')
  })

  describe('handleMobileNavClick', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('closes the mobile sheet and scrolls to the target section', async () => {
      const scrollSpy = vi.spyOn(smoothScroll, 'scrollToHash').mockImplementation(() => {})
      const wrapper = factory()

      const mobileLink = wrapper.find('[data-testid="mobile-nav-link"]')
      await mobileLink.trigger('click')

      // After nextTick, scrollToHash should be called with the link href
      await flushPromises()
      expect(scrollSpy).toHaveBeenCalledWith(NAV_LINKS[0].href)
    })
  })
})
