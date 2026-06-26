import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 每页商品数量
const PAGE_SIZE = 9;

// GET /api/products — 商品列表（支持搜索、分类筛选、分页）
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const pageNum = parseInt(searchParams.get("page") || "1", 10);
  const page = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;

  try {
    // 构建查询条件
    const where: Record<string, unknown> = {};

    if (search) {
      where.name = { contains: search };
    }

    if (category) {
      where.category = { slug: category };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    });
  } catch (error) {
    console.error("获取商品列表失败:", error);
    return NextResponse.json({ error: "获取商品列表失败" }, { status: 500 });
  }
}
