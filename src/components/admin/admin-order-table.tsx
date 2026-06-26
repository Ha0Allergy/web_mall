"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import OrderStatusBadge from "@/components/order-status-badge";

interface Order {
  id: number;
  status: string;
  statusLabel: string;
  total: number;
  itemCount: number;
  createdAt: string;
  user: { id: number; name: string; email: string };
  items: { id: number; productName: string; price: number; quantity: number }[];
}

interface AdminOrderTableProps {
  orders: Order[];
}

// 允许的状态转换
const ALLOWED_TRANSITIONS: Record<string, { label: string; action: string; variant: string }[]> = {
  PENDING: [
    { label: "设为已支付", action: "pay", variant: "bg-green-100 text-green-700 hover:bg-green-200" },
    { label: "取消", action: "cancel", variant: "bg-red-100 text-red-700 hover:bg-red-200" },
  ],
  PAID: [
    { label: "设为已发货", action: "ship", variant: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
    { label: "取消", action: "cancel", variant: "bg-red-100 text-red-700 hover:bg-red-200" },
  ],
  SHIPPED: [
    { label: "设为已完成", action: "complete", variant: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
    { label: "取消", action: "cancel", variant: "bg-red-100 text-red-700 hover:bg-red-200" },
  ],
};

// 订单管理表格 — 客户端组件
export default function AdminOrderTable({ orders: initialOrders }: AdminOrderTableProps) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(orderId: number, action: string) {
    setLoading(`${orderId}-${action}`);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      router.refresh();
    }
    setLoading(null);
  }

  return (
    <div className="mt-6 space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="rounded-xl border border-gray-200 bg-white">
          {/* 订单头部 */}
          <div
            className="flex cursor-pointer items-center justify-between px-5 py-4"
            onClick={() => setExpanded(expanded === order.id ? null : order.id)}
          >
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                #{String(order.id).padStart(8, "0")}
              </span>
              <span className="text-sm text-gray-600">
                {order.user.name} ({order.user.email})
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{order.itemCount} 件</span>
              <span className="text-sm font-bold">¥{order.total.toFixed(2)}</span>
              <span className="text-xs text-gray-400">
                {new Date(order.createdAt).toLocaleDateString("zh-CN")}
              </span>
            </div>
          </div>

          {/* 展开的明细 */}
          {expanded === order.id && (
            <div className="border-t border-gray-200 px-5 py-4">
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.productName} × {item.quantity}</span>
                    <span className="text-gray-500">¥{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-right text-sm font-bold">
                合计：¥{order.total.toFixed(2)}
              </p>

              {/* 操作按钮 */}
              {(ALLOWED_TRANSITIONS[order.status] || []).length > 0 && (
                <div className="mt-3 flex gap-2">
                  {ALLOWED_TRANSITIONS[order.status].map((btn) => (
                    <button
                      key={btn.action}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(order.id, btn.action);
                      }}
                      disabled={loading === `${order.id}-${btn.action}`}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50 transition-colors ${btn.variant}`}
                    >
                      {loading === `${order.id}-${btn.action}` ? "处理中…" : btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
