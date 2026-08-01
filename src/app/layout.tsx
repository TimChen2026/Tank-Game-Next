import type { Metadata } from "next";
import Script from "next/script";
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
      <body className="antialiased">
        {children}
        {/* ==================== Tawk.to 用户反馈聊天组件 ==================== */}
        {/* 在所有页面右下角显示聊天气泡，用户可点击发起反馈/咨询 */}
        <Script id="tawk-to" strategy="afterInteractive">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/6a6db5578b71c61d4ae8b6a2/1juu8oobd';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
