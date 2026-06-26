import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

// 后台管理布局 — 校验 ADMIN 角色
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-lg">无权访问</p>
        <p className="mt-1 text-sm">仅管理员可进入后台</p>
        <Link href="/" className="mt-4 text-sm text-blue-600 hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* 侧边栏 */}
      <aside className="w-48 shrink-0">
        <nav className="sticky top-6 space-y-1 rounded-xl bg-white border border-gray-200 p-3">
          <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">
            后台管理
          </p>
          <Link
            href="/admin"
            className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            仪表盘
          </Link>
          <Link
            href="/admin/products"
            className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            商品管理
          </Link>
          <Link
            href="/admin/orders"
            className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            订单管理
          </Link>
          <Link
            href="/admin/categories"
            className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            分类管理
          </Link>
          <hr className="my-2" />
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-100 transition-colors"
          >
            ← 返回前台
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
