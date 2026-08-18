"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { getCategories } from "@/lib/categories";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import TrustFeatures from "@/components/TrustFeatures";
import CategorySection from "@/components/CategorySection";
import { CategoryItem } from "@/components/CategorySection";
import BookGrid from "@/components/BookGrid";
import Toast from "@/components/Toast";
import { BookCardProps } from "@/components/BookCard";
import {
  ArrowRight,
  BookOpen,
  HeadsetIcon,
  Package,
  ShieldCheck,
  Star,
  Tag,
  Truck,
} from "lucide-react";

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
  averageRating?: number;
  reviewCount?: number;
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
    averageRating: b.averageRating,
    reviewCount: b.reviewCount,
  }));
}

// ─── Section Header Component ──────────────────────────────────────────────────

function SectionHeader({
  eyebrow,
  title,
  viewAllHref,
  viewAllLabel = "View All",
}: {
  eyebrow?: string;
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-7">
      <div>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B58A3A] mb-1.5">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold text-[#111] leading-tight">
          {title}
        </h2>
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#111] transition-colors group flex-shrink-0"
        >
          <span>{viewAllLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

// ─── Promo Banner ──────────────────────────────────────────────────────────────

function PromoBanner() {
  return (
    <section className="py-12 bg-white border-b border-neutral-100">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-[#111] px-8 sm:px-12 py-10 sm:py-12 flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#B58A3A]/20">
          {/* Gold glow */}
          <div
            className="absolute right-0 top-0 w-64 h-64 rounded-full bg-[#B58A3A]/10 blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-lg text-center sm:text-left">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#B58A3A] mb-3 px-3 py-1 rounded-full border border-[#B58A3A]/30">
              Limited Time
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
              Special Discounts on <span className="text-[#B58A3A]">Select Editions</span>
            </h3>
            <p className="text-neutral-400 text-sm mt-3 leading-relaxed">
              Handpicked titles at reduced prices. Free delivery on all standard orders.
            </p>
          </div>

          <Link
            href="/books?sort=discount"
            className="relative z-10 inline-flex items-center gap-2 px-7 py-3.5 bg-[#B58A3A] text-white font-bold text-sm rounded-xl hover:bg-[#9E7730] transition-colors shadow-lg flex-shrink-0 group"
          >
            <Tag className="w-4 h-4" />
            <span>Shop Deals</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Why Shop Section ──────────────────────────────────────────────────────────

function WhyShopSection() {
  const reasons = [
    {
      icon: ShieldCheck,
      title: "100% Authentic Books",
      desc: "Every title is sourced from verified publishers and carefully inspected.",
    },
    {
      icon: Truck,
      title: "Nationwide Delivery",
      desc: "Fast, reliable delivery to your doorstep across Nepal.",
    },
    {
      icon: Package,
      title: "Premium Packaging",
      desc: "Books are packed safely to ensure perfect condition on arrival.",
    },
    {
      icon: HeadsetIcon,
      title: "Dedicated Support",
      desc: "Our team is ready to assist with orders, returns and recommendations.",
    },
    {
      icon: Star,
      title: "Curated Selection",
      desc: "Every book on Elite Library is handpicked for quality and value.",
    },
    {
      icon: BookOpen,
      title: "New Arrivals Weekly",
      desc: "Fresh titles added every week across all popular genres.",
    },
  ];

  return (
    <section className="py-14 bg-neutral-50 border-b border-neutral-100">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B58A3A] mb-1.5">
            Why Choose Us
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111]">
            Why Shop With Elite Library
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {reasons.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-start gap-3 p-5 bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-[#B58A3A]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111] leading-tight">{title}</p>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

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
        const [catSettled, featSettled, newSettled, bestSettled, discSettled] =
          await Promise.allSettled([
            getCategories(),
            fetchApi<{ books: BookData[] }>("/books?isFeatured=true&limit=5"),
            fetchApi<{ books: BookData[] }>("/books?isNewArrival=true&limit=5"),
            fetchApi<{ books: BookData[] }>("/books?isBestSeller=true&limit=5"),
            fetchApi<{ books: BookData[] }>("/books?hasDiscount=true&limit=5"),
          ]);

        if (catSettled.status === "fulfilled" && Array.isArray(catSettled.value)) {
          setCategories(catSettled.value);
        }
        if (featSettled.status === "fulfilled" && featSettled.value.success) {
          setFeaturedBooks(mapBookData(featSettled.value.data.books));
        }
        if (newSettled.status === "fulfilled" && newSettled.value.success) {
          setNewArrivals(mapBookData(newSettled.value.data.books));
        }
        if (bestSettled.status === "fulfilled" && bestSettled.value.success) {
          setBestSellers(mapBookData(bestSettled.value.data.books));
        }
        if (discSettled.status === "fulfilled" && discSettled.value.success) {
          setDiscountedBooks(mapBookData(discSettled.value.data.books));
        }
      } catch (err) {
        console.error("Error loading home page data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    void loadHomeData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111]">
      <Navbar />
      <HeroSection />
      <TrustFeatures />

      {/* Shop by Category */}
      <CategorySection categories={categories} />

      {/* Featured Books */}
      <section className="py-14 bg-white border-b border-neutral-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Hand-picked"
            title="Featured Books"
            viewAllHref="/books?isFeatured=true"
            viewAllLabel="View All Featured"
          />
          <BookGrid books={featuredBooks} isLoading={isLoading} />
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-14 bg-neutral-50 border-b border-neutral-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Just Added"
            title="New Arrivals"
            viewAllHref="/books?isNewArrival=true"
            viewAllLabel="View All"
          />
          <BookGrid books={newArrivals} isLoading={isLoading} />
        </div>
      </section>

      {/* Promo Banner */}
      <PromoBanner />

      {/* Best Sellers */}
      <section className="py-14 bg-white border-b border-neutral-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Most Popular"
            title="Best Sellers"
            viewAllHref="/books?isBestSeller=true"
            viewAllLabel="View All"
          />
          <BookGrid books={bestSellers} isLoading={isLoading} />
        </div>
      </section>

      {/* Curated Deals */}
      {discountedBooks.length > 0 && (
        <section className="py-14 bg-neutral-50 border-b border-neutral-100">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Limited Savings"
              title="Curated Deals"
              viewAllHref="/books?sort=discount"
              viewAllLabel="View All Deals"
            />
            <BookGrid books={discountedBooks} isLoading={isLoading} />
          </div>
        </section>
      )}

      {/* Why Shop With Us */}
      <WhyShopSection />

      <Toast />
      <Footer />
    </div>
  );
}
