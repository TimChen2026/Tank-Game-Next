import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "坦克大战",
  description: "经典NES风格网页坦克大战游戏",
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
