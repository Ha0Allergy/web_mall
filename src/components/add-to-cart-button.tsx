"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  productId: number;
  disabled?: boolean;
}

// 加入购物车按钮 — 调用 POST /api/cart
export default function AddToCartButton({
  productId,
  disabled,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "加入购物车失败");
        return;
      }

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleAdd}
        disabled={disabled || loading}
        className={`w-full rounded-lg px-6 py-3 text-sm font-medium transition-all ${
          disabled
            ? "cursor-not-allowed bg-gray-300 text-gray-500"
            : added
              ? "bg-green-500 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
        }`}
      >
        {disabled
          ? "暂时缺货"
          : loading
            ? "处理中…"
            : added
              ? "已加入购物车 ✓"
              : "加入购物车"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
