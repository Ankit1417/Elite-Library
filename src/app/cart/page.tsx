"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountSavings,
    finalTotal,
  } = useCart();

  const deliveryFee = cart.length > 0 ? 150 : 0;
  const grandTotal = finalTotal + deliveryFee;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#26231F]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="border-b border-[#DED6C8] pb-6 mb-8 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B58A3A] font-semibold">
              Shopping Bag
            </span>
            <h1 className="font-serif-luxury text-3xl font-bold text-[#26231F] mt-1">
              Your Selected Library
            </h1>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-[#8C2D19] hover:underline font-semibold"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="py-20 text-center bg-[#FFFDF8] rounded-2xl border border-[#DED6C8] max-w-md mx-auto p-8 shadow-xs">
            <ShoppingBag className="w-16 h-16 text-[#DED6C8] mx-auto mb-4 stroke-[1.5]" />
            <h2 className="font-serif-luxury text-xl font-bold text-[#26231F]">
              Your cart is currently empty
            </h2>
            <p className="text-xs text-[#6F6A61] mt-2 mb-6 font-light">
              Explore our luxury bookstore catalog to find rare classics and intellectual works.
            </p>
            <Link
              href="/books"
              className="px-6 py-3 bg-[#4A3628] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#352D27] transition-all inline-block shadow-md"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Table List (Left 8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.bookId}
                  className="bg-[#FFFDF8] p-4 sm:p-5 rounded-2xl border border-[#DED6C8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <Link
                      href={`/books/${item.slug}`}
                      className="relative aspect-[3/4] w-20 shrink-0 rounded-lg overflow-hidden bg-[#F1ECE2] border border-[#DED6C8] book-shadow"
                    >
                      <Image
                        src={item.coverImage}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </Link>

                    <div>
                      <Link
                        href={`/books/${item.slug}`}
                        className="font-serif-luxury font-bold text-[#26231F] hover:text-[#B58A3A] text-base line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-bold text-[#4A3628]">
                          Rs. {item.finalPrice.toLocaleString()}
                        </span>
                        {item.discountPercentage > 0 && (
                          <span className="text-xs text-[#6F6A61] line-through">
                            Rs. {item.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#6F6A61] block mt-1">
                        Stock available: {item.stockQuantity}
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#DED6C8]">
                    <div className="flex items-center bg-[#F1ECE2] border border-[#DED6C8] rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                        className="p-1.5 text-[#6F6A61] hover:text-[#26231F]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-[#26231F] min-w-[28px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                        className="p-1.5 text-[#6F6A61] hover:text-[#26231F]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <span className="text-sm font-bold text-[#26231F] block">
                        Rs. {(item.finalPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.bookId)}
                      className="p-2 text-[#8C2D19] hover:bg-[#F8F5EF] rounded-lg transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Box (Right 4 cols) */}
            <div className="lg:col-span-4">
              <div className="bg-[#F1ECE2] p-6 rounded-2xl border border-[#DED6C8] space-y-4 sticky top-24 shadow-xs">
                <h3 className="font-serif-luxury text-lg font-bold text-[#26231F] border-b border-[#DED6C8] pb-3">
                  Order Summary
                </h3>

                <div className="space-y-2.5 text-xs text-[#6F6A61]">
                  <div className="flex justify-between">
                    <span>Original Price</span>
                    <span className="text-[#26231F] font-semibold">
                      Rs. {subtotal.toLocaleString()}
                    </span>
                  </div>

                  {discountSavings > 0 && (
                    <div className="flex justify-between text-[#2E7D32]">
                      <span>Discount Savings</span>
                      <span>- Rs. {discountSavings.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="text-[#26231F] font-semibold">
                      Rs. {deliveryFee.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-base font-bold text-[#4A3628] pt-3 border-t border-[#DED6C8]">
                    <span>Total Amount</span>
                    <span>Rs. {grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/checkout"
                    className="w-full py-4 bg-[#4A3628] text-[#FFFDF8] font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#352D27] transition-all shadow-md"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 text-[#B58A3A]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Toast />
      <Footer />
    </div>
  );
}

