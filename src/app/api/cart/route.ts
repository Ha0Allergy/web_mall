import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/cart — 获取当前用户的购物车
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
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

    const result = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: item.product,
      subtotal: item.product.price * item.quantity,
    }));

    const total = result.reduce((sum, item) => sum + item.subtotal, 0);

    return NextResponse.json({ items: result, total });
  } catch (error) {
    console.error("获取购物车失败:", error);
    return NextResponse.json({ error: "获取购物车失败" }, { status: 500 });
  }
}

// POST /api/cart — 加入购物车
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await request.json();
    const productId = parseInt(body.productId, 10);
    const quantity = Math.max(1, parseInt(body.quantity, 10) || 1);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "无效的商品 ID" }, { status: 400 });
    }

    // 检查商品是否存在且有库存
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    // 查找是否已有该商品的购物车项
    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId: user.id, productId },
      },
    });
    const newQty = (existing?.quantity || 0) + quantity;

    // 检查库存
    if (newQty > product.stock) {
      return NextResponse.json(
        { error: `库存不足，当前库存 ${product.stock} 件` },
        { status: 400 }
      );
    }

    // upsert 购物车项
    const item = await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId: user.id, productId },
      },
      update: { quantity: newQty },
      create: { userId: user.id, productId, quantity },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("加入购物车失败:", error);
    return NextResponse.json({ error: "加入购物车失败" }, { status: 500 });
  }
}
