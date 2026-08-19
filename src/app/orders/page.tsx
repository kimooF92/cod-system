import { getOrders } from "@/actions/orders";
import { OrderTable } from "@/components/orders/order-table";

export const metadata = {
  title: "COD Orders & Delivery Tracking — COD Growth OS",
};

export default async function OrdersPage() {
  const initialOrders = await getOrders();

  return <OrderTable initialOrders={initialOrders} />;
}
