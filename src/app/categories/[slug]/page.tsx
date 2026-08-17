"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookGrid from "@/components/BookGrid";
import Toast from "@/components/Toast";
import { BookCardProps } from "@/components/BookCard";
import { ArrowLeft } from "lucide-react";

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
}

interface CategoryDetail {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [books, setBooks] = useState<BookCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryData() {
      try {
        setIsLoading(true);
        // Load category details
        const catRes = await fetchApi<CategoryDetail>(`/categories/${slug}`);
        if (catRes.success) setCategory(catRes.data);

        // Load books in this category
        const booksRes = await fetchApi<{ books: BookData[] }>(
          `/books?category=${slug}`
        );
        if (booksRes.success) {
          setBooks(
            booksRes.data.books.map((b) => ({
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
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load category data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCategoryData();
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#26231F]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Link
          href="/books"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6F6A61] hover:text-[#4A3628] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Genres</span>
        </Link>

        <div className="border-b border-[#DED6C8] pb-8 mb-10">
          <span className="text-xs uppercase tracking-widest text-[#B58A3A] font-semibold">
            Genre Collection
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#26231F] mt-1">
            {category?.name || "Category"}
          </h1>
          {category?.description && (
            <p className="text-sm text-[#6F6A61] mt-2 font-light max-w-2xl">
              {category.description}
            </p>
          )}
        </div>

        <BookGrid
          books={books}
          isLoading={isLoading}
          emptyMessage={`No books currently found in "${category?.name || slug}".`}
        />
      </main>

      <Toast />
      <Footer />
    </div>
  );
}
