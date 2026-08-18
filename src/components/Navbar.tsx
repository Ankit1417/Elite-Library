"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  FocusEvent,
  FormEvent,
  KeyboardEvent,
  ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/lib/cartContext";
import { useAuth } from "@/lib/authContext";
import { useWishlist } from "@/lib/wishlistContext";
import { isAbortError } from "@/lib/api";
import { getCategories } from "@/lib/categories";
import { CategoryItem } from "@/components/CategorySection";
import BirthdayRewardsPrompt from "@/components/BirthdayRewardsPrompt";
import NotificationBell from "@/components/NotificationBell";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

const SCROLL_THRESHOLD = 80;
const CATALOG_OPEN_DELAY = 90;
const CATALOG_CLOSE_DELAY = 140;

const actionButtonClass =
  "relative flex items-center justify-center rounded-xl border border-[#DED6C8] bg-[#FFFDF8] p-2.5 text-[#2B1F16] shadow-xs transition-all duration-200 hover:border-[#B58A3A]/60 hover:bg-[#EDE7DF]";

function useScrolled(threshold: number) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let frameId = 0;
    const update = () => {
      frameId = 0;
      setIsScrolled(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (frameId === 0) frameId = window.requestAnimationFrame(update);
    };
    const onResize = () => update();

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frameId !== 0) window.cancelAnimationFrame(frameId);
    };
  }, [threshold]);

  return isScrolled;
}

/** Navbar link with a subtle gold active state. */
function NavLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`relative flex items-center py-2 text-sm font-medium transition-colors duration-200 ${
        isActive ? "text-[#B58A3A]" : "text-[#211C18] hover:text-[#B58A3A]"
      }`}
    >
      {label}
      {isActive && (
        <span
          className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#B58A3A]"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}

interface CatalogNavItemProps {
  categories: CategoryItem[];
  isLoading: boolean;
  hasError: boolean;
  isActive: boolean;
}

function CatalogNavItem({
  categories,
  isLoading,
  hasError,
  isActive,
}: CatalogNavItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);

  const clearTimers = useCallback(() => {
    if (openTimer.current !== null) window.clearTimeout(openTimer.current);
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  const closeDropdown = useCallback(() => {
    clearTimers();
    setIsOpen(false);
  }, [clearTimers]);

  const openWithDelay = useCallback(() => {
    clearTimers();
    openTimer.current = window.setTimeout(
      () => setIsOpen(true),
      CATALOG_OPEN_DELAY
    );
  }, [clearTimers]);

  const closeWithDelay = useCallback(() => {
    clearTimers();
    closeTimer.current = window.setTimeout(
      () => setIsOpen(false),
      CATALOG_CLOSE_DELAY
    );
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={openWithDelay}
      onMouseLeave={closeWithDelay}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) closeDropdown();
      }}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Escape") {
          closeDropdown();
          triggerRef.current?.focus();
        }
      }}
    >
      <Link
        ref={triggerRef}
        href="/books"
        onFocus={openWithDelay}
        onClick={closeDropdown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`relative flex items-center gap-1.5 py-2 text-sm font-medium transition-colors duration-200 ${
          isActive ? "text-[#B58A3A]" : "text-[#211C18] hover:text-[#B58A3A]"
        }`}
      >
        <span>Browse Catalog</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
        {isActive && (
          <span
            className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#B58A3A]"
            aria-hidden="true"
          />
        )}
      </Link>

{isOpen && (
        <div
          role="menu"
          aria-label="Browse by Category"
          className="absolute left-0 z-50 mt-3 w-[440px] max-w-[calc(100vw-2rem)] rounded-2xl border border-[#DED6C8] bg-[#FFFDF8]/95 p-5 shadow-[0_24px_70px_rgba(43,31,22,0.18)] backdrop-blur-xl"
        >
          <p className="border-b border-[#DED6C8] pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B58A3A]">
            Browse by Category
          </p>

          {isLoading ? (
            <div
              className="grid grid-cols-2 gap-x-6 gap-y-2 py-4"
              aria-hidden="true"
            >
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-9 animate-pulse rounded-lg bg-[#F1ECE2]"
                />
              ))}
            </div>
          ) : hasError || categories.length === 0 ? (
            <div className="py-3">
              <Link
                href="/books"
                onClick={closeDropdown}
                className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-[#4A3628] transition-colors hover:bg-[#F8F5EF] hover:text-[#B58A3A]"
              >
                <span>Browse all books</span>
                <ArrowRight
                  className="h-4 w-4 text-[#B58A3A] transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          ) : (
            <div className="max-h-[min(60vh,26rem)] overflow-y-auto py-3">
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                {categories.map((cat) => (
                  <li key={cat._id}>
                    <Link
                      href={`/books?category=${encodeURIComponent(cat.slug)}`}
                      onClick={closeDropdown}
                      role="menuitem"
                      className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[#211C18] transition-all duration-200 hover:bg-[#B58A3A]/10 hover:text-[#2B1F16]"
                    >
                      <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                        {cat.name}
                      </span>
                      <ArrowRight
                        className="h-3.5 w-3.5 -translate-x-1 text-[#B58A3A] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-1 border-t border-[#DED6C8] pt-3">
            <Link
              href="/books"
              onClick={closeDropdown}
              role="menuitem"
              className="group flex items-center justify-between text-sm font-bold text-[#4A3628] transition-colors hover:text-[#B58A3A]"
            >
              <span>View All Books</span>
              <ArrowRight
                className="h-4 w-4 text-[#B58A3A] transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-[#211C18] transition-colors hover:bg-[#F8F5EF] hover:text-[#B58A3A]"
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4 text-[#68615B]" />
    </Link>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { customer, isAuthenticated, isLoading: authLoading, logout } =
    useAuth();
  const { wishlistIds } = useWishlist();

  const isScrolled = useScrolled(SCROLL_THRESHOLD);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCatalogAccordionOpen, setIsCatalogAccordionOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [dealsActive, setDealsActive] = useState(false);

  // Curated Deals shares the /books pathname but uses a sort=discount query.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.requestAnimationFrame(() => {
      setDealsActive(
        pathname === "/books" &&
          new URLSearchParams(window.location.search).get("sort") === "discount"
      );
    });
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  // Load categories — uses shared in-memory cached promise with lifecycle-safe abort handling
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    (async () => {
      try {
        const data = await getCategories({ signal: controller.signal });
        if (isMounted) {
          setCategories(data);
          setCategoriesError(false);
        }
      } catch (err) {
        if (isAbortError(err, controller.signal)) {
          // Expected lifecycle cleanup on unmount - do not set error state
          return;
        }
        if (isMounted) {
          setCategoriesError(true);
        }
      } finally {
        if (isMounted) {
          setCategoriesLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const submitSearch = (term: string) => {
    if (term.trim()) {
      router.push(`/books?search=${encodeURIComponent(term.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      setSearchQuery("");
      setMobileSearch("");
    }
  };

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitSearch(searchQuery);
  };

  const handleMobileSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitSearch(mobileSearch);
  };

  const handleLogout = async () => {
    setIsAccountDropdownOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
    router.push("/");
  };

  const isHome = pathname === "/";
  const isCatalog = pathname === "/books" && !dealsActive;
  const isTrack = pathname === "/orders";

  return (
    <>
      <header
        className={`sticky z-40 mx-auto w-full transition-all duration-300 ease-out ${
          isScrolled
            ? "top-2 md:top-3 w-[calc(100%-24px)] sm:w-[calc(100%-40px)] md:w-[calc(100%-64px)] max-w-[1500px] rounded-2xl md:rounded-3xl border border-[#DED6C8] bg-[#F7F3EF]/90 shadow-[0_10px_35px_rgba(40,30,20,0.10)] backdrop-blur-xl"
            : "top-0 max-w-none rounded-none border-b border-[#DED6C8] bg-[#F7F3EF]/95 shadow-none backdrop-blur-md"
        }`}
        onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
          if (e.key === "Escape") setIsMobileMenuOpen(false);
        }}
      >
        <div className="mx-auto flex h-[88px] w-full max-w-[1400px] items-center justify-between gap-3 px-3 sm:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="Elite Library Home"
          >
            <Image
              src="/Elite_logo.png"
              alt="Elite Library"
              width={220}
              height={80}
              priority
              className="h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02] md:h-[70px]"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-5 text-sm font-medium lg:flex xl:gap-7">
            <NavLink href="/" label="Home" isActive={isHome} />
            <CatalogNavItem
              categories={categories}
              isLoading={categoriesLoading}
              hasError={categoriesError}
              isActive={isCatalog}
            />
            <NavLink
              href="/books?sort=discount"
              label="Curated Deals"
              isActive={dealsActive}
            />
            <NavLink href="/orders" label="Track Order" isActive={isTrack} />
          </nav>

{/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu-panel"
              className={`lg:hidden ${actionButtonClass}`}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Inline search (large screens) */}
            <div className="hidden w-[200px] items-center gap-2 rounded-xl border border-[#DED6C8] bg-[#FFFDF8] px-3.5 py-2.5 shadow-xs transition-all duration-200 focus-within:border-[#B58A3A] focus-within:ring-1 focus-within:ring-[#B58A3A]/40 xl:flex 2xl:w-[240px]">
              <Search className="h-4 w-4 text-[#68615B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitSearch(searchQuery);
                }}
                placeholder="Search books, authors..."
                className="w-full bg-transparent text-sm text-[#211C18] placeholder-[#68615B] focus:outline-none"
              />
            </div>

            {/* Mobile / tablet search trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              type="button"
              aria-label="Search books"
              title="Search Books"
              className={`xl:hidden ${actionButtonClass}`}
            >
              <Search className="h-5 w-5" />
            </button>

            <NotificationBell />

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label={
                wishlistIds.length > 0
                  ? `Wishlist, ${wishlistIds.length} items`
                  : "Wishlist"
              }
              title="My Wishlist"
              className={actionButtonClass}
            >
              <Heart className="h-5 w-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#B58A3A] text-[10px] font-bold text-[#FFFDF8] shadow-xs">
                  {wishlistIds.length > 9 ? "9+" : wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              type="button"
              aria-label={
                totalItems > 0 ? `Open cart, ${totalItems} items` : "Open cart"
              }
              title="Open Cart"
              className={actionButtonClass}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2B1F16] text-[10px] font-bold text-[#F7F3EF] shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>

{/* Account / Login */}
            {isAuthenticated && customer ? (
              <div className="relative">
                <button
                  onClick={() =>
                    setIsAccountDropdownOpen(!isAccountDropdownOpen)
                  }
                  aria-haspopup="menu"
                  aria-expanded={isAccountDropdownOpen}
                  title="My Account"
                  className="flex items-center gap-2 rounded-xl border border-[#DED6C8] bg-[#FFFDF8] p-2.5 text-[#2B1F16] shadow-xs transition-all duration-200 hover:border-[#B58A3A]/60 hover:bg-[#EDE7DF]"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden max-w-[90px] truncate text-sm font-medium sm:inline">
                    {customer.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 sm:block" />
                </button>
                {isAccountDropdownOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-[#DED6C8] bg-[#FFFDF8] py-2 shadow-lg">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-[#211C18] transition-colors hover:bg-[#EDE7DF]"
                      onClick={() => setIsAccountDropdownOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-[#211C18] transition-colors hover:bg-[#EDE7DF]"
                      onClick={() => setIsAccountDropdownOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      type="button"
                      className="block w-full px-4 py-2 text-left text-sm text-[#211C18] transition-colors hover:bg-[#EDE7DF]"
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
                className="rounded-xl bg-[#2B1F16] px-4 py-2.5 text-sm font-bold text-[#F7F3EF] transition-all hover:bg-[#1F1A17] md:px-5"
              >
                Login
              </Link>
            ) : (
              <div className="h-10 w-20 animate-pulse rounded-xl border border-[#DED6C8] bg-[#F7F3EF]" />
            )}
          </div>
        </div>

{/* Mobile / tablet menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu-panel"
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[#DED6C8] bg-[#FFFDF8] shadow-xl lg:hidden"
          >
            <div className="max-h-[calc(100dvh-120px)] overflow-y-auto px-4 py-4 sm:px-5">
              {/* Mobile search */}
              <form
                onSubmit={handleMobileSearchSubmit}
                className="relative mb-3"
              >
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68615B]" />
                <input
                  type="text"
                  value={mobileSearch}
                  onChange={(e) => setMobileSearch(e.target.value)}
                  placeholder="Search books, authors..."
                  className="w-full rounded-xl border border-[#DED6C8] bg-[#F8F5EF] py-2.5 pl-10 pr-3 text-sm text-[#211C18] placeholder-[#68615B] focus:border-[#B58A3A] focus:outline-none focus:ring-1 focus:ring-[#B58A3A]/40"
                />
              </form>

              <div className="divide-y divide-[#DED6C8]/70 pb-1">
                <MobileNavLink
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </MobileNavLink>

                {/* Browse Catalog accordion */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsCatalogAccordionOpen((open) => !open)}
                    aria-expanded={isCatalogAccordionOpen}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-[#211C18] transition-colors hover:bg-[#F8F5EF] hover:text-[#B58A3A]"
                  >
                    <span>Browse Catalog</span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#68615B] transition-transform duration-200 ${
                        isCatalogAccordionOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isCatalogAccordionOpen && (
                    <div className="space-y-1 border-l-2 border-[#B58A3A]/40 pb-3 pl-3">
                      {categoriesLoading ? (
                        <div className="space-y-2 py-2" aria-hidden="true">
                          {[0, 1, 2, 3].map((item) => (
                            <div
                              key={item}
                              className="h-8 animate-pulse rounded-lg bg-[#F1ECE2]"
                            />
                          ))}
                        </div>
                      ) : categoriesError || categories.length === 0 ? (
                        <Link
                          href="/books"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-[#4A3628] hover:text-[#B58A3A]"
                        >
                          Browse all books
                          <ArrowRight className="h-4 w-4 text-[#B58A3A]" />
                        </Link>
                      ) : (
                        categories.map((cat) => (
                          <Link
                            key={cat._id}
                            href={`/books?category=${encodeURIComponent(
                              cat.slug
                            )}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-[#211C18] transition-colors hover:bg-[#B58A3A]/10 hover:text-[#B58A3A]"
                          >
                            {cat.name}
                            <ArrowRight className="h-3.5 w-3.5 text-[#B58A3A]" />
                          </Link>
                        ))
                      )}
                      <Link
                        href="/books"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="mt-1 flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-bold text-[#4A3628] hover:text-[#B58A3A]"
                      >
                        View All Books
                        <ArrowRight className="h-4 w-4 text-[#B58A3A]" />
                      </Link>
                    </div>
                  )}
                </div>

                <MobileNavLink
                  href="/books?sort=discount"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Curated Deals
                </MobileNavLink>
                <MobileNavLink
                  href="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Track Order
                </MobileNavLink>
              </div>

{/* Account section */}
              {isAuthenticated && customer ? (
                <div className="mt-4 space-y-1 border-t border-[#DED6C8] pt-4">
                  <MobileNavLink
                    href="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Account
                  </MobileNavLink>
                  <MobileNavLink
                    href="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Orders
                  </MobileNavLink>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm font-medium text-[#211C18] transition-colors hover:bg-[#F8F5EF] hover:text-[#B58A3A]"
                  >
                    Logout
                  </button>
                </div>
              ) : !authLoading ? (
                <div className="mt-4 border-t border-[#DED6C8] pt-4">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-xl bg-[#2B1F16] px-4 py-2.5 text-center text-sm font-bold text-[#F7F3EF] transition-all hover:bg-[#1F1A17]"
                  >
                    Login
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </header>

      <BirthdayRewardsPrompt />

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#211C18]/40 px-4 pt-20 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[#DED6C8] bg-[#FFFDF8] p-6 shadow-2xl">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-4 top-4 p-1 text-[#68615B] hover:text-[#211C18]"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="mb-4 font-serif-luxury text-lg font-bold text-[#211C18]">
              Search Elite Library
            </h3>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#68615B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, description, or ISBN..."
                  autoFocus
                  className="w-full rounded-xl border border-[#DED6C8] bg-[#F7F3EF] py-3 pl-11 pr-4 text-sm text-[#211C18] placeholder-[#68615B] focus:border-[#B58A3A] focus:outline-none focus:ring-1 focus:ring-[#B58A3A]"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-[#2B1F16] px-6 py-3 text-sm font-bold text-[#F7F3EF] transition-all hover:bg-[#1F1A17]"
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