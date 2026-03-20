export type ProductMockupType = 'phone' | 'browser' | 'tablet'

export interface ProductFeature {
  mockup: ProductMockupType
  heading: string
  description: string
}
