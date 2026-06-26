"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Category {
  id: number;
  name: string;
  slug: string;
  productCount: number;
}

interface AdminCategoryListProps {
  categories: Category[];
}

// 分类管理列表 — 客户端组件
export default function AdminCategoryList({
  categories: initial,
}: AdminCategoryListProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setError("");
    if (!name.trim() || !slug.trim()) {
      setError("请填写分类名称和标识");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "创建失败");
      setLoading(false);
      return;
    }
    setShowForm(false);
    setName("");
    setSlug("");
    router.refresh();
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`确定删除分类「${name}」？`)) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || "删除失败");
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">共 {categories.length} 个分类</p>
        <button
          onClick={() => { setShowForm(true); setError(""); }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + 新增分类
        </button>
      </div>

      {/* 新增表单 */}
      {showForm && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700">名称</label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如：数码电子"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700">标识（英文）</label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="如：digital"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "创建中…" : "创建"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </div>
      )}

      {/* 分类列表 */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">ID</th>
              <th className="px-4 py-3 font-medium text-gray-600">名称</th>
              <th className="px-4 py-3 font-medium text-gray-600">标识</th>
              <th className="px-4 py-3 font-medium text-gray-600">商品数</th>
              <th className="px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-gray-100">
                <td className="px-4 py-3 text-gray-500">{c.id}</td>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.slug}</td>
                <td className="px-4 py-3">{c.productCount}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    className="text-red-500 hover:underline text-xs"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
