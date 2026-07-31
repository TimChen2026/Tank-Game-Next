import type { Metadata } from "next";
import "./globals.css";

// ==================== 网页元数据 ====================
// 控制浏览器标签页显示的标题和搜索引擎描述
export const metadata: Metadata = {
  title: "Tank Game 坦克大战",                    // 👈 浏览器标签页标题
  description: "Classic Tank Battle Game 经典坦克大战游戏", // 👈 搜索引擎描述
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
