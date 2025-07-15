import vine from '@vinejs/vine'

/**
 * Validador para criação de compras
 */
export const createPurchaseValidator = vine.compile(
  vine.object({
    // Dados do cliente
    client: vine.object({
      name: vine.string().trim().minLength(2).maxLength(255),
      email: vine.string().email().normalizeEmail(),
    }),

    // Dados do cartão
    payment: vine.object({
      cardNumber: vine.string().regex(/^[0-9]{13,19}$/),
      cvv: vine.string().regex(/^[0-9]{3,4}$/),
    }),

    // Produtos da compra
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
