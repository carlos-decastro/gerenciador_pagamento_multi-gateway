import vine from '@vinejs/vine'

/**
 * Validator para parâmetros de gateway (ID)
 */
export const gatewayParamsValidator = vine.compile(
  vine.object({
    id: vine.string().uuid(),
  })
)

/**
 * Validator para atualizar status do gateway
 */
export const updateGatewayStatusValidator = vine.compile(
  vine.object({
    isActive: vine.boolean(),
  })
)

/**
 * Validator para atualizar prioridade do gateway
 */
export const updateGatewayPriorityValidator = vine.compile(
  vine.object({
    priority: vine.number().min(0).max(999),
  })
)

/**
 * Validator para criar gateway
 */
export const createGatewayValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(255),
    isActive: vine.boolean().optional(),
    priority: vine.number().min(0).max(999).optional(),
  })
)

/**
 * Validator para atualizar gateway
 */
export const updateGatewayValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(255).optional(),
    isActive: vine.boolean().optional(),
    priority: vine.number().min(0).max(999).optional(),
  })
)
