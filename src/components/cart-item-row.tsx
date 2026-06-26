"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  subtotal: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    stock: number;
  };
}

interface CartItemRowProps {
  item: CartItem;
}

// 购物车行 — 客户端组件，处理增减数量和删除
export default function CartItemRow({ item }: CartItemRowProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateQuantity(newQty: number) {
    if (newQty < 1 || newQty > item.product.stock) return;
    setLoading(true);
    const res = await fetch(`/api/cart/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty }),
    });
    if (res.ok) router.refresh();
    setLoading(false);
  }

  async function remove() {
    setLoading(true);
    const res = await fetch(`/api/cart/${item.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-4 rounded-xl bg-white border border-gray-200 p-4">
      {/* 商品图片 */}
      <img
        src={item.product.image || "https://picsum.photos/100/100"}
        alt={item.product.name}
        className="h-20 w-20 rounded-lg object-cover"
      />
      {/* 商品信息 */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {item.product.name}
        </h3>
        <p className="mt-1 text-sm text-red-600 font-medium">
          ¥{item.product.price.toFixed(2)}
        </p>
      </div>
      {/* 数量控制 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.quantity - 1)}
          disabled={loading || item.quantity <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
        >
          −
        </button>
        <span className="w-10 text-center text-sm font-medium">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.quantity + 1)}
          disabled={loading || item.quantity >= item.product.stock}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
        >
          +
        </button>
      </div>
      {/* 小计 */}
      <div className="w-24 text-right">
        <p className="text-sm font-bold text-gray-900">
          ¥{item.subtotal.toFixed(2)}
        </p>
      </div>
      {/* 删除按钮 */}
      <button
        onClick={remove}
        disabled={loading}
        className="text-sm text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
      >
        删除
      </button>
    </div>
  );
}
