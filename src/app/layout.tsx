import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cartContext";
import { AuthProvider } from "@/lib/authContext";
import CartDrawer from "@/components/CartDrawer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Elite Library | Luxury Online Bookstore",
    template: "%s | Elite Library",
  },
  description:
    "Curated collection of classic literature, rare masterpieces, philosophy, business, and art. Elevate your bookshelf with Elite Library.",
  keywords: ["books", "bookstore", "luxury books", "hardcover", "literature", "philosophy"],
  authors: [{ name: "Elite Library" }],
  openGraph: {
    title: "Elite Library | Luxury Online Bookstore",
    description: "Curated collection of literary masterpieces, rare books, and philosophical treatises.",
    siteName: "Elite Library",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="antialiased bg-[#F8F5EF] text-[#26231F] selection:bg-[#B58A3A]/20 selection:text-[#4A3628]">
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
