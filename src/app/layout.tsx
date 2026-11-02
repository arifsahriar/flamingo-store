import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { AuthProvider } from "@/context/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import PWARegister from "@/components/pwa/PWARegister";
import PWAInstallBanner from "@/components/pwa/PWAInstallBanner";

export const viewport: Viewport = {
  themeColor: "#db2777",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "FLAMINGO | 925 Sterling Silver Jewelry & Artisan Wear",
  description: "Elegance That Endures - Premium 925 Sterling Silver Jewelry in Bangladesh",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FLAMINGO",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
                <FavoritesProvider>
                  <div className="flex-1">
                    {children}
                  </div>
                  <Suspense fallback={null}>
                    <Footer />
                  </Suspense>
                  <CartDrawer />
                  <PWARegister />
                  <Suspense fallback={null}>
                    <PWAInstallBanner />
                  </Suspense>
                </FavoritesProvider>
              </CartProvider>
            </ProductsProvider>
          </AuthProvider>
        </SiteConfigProvider>
      </body>
    </html>
  );
}
