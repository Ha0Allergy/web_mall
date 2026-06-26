import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AddToCartButton from "@/components/add-to-cart-button";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

// 商品详情页 — Server Component
export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  return (
    <div>
      {/* 面包屑导航 */}
      <div className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          首页
        </Link>
        <span className="mx-2">/</span>
        {product.category && (
          <>
            <Link
              href={`/?category=${product.category.slug}`}
              className="hover:text-blue-600 transition-colors"
            >
              {product.category.name}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-gray-900">{product.name}</span>
      </div>

      {/* 商品详情 */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* 左侧大图 */}
        <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
          <img
            src={product.image || "https://picsum.photos/600/600"}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* 右侧信息 */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900">
            {product.name}
          </h1>

          {product.category && (
            <span className="mt-2 inline-block w-fit rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
              {product.category.name}
            </span>
          )}

          <p className="mt-6 text-3xl font-bold text-red-600">
            ¥{product.price.toFixed(2)}
          </p>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="text-sm font-medium text-gray-900">商品描述</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {product.description || "暂无描述"}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500">
              库存：
              {product.stock > 0 ? (
                <span className="text-green-600">{product.stock} 件</span>
              ) : (
                <span className="text-red-500">暂时缺货</span>
              )}
            </p>
          </div>

          {/* 加入购物车按钮 */}
          <div className="mt-8">
            <AddToCartButton
              productId={product.id}
              disabled={product.stock <= 0}
            />
          </div>

          {/* 返回链接 */}
          <div className="mt-6">
            <Link
              href="/"
              className="text-sm text-blue-600 hover:underline"
            >
              ← 返回商品列表
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
