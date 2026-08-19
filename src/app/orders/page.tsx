import { getOrders } from "@/actions/orders";
import { OrderTriageTable } from "@/components/orders/order-triage-table";

export const metadata = {
  title: "COD Order Triage & WhatsApp Confirmation — COD Growth OS",
};

export default async function OrdersPage() {
  const initialOrders = await getOrders();

  return <OrderTriageTable initialOrders={initialOrders} />;
}
