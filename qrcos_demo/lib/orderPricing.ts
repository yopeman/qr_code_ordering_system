import { Menu } from "@/lib/models/Menu";
import { IRestaurant } from "@/lib/models/Restaurant";
import { IOrderFee, IOrderItem } from "@/lib/models/Order";

export interface OrderItemInput {
  menuId: string;
  quantity: number;
}

export interface ComputedOrderPricing {
  orderDetails: IOrderItem[];
  fees: IOrderFee[];
  subtotal: number;
  totalPrice: number;
}

/**
 * Verifies menu item prices from MongoDB and computes subtotal, configured fees, and total price.
 */
export async function computeOrderPricing(
  restaurant: IRestaurant,
  items: OrderItemInput[]
): Promise<ComputedOrderPricing> {
  const orderDetails: IOrderItem[] = [];
  let subtotal = 0;

  for (const item of items) {
    const quantity = Math.max(1, parseInt(String(item.quantity), 10) || 1);
    const menuItem = await Menu.findOne({
      _id: item.menuId,
      restaurantId: restaurant._id,
    });

    if (!menuItem) continue;

    const unitPrice = menuItem.price;
    const subtotalPrice = Number((unitPrice * quantity).toFixed(2));
    subtotal += subtotalPrice;

    orderDetails.push({
      menuId: menuItem._id,
      name: menuItem.name,
      quantity,
      unitPrice,
      subtotalPrice,
    });
  }

  subtotal = Number(subtotal.toFixed(2));

  const fees: IOrderFee[] = [];
  let totalFees = 0;

  if (Array.isArray(restaurant.config)) {
    for (const cfg of restaurant.config) {
      if (!cfg.amount || cfg.amount <= 0) continue;

      const feeAmount =
        cfg.type === "percent"
          ? Number(((subtotal * cfg.amount) / 100).toFixed(2))
          : Number(Number(cfg.amount).toFixed(2));

      totalFees += feeAmount;
      fees.push({
        feeName: cfg.feeName,
        type: cfg.type,
        rate: cfg.amount,
        calculatedAmount: feeAmount,
      });
    }
  }

  const totalPrice = Number((subtotal + totalFees).toFixed(2));

  return { orderDetails, fees, subtotal, totalPrice };
}
