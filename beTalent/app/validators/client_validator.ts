import vine from '@vinejs/vine'

/**
 * Validator para parâmetros de cliente
 */
export const clientParamsValidator = vine.compile(
  vine.object({
    id: vine.string().uuid(),
  })
)

/**
 * Validator para query parameters de listagem de clientes
 */
export const clientIndexValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)