import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  search?: string;
  category?: string;
}

// 分页组件 — 保留当前搜索和分类参数
export default function Pagination({
  page,
  totalPages,
  search,
  category,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildUrl(targetPage: number) {
    const params = new URLSearchParams();
    params.set("page", String(targetPage));
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    return `/?${params.toString()}`;
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link
          href={buildUrl(page - 1)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
        >
          上一页
        </Link>
      )}
      <span className="px-4 py-2 text-sm text-gray-600">
        第 {page} / {totalPages} 页
      </span>
      {page < totalPages && (
        <Link
          href={buildUrl(page + 1)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
        >
          下一页
        </Link>
      )}
    </div>
  );
}
