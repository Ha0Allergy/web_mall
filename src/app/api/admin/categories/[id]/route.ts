import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/admin/categories/[id] — 删除分类
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "无效的分类 ID" }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!existing) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    // 检查是否有关联商品
    const productCount = await prisma.product.count({ where: { categoryId } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `该分类下有 ${productCount} 件商品，无法删除` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id: categoryId } });
    return NextResponse.json({ message: "已删除" });
  } catch (error) {
    console.error("删除分类失败:", error);
    return NextResponse.json({ error: "删除分类失败" }, { status: 500 });
  }
}
