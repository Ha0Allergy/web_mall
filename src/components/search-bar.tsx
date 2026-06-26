"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

interface SearchBarProps {
  initialSearch: string;
}

// 搜索框 — 客户端组件，提交时更新 URL query 参数
export default function SearchBar({ initialSearch }: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialSearch);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }
    params.delete("page"); // 搜索时重置页码
    router.push(`/?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="搜索商品…"
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
      >
        搜索
      </button>
    </form>
  );
}
