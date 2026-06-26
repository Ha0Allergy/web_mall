import { prisma } from "@/lib/prisma";
import AdminCategoryList from "@/components/admin/admin-category-list";

// 分类管理页 — Server Component
export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { id: "asc" },
  });

  const result = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c._count.products,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
      <AdminCategoryList categories={result} />
    </div>
  );
}
