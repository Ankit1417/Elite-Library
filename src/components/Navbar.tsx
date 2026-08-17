"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cartContext";
import { useAuth } from "@/lib/authContext";
import { BookOpen, Search, ShoppingBag, User, X, ChevronDown } from "lucide-react";
import BirthdayRewardsPrompt from "@/components/BirthdayRewardsPrompt";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar() {
  const router = useRouter();
  const { totalItems, setIsCartOpen } = useCart();
  const { customer, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    setIsAccountDropdownOpen(false);
    await logout();
    router.push("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#F7F3EF]/95 backdrop-blur-md border-b border-[#DED6C8]">
        <div className="max-w-[1400px] mx-auto px-6 h-[88px] flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center group shrink-0"
            aria-label="Elite Library Home"
          >
            <Image
              src="/Elite_logo.png"
              alt="Elite Library"
              width={220}
              height={80}
              priority
              className="h-[70px] w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#211C18]">
            <Link
              href="/"
              className="hover:text-[#B58A3A] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/books"
              className="hover:text-[#B58A3A] transition-colors"
            >
              Browse Catalog
            </Link>
            <Link
              href="/books?sort=discount"
              className="hover:text-[#B58A3A] transition-colors"
            >
              Curated Deals
            </Link>
            <Link
              href="/orders"
              className="hover:text-[#B58A3A] transition-colors"
            >
              Track Order
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFFDF8] border border-[#DED6C8] w-[260px]">
              <Search className="w-4 h-4 text-[#68615B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                placeholder="Search books, authors..."
                className="w-full bg-transparent text-sm text-[#211C18] placeholder-[#68615B] focus:outline-none"
              />
            </div>

            {/* Mobile Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              type="button"
              aria-label="Search books"
              className="sm:hidden p-2.5 rounded-xl bg-[#FFFDF8] border border-[#DED6C8] text-[#211C18] hover:bg-[#EDE7DF] hover:border-[#B58A3A]/60 transition-all flex items-center justify-center shadow-xs"
              title="Search Books"
            >
              <Search className="w-4 h-4 text-[#68615B]" />
            </button>

            <NotificationBell />

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              type="button"
              aria-label={totalItems > 0 ? `Open cart, ${totalItems} items` : "Open cart"}
              className="relative p-2.5 rounded-xl bg-[#FFFDF8] border border-[#DED6C8] text-[#2B1F16] hover:bg-[#EDE7DF] hover:border-[#B58A3A]/60 transition-all flex items-center justify-center shadow-xs"
              title="Open Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#2B1F16] text-[#F7F3EF] font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Account/Login */}
            {isAuthenticated && customer ? (
              <div className="relative">
                <button
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                  className="p-2.5 rounded-xl bg-[#FFFDF8] border border-[#DED6C8] text-[#2B1F16] hover:bg-[#EDE7DF] hover:border-[#B58A3A]/60 transition-all flex items-center gap-2 shadow-xs"
                  title="My Account"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {customer.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isAccountDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#FFFDF8] rounded-xl border border-[#DED6C8] shadow-lg py-2 z-50">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-[#211C18] hover:bg-[#EDE7DF] transition-colors"
                      onClick={() => setIsAccountDropdownOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-[#211C18] hover:bg-[#EDE7DF] transition-colors"
                      onClick={() => setIsAccountDropdownOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      type="button"
                      className="block w-full px-4 py-2 text-left text-sm text-[#211C18] hover:bg-[#EDE7DF] transition-colors"
                      onClick={() => void handleLogout()}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : !authLoading ? (
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-[#2B1F16] text-[#F7F3EF] font-bold text-sm hover:bg-[#1F1A17] transition-all shadow-xs"
              >
                Login
              </Link>
            ) : (
              <div className="w-20 h-10 rounded-xl bg-[#F7F3EF] border border-[#DED6C8] animate-pulse" />
            )}
          </div>
        </div>
      </header>

      <BirthdayRewardsPrompt />

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#211C18]/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#FFFDF8] rounded-2xl p-6 border border-[#DED6C8] shadow-2xl relative">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-4 right-4 text-[#68615B] hover:text-[#211C18] p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif-luxury text-lg font-bold text-[#211C18] mb-4">
              Search Elite Library
            </h3>

            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#68615B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, description, or ISBN..."
                  className="w-full bg-[#F7F3EF] border border-[#DED6C8] rounded-xl pl-11 pr-4 py-3 text-sm text-[#211C18] placeholder-[#68615B] focus:outline-none focus:border-[#B58A3A] focus:ring-1 focus:ring-[#B58A3A]"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#2B1F16] text-[#F7F3EF] font-bold rounded-xl text-sm hover:bg-[#1F1A17] transition-all"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
