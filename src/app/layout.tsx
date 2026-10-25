import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "FLAMINGO | 925 Sterling Silver Jewelry",
  description: "Elegance That Endures - Premium 925 Sterling Silver Jewelry in Bangladesh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className="antialiased">
        <SiteConfigProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </SiteConfigProvider>
      </body>
    </html>
  );
}