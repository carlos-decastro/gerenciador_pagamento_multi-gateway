import vine from '@vinejs/vine'

/**
 * Validator para criar um reembolso
 */
export const createRefundValidator = vine.compile(
  vine.object({
    transactionId: vine.string().uuid(),
    amount: vine.number().positive().optional(),
    refundType: vine.enum(['total', 'partial']),
    reason: vine.string().minLength(10).maxLength(500).optional(),
    notes: vine.string().maxLength(1000).optional(),
  })
)

/**
 * Validator para parâmetros de reembolso
 */
export const refundParamsValidator = vine.compile(
  vine.object({
    id: vine.string().uuid(),
  })
)

/**
 * Validator para query parameters de listagem de reembolsos
 */
export const refundIndexValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    status: vine.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']).optional(),
    refundType: vine.enum(['total', 'partial']).optional(),
    transactionId: vine.string().uuid().optional(),
  })
)

/**
 * Validator para atualizar status de reembolso
 */
export const updateRefundStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['processing', 'completed', 'failed', 'cancelled']),
    gatewayResponse: vine.string().maxLength(2000).optional(),
    externalRefundId: vine.string().maxLength(255).optional(),
    notes: vine.string().maxLength(1000).optional(),
  })
)
