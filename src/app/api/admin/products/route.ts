import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/products — 商品列表（后台）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const pageSize = 10;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        include: { category: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count(),
    ]);

    return NextResponse.json({
      products,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("获取商品列表失败:", error);
    return NextResponse.json({ error: "获取商品列表失败" }, { status: 500 });
  }
}

// POST /api/admin/products — 新增商品
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, image, stock, categoryId } = body;

    // 输入验证
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "请输入商品名称" }, { status: 400 });
    }
    if (price === undefined || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return NextResponse.json({ error: "请输入有效的价格" }, { status: 400 });
    }
    if (stock === undefined || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
      return NextResponse.json({ error: "请输入有效的库存数量" }, { status: 400 });
    }
    if (!categoryId || isNaN(parseInt(categoryId))) {
      return NextResponse.json({ error: "请选择分类" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description || "",
        price: parseFloat(price),
        image: image || "",
        stock: parseInt(stock),
        categoryId: parseInt(categoryId),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("创建商品失败:", error);
    return NextResponse.json({ error: "创建商品失败" }, { status: 500 });
  }
}
