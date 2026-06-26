"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface OrderActionsProps {
  orderId: number;
  allowedActions: string[];
}

// 操作按钮配置
const ACTION_CONFIG: Record<string, { label: string; variant: "primary" | "danger" | "default" }> = {
  PAID: { label: "模拟支付", variant: "primary" },
  SHIPPED: { label: "确认发货", variant: "primary" },
  COMPLETED: { label: "确认完成", variant: "primary" },
  CANCELLED: { label: "取消订单", variant: "danger" },
};

// 订单操作按钮 — 客户端组件
export default function OrderActions({
  orderId,
  allowedActions,
}: OrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleAction(action: string) {
    setError("");
    setLoading(action);

    // action → API action 映射（PAID/SHIPPED/COMPLETED/CANCELLED → pay/ship/complete/cancel）
    const actionMap: Record<string, string> = {
      PAID: "pay",
      SHIPPED: "ship",
      COMPLETED: "complete",
      CANCELLED: "cancel",
    };
    const apiAction = actionMap[action];

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: apiAction }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "操作失败");
        return;
      }
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setLoading(null);
    }
  }

  const buttons = allowedActions
    .map((status) => ({
      status,
      ...ACTION_CONFIG[status],
    }))
    .filter((b) => b.label);

  const variantStyles: Record<string, string> = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700",
    danger:
      "border border-red-300 text-red-600 hover:bg-red-50",
    default:
      "border border-gray-300 text-gray-600 hover:bg-gray-50",
  };

  return (
    <div className="mt-6 space-y-3">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="flex gap-3">
        {buttons.map((btn) => (
          <button
            key={btn.status}
            onClick={() => handleAction(btn.status)}
            disabled={loading !== null}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium disabled:opacity-50 transition-colors ${variantStyles[btn.variant]}`}
          >
            {loading === btn.status ? "处理中…" : btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
