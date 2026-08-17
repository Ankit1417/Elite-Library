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
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Tags,
  User,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

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
    { label: "Deals", href: "/admin/deals", icon: Tags },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F6F2EA] text-[#27231F] flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-[#1F1A17] flex flex-col justify-between p-5 shrink-0 hidden md:flex">
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#FFFDF9] border-b border-[#DED6CA] px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-serif-luxury text-lg font-bold text-[#27231F]">
                {getPageTitle(pathname)}
              </h1>
              <p className="text-xs text-[#716A61]">
                {getPageDescription(pathname)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#716A61] hover:text-[#B58A3A] hover:bg-[#F6F2EA] transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>View Store</span>
            </Link>
            <button
              onClick={handleLogout}
              className="md:hidden flex items-center gap-1 text-xs text-[#716A61] font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Children */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
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
  if (pathname === "/admin/deals") return "Create campaigns and manage coupon performance";
  if (pathname === "/admin/settings") return "Configure store settings";
  if (pathname.startsWith("/admin/books/")) return "Edit book details";
  if (pathname.startsWith("/admin/orders/")) return "View order details";
  if (pathname.startsWith("/admin/deals/")) return "Review campaign reach, redemptions, and customer coupons";
  return "";
}
