import vine from '@vinejs/vine'

/**
 * Validator para criar produto
 */
export const createProductValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    amount: vine.number().positive().decimal([0, 2]),
  })
)

/**
 * Validator para atualizar produto
 */
export const updateProductValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255).optional(),
    amount: vine.number().positive().decimal([0, 2]).optional(),
  })
)

/**
 * Validator para parâmetros de produto (ID)
 */
export const productParamsValidator = vine.compile(
  vine.object({
    id: vine.string().uuid(),
  })
)

/**
 * Validator para query parameters de listagem
 */
export const productQueryValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    search: vine.string().trim().minLength(1).optional(),
    sortBy: vine.enum(['name', 'amount', 'createdAt']).optional(),
    sortOrder: vine.enum(['asc', 'desc']).optional(),
  })
)