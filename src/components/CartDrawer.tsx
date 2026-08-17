"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cartContext";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    discountSavings,
    finalTotal,
  } = useCart();

  if (!isCartOpen) return null;

  const deliveryFee = cart.length > 0 ? 150 : 0;
  const grandTotal = finalTotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#26231F]/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFFDF8] border-l border-[#DED6C8] text-[#26231F] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-[#DED6C8] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#B58A3A]" />
              <h2 className="font-serif-luxury font-bold text-lg text-[#26231F]">
                Your Selection
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#6F6A61] hover:text-[#26231F] hover:bg-[#F1ECE2] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center text-[#6F6A61]">
                <ShoppingBag className="w-12 h-12 text-[#DED6C8] mx-auto mb-3 stroke-[1.5]" />
                <p className="font-serif-luxury text-base text-[#26231F]">Your cart is empty.</p>
                <p className="text-xs text-[#6F6A61] mt-1">
                  Explore our curated books to start building your library.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 px-5 py-2.5 bg-[#4A3628] hover:bg-[#352D27] text-[#FFFDF8] rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  Browse Books
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.bookId}
                  className="flex gap-3 bg-[#F8F5EF] p-3 rounded-xl border border-[#DED6C8] items-center"
                >
                  <div className="relative aspect-[3/4] w-16 shrink-0 rounded-md overflow-hidden bg-[#F1ECE2] border border-[#DED6C8]">
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif-luxury text-sm font-semibold text-[#26231F] truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#4A3628] font-bold mt-0.5">
                      Rs. {item.finalPrice.toLocaleString()}{" "}
                      {item.discountPercentage > 0 && (
                        <span className="text-[10px] text-[#6F6A61] line-through font-normal ml-1">
                          Rs. {item.price.toLocaleString()}
                        </span>
                      )}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-[#FFFDF8] border border-[#DED6C8] rounded-md">
                        <button
                          onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                          className="p-1 text-[#6F6A61] hover:text-[#26231F] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#26231F] min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                          className="p-1 text-[#6F6A61] hover:text-[#26231F] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.bookId)}
                        className="p-1.5 text-[#8C2D19] hover:bg-[#F1ECE2] rounded transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#DED6C8] bg-[#F1ECE2] space-y-3">
              <div className="space-y-1.5 text-xs text-[#6F6A61]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#26231F]">Rs. {subtotal.toLocaleString()}</span>
                </div>
                {discountSavings > 0 && (
                  <div className="flex justify-between text-[#2E7D32]">
                    <span>Discount Savings</span>
                    <span>- Rs. {discountSavings.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-[#26231F]">Rs. {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#4A3628] pt-2 border-t border-[#DED6C8]">
                  <span>Total</span>
                  <span>Rs. {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3.5 bg-[#4A3628] text-[#FFFDF8] font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#352D27] transition-all shadow-md"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#B58A3A]" />
                </Link>
                <div className="mt-2 text-center">
                  <Link
                    href="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs text-[#6F6A61] hover:text-[#4A3628] underline"
                  >
                    View Full Cart Page
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

