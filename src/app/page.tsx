import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/search-bar";
import CategoryFilter from "@/components/category-filter";
import ProductGrid from "@/components/product-grid";
import Pagination from "@/components/pagination";

// 每页商品数量
const PAGE_SIZE = 9;

interface HomePageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}

// 首页 — Server Component，从 URL 参数读取搜索词、分类、页码
export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = await searchParams;
  const search = sp.search || "";
  const category = sp.category || "";
  const pageNum = parseInt(sp.page || "1", 10);
  const page = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;

  // 并行获取分类列表和商品列表
  const [categories, productData] = await Promise.all([
    prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    }),
    (async () => {
      const where: Record<string, unknown> = {};
      if (search) where.name = { contains: search };
      if (category) where.category = { slug: category };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: { category: true },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        }),
        prisma.product.count({ where }),
      ]);
      return { products, total };
    })(),
  ]);

  const { products, total } = productData;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // 分类数据简化
  const categoryList = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c._count.products,
  }));

  return (
    <div>
      {/* 搜索和筛选区域 */}
      <div className="mb-8 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">商品列表</h1>
        <SearchBar initialSearch={search} />
        <Suspense fallback={<div className="flex gap-2">{Array.from({ length: 5 }, (_, i) => (<div key={i} className="h-8 w-20 animate-pulse rounded-full bg-gray-200" />))}</div>}>
          <CategoryFilter categories={categoryList} />
        </Suspense>
        {search && (
          <p className="text-sm text-gray-500">
            搜索「{search}」共找到 {total} 件商品
          </p>
        )}
      </div>

      {/* 商品网格 */}
      <ProductGrid products={products} />

      {/* 分页 */}
      <Pagination
        page={page}
        totalPages={totalPages}
        search={search}
        category={category}
      />
    </div>
  );
}
