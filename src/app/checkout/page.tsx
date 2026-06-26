"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CartData {
  items: {
    id: number;
    product: { id: number; name: string; price: number; image: string };
    quantity: number;
    subtotal: number;
  }[];
  total: number;
}

// 下单确认页 — 客户端组件，展示购物车汇总并提交订单
export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/cart")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          router.push("/cart");
          return;
        }
        setCart(data);
      })
      .catch(() => setError("加载购物车失败"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "下单失败");
        return;
      }
      router.push(`/orders/${data.id}`);
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg pt-12 text-center text-gray-400">
        加载中…
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-lg pt-12 text-center">
        <p className="text-gray-400">购物车为空，无法下单</p>
        <Link href="/cart" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          返回购物车
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">确认订单</h1>

      {/* 商品明细 */}
      <div className="mt-6 space-y-3">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-xl bg-white border border-gray-200 p-4"
          >
            <img
              src={item.product.image || "https://picsum.photos/80/80"}
              alt={item.product.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {item.product.name}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                ¥{item.product.price.toFixed(2)} × {item.quantity}
              </p>
            </div>
            <p className="text-sm font-bold text-gray-900">
              ¥{item.subtotal.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* 合计 */}
      <div className="mt-6 rounded-xl bg-white border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            共 {cart.items.reduce((s, i) => s + i.quantity, 0)} 件
          </span>
          <span className="text-2xl font-bold text-red-600">
            ¥{cart.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="mt-6 flex gap-3">
        <Link
          href="/cart"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-center text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          返回修改
        </Link>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? "提交中…" : "确认下单"}
        </button>
      </div>
    </div>
  );
}
