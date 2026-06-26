import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// PUT /api/cart/[id] — 修改购物车项数量
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
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: "无效的购物车项 ID" }, { status: 400 });
    }

    // 查找购物车项并验证归属
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: { select: { stock: true } } },
    });
    if (!item) {
      return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
    }
    if (item.userId !== user.id) {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const body = await request.json();
    const quantity = parseInt(body.quantity, 10);

    if (isNaN(quantity) || quantity < 1) {
      return NextResponse.json({ error: "数量必须大于 0" }, { status: 400 });
    }

    // 检查库存
    if (quantity > item.product.stock) {
      return NextResponse.json(
        { error: `库存不足，当前库存 ${item.product.stock} 件` },
        { status: 400 }
      );
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("更新购物车失败:", error);
    return NextResponse.json({ error: "更新购物车失败" }, { status: 500 });
  }
}

// DELETE /api/cart/[id] — 删除购物车项
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: "无效的购物车项 ID" }, { status: 400 });
    }

    // 查找并验证归属
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!item) {
      return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
    }
    if (item.userId !== user.id) {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    return NextResponse.json({ message: "已删除" });
  } catch (error) {
    console.error("删除购物车项失败:", error);
    return NextResponse.json({ error: "删除购物车项失败" }, { status: 500 });
  }
}
