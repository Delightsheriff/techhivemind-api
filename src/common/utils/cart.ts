import { Product } from "../../models/Product";

export async function calculateCartTotal(cart: any): Promise<number> {
  let total = 0;
  for (const item of cart.cartItems) {
    // Access cartItems directly
    try {
      const product = await Product.findById(item.product);
      if (product) {
        const priceToUse = product.onSale ? product.salePrice : product.price;
        total += priceToUse * item.quantity;
      } else {
        console.warn(`Product with ID ${item.product} not found. Skipping.`);
        // Consider handling this case more robustly, e.g., removing the item from the cart
      }
    } catch (error) {
      console.error(`Error fetching product ${item.product}:`, error);
      // Handle the error appropriately, perhaps by returning an error or a partial total
      // For now, continue to the next item
    }
  }
  return total;
}
