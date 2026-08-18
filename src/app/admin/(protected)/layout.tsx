"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import {
  BookOpen,
  FolderTree,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Tags,
  User,
  X,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchApi("/admin/auth/me")
      .then((res) => {
        if (!isMounted) return;
        if (res.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.replace("/admin/login");
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setIsAuthenticated(false);
        router.replace("/admin/login");
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Close mobile drawer when route changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetchApi("/admin/auth/logout", { method: "POST" });
      router.replace("/admin/login");
    } catch {
      router.replace("/admin/login");
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#1F1A17] text-[#27231F] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-3 border-[#B58A3A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#716A61]">Checking admin session...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null;
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Homepage", href: "/admin/homepage", icon: Home },
    { label: "Books", href: "/admin/books", icon: BookOpen },
    { label: "Categories", href: "/admin/categories", icon: FolderTree },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    { label: "Deals", href: "/admin/deals", icon: Tags },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F6F2EA] text-[#27231F]">
      {/* ─── Desktop Admin Sidebar (Fixed) ─── */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 bg-[#1F1A17] flex-col justify-between p-5 shrink-0 hidden md:flex z-30 select-none border-r border-[#2B2520] overflow-y-auto">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B58A3A] to-[#8B6B3A] flex items-center justify-center shadow-lg shadow-[#B58A3A]/20">
              <ShieldCheck className="w-5 h-5 text-[#FFFDF9] stroke-[2.5]" />
            </div>
            <div>
              <span className="font-serif-luxury font-bold text-base text-[#FFFDF9] block">
                Elite Admin
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#B58A3A] font-semibold block">
                Management Studio
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#2B2520] text-[#B58A3A] border border-[#B58A3A]/30 shadow-xs"
                      : "text-[#716A61] hover:text-[#FFFDF9] hover:bg-[#2B2520]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#B58A3A]" : ""}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="space-y-3 pt-4 border-t border-[#2B2520]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#716A61] hover:text-[#B58A3A] transition-colors"
          >
            <Package className="w-4 h-4 text-[#B58A3A]" />
            <span>Open Live Store ↗</span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#716A61]">
            <User className="w-4 h-4 text-[#B58A3A]" />
            <span>Administrator</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#716A61] hover:bg-[#2B2520] hover:text-[#FFFDF9] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Mobile Sidebar Overlay & Drawer ─── */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-[#1F1A17] flex flex-col justify-between p-5 z-50 md:hidden select-none border-r border-[#2B2520] overflow-y-auto shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B58A3A] to-[#8B6B3A] flex items-center justify-center shadow-lg shadow-[#B58A3A]/20">
                <ShieldCheck className="w-5 h-5 text-[#FFFDF9] stroke-[2.5]" />
              </div>
              <div>
                <span className="font-serif-luxury font-bold text-base text-[#FFFDF9] block">
                  Elite Admin
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#B58A3A] font-semibold block">
                  Management Studio
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl text-[#716A61] hover:text-white hover:bg-[#2B2520] transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#2B2520] text-[#B58A3A] border border-[#B58A3A]/30"
                      : "text-[#716A61] hover:text-[#FFFDF9] hover:bg-[#2B2520]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#B58A3A]" : ""}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="space-y-3 pt-4 border-t border-[#2B2520]">
          <Link
            href="/"
            target="_blank"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#716A61] hover:text-[#B58A3A] hover:bg-[#2B2520] transition-colors"
          >
            <Package className="w-4 h-4 text-[#B58A3A]" />
            <span>Open Live Store ↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#716A61] hover:bg-[#2B2520] hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="md:ml-64 min-h-screen flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 h-16 bg-[#FFFDF9] border-b border-[#DED6CA] px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              type="button"
              aria-label="Open navigation menu"
              className="p-2.5 rounded-xl text-[#27231F] hover:bg-neutral-100 md:hidden border border-neutral-200 shadow-xs flex items-center justify-center transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="font-serif-luxury text-base sm:text-lg font-bold text-[#27231F] line-clamp-1">
                {getPageTitle(pathname)}
              </h1>
              <p className="text-[11px] sm:text-xs text-[#716A61] line-clamp-1 hidden xs:block">
                {getPageDescription(pathname)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#716A61] hover:text-[#B58A3A] hover:bg-[#F6F2EA] transition-colors border border-[#DED6CA]"
            >
              <Package className="w-3.5 h-3.5 text-[#B58A3A]" />
              <span className="hidden sm:inline">View Store</span>
              <span className="sm:hidden text-[11px]">Store</span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs text-neutral-600 hover:text-red-600 hover:bg-red-50 transition-colors font-semibold flex items-center gap-1 border border-neutral-200"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Children */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname === "/admin/homepage") return "Homepage Settings";
  if (pathname === "/admin/books") return "Books";
  if (pathname === "/admin/categories") return "Categories";
  if (pathname === "/admin/orders") return "Orders";
  if (pathname === "/admin/reviews") return "Reviews";
  if (pathname === "/admin/deals") return "Deals";
  if (pathname === "/admin/settings") return "Settings";
  if (pathname.startsWith("/admin/books/")) return "Edit Book";
  if (pathname.startsWith("/admin/orders/")) return "Order Details";
  if (pathname.startsWith("/admin/deals/")) return "Deal Intelligence";
  return "Admin";
}

function getPageDescription(pathname: string): string {
  if (pathname === "/admin") return "Overview and insights";
  if (pathname === "/admin/homepage") return "Manage homepage content and promotions";
  if (pathname === "/admin/books") return "Manage your catalog and inventory";
  if (pathname === "/admin/categories") return "Organize book categories";
  if (pathname === "/admin/orders") return "Manage customer orders";
  if (pathname === "/admin/reviews") return "Moderate book reviews and ratings";
  if (pathname === "/admin/deals") return "Create campaigns and manage coupon performance";
  if (pathname === "/admin/settings") return "Configure store settings";
  if (pathname.startsWith("/admin/books/")) return "Edit book details";
  if (pathname.startsWith("/admin/orders/")) return "View order details";
  if (pathname.startsWith("/admin/deals/")) return "Review campaign reach, redemptions, and customer coupons";
  return "";
}
