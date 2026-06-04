import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata = {
  title: "黄河流域（山东段）文学景观 - 数字人文展示平台",
  description: "数字人文视域下黄河流域（山东段）文学景观构建与教学应用研究展示平台，采用三维地理与古典水墨双视觉模式交互体验。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className="h-full select-none">
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          <Header />
          <main className="flex-grow pt-[var(--nav-height)] flex flex-col">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
