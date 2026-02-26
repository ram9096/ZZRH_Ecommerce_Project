import { cartData } from "../service/cartService.js"

export const calculateOrderTotal = async (_id) => {

  let cartItems = await cartData({userId:_id})

  if (!cartItems.success || cartItems.data.length === 0) {
    return { success: false }
  }

  const activeCartItems = cartItems.data.filter(
    item =>
      item.variantId.status === true &&
      item.variantId.stock > 0 &&
      item.quantity <= item.variantId.stock
  )

  let subTotal = 0
  for (let i of activeCartItems) {
    subTotal += i.variantId.price * i.quantity
  }

  const taxAmount = subTotal * 0.05
  const totalAmount = subTotal + taxAmount

  return {
    success: true,
    subTotal,
    taxAmount,
    totalAmount,
    activeCartItems
  }
}
