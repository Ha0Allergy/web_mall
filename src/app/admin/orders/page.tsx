import { prisma } from "@/lib/prisma";
import AdminOrderTable from "@/components/admin/admin-order-table";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待付款",
  PAID: "已支付",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

// 订单管理页 — Server Component 加载数据
export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { select: { id: true, productName: true, price: true, quantity: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = orders.map((order) => ({
    id: order.id,
    status: order.status,
    statusLabel: STATUS_LABELS[order.status] || order.status,
    total: order.total,
    itemCount: order.items.reduce((s, i) => s + i.quantity, 0),
    createdAt: order.createdAt,
    user: order.user,
    items: order.items,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
      <AdminOrderTable orders={result} />
    </div>
  );
}
