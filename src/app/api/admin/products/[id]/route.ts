import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/products/[id] — 商品详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "无效的商品 ID" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("获取商品详情失败:", error);
    return NextResponse.json({ error: "获取商品详情失败" }, { status: 500 });
  }
}

// PUT /api/admin/products/[id] — 更新商品
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "无效的商品 ID" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, price, image, stock, categoryId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "请输入商品名称" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name.trim(),
        description: description ?? existing.description,
        price: price !== undefined ? parseFloat(price) : existing.price,
        image: image ?? existing.image,
        stock: stock !== undefined ? parseInt(stock) : existing.stock,
        categoryId: categoryId ? parseInt(categoryId) : existing.categoryId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("更新商品失败:", error);
    return NextResponse.json({ error: "更新商品失败" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] — 删除商品
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "无效的商品 ID" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json({ message: "已删除" });
  } catch (error) {
    console.error("删除商品失败:", error);
    return NextResponse.json({ error: "删除商品失败" }, { status: 500 });
  }
}
