import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category?: { name: string } | null;
}

interface ProductCardProps {
  product: Product;
}

// 商品卡片
export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* 商品图片 */}
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image || "https://picsum.photos/400/400"}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      {/* 商品信息 */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          {product.name}
        </h3>
        {product.category && (
          <span className="mt-1 inline-block text-xs text-gray-500">
            {product.category.name}
          </span>
        )}
        <p className="mt-2 text-lg font-bold text-red-600">
          ¥{product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
