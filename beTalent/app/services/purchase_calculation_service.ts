import Product from '#models/product'

export interface PurchaseItem {
  productId: string
  quantity: number
}

export interface PurchaseCalculation {
  items: Array<{
    productId: string
    productName: string
    unitPrice: number
    quantity: number
    totalPrice: number
  }>
  totalAmount: number
}

export default class PurchaseCalculationService {
  /**
   * Calcula o valor total de uma compra baseado nos produtos e quantidades
   */
  static async calculatePurchase(items: PurchaseItem[]): Promise<PurchaseCalculation> {
    if (!items || items.length === 0) {
      throw new Error('Lista de produtos não pode estar vazia')
    }

    // Validar se todas as quantidades são positivas
    for (const item of items) {
      if (item.quantity <= 0) {
        throw new Error(`Quantidade deve ser maior que zero para o produto ${item.productId}`)
      }
    }

    // Buscar todos os produtos
    const productIds = items.map((item) => item.productId)
    const products = await Product.query().whereIn('id', productIds)

    // Verificar se todos os produtos existem
    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id)
      const missingIds = productIds.filter((id) => !foundIds.includes(id))
      throw new Error(`Produtos não encontrados: ${missingIds.join(', ')}`)
    }

    // Calcular o valor de cada item e o total
    const calculatedItems = []
    let totalAmount = 0

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)!
      const itemTotal = product.amount * item.quantity

      calculatedItems.push({
        productId: product.id,
        productName: product.name,
        unitPrice: product.amount,
        quantity: item.quantity,
        totalPrice: itemTotal,
      })

      totalAmount += itemTotal
    }

    return {
      items: calculatedItems,
      totalAmount,
    }
  }

  /**
   * Valida se os itens de compra estão no formato correto
   */
  static validatePurchaseItems(items: any[]): PurchaseItem[] {
    if (!Array.isArray(items)) {
      throw new Error('Items deve ser um array')
    }

    return items.map((item, index) => {
      if (!item.productId || typeof item.productId !== 'string') {
        throw new Error(`Item ${index + 1}: productId é obrigatório e deve ser uma string`)
      }

      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        throw new Error(`Item ${index + 1}: quantity é obrigatório e deve ser um número positivo`)
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
      }
    })
  }
}
