"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useCart } from "@/lib/cartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Globe,
  Layers,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  XCircle,
} from "lucide-react";

interface BookDetail {
  _id: string;
  title: string;
  slug: string;
  author: string;
  description: string;
  category?: { name: string; slug: string };
  publisher?: string;
  isbn?: string;
  language?: string;
  pages?: number;
  publicationYear?: number;
  edition?: string;
  coverImage: string;
  additionalImages: string[];
  price: number;
  discountPercentage: number;
  finalPrice: number;
  stockQuantity: number;
}

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();

  const [book, setBook] = useState<BookDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBook() {
      try {
        setIsLoading(true);
        const res = await fetchApi<BookDetail>(`/books/slug/${slug}`);
        if (res.success && res.data) {
          setBook(res.data);
          setSelectedImage(res.data.coverImage);
        } else {
          setError("Book not found");
        }
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to load book details");
      } finally {
        setIsLoading(false);
      }
    }
    loadBook();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#26231F]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#B58A3A] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#26231F]">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
          <h2 className="font-serif-luxury text-2xl font-bold text-[#26231F] mb-2">
            Book Not Found
          </h2>
          <p className="text-[#6F6A61] text-sm mb-6">
            The literary work you are searching for may have been archived or moved.
          </p>
          <Link
            href="/books"
            className="px-6 py-3 bg-[#4A3628] text-[#FFFDF8] font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-[#352D27] transition-colors inline-block shadow-md"
          >
            Back to Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isOutOfStock = book.stockQuantity <= 0;
  const isLowStock = book.stockQuantity > 0 && book.stockQuantity <= 3;
  const allImages = [book.coverImage, ...(book.additionalImages || [])];

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    
    try {
      await fetchApi("/auth/me");
      addToCart(
        {
          bookId: book._id,
          title: book.title,
          slug: book.slug,
          coverImage: book.coverImage,
          price: book.price,
          discountPercentage: book.discountPercentage,
          finalPrice: book.finalPrice,
          stockQuantity: book.stockQuantity,
        },
        quantity
      );
    } catch {
      router.push(`/login?redirect=${encodeURIComponent(`/books/${slug}`)}`);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    
    try {
      await fetchApi("/auth/me");
      const added = addToCart(
        {
          bookId: book._id,
          title: book.title,
          slug: book.slug,
          coverImage: book.coverImage,
          price: book.price,
          discountPercentage: book.discountPercentage,
          finalPrice: book.finalPrice,
          stockQuantity: book.stockQuantity,
        },
        quantity
      );
      if (added) {
        router.push("/checkout");
      }
    } catch {
      router.push(`/login?redirect=${encodeURIComponent(`/books/${slug}`)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#26231F]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Back Link */}
        <Link
          href="/books"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6F6A61] hover:text-[#4A3628] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Gallery Section (Left 5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Main Image View */}
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#FFFDF8] border border-[#DED6C8] book-shadow p-4 flex items-center justify-center">
              <div className="relative w-full h-full rounded-sm overflow-hidden">
                <Image
                  src={selectedImage || book.coverImage}
                  alt={book.title}
                  fill
                  className="object-cover object-center"
                  priority
                  unoptimized
                />
              </div>
              {book.discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-[#B58A3A] text-[#FFFDF8] font-bold text-xs uppercase px-3 py-1 rounded-full shadow-md z-10">
                  -{book.discountPercentage}% Discount
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all shrink-0 bg-[#F1ECE2] ${
                      selectedImage === img
                        ? "border-[#B58A3A] ring-2 ring-[#B58A3A]/20"
                        : "border-[#DED6C8] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${book.title} thumb ${idx}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Purchase Section (Right 7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              {/* Category */}
              {book.category && (
                <Link
                  href={`/categories/${book.category.slug}`}
                  className="text-xs uppercase tracking-widest text-[#B58A3A] font-semibold hover:underline block mb-2"
                >
                  {book.category.name}
                </Link>
              )}

              {/* Title & Author */}
              <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-[#26231F] leading-tight">
                {book.title}
              </h1>
              <p className="text-base text-[#6F6A61] mt-2 font-serif-luxury italic">
                by <span className="text-[#26231F] font-semibold">{book.author}</span>
              </p>

              {/* Pricing Box */}
              <div className="mt-6 p-4 rounded-xl bg-[#FFFDF8] border border-[#DED6C8] flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-xs text-[#6F6A61] block mb-1">Selling Price</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-[#4A3628]">
                      Rs. {book.finalPrice.toLocaleString()}
                    </span>
                    {book.discountPercentage > 0 && (
                      <span className="text-base text-[#6F6A61] line-through">
                        Rs. {book.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Status Badge */}
                <div>
                  {isOutOfStock ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F1ECE2] border border-[#DED6C8] text-[#8C2D19] text-xs font-semibold">
                      <XCircle className="w-4 h-4" />
                      <span>Out of Stock</span>
                    </div>
                  ) : isLowStock ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F1ECE2] border border-[#DED6C8] text-[#4A3628] text-xs font-semibold">
                      <Package className="w-4 h-4" />
                      <span>Low Stock ({book.stockQuantity} remaining)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F1ECE2] border border-[#DED6C8] text-[#2E7D32] text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>In Stock ({book.stockQuantity} copies)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Selector & Action CTAs */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-[#26231F]">Select Quantity:</span>
                  <div className="flex items-center bg-[#F1ECE2] border border-[#DED6C8] rounded-xl p-1">
                    <button
                      disabled={quantity <= 1 || isOutOfStock}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 text-[#6F6A61] hover:text-[#26231F] disabled:opacity-40"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-sm font-bold text-[#26231F] min-w-[36px] text-center">
                      {quantity}
                    </span>
                    <button
                      disabled={quantity >= book.stockQuantity || isOutOfStock}
                      onClick={() => setQuantity((q) => Math.min(book.stockQuantity, q + 1))}
                      className="p-2 text-[#6F6A61] hover:text-[#26231F] disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                    className="w-full py-4 rounded-xl bg-[#FFFDF8] text-[#4A3628] font-bold text-sm border border-[#DED6C8] hover:bg-[#F1ECE2] hover:border-[#4A3628] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xs"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#B58A3A]" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    disabled={isOutOfStock}
                    onClick={handleBuyNow}
                    className="w-full py-4 rounded-xl bg-[#4A3628] text-[#FFFDF8] font-bold text-sm hover:bg-[#352D27] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="mt-10 pt-8 border-t border-[#DED6C8]">
                <h3 className="font-serif-luxury text-lg font-bold text-[#26231F] mb-3">
                  Overview & Synopsis
                </h3>
                <p className="text-[#6F6A61] text-sm leading-relaxed font-light whitespace-pre-line">
                  {book.description}
                </p>
              </div>

              {/* Book Metadata Specification Table */}
              <div className="mt-8 pt-8 border-t border-[#DED6C8]">
                <h3 className="font-serif-luxury text-lg font-bold text-[#26231F] mb-4">
                  Edition Details & Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  {book.publisher && (
                    <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#DED6C8] shadow-xs">
                      <div className="flex items-center gap-1.5 text-[#6F6A61] mb-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#B58A3A]" />
                        <span>Publisher</span>
                      </div>
                      <span className="font-semibold text-[#26231F]">{book.publisher}</span>
                    </div>
                  )}

                  {book.isbn && (
                    <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#DED6C8] shadow-xs">
                      <div className="flex items-center gap-1.5 text-[#6F6A61] mb-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#B58A3A]" />
                        <span>ISBN</span>
                      </div>
                      <span className="font-semibold text-[#26231F]">{book.isbn}</span>
                    </div>
                  )}

                  {book.language && (
                    <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#DED6C8] shadow-xs">
                      <div className="flex items-center gap-1.5 text-[#6F6A61] mb-1">
                        <Globe className="w-3.5 h-3.5 text-[#B58A3A]" />
                        <span>Language</span>
                      </div>
                      <span className="font-semibold text-[#26231F]">{book.language}</span>
                    </div>
                  )}

                  {book.pages && (
                    <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#DED6C8] shadow-xs">
                      <div className="flex items-center gap-1.5 text-[#6F6A61] mb-1">
                        <Layers className="w-3.5 h-3.5 text-[#B58A3A]" />
                        <span>Pages</span>
                      </div>
                      <span className="font-semibold text-[#26231F]">{book.pages} pages</span>
                    </div>
                  )}

                  {book.publicationYear && (
                    <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#DED6C8] shadow-xs">
                      <div className="flex items-center gap-1.5 text-[#6F6A61] mb-1">
                        <Calendar className="w-3.5 h-3.5 text-[#B58A3A]" />
                        <span>Published</span>
                      </div>
                      <span className="font-semibold text-[#26231F]">{book.publicationYear}</span>
                    </div>
                  )}

                  {book.edition && (
                    <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#DED6C8] shadow-xs">
                      <div className="flex items-center gap-1.5 text-[#6F6A61] mb-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#B58A3A]" />
                        <span>Edition</span>
                      </div>
                      <span className="font-semibold text-[#26231F]">{book.edition}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Toast />
      <Footer />
    </div>
  );
}
