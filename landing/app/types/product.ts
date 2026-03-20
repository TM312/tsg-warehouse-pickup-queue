export type ProductMockupType = 'phone' | 'browser' | 'tablet'

export interface ProductFeature {
  key: string
  mockup: ProductMockupType
  heading: string
  description: string
}
