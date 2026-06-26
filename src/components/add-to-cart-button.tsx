"use client";

import { useState } from "react";

interface AddToCartButtonProps {
  productId: number;
  disabled?: boolean;
}

// 加入购物车按钮 — 客户端组件
export default function AddToCartButton({
  productId,
  disabled,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    // TODO: 实现加入购物车逻辑（后续配合 Server Actions）
    console.log("加入购物车:", productId);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleAdd}
      disabled={disabled}
      className={`w-full rounded-lg px-6 py-3 text-sm font-medium transition-all ${
        disabled
          ? "cursor-not-allowed bg-gray-300 text-gray-500"
          : added
            ? "bg-green-500 text-white"
            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
      }`}
    >
      {disabled ? "暂时缺货" : added ? "已加入购物车 ✓" : "加入购物车"}
    </button>
  );
}
