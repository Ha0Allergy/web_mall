import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Mall - 微型电商",
  description: "Mini Mall 微型电商平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {/* 顶栏导航 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <a href="/" className="text-xl font-bold text-blue-600">
              Mini Mall
            </a>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/" className="hover:text-blue-600 transition-colors">
                首页
              </a>
              <a href="/cart" className="hover:text-blue-600 transition-colors">
                购物车
              </a>
              <a href="/login" className="hover:text-blue-600 transition-colors">
                登录
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
