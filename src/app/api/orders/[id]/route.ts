import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// 状态中文映射
const STATUS_LABELS: Record<string, string> = {
  PENDING: "待付款",
  PAID: "已支付",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

// 允许的状态转换
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["CANCELLED"],
};

// GET /api/orders/[id] — 订单详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "无效的订单 ID" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            productName: true,
            price: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 验证归属
    if (order.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权查看此订单" }, { status: 403 });
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      statusLabel: STATUS_LABELS[order.status] || order.status,
      total: order.total,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        ...item,
        subtotal: item.price * item.quantity,
      })),
      allowedActions: ALLOWED_TRANSITIONS[order.status] || [],
    });
  } catch (error) {
    console.error("获取订单详情失败:", error);
    return NextResponse.json({ error: "获取订单详情失败" }, { status: 500 });
  }
}

// PUT /api/orders/[id] — 修改订单状态（支付/发货/完成/取消）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "无效的订单 ID" }, { status: 400 });
    }

    const body = await request.json();
    const action: string = body.action;

    if (!action || !["pay", "ship", "complete", "cancel"].includes(action)) {
      return NextResponse.json(
        { error: "无效的操作，支持：pay / ship / complete / cancel" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 验证归属（管理员可以处理任意订单，用户只能操作自己的）
    if (order.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权操作此订单" }, { status: 403 });
    }

    // 检查状态转换是否允许
    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    const targetStatus = mapAction(action);
    if (!allowed.includes(targetStatus)) {
      return NextResponse.json(
        {
          error: `当前状态（${STATUS_LABELS[order.status]}）不允许此操作`,
        },
        { status: 400 }
      );
    }

    // 取消订单时恢复库存
    if (action === "cancel") {
      await prisma.$transaction(async (tx) => {
        const items = await tx.orderItem.findMany({
          where: { orderId },
        });
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });
      });
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: targetStatus },
      });
    }

    return NextResponse.json({
      message: "操作成功",
      status: targetStatus,
      statusLabel: STATUS_LABELS[targetStatus],
    });
  } catch (error) {
    console.error("更新订单状态失败:", error);
    return NextResponse.json({ error: "更新订单状态失败" }, { status: 500 });
  }
}

// action → status 映射
function mapAction(action: string): string {
  const map: Record<string, string> = {
    pay: "PAID",
    ship: "SHIPPED",
    complete: "COMPLETED",
    cancel: "CANCELLED",
  };
  return map[action];
}
