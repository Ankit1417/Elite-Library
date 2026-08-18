"use client";

import { useWishlist, WishlistBook } from "@/lib/wishlistContext";
import { useCart } from "@/lib/cartContext";
import { useAuth } from "@/lib/authContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Heart, ShoppingBag, Trash2, BookOpen, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { wishlistBooks, isLoading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent("/wishlist")}`);
    }
  }, [authLoading, isAuthenticated, router]);

  const handleAddToCart = (book: WishlistBook) => {
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
      1
    );
  };

  const handleRemove = async (bookId: string) => {
    await removeFromWishlist(bookId);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F5EF]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#B58A3A] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#26231F]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-[#B58A3A]/10 border border-[#B58A3A]/20">
              <Heart className="w-5 h-5 text-[#B58A3A] fill-[#B58A3A]" />
            </div>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#26231F]">
              My Wishlist
            </h1>
          </div>
          <p className="text-sm text-[#6F6A61] ml-14">
            {wishlistBooks.length > 0
              ? `${wishlistBooks.length} ${wishlistBooks.length === 1 ? "book" : "books"} saved for later`
              : "Save books you love for later"}
          </p>
        </div>

        {wishlistBooks.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-full bg-[#F1ECE2] border border-[#DED6C8] flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-[#B58A3A]" />
            </div>
            <h2 className="font-serif-luxury text-2xl font-bold text-[#26231F] mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-[#6F6A61] text-sm max-w-sm mb-8 leading-relaxed">
              Browse our curated collection and save the books that speak to you. Your wishlist is your personal reading blueprint.
            </p>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#4A3628] text-[#FFFDF8] font-bold text-sm rounded-xl hover:bg-[#352D27] transition-all shadow-md"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistBooks.map((book) => {
              const isOutOfStock = book.stockQuantity <= 0;
              return (
                <div
                  key={book._id}
                  className="group relative flex flex-col bg-[#FFFDF8] rounded-xl overflow-hidden border border-[#DED6C8] hover:border-[#B58A3A]/60 transition-all shadow-xs hover:shadow-md"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => void handleRemove(book._id)}
                    title="Remove from wishlist"
                    aria-label="Remove from wishlist"
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-[#FFFDF8]/90 border border-[#DED6C8] text-[#6F6A61] hover:text-[#8C2D19] hover:border-[#8C2D19]/40 hover:bg-[#FFFDF8] transition-all opacity-0 group-hover:opacity-100 shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Discount Badge */}
                  {book.discountPercentage > 0 && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-[#B58A3A] text-[#FFFDF8] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                        -{book.discountPercentage}%
                      </span>
                    </div>
                  )}

                  {/* Cover Image */}
                  <Link
                    href={`/books/${book.slug}`}
                    className="relative aspect-[3/4] w-full overflow-hidden bg-[#F1ECE2] p-4 flex items-center justify-center"
                  >
                    <div className="relative w-full h-full rounded-sm overflow-hidden shadow-md">
                      <Image
                        src={book.coverImage}
                        alt={book.title}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        unoptimized
                      />
                    </div>
                  </Link>

                  {/* Book Info */}
                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      {book.category && (
                        <span className="text-[11px] uppercase tracking-widest text-[#B58A3A] font-semibold block mb-1">
                          {book.category.name}
                        </span>
                      )}
                      <Link
                        href={`/books/${book.slug}`}
                        className="font-serif-luxury font-bold text-[#26231F] hover:text-[#B58A3A] transition-colors line-clamp-2 text-sm leading-snug"
                      >
                        {book.title}
                      </Link>
                      <p className="text-xs text-[#6F6A61] mt-0.5">{book.author}</p>
                    </div>

                    <div className="pt-3 border-t border-[#DED6C8]/80 space-y-2.5">
                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-[#4A3628]">
                          Rs. {book.finalPrice.toLocaleString()}
                        </span>
                        {book.discountPercentage > 0 && (
                          <span className="text-xs text-[#6F6A61] line-through">
                            Rs. {book.price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(book)}
                          disabled={isOutOfStock}
                          title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
                          className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            isOutOfStock
                              ? "bg-[#F8F5EF] text-[#DED6C8] cursor-not-allowed border border-[#DED6C8]"
                              : "bg-[#4A3628] text-[#FFFDF8] hover:bg-[#352D27] border border-[#4A3628] shadow-xs active:scale-95"
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                        </button>

                        <button
                          onClick={() => void handleRemove(book._id)}
                          title="Remove"
                          aria-label="Remove from wishlist"
                          className="p-2.5 rounded-lg border border-[#DED6C8] bg-[#F8F5EF] text-[#6F6A61] hover:text-[#8C2D19] hover:border-[#8C2D19]/40 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
