import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BizAgent - Giải Pháp AI dành cho doanh nghiệp",
  description: "BizAgent - Giải Pháp AI dành cho doanh nghiệp",
  keywords: "AI, giải pháp doanh nghiệp, công nghệ, BizAgent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="antialiased bg-[#060909] text-white">
        {children}
      </body>
    </html>
  );
}
