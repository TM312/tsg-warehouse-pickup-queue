interface OrderValidationResult {
  success: boolean
  order?: {
    company_name: string
    item_count: number
    po_number: string | null
    email_match: boolean
    netsuite_email: string | null
  }
  error?: string
}

interface LambdaResponse {
  success: boolean
  order_data?: {
    company_name: string
    item_count: number
    po_number: string | null
    customer_email: string | null
  }
  email_match?: boolean
  error?: string
}

/**
 * Validates an order against the NetSuite Lambda validation service.
 * If the NETSUITE_VALIDATION_URL is not set, returns a mock success (dev mode).
 */
export async function validateOrder(
  salesOrderNumber: string,
  email: string
): Promise<OrderValidationResult> {
  const config = useRuntimeConfig()
  const validationUrl = config.netsuiteValidationUrl

  // Dev mode: skip validation if URL not configured
  if (!validationUrl) {
    console.warn('NETSUITE_VALIDATION_URL not set - skipping order validation (dev mode)')
    return {
      success: true,
      order: {
        company_name: 'Test Company',
        item_count: 5,
        po_number: 'PO-DEV-001',
        email_match: true,
        netsuite_email: email
      }
    }
  }

  try {
    // Call Lambda with timeout (10 seconds per research pitfall)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(validationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sales_order_number: salesOrderNumber,
        email: email
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: 'Sales order not found. Please check the order number and try again.'
        }
      }
      return {
        success: false,
        error: 'Unable to validate order. Please try again later.'
      }
    }

    const data: LambdaResponse = await response.json()

    if (!data.success || !data.order_data) {
      return {
        success: false,
        error: data.error || 'Order validation failed. Please check your order number.'
      }
    }

    return {
      success: true,
      order: {
        company_name: data.order_data.company_name,
        item_count: data.order_data.item_count,
        po_number: data.order_data.po_number,
        email_match: data.email_match ?? false,
        netsuite_email: data.order_data.customer_email
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Order validation timed out:', salesOrderNumber)
      return {
        success: false,
        error: 'Validation is taking too long. Please try again.'
      }
    }

    console.error('Order validation error:', error)
    return {
      success: false,
      error: 'Unable to validate order. Please try again later.'
    }
  }
}
