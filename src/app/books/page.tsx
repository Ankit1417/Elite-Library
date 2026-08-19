"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { getCategories } from "@/lib/categories";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookGrid from "@/components/BookGrid";
import Toast from "@/components/Toast";
import { BookCardProps } from "@/components/BookCard";
import { CategoryItem } from "@/components/CategorySection";
import { Filter, SlidersHorizontal, X } from "lucide-react";

interface BookData {
  _id: string;
  title: string;
  slug: string;
  author: string;
  coverImage: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  stockQuantity: number;
  category?: { name: string; slug: string };
  averageRating?: number;
  reviewCount?: number;
}

function BooksCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [books, setBooks] = useState<BookCardProps[]>([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state - URL is the source of truth
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categorySlug, setCategorySlug] = useState(searchParams.get("category") || "");
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("inStock") === "true");
  const [isFeaturedOnly, setIsFeaturedOnly] = useState(searchParams.get("isFeatured") === "true");
  const [isNewArrivalOnly, setIsNewArrivalOnly] = useState(searchParams.get("isNewArrival") === "true");
  const [isBestSellerOnly, setIsBestSellerOnly] = useState(searchParams.get("isBestSeller") === "true");
  const [sort, setSort] = useState(searchParams.get("sort") || "top-rated");
  const [page, setPage] = useState(1);
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Synchronize state whenever URL searchParams change (e.g. Navbar category navigation)
  useEffect(() => {
    const urlCategory = searchParams.get("category") || "";
    const urlSearch = searchParams.get("search") || "";
    const urlSort = searchParams.get("sort") || "top-rated";
    const urlInStock = searchParams.get("inStock") === "true";
    const urlIsFeatured = searchParams.get("isFeatured") === "true";
    const urlIsNewArrival = searchParams.get("isNewArrival") === "true";
    const urlIsBestSeller = searchParams.get("isBestSeller") === "true";
    const urlMinPrice = searchParams.get("minPrice") || "";
    const urlMaxPrice = searchParams.get("maxPrice") || "";

    setCategorySlug(urlCategory);
    setSearch(urlSearch);
    setSort(urlSort);
    setInStockOnly(urlInStock);
    setIsFeaturedOnly(urlIsFeatured);
    setIsNewArrivalOnly(urlIsNewArrival);
    setIsBestSellerOnly(urlIsBestSeller);
    setMinPrice(urlMinPrice);
    setMaxPrice(urlMaxPrice);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadBooks() {
      setIsLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.append("search", search);
        if (categorySlug) query.append("category", categorySlug);
        if (inStockOnly) query.append("inStock", "true");
        if (isFeaturedOnly) query.append("isFeatured", "true");
        if (isNewArrivalOnly) query.append("isNewArrival", "true");
        if (isBestSellerOnly) query.append("isBestSeller", "true");
        if (minPrice) query.append("minPrice", minPrice);
        if (maxPrice) query.append("maxPrice", maxPrice);
        if (sort) query.append("sort", sort);
        query.append("page", page.toString());
        query.append("limit", "12");

        const res = await fetchApi<{ books: BookData[]; total: number; pages: number }>(
          `/books?${query.toString()}`
        );

        if (res.success) {
          setBooks(
            res.data.books.map((b) => ({
              id: b._id,
              title: b.title,
              slug: b.slug,
              author: b.author,
              coverImage: b.coverImage,
              price: b.price,
              discountPercentage: b.discountPercentage,
              finalPrice: b.finalPrice,
              stockQuantity: b.stockQuantity,
              categoryName: b.category?.name,
              averageRating: b.averageRating,
              reviewCount: b.reviewCount,
            }))
          );
          setTotalBooks(res.data.total);
          setTotalPages(res.data.pages || 1);
        }
      } catch (err) {
        console.error("Failed to load books", err);
      } finally {
        setIsLoading(false);
      }
    }

    startTransition(() => {
      loadBooks();
    });
  }, [
    search,
    categorySlug,
    inStockOnly,
    isFeaturedOnly,
    isNewArrivalOnly,
    isBestSellerOnly,
    sort,
    page,
    minPrice,
    maxPrice,
  ]);

  const handleCategoryChange = (newCat: string) => {
    setCategorySlug(newCat);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (newCat) {
      params.set("category", newCat);
    } else {
      params.delete("category");
    }
    const queryString = params.toString();
    router.push(`/books${queryString ? `?${queryString}` : ""}`, { scroll: false });
  };

  const resetFilters = () => {
    router.push("/books", { scroll: false });
    setSearch("");
    setCategorySlug("");
    setInStockOnly(false);
    setIsFeaturedOnly(false);
    setIsNewArrivalOnly(false);
    setIsBestSellerOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setSort("top-rated");
    setPage(1);
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#DED6C8] pb-6 mb-8 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#B58A3A] font-semibold">
            The Complete Library
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#26231F] mt-1">
            Browse Books
          </h1>
          <p className="text-xs text-[#6F6A61] mt-1">
            Showing {totalBooks} available title(s)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2.5 bg-[#FFFDF8] border border-[#DED6C8] rounded-xl text-xs font-semibold text-[#26231F] flex items-center gap-2 shadow-xs"
          >
            <Filter className="w-4 h-4 text-[#B58A3A]" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#B58A3A] hidden sm:inline" />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="bg-[#FFFDF8] border border-[#DED6C8] text-[#26231F] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#B58A3A] shadow-xs"
            >
              <option value="top-rated">Top Rated</option>
              <option value="newest">Sort by Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6 bg-[#FFFDF8] p-6 rounded-2xl border border-[#DED6C8] h-fit shadow-xs">
          <div className="flex items-center justify-between border-b border-[#DED6C8] pb-3">
            <h3 className="font-serif-luxury font-bold text-[#26231F] text-base">
              Refine Search
            </h3>
            <button
              onClick={resetFilters}
              className="text-[11px] text-[#4A3628] hover:text-[#B58A3A] hover:underline font-semibold"
            >
              Reset All
            </button>
          </div>

          {/* Search Input */}
          <div>
            <label className="text-xs font-semibold text-[#26231F] block mb-2">
              Keyword
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Title, author, ISBN..."
              className="w-full bg-[#F8F5EF] border border-[#DED6C8] rounded-xl px-3 py-2 text-xs text-[#26231F] placeholder-[#6F6A61] focus:outline-none focus:border-[#B58A3A]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-semibold text-[#26231F] block mb-2">
              Category
            </label>
            <select
              value={categorySlug}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full bg-[#F8F5EF] border border-[#DED6C8] rounded-xl px-3 py-2 text-xs text-[#26231F] focus:outline-none focus:border-[#B58A3A]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="text-xs font-semibold text-[#26231F] block mb-2">
              Price Range (Rs.)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
                className="w-1/2 bg-[#F8F5EF] border border-[#DED6C8] rounded-xl px-3 py-2 text-xs text-[#26231F] focus:outline-none focus:border-[#B58A3A]"
              />
              <span className="text-[#6F6A61] text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                className="w-1/2 bg-[#F8F5EF] border border-[#DED6C8] rounded-xl px-3 py-2 text-xs text-[#26231F] focus:outline-none focus:border-[#B58A3A]"
              />
            </div>
          </div>

          {/* Checkbox Toggles */}
          <div className="space-y-3 pt-2 border-t border-[#DED6C8]">
            <label className="flex items-center gap-2.5 text-xs text-[#26231F] cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setPage(1);
                }}
                className="accent-[#B58A3A] w-4 h-4 rounded"
              />
              <span>In Stock Only</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-[#26231F] cursor-pointer">
              <input
                type="checkbox"
                checked={isFeaturedOnly}
                onChange={(e) => {
                  setIsFeaturedOnly(e.target.checked);
                  setPage(1);
                }}
                className="accent-[#B58A3A] w-4 h-4 rounded"
              />
              <span>Featured Highlights</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-[#26231F] cursor-pointer">
              <input
                type="checkbox"
                checked={isNewArrivalOnly}
                onChange={(e) => {
                  setIsNewArrivalOnly(e.target.checked);
                  setPage(1);
                }}
                className="accent-[#B58A3A] w-4 h-4 rounded"
              />
              <span>New Arrivals</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-[#26231F] cursor-pointer">
              <input
                type="checkbox"
                checked={isBestSellerOnly}
                onChange={(e) => {
                  setIsBestSellerOnly(e.target.checked);
                  setPage(1);
                }}
                className="accent-[#B58A3A] w-4 h-4 rounded"
              />
              <span>Best Sellers</span>
            </label>
          </div>
        </aside>

        {/* Book Grid & Pagination */}
        <div className="lg:col-span-3">
          <BookGrid books={books} isLoading={isLoading} />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-xl bg-[#FFFDF8] border border-[#DED6C8] text-xs font-semibold text-[#26231F] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#B58A3A] hover:bg-[#F1ECE2] transition-all shadow-xs"
              >
                Previous
              </button>
              <span className="text-xs text-[#6F6A61] font-medium px-3">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-xl bg-[#FFFDF8] border border-[#DED6C8] text-xs font-semibold text-[#26231F] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#B58A3A] hover:bg-[#F1ECE2] transition-all shadow-xs"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-[#26231F]/40 backdrop-blur-xs p-4 flex justify-end">
          <div className="w-full max-w-xs bg-[#FFFDF8] p-6 rounded-2xl border border-[#DED6C8] space-y-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#DED6C8] pb-3">
              <h3 className="font-serif-luxury font-bold text-[#26231F] text-base">Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-[#6F6A61] hover:text-[#26231F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#26231F] block mb-2">Category</label>
              <select
                value={categorySlug}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-[#F8F5EF] border border-[#DED6C8] rounded-xl px-3 py-2 text-xs text-[#26231F]"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-[#DED6C8]">
              <button
                onClick={resetFilters}
                className="text-xs text-[#6F6A61] hover:underline"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="px-5 py-2 bg-[#4A3628] text-[#FFFDF8] font-bold rounded-xl text-xs hover:bg-[#352D27]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function BooksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#26231F]">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-[#B58A3A] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <BooksCatalogContent />
      </Suspense>
      <Toast />
      <Footer />
    </div>
  );
}
