import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "Jampur Digital OS — Local Economic & Community Operating System",
  description:
    "Discover verified local businesses, pharmacies, solar experts, cloth houses, groceries, and services in Jampur, Rajanpur, and South Punjab.",
  keywords: [
    "Jampur",
    "Rajanpur",
    "D.G. Khan",
    "South Punjab",
    "Local Directory",
    "Jampur OS",
    "Businesses",
    "Services",
    "Commerce",
    "Delivery",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        <CartProvider>
          <Navbar />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileNav />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
