import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CartItemRow from "@/components/cart-item-row";

// 购物车页面 — Server Component 获取数据，客户端组件处理交互
export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
          stock: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  const cartItems = items.map((item) => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    subtotal: item.product.price * item.quantity,
    product: item.product,
  }));

  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">购物车</h1>

      {cartItems.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-gray-400">
          <svg
            className="mb-4 h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
            />
          </svg>
          <p className="text-lg">购物车是空的</p>
          <Link
            href="/"
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            去逛逛
          </Link>
        </div>
      ) : (
        <>
          {/* 商品列表 */}
          <div className="mt-6 space-y-3">
            {cartItems.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          {/* 底部总价和操作 */}
          <div className="mt-6 sticky bottom-0 rounded-xl bg-white border border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  共 {cartItems.reduce((s, i) => s + i.quantity, 0)} 件商品
                </p>
                <p className="text-2xl font-bold text-red-600">
                  ¥{total.toFixed(2)}
                </p>
              </div>
              <Link
                href="/checkout"
                className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                提交订单
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
