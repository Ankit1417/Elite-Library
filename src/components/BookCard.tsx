"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { fetchApi } from "@/lib/api";

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
}: BookCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const isOutOfStock = stockQuantity <= 0;
  const isLowStock = stockQuantity > 0 && stockQuantity <= 3;

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

  return (
    <div className="group relative flex flex-col bg-[#FFFDF8] rounded-xl overflow-hidden border border-[#DED6C8] hover:border-[#B58A3A]/60 book-card-hover shadow-xs">
      {/* Discount & Stock Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {discountPercentage > 0 && (
          <span className="bg-[#B58A3A] text-[#FFFDF8] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
            -{discountPercentage}%
          </span>
        )}
        {isOutOfStock ? (
          <span className="bg-[#F8F5EF]/95 border border-[#DED6C8] text-[#8C2D19] text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="bg-[#F8F5EF]/95 border border-[#DED6C8] text-[#4A3628] text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
            Only {stockQuantity} left
          </span>
        ) : null}
      </div>

      {/* Book Cover Image */}
      <Link href={`/books/${slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-[#F1ECE2] p-4 flex items-center justify-center">
        <div className="relative w-full h-full book-shadow rounded-sm overflow-hidden">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
        </div>
      </Link>

      {/* Book Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-[#FFFDF8]">
        <div>
          {categoryName && (
            <span className="text-[11px] uppercase tracking-widest text-[#B58A3A] font-semibold block mb-1">
              {categoryName}
            </span>
          )}
          <Link
            href={`/books/${slug}`}
            className="font-serif-luxury font-bold text-[#26231F] group-hover:text-[#B58A3A] transition-colors line-clamp-1 text-base"
          >
            {title}
          </Link>
          <p className="text-xs text-[#6F6A61] mt-0.5 line-clamp-1">{author}</p>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-3 border-t border-[#DED6C8]/80 flex items-center justify-between mt-auto">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[#4A3628]">
                Rs. {finalPrice.toLocaleString()}
              </span>
              {discountPercentage > 0 && (
                <span className="text-xs text-[#6F6A61] line-through">
                  Rs. {price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
            className={`p-2.5 rounded-lg transition-all flex items-center justify-center ${
              isOutOfStock
                ? "bg-[#F8F5EF] text-[#DED6C8] cursor-not-allowed border border-[#DED6C8]"
                : "bg-[#F1ECE2] text-[#4A3628] hover:bg-[#4A3628] hover:text-[#FFFDF8] border border-[#DED6C8] hover:border-[#4A3628] active:scale-95 shadow-xs"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

