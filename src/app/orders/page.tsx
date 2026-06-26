import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrderStatusBadge from "@/components/order-status-badge";

// 状态中文映射
const STATUS_LABELS: Record<string, string> = {
  PENDING: "待付款",
  PAID: "已支付",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

// 订单列表页 — Server Component
export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: {
        select: { id: true, productName: true, quantity: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">我的订单</h1>

      {orders.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-gray-400">
          <svg
            className="mb-4 h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-lg">还没有订单</p>
          <Link
            href="/"
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            去逛逛
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-xl bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">
                    订单号：{String(order.id).padStart(8, "0")}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {order.items
                      .slice(0, 2)
                      .map((i) => i.productName)
                      .join("、")}
                    {order.items.length > 2
                      ? ` 等 ${order.items.length} 件商品`
                      : ` 共 ${order.items.reduce((s, i) => s + i.quantity, 0)} 件`}
                  </p>
                </div>
                <div className="text-right">
                  <OrderStatusBadge status={order.status} />
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    ¥{order.total.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {new Date(order.createdAt).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
