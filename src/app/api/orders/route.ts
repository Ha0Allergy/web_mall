import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// 订单状态中文映射
const STATUS_LABELS: Record<string, string> = {
  PENDING: "待付款",
  PAID: "已支付",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

// GET /api/orders — 我的订单列表
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            price: true,
            quantity: true,
            productId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = orders.map((order) => ({
      id: order.id,
      status: order.status,
      statusLabel: STATUS_LABELS[order.status] || order.status,
      total: order.total,
      itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
      createdAt: order.createdAt,
      items: order.items,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("获取订单列表失败:", error);
    return NextResponse.json({ error: "获取订单列表失败" }, { status: 500 });
  }
}

// POST /api/orders — 从购物车创建订单（事务）
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    // 获取购物车内容
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: { id: true, name: true, price: true, stock: true },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "购物车为空" }, { status: 400 });
    }

    // 检查库存
    const insufficientStock: { name: string; available: number; requested: number }[] = [];
    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        insufficientStock.push({
          name: item.product.name,
          available: item.product.stock,
          requested: item.quantity,
        });
      }
    }

    if (insufficientStock.length > 0) {
      return NextResponse.json(
        {
          error: `以下商品库存不足：${insufficientStock
            .map((s) => `${s.name}（需 ${s.requested} 件，仅剩 ${s.available} 件）`)
            .join("；")}`,
        },
        { status: 400 }
      );
    }

    // 计算总价
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // 在事务中：创建订单 → 扣减库存 → 清空购物车
    const order = await prisma.$transaction(async (tx) => {
      // 创建订单
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          status: "PENDING",
          total,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // 扣减库存
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 清空购物车
      await tx.cartItem.deleteMany({
        where: { userId: user.id },
      });

      return newOrder;
    });

    return NextResponse.json(
      {
        id: order.id,
        status: order.status,
        statusLabel: STATUS_LABELS[order.status],
        total: order.total,
        createdAt: order.createdAt,
        items: order.items,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("创建订单失败:", error);
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
  }
}
