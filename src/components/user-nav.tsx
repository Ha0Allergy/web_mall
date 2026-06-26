"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: number;
  name: string;
  role: string;
}

interface UserNavProps {
  user: User | null;
}

// 用户导航区 — 客户端组件，处理退出登录交互
export default function UserNav({ user }: UserNavProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
      >
        登录
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">
        {user.name}
        {user.role === "ADMIN" && (
          <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
            管理员
          </span>
        )}
      </span>
      <button
        onClick={handleLogout}
        className="text-sm text-gray-400 hover:text-red-500 transition-colors"
      >
        退出
      </button>
    </div>
  );
}
