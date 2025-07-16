import vine from '@vinejs/vine'

/**
 * Validador para criação de compras
 */
export const createPurchaseValidator = vine.compile(
  vine.object({
    client: vine.object({
      name: vine.string().trim().minLength(2).maxLength(255),
      email: vine.string().email().normalizeEmail(),
    }),

    payment: vine.object({
      cardNumber: vine.string().regex(/^[0-9]{13,19}$/),
      cvv: vine.string().regex(/^[0-9]{3,4}$/),
    }),

    items: vine
      .array(
        vine.object({
          productId: vine.string().uuid(),
          quantity: vine.number().positive().min(1),
        })
      )
      .minLength(1),
  })
)

/**
 * Validador para parâmetros de compra
 */
export const purchaseParamsValidator = vine.compile(
  vine.object({
    id: vine.string().uuid(),
  })
)
