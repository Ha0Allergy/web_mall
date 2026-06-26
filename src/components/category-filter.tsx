"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Category {
  id: number;
  name: string;
  slug: string;
  productCount: number;
}

interface CategoryFilterProps {
  categories: Category[];
}

// 分类筛选标签 — 客户端组件，点击切换 URL category 参数
export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("category") || "";

  function handleClick(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    params.delete("page"); // 切换分类时重置页码
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* "全部"标签 */}
      <button
        onClick={() => handleClick("")}
        className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
          activeSlug === ""
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
        }`}
      >
        全部
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleClick(cat.slug)}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
            activeSlug === cat.slug
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
