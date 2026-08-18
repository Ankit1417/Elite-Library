"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useCart } from "@/lib/cartContext";
import { useWishlist } from "@/lib/wishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import StarRating from "@/components/StarRating";
import ReviewSection from "@/components/ReviewSection";
import BookCard from "@/components/BookCard";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Globe,
  Heart,
  Layers,
  Minus,
  Package,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
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
  averageRating?: number;
  reviewCount?: number;
}

interface RelatedBook {
  _id: string;
  title: string;
  slug: string;
  author: string;
  coverImage: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  stockQuantity: number;
  averageRating?: number;
  reviewCount?: number;
}

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [book, setBook] = useState<BookDetail | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<RelatedBook[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [wishlistPending, setWishlistPending] = useState(false);

  useEffect(() => {
    async function loadBook() {
      try {
        setIsLoading(true);
        const res = await fetchApi<BookDetail>(`/books/slug/${slug}`);
        if (res.success && res.data) {
          setBook(res.data);
          setSelectedImage(res.data.coverImage);
          // Load related books after main book loads
          try {
            const relRes = await fetchApi<{ books: RelatedBook[] }>(
              `/books/${res.data._id}/related`
            );
            if (relRes.success && relRes.data?.books) {
              setRelatedBooks(relRes.data.books);
            }
          } catch {
            // Related books are non-critical
          }
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
      <div className="min-h-screen flex flex-col bg-white text-[#111]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-[#B58A3A] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-[#111]">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-[#111] mb-2">
            Book Not Found
          </h2>
          <p className="text-neutral-500 text-sm mb-6">
            The book you are looking for may have been removed or is temporarily unavailable.
          </p>
          <Link
            href="/books"
            className="px-6 py-3 bg-[#111] text-white font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-colors inline-block shadow-md"
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
  const wishlisted = isWishlisted(book._id);

  // Truncate synopsis for collapsed state
  const synopsisWords = book.description?.split(" ") ?? [];
  const synopsisShort = synopsisWords.slice(0, 50).join(" ");
  const hasSynopsisMore = synopsisWords.length > 50;

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
      if (added) router.push("/checkout");
    } catch {
      router.push(`/login?redirect=${encodeURIComponent(`/books/${slug}`)}`);
    }
  };

  const handleWishlistToggle = async () => {
    if (wishlistPending) return;
    setWishlistPending(true);
    await toggleWishlist(book._id);
    setWishlistPending(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111]">
      <Navbar />

      <main className="flex-1 w-full">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
            <Link href="/" className="hover:text-[#B58A3A] transition-colors">Home</Link>
            <span className="text-neutral-300">/</span>
            <Link href="/books" className="hover:text-[#B58A3A] transition-colors">Catalog</Link>
            {book.category && (
              <>
                <span className="text-neutral-300">/</span>
                <Link
                  href={`/categories/${book.category.slug}`}
                  className="hover:text-[#B58A3A] transition-colors"
                >
                  {book.category.name}
                </Link>
              </>
            )}
            <span className="text-neutral-300">/</span>
            <span className="text-[#111] font-medium line-clamp-1 max-w-[240px]">{book.title}</span>
          </nav>

          {/* Back Link */}
          <Link
            href="/books"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#111] transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Catalog</span>
          </Link>

          {/* Product Layout - 2 Balanced Columns with sticky gallery to eliminate dead space */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* ─── Left: Gallery Column (Sticky) ─── */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4 self-start">
              {/* Main Image Frame with Ambient Glow and Book Spine */}
              <div className="relative aspect-[3/4] sm:aspect-[4/4.8] w-full rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-200/80 shadow-md flex items-center justify-center">
                {/* Ambient blurred backdrop for non-standard image ratios */}
                <Image
                  src={selectedImage || book.coverImage}
                  alt=""
                  fill
                  className="object-cover blur-2xl scale-125 opacity-20 pointer-events-none"
                  unoptimized
                />
                
                {/* 3D Realistic Book Monograph Container */}
                <div className="relative w-full h-full p-4 sm:p-6 flex items-center justify-center z-10">
                  <div className="relative w-full h-full max-h-[440px] rounded-r-xl rounded-l-xs overflow-hidden shadow-2xl bg-neutral-100 border-y border-r border-neutral-200/80">
                    <Image
                      src={selectedImage || book.coverImage}
                      alt={book.title}
                      fill
                      className="object-cover"
                      priority
                      unoptimized
                    />
                    {/* Spine Highlight Overlay */}
                    <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/30 via-white/15 to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Discount Badge */}
                {book.discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 bg-[#B58A3A] text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full shadow-md z-20 tracking-wider">
                    -{book.discountPercentage}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-neutral-100 ${
                        selectedImage === img
                          ? "border-[#B58A3A] ring-2 ring-[#B58A3A]/20 shadow-md"
                          : "border-neutral-200 opacity-60 hover:opacity-100 hover:border-[#B58A3A]/40"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${book.title} view ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badges Strip Under Gallery */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {[
                  { icon: Truck, label: "Free Delivery", sub: "Orders over Rs. 999" },
                  { icon: RefreshCw, label: "Easy Returns", sub: "7-day policy" },
                  { icon: ShieldCheck, label: "100% Authentic", sub: "Verified book" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center text-center p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 shadow-xs gap-1"
                  >
                    <Icon className="w-4 h-4 text-[#B58A3A]" />
                    <span className="text-[10px] font-bold text-[#111] leading-tight">{label}</span>
                    <span className="text-[9px] text-neutral-500 leading-tight">{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Right: Info Column (7 cols) ─── */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category */}
              {book.category && (
                <Link
                  href={`/categories/${book.category.slug}`}
                  className="text-xs uppercase tracking-[0.18em] text-[#B58A3A] font-bold hover:underline inline-block"
                >
                  {book.category.name}
                </Link>
              )}

              {/* Title & Author */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111] leading-tight">
                  {book.title}
                </h1>
                <p className="text-sm text-neutral-500 mt-2 font-medium">
                  by <span className="text-[#111] font-semibold">{book.author}</span>
                </p>
                {book.edition && (
                  <span className="inline-block mt-2 text-[11px] uppercase tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200 px-3 py-1 rounded-full font-semibold">
                    {book.edition}
                  </span>
                )}
              </div>

              {/* Short Synopsis Preview */}
              <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {synopsisExpanded || !hasSynopsisMore
                    ? book.description
                    : `${synopsisShort}...`}
                </p>
                {hasSynopsisMore && (
                  <button
                    onClick={() => setSynopsisExpanded((s) => !s)}
                    className="mt-2.5 text-xs font-bold text-[#B58A3A] hover:text-[#9A7330] flex items-center gap-1 transition-colors"
                  >
                    {synopsisExpanded ? "Show less" : "Read full synopsis"}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${synopsisExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
              </div>

              {/* Pricing & Stock Card */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                      Price
                    </span>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-3xl font-bold text-[#111]">
                        Rs. {book.finalPrice.toLocaleString()}
                      </span>
                      {book.discountPercentage > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-neutral-400 line-through">
                            Rs. {book.price.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                            Save Rs. {(book.price - book.finalPrice).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="shrink-0">
                    {isOutOfStock ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Out of Stock</span>
                      </div>
                    ) : isLowStock ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                        <Package className="w-3.5 h-3.5" />
                        <span>Only {book.stockQuantity} left</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>In Stock</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating row */}
                <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                  {book.reviewCount && book.reviewCount > 0 ? (
                    <>
                      <StarRating value={book.averageRating ?? 0} sizeClassName="w-3.5 h-3.5" />
                      <span className="text-xs text-neutral-500">
                        <span className="font-bold text-[#111]">
                          {(book.averageRating ?? 0).toFixed(1)}
                        </span>{" "}
                        ·{" "}
                        <a
                          href="#ratings-reviews"
                          className="font-medium text-neutral-700 hover:text-[#B58A3A] underline-offset-2 hover:underline transition-colors"
                        >
                          {book.reviewCount}{" "}
                          {book.reviewCount === 1 ? "review" : "reviews"}
                        </a>
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-neutral-400">
                      No reviews yet — be the first to review this book.
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity & CTA Row */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-[#111] uppercase tracking-wider">Quantity:</span>
                  <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
                    <button
                      disabled={quantity <= 1 || isOutOfStock}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-[#111] hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-sm font-bold text-[#111] min-w-[36px] text-center border-x border-neutral-200">
                      {quantity}
                    </span>
                    <button
                      disabled={quantity >= book.stockQuantity || isOutOfStock}
                      onClick={() => setQuantity((q) => Math.min(book.stockQuantity, q + 1))}
                      className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-[#111] hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    disabled={isOutOfStock}
                    onClick={() => void handleAddToCart()}
                    id="add-to-cart-btn"
                    className="flex-1 py-3.5 rounded-xl bg-white text-[#111] font-bold text-sm border-2 border-neutral-200 hover:border-[#111] hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#B58A3A]" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    disabled={isOutOfStock}
                    onClick={() => void handleBuyNow()}
                    id="buy-now-btn"
                    className="flex-1 py-3.5 rounded-xl bg-[#111] text-white font-bold text-sm hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <span>Buy Now</span>
                  </button>

                  <button
                    onClick={() => void handleWishlistToggle()}
                    disabled={wishlistPending}
                    id="wishlist-toggle-btn"
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    className={`py-3.5 px-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-xs ${
                      wishlisted
                        ? "bg-amber-50 border-[#B58A3A] text-[#B58A3A]"
                        : "bg-white border-neutral-200 text-neutral-500 hover:border-[#B58A3A] hover:text-[#B58A3A]"
                    } disabled:opacity-60`}
                  >
                    <Heart className={`w-4 h-4 transition-all ${wishlisted ? "fill-[#B58A3A]" : ""}`} />
                    <span className="hidden sm:inline">{wishlisted ? "Saved" : "Wishlist"}</span>
                  </button>
                </div>
              </div>

              {/* Edition Specifications */}
              {(book.publisher || book.isbn || book.language || book.pages || book.publicationYear || book.edition) && (
                <div className="pt-6 border-t border-neutral-200">
                  <h3 className="text-sm font-bold text-[#111] mb-3">
                    Edition Details
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {book.publisher && (
                      <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70 shadow-xs">
                        <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                          <BookOpen className="w-3.5 h-3.5 text-[#B58A3A]" />
                          <span>Publisher</span>
                        </div>
                        <span className="font-semibold text-[#111] line-clamp-1">{book.publisher}</span>
                      </div>
                    )}
                    {book.isbn && (
                      <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70 shadow-xs">
                        <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#B58A3A]" />
                          <span>ISBN</span>
                        </div>
                        <span className="font-semibold text-[#111] line-clamp-1">{book.isbn}</span>
                      </div>
                    )}
                    {book.language && (
                      <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70 shadow-xs">
                        <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                          <Globe className="w-3.5 h-3.5 text-[#B58A3A]" />
                          <span>Language</span>
                        </div>
                        <span className="font-semibold text-[#111]">{book.language}</span>
                      </div>
                    )}
                    {book.pages && (
                      <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70 shadow-xs">
                        <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                          <Layers className="w-3.5 h-3.5 text-[#B58A3A]" />
                          <span>Pages</span>
                        </div>
                        <span className="font-semibold text-[#111]">{book.pages}</span>
                      </div>
                    )}
                    {book.publicationYear && (
                      <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70 shadow-xs">
                        <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-[#B58A3A]" />
                          <span>Published</span>
                        </div>
                        <span className="font-semibold text-[#111]">{book.publicationYear}</span>
                      </div>
                    )}
                    {book.edition && (
                      <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70 shadow-xs">
                        <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                          <BookOpen className="w-3.5 h-3.5 text-[#B58A3A]" />
                          <span>Edition</span>
                        </div>
                        <span className="font-semibold text-[#111]">{book.edition}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Overview & Synopsis Section ─── */}
          <section className="mt-14 pt-10 border-t border-neutral-200">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111] mb-4">
              Overview &amp; Synopsis
            </h2>
            <div className="max-w-3xl">
              <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </div>
          </section>

          {/* ─── Ratings & Reviews Section ─── */}
          <section id="ratings-reviews" className="mt-14 pt-10 border-t border-neutral-200">
            <ReviewSection bookId={book._id} bookSlug={book.slug} />
          </section>

          {/* ─── Related Products Section ─── */}
          {relatedBooks.length > 0 && (
            <section className="mt-14 pt-10 border-t border-neutral-200">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[#111]">
                  You May Also Like
                </h2>
                {book.category && (
                  <Link
                    href={`/categories/${book.category.slug}`}
                    className="text-xs font-bold text-[#B58A3A] hover:text-[#9A7330] transition-colors uppercase tracking-wider"
                  >
                    View all in {book.category.name} →
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {relatedBooks.slice(0, 5).map((rel) => (
                  <BookCard
                    key={rel._id}
                    id={rel._id}
                    title={rel.title}
                    slug={rel.slug}
                    author={rel.author}
                    coverImage={rel.coverImage}
                    price={rel.price}
                    discountPercentage={rel.discountPercentage}
                    finalPrice={rel.finalPrice}
                    stockQuantity={rel.stockQuantity}
                    categoryName={book.category?.name}
                    averageRating={rel.averageRating}
                    reviewCount={rel.reviewCount}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Toast />
      <Footer />
    </div>
  );
}
