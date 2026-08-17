"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import AnnouncementBar from "@/components/AnnouncementBar";
import TrustFeatures from "@/components/TrustFeatures";
import FeaturedCollections from "@/components/FeaturedCollections";
import BookGrid from "@/components/BookGrid";
import Toast from "@/components/Toast";
import { BookCardProps } from "@/components/BookCard";
import { ArrowRight, Sparkles, Star, TrendingUp } from "lucide-react";

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  bookCount?: number;
}

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
  category?: { name: string };
  isFeatured?: boolean;
  isActive?: boolean;
}

function mapBookData(books: BookData[]): BookCardProps[] {
  return books.map((b) => ({
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
  }));
}

export default function HomePage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<BookCardProps[]>([]);
  const [newArrivals, setNewArrivals] = useState<BookCardProps[]>([]);
  const [bestSellers, setBestSellers] = useState<BookCardProps[]>([]);
  const [discountedBooks, setDiscountedBooks] = useState<BookCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setIsLoading(true);
        // Load categories
        const catRes = await fetchApi<CategoryItem[]>("/categories");
        if (catRes.success) setCategories(catRes.data);

        // Load Featured books
        const featRes = await fetchApi<{ books: BookData[] }>(
          "/books?isFeatured=true&limit=4"
        );
        if (featRes.success) {
          setFeaturedBooks(mapBookData(featRes.data.books));
        }

        // Load New Arrivals
        const newRes = await fetchApi<{ books: BookData[] }>(
          "/books?isNewArrival=true&limit=4"
        );
        if (newRes.success) {
          setNewArrivals(mapBookData(newRes.data.books));
        }

        // Load Best Sellers
        const bestRes = await fetchApi<{ books: BookData[] }>(
          "/books?isBestSeller=true&limit=4"
        );
        if (bestRes.success) {
          setBestSellers(mapBookData(bestRes.data.books));
        }

        // Load Discounted
        const discRes = await fetchApi<{ books: BookData[] }>(
          "/books?hasDiscount=true&limit=4"
        );
        if (discRes.success) {
          setDiscountedBooks(mapBookData(discRes.data.books));
        }
      } catch (err) {
        console.error("Error loading home page data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EF] text-[#211C18]">
      <AnnouncementBar />
      <Navbar />
      <HeroSection />
      <TrustFeatures />
      <FeaturedCollections categories={categories} />

      {/* Featured Books (White section) */}
      <section className="py-14 bg-[#FFFDF8] border-b border-[#DED6C8]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <Star className="w-5 h-5 text-[#B58A3A] fill-[#B58A3A]" />
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#211C18]">
                Featured Highlights
              </h2>
            </div>
            <Link
              href="/books?isFeatured=true"
              className="text-xs font-semibold text-[#2B1F16] hover:text-[#B58A3A] flex items-center gap-1 group transition-colors"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <BookGrid books={featuredBooks} isLoading={isLoading} />
        </div>
      </section>

      {/* New Arrivals (Ivory section) */}
      <section className="py-14 bg-[#F7F3EF] border-b border-[#DED6C8]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[#B58A3A]" />
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#211C18]">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/books?isNewArrival=true"
              className="text-xs font-semibold text-[#2B1F16] hover:text-[#B58A3A] flex items-center gap-1 group transition-colors"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <BookGrid books={newArrivals} isLoading={isLoading} />
        </div>
      </section>

      {/* Promotional Banner (Beige section with deep brown card) */}
      <section className="py-14 bg-[#EDE7DF] border-b border-[#DED6C8]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="bg-[#2B1F16] rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-[#B58A3A]/30 shadow-lg">
            <div className="max-w-xl z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#B58A3A] block mb-2">
                Exclusive Bibliophile Offer
              </span>
              <h3 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#F7F3EF] leading-tight">
                Enhance Your Personal Library Today
              </h3>
              <p className="text-[#DED6C8] text-sm mt-3 font-light leading-relaxed">
                Enjoy special reduced pricing on selected leather-bound classics and rare intellectual monographs. Complimentary safe delivery on all standard orders.
              </p>
              <div className="mt-6">
                <Link
                  href="/books?sort=discount"
                  className="px-6 py-3 bg-[#B58A3A] text-[#F7F3EF] font-bold text-sm rounded-xl hover:bg-[#9E7730] transition-all inline-flex items-center gap-2 shadow-md"
                >
                  <span>Shop Discounted Editions</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers (White section) */}
      <section className="py-14 bg-[#FFFDF8] border-b border-[#DED6C8]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 text-[#B58A3A]" />
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#211C18]">
                Best Sellers
              </h2>
            </div>
            <Link
              href="/books?isBestSeller=true"
              className="text-xs font-semibold text-[#2B1F16] hover:text-[#B58A3A] flex items-center gap-1 group transition-colors"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <BookGrid books={bestSellers} isLoading={isLoading} />
        </div>
      </section>

      {/* Discounted Books (Ivory section) */}
      {discountedBooks.length > 0 && (
        <section className="py-14 bg-[#F7F3EF]">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-semibold text-[#B58A3A] uppercase tracking-widest block">
                  Limited Savings
                </span>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#211C18] mt-0.5">
                  Special Discounts
                </h2>
              </div>
              <Link
                href="/books?sort=discount"
                className="text-xs font-semibold text-[#2B1F16] hover:text-[#B58A3A] flex items-center gap-1 group transition-colors"
              >
                <span>Explore All</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <BookGrid books={discountedBooks} isLoading={isLoading} />
          </div>
        </section>
      )}

      <Toast />
      <Footer />
    </div>
  );
}
