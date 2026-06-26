import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待付款",
  PAID: "已支付",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["CANCELLED"],
};

// PUT /api/admin/orders/[id] — 更新订单状态（管理员）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "无效的订单 ID" }, { status: 400 });
    }

    const body = await request.json();
    const action: string = body.action;
    if (!action || !["pay", "ship", "complete", "cancel"].includes(action)) {
      return NextResponse.json({ error: "无效的操作" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    const targetStatus = mapAction(action);
    if (!allowed.includes(targetStatus)) {
      return NextResponse.json(
        { error: `当前状态（${STATUS_LABELS[order.status]}）不允许此操作` },
        { status: 400 }
      );
    }

    // 取消时恢复库存
    if (action === "cancel") {
      await prisma.$transaction(async (tx) => {
        const items = await tx.orderItem.findMany({ where: { orderId } });
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
    console.error("更新订单失败:", error);
    return NextResponse.json({ error: "更新订单失败" }, { status: 500 });
  }
}

function mapAction(action: string): string {
  return { pay: "PAID", ship: "SHIPPED", complete: "COMPLETED", cancel: "CANCELLED" }[action];
}
