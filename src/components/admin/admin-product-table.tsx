"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: { id: number; name: string } | null;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
}

interface AdminProductTableProps {
  products: Product[];
  categories: Category[];
}

// 商品管理表格 — 客户端组件，含新增/编辑弹窗
export default function AdminProductTable({
  products: initialProducts,
  categories,
}: AdminProductTableProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 表单字段
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    stock: "",
    categoryId: "",
  });

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", price: "", image: "", stock: "", categoryId: "" });
    setError("");
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: "",
      price: String(p.price),
      image: p.image,
      stock: String(p.stock),
      categoryId: String(p.category?.id || ""),
    });
    setError("");
    setShowForm(true);
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);

    const body = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      image: form.image,
      stock: parseInt(form.stock),
      categoryId: parseInt(form.categoryId),
    };

    const url = editing
      ? `/api/admin/products/${editing.id}`
      : "/api/admin/products";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "操作失败");
      setLoading(false);
      return;
    }

    setShowForm(false);
    router.refresh();
  }

  async function handleDelete(id: number) {
    if (!confirm("确定删除该商品？")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">共 {products.length} 件商品</p>
        <button
          onClick={openCreate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + 新增商品
        </button>
      </div>

      {/* 商品表格 */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">ID</th>
              <th className="px-4 py-3 font-medium text-gray-600">图片</th>
              <th className="px-4 py-3 font-medium text-gray-600">名称</th>
              <th className="px-4 py-3 font-medium text-gray-600">分类</th>
              <th className="px-4 py-3 font-medium text-gray-600">价格</th>
              <th className="px-4 py-3 font-medium text-gray-600">库存</th>
              <th className="px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-100">
                <td className="px-4 py-3 text-gray-500">{p.id}</td>
                <td className="px-4 py-3">
                  <img
                    src={p.image || "https://picsum.photos/40/40"}
                    alt={p.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                </td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.category?.name || "-"}</td>
                <td className="px-4 py-3 text-red-600 font-medium">¥{p.price.toFixed(2)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-500 hover:underline text-xs"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 新增/编辑弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold">
              {editing ? "编辑商品" : "新增商品"}
            </h2>

            {error && (
              <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">名称 *</label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">描述</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700">价格 *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700">库存 *</label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">分类 *</label>
                <select
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="">请选择</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">图片 URL</label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "保存中…" : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
