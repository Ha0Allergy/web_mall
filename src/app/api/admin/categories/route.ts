import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/categories — 分类列表（含商品数量）
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { id: "asc" },
    });

    const result = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      productCount: c._count.products,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("获取分类列表失败:", error);
    return NextResponse.json({ error: "获取分类列表失败" }, { status: 500 });
  }
}

// POST /api/admin/categories — 新增分类
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "请输入分类名称" }, { status: 400 });
    }
    if (!slug || !slug.trim()) {
      return NextResponse.json({ error: "请输入分类标识" }, { status: 400 });
    }

    // 检查是否重复
    const existing = await prisma.category.findFirst({
      where: { OR: [{ name: name.trim() }, { slug: slug.trim() }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "分类名称或标识已存在" },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: { name: name.trim(), slug: slug.trim() },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("创建分类失败:", error);
    return NextResponse.json({ error: "创建分类失败" }, { status: 500 });
  }
}
