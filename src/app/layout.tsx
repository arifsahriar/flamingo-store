import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FLAMINGO | Elegance That Endures — Premium 925 Sterling Silver Jewelry",
  description:
    "Discover authentic 925 Sterling Silver jewelry by FLAMINGO. Hallmarked, anti-tarnish, waterproof, and 100% skin safe in Bangladesh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FFF5F5] text-slate-800 antialiased selection:bg-[#FDA4AF] selection:text-[#881337]">
        {children}
      </body>
    </html>
  );
}
