import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待付款",
  PAID: "已支付",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

// GET /api/admin/orders — 所有订单列表
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          select: { id: true, productName: true, price: true, quantity: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = orders.map((order) => ({
      id: order.id,
      status: order.status,
      statusLabel: STATUS_LABELS[order.status] || order.status,
      total: order.total,
      itemCount: order.items.reduce((s, i) => s + i.quantity, 0),
      createdAt: order.createdAt,
      user: order.user,
      items: order.items,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("获取订单列表失败:", error);
    return NextResponse.json({ error: "获取订单列表失败" }, { status: 500 });
  }
}
