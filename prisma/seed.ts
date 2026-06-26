import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: "file:./dev.db" }),
});

async function main() {
  // 创建 5 个分类
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "数码电子", slug: "digital" } }),
    prisma.category.create({ data: { name: "服装鞋帽", slug: "clothing" } }),
    prisma.category.create({ data: { name: "家居生活", slug: "home" } }),
    prisma.category.create({ data: { name: "食品饮料", slug: "food" } }),
    prisma.category.create({ data: { name: "图书教育", slug: "books" } }),
  ]);

  // 创建 12 个商品
  const products = [
    { name: "无线蓝牙耳机", description: "降噪无线蓝牙耳机，续航 30 小时", price: 299, image: "https://picsum.photos/seed/earphone/400/400", stock: 100, categoryId: categories[0].id },
    { name: "机械键盘", description: "青轴机械键盘，87 键 RGB 背光", price: 459, image: "https://picsum.photos/seed/keyboard/400/400", stock: 50, categoryId: categories[0].id },
    { name: "USB-C 扩展坞", description: "7 合 1 Type-C 扩展坞，支持 4K 输出", price: 199, image: "https://picsum.photos/seed/usbhub/400/400", stock: 80, categoryId: categories[0].id },
    { name: "纯棉 T 恤", description: "男女同款纯棉圆领短袖，多色可选", price: 79, image: "https://picsum.photos/seed/tshirt/400/400", stock: 200, categoryId: categories[1].id },
    { name: "休闲运动鞋", description: "轻便透气跑步鞋，适合日常运动", price: 329, image: "https://picsum.photos/seed/sneakers/400/400", stock: 60, categoryId: categories[1].id },
    { name: "简约台灯", description: "LED 护眼台灯，三档调光", price: 149, image: "https://picsum.photos/seed/lamp/400/400", stock: 120, categoryId: categories[2].id },
    { name: "保温杯", description: "316 不锈钢保温杯 500ml", price: 89, image: "https://picsum.photos/seed/mug/400/400", stock: 150, categoryId: categories[2].id },
    { name: "收纳盒套装", description: "可折叠布艺收纳盒 3 件套", price: 59, image: "https://picsum.photos/seed/storage/400/400", stock: 90, categoryId: categories[2].id },
    { name: "有机绿茶", description: "明前龙井 100g 礼盒装", price: 168, image: "https://picsum.photos/seed/tea/400/400", stock: 40, categoryId: categories[3].id },
    { name: "坚果礼盒", description: "每日坚果混合装 750g", price: 99, image: "https://picsum.photos/seed/nuts/400/400", stock: 70, categoryId: categories[3].id },
    { name: "TypeScript 编程指南", description: "从入门到实战，涵盖高级类型系统", price: 69, image: "https://picsum.photos/seed/tsbook/400/400", stock: 30, categoryId: categories[4].id },
    { name: "算法导论", description: "经典计算机算法教材，第四版", price: 128, image: "https://picsum.photos/seed/algobook/400/400", stock: 25, categoryId: categories[4].id },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  // 创建管理员和测试用户
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);
  await prisma.user.create({
    data: { name: "管理员", email: "admin@example.com", password: adminPassword, role: "ADMIN" },
  });
  await prisma.user.create({
    data: { name: "测试用户", email: "user@example.com", password: userPassword, role: "USER" },
  });

  console.log("种子数据创建完成！");
  console.log(`  - ${categories.length} 个分类`);
  console.log(`  - ${products.length} 个商品`);
  console.log(`  - 管理员: admin@example.com / admin123`);
  console.log(`  - 用户: user@example.com / user123`);
}

main().finally(() => prisma.$disconnect());