import { serverSupabaseClient } from '#supabase/server'
import { z } from 'zod'
import { validateOrder } from '../utils/validateOrder'
import { PICKUP_STATUS } from '#shared/types/pickup-request'
import type { PickupStatus } from '#shared/types/pickup-request'

const submitSchema = z.object({
  salesOrderNumber: z
    .string()
    .min(1, 'Sales order number is required')
    .max(50, 'Sales order number is too long')
    .regex(/^[A-Za-z0-9-]+$/, 'Invalid sales order number format'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9+\-() ]+$/.test(val),
      'Invalid phone number format'
    )
})

// Minimal interface for duplicate check response
interface ExistingPickupRequest {
  id: string
  sales_order_number: string
  status: PickupStatus
}

export default defineEventHandler(async (event) => {
  // Parse and validate request body
  const body = await readBody(event)
  const parsed = submitSchema.safeParse(body)

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]
    throw createError({
      statusCode: 400,
      message: firstError?.message || 'Invalid input'
    })
  }

  const { salesOrderNumber, email, phone } = parsed.data
  const client = await serverSupabaseClient(event)

  // Check for duplicate request (pending, approved, or in_queue)
  const { data: existing } = await client
    .from('pickup_requests')
    .select('id, sales_order_number, status')
    .eq('sales_order_number', salesOrderNumber)
    .in('status', [PICKUP_STATUS.PENDING, PICKUP_STATUS.APPROVED, PICKUP_STATUS.IN_QUEUE])
    .limit(1)

  if (existing && existing.length > 0) {
    const existingRequest = existing[0] as ExistingPickupRequest
    throw createError({
      statusCode: 409,
      message: `A pickup request for order ${existingRequest.sales_order_number} is already ${existingRequest.status === PICKUP_STATUS.IN_QUEUE ? 'in the queue' : existingRequest.status}.`
    })
  }

  // Validate order against NetSuite (via Lambda or mock in dev)
  const validation = await validateOrder(salesOrderNumber, email)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error || 'Order validation failed'
    })
  }

  // Insert pickup request
  const { data, error } = await client
    .from('pickup_requests')
    .insert({
      sales_order_number: salesOrderNumber,
      customer_email: email,
      customer_phone: phone || null,
      company_name: validation.order!.company_name,
      item_count: validation.order!.item_count,
      po_number: validation.order!.po_number,
      email_flagged: !validation.order!.email_match,
      status: PICKUP_STATUS.PENDING
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to create pickup request:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create pickup request. Please try again.'
    })
  }

  return {
    success: true,
    requestId: data.id,
    message: 'Your pickup request has been submitted. A staff member will review it shortly.'
  }
})
