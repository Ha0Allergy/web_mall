import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 创建 5 个分类
  const categories = await Promise.all([
   prisma.category.create({ data: { name: "数码电子", slug: "digital" } }),
   prisma.category.create({ data: { name: "服装鞋帽", slug: "clothing" } }),
   prisma.category.create({ data: { name: "家居生活", slug: "home" } }),
   prisma.category.create({ data: { name: "食品饮料", slug: "food" } }),
   prisma.category.create({ data: { name: "图书教育", slug: "books" } }),
  ]);

  // 创建 12 个商品（代码略，见完整源码）
  // ...

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
}

main().finally(() => prisma.$disconnect());