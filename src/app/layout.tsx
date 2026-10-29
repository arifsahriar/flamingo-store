import "./globals.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CartProvider } from "@/context/CartContext";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { AuthProvider } from "@/context/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";

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
      <body className="antialiased flex flex-col min-h-screen">
        <SiteConfigProvider>
          <AuthProvider>
            <ProductsProvider>
              <CartProvider>
                <div className="flex-1">
                  {children}
                </div>
                <Suspense fallback={null}>
                  <Footer />
                </Suspense>
                <CartDrawer />
              </CartProvider>
            </ProductsProvider>
          </AuthProvider>
        </SiteConfigProvider>
      </body>
    </html>
  );
}
