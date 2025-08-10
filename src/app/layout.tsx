import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/layout";
import { suppressHydrationWarnings } from "@/lib/suppressHydrationWarnings";

// Suppress hydration warnings caused by browser extensions
suppressHydrationWarnings();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SuperM - Görev Yönetimi",
  description: "İki yazılım ajansını yöneten Mustafa Talha Boz için merkezi görev ve proje yönetimi sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
