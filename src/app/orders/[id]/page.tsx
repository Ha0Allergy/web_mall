import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrderStatusBadge from "@/components/order-status-badge";
import OrderActions from "@/components/order-actions";

// 允许的状态转换
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["CANCELLED"],
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

// 订单详情页 — Server Component
export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        select: {
          id: true,
          productId: true,
          productName: true,
          price: true,
          quantity: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // 验证归属
  if (order.userId !== user.id && user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-lg pt-12 text-center">
        <p className="text-gray-400">无权查看此订单</p>
        <Link href="/orders" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          返回订单列表
        </Link>
      </div>
    );
  }

  const allowedActions = ALLOWED_TRANSITIONS[order.status] || [];

  return (
    <div className="mx-auto max-w-lg">
      {/* 面包屑 */}
      <div className="mb-6 text-sm text-gray-500">
        <Link href="/orders" className="hover:text-blue-600 transition-colors">
          我的订单
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">#{String(order.id).padStart(8, "0")}</span>
      </div>

      {/* 状态和操作 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          订单 #{String(order.id).padStart(8, "0")}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* 商品明细 */}
      <div className="mt-6 space-y-3">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-xl bg-white border border-gray-200 p-4"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900">
                {item.productName}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                ¥{item.price.toFixed(2)} × {item.quantity}
              </p>
            </div>
            <p className="text-sm font-bold text-gray-900">
              ¥{(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* 合计 */}
      <div className="mt-6 rounded-xl bg-white border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            共 {order.items.reduce((s, i) => s + i.quantity, 0)} 件商品
          </span>
          <span className="text-2xl font-bold text-red-600">
            ¥{order.total.toFixed(2)}
          </span>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          下单时间：{new Date(order.createdAt).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* 操作按钮 */}
      {allowedActions.length > 0 && (
        <OrderActions orderId={order.id} allowedActions={allowedActions} />
      )}

      {/* 返回 */}
      <div className="mt-6">
        <Link
          href="/orders"
          className="text-sm text-blue-600 hover:underline"
        >
          ← 返回订单列表
        </Link>
      </div>
    </div>
  );
}
