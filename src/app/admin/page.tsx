import { prisma } from "@/lib/prisma";

// 后台仪表盘 — 展示统计数据
export default async function AdminDashboardPage() {
  const [productCount, orderCount, userCount, pendingOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
  ]);

  const stats = [
    { label: "商品总数", value: productCount, href: "/admin/products" },
    { label: "订单总数", value: orderCount, href: "/admin/orders" },
    { label: "待处理订单", value: pendingOrders, href: "/admin/orders" },
    { label: "用户总数", value: userCount, href: "#" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="rounded-xl bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
