import { prisma } from "@/lib/prisma";
import AdminProductTable from "@/components/admin/admin-product-table";

// 商品管理页 — Server Component 加载数据
export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
      <AdminProductTable products={products} categories={categories} />
    </div>
  );
}
