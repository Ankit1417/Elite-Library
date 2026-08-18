"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { useWishlist } from "@/lib/wishlistContext";
import { fetchApi } from "@/lib/api";
import StarRating from "@/components/StarRating";

export interface BookCardProps {
  id: string;
  title: string;
  slug: string;
  author: string;
  coverImage: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  stockQuantity: number;
  categoryName?: string;
  isFeatured?: boolean;
  averageRating?: number;
  reviewCount?: number;
}

export default function BookCard({
  id,
  title,
  slug,
  author,
  coverImage,
  price,
  discountPercentage,
  finalPrice,
  stockQuantity,
  categoryName,
  averageRating,
  reviewCount,
}: BookCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const isOutOfStock = stockQuantity <= 0;
  const isLowStock = stockQuantity > 0 && stockQuantity <= 3;
  const wishlisted = isWishlisted(id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    try {
      await fetchApi("/auth/me");
      addToCart(
        {
          bookId: id,
          title,
          slug,
          coverImage,
          price,
          discountPercentage,
          finalPrice,
          stockQuantity,
        },
        1
      );
    } catch {
      router.push(`/login?redirect=${encodeURIComponent(`/books/${slug}`)}`);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(id);
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-200/80 hover:border-[#B58A3A]/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-xs">
      {/* Discount & Stock Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {discountPercentage > 0 && (
          <span className="bg-[#B58A3A] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
            -{discountPercentage}%
          </span>
        )}
        {isOutOfStock ? (
          <span className="bg-white/95 border border-red-200 text-red-700 text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="bg-white/95 border border-amber-200 text-amber-800 text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
            Only {stockQuantity} left
          </span>
        ) : null}
      </div>

      {/* Wishlist Heart Button */}
      <button
        onClick={handleToggleWishlist}
        type="button"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all shadow-xs ${
          wishlisted
            ? "bg-[#B58A3A] text-white border border-[#B58A3A]"
            : "bg-white/90 text-neutral-500 border border-neutral-200 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-[#B58A3A] hover:border-[#B58A3A]/60"
        }`}
      >
        <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-current" : ""}`} />
      </button>

      {/* Book Cover Image */}
      <Link
        href={`/books/${slug}`}
        className="relative aspect-[3/4.2] w-full overflow-hidden bg-neutral-50 p-4 flex items-center justify-center"
      >
        <div className="relative w-full h-full rounded-r-lg rounded-l-xs overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 bg-neutral-200">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
          {/* Subtle Book Spine Highlight on Left Edge */}
          <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/25 via-white/10 to-transparent pointer-events-none" />
        </div>
      </Link>

      {/* Book Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-white">
        <div>
          {categoryName && (
            <span className="text-[10px] uppercase tracking-widest text-[#B58A3A] font-bold block mb-1">
              {categoryName}
            </span>
          )}
          <Link
            href={`/books/${slug}`}
            className="font-bold text-[#111] group-hover:text-[#B58A3A] transition-colors line-clamp-1 text-sm leading-snug"
          >
            {title}
          </Link>
          <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{author}</p>

          {/* Real ratings from backend */}
          {reviewCount && reviewCount > 0 ? (
            <div className="flex items-center gap-1.5 mt-1.5">
              <StarRating value={averageRating ?? 0} sizeClassName="w-3 h-3" />
              <span className="text-[10px] font-medium text-neutral-500">
                {(averageRating ?? 0).toFixed(1)} ({reviewCount})
              </span>
            </div>
          ) : null}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between mt-auto">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-[#111]">
                Rs. {finalPrice.toLocaleString()}
              </span>
              {discountPercentage > 0 && (
                <span className="text-[11px] text-neutral-400 line-through">
                  Rs. {price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
              isOutOfStock
                ? "bg-neutral-100 text-neutral-300 cursor-not-allowed"
                : "bg-neutral-900 text-white hover:bg-[#B58A3A] active:scale-95 shadow-xs"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
