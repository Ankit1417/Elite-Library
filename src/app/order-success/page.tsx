"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, MapPin, Truck } from "lucide-react";

interface OrderDetail {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    province: string;
    city: string;
    area: string;
    landmark?: string;
  };
  items: {
    bookId: string;
    title: string;
    coverImage: string;
    price: number;
    finalPrice: number;
    quantity: number;
  }[];
  subtotal: number;
  discountAmount: number;
  itemDiscountAmount?: number;
  couponDiscountAmount?: number;
  couponCode?: string;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderNumber) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetchApi<OrderDetail>(`/orders/number/${orderNumber}`);
        if (res.success) {
          setOrder(res.data);
        }
      } catch (err) {
        console.error("Failed to load order details", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [orderNumber]);

  const itemDiscountAmount = order
    ? order.itemDiscountAmount ??
      (order.couponDiscountAmount !== undefined
        ? Math.max(0, order.discountAmount - order.couponDiscountAmount)
        : order.discountAmount)
    : 0;
  const couponDiscountAmount = order?.couponDiscountAmount ?? 0;

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="bg-[#FFFDF8] p-8 sm:p-12 rounded-3xl border border-[#DED6C8] text-center space-y-6 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-[#F1ECE2] text-[#2E7D32] border border-[#DED6C8] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-[#B58A3A] font-semibold">
            Purchase Confirmed
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#26231F] mt-1">
            Thank You for Your Order
          </h1>
          <p className="text-sm text-[#6F6A61] font-light mt-2 max-w-md mx-auto">
            Your order has been recorded in our system and is currently being prepared by our concierge team.
          </p>
        </div>

        {orderNumber && (
          <div className="inline-block px-6 py-3 rounded-2xl bg-[#F8F5EF] border border-[#DED6C8]">
            <span className="text-xs text-[#6F6A61] block mb-0.5">Order Reference Number</span>
            <span className="font-mono text-xl font-bold text-[#4A3628]">
              {orderNumber}
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="py-8">
            <div className="w-8 h-8 border-3 border-[#B58A3A] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : order ? (
          <div className="text-left space-y-6 pt-6 border-t border-[#DED6C8]">
            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#F8F5EF] rounded-xl border border-[#DED6C8] space-y-1">
                <div className="flex items-center gap-1.5 text-[#B58A3A] font-semibold mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Delivery Address</span>
                </div>
                <p className="font-bold text-[#26231F]">{order.customer.name}</p>
                <p className="text-[#6F6A61]">{order.customer.area}</p>
                <p className="text-[#6F6A61]">
                  {order.customer.city}, {order.customer.province}
                </p>
              </div>

              <div className="p-4 bg-[#F8F5EF] rounded-xl border border-[#DED6C8] space-y-1">
                <div className="flex items-center gap-1.5 text-[#B58A3A] font-semibold mb-2">
                  <Truck className="w-4 h-4" />
                  <span>Payment & Status</span>
                </div>
                <p className="text-[#6F6A61]">
                  Method: <span className="font-bold text-[#26231F]">{order.paymentMethod}</span>
                </p>
                <p className="text-[#6F6A61]">
                  Payment Status: <span className="font-bold text-[#4A3628]">{order.paymentStatus}</span>
                </p>
                <p className="text-[#6F6A61]">
                  Order Status: <span className="font-bold text-[#2E7D32]">{order.orderStatus}</span>
                </p>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-3">
              <h4 className="font-serif-luxury text-sm font-bold text-[#26231F]">
                Ordered Titles
              </h4>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 bg-[#F8F5EF] rounded-xl border border-[#DED6C8]"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative aspect-[3/4] w-10 rounded overflow-hidden bg-[#F1ECE2] border border-[#DED6C8] shrink-0">
                      <Image
                        src={item.coverImage}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <h5 className="font-serif-luxury text-xs font-semibold text-[#26231F]">
                        {item.title}
                      </h5>
                      <span className="text-[11px] text-[#6F6A61]">
                        Qty: {item.quantity} × Rs. {item.finalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#4A3628]">
                    Rs. {(item.finalPrice * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Total summary */}
            <div className="space-y-2 rounded-xl border border-[#DED6C8] bg-[#F1ECE2] p-4 text-xs text-[#6F6A61]">
              <div className="flex justify-between">
                <span>Catalog subtotal</span>
                <span className="font-semibold text-[#26231F]">Rs. {order.subtotal.toLocaleString()}</span>
              </div>
              {itemDiscountAmount > 0 && (
                <div className="flex justify-between text-[#2E7D32]">
                  <span>Catalog savings</span>
                  <span>- Rs. {itemDiscountAmount.toLocaleString()}</span>
                </div>
              )}
              {(couponDiscountAmount > 0 || order.couponCode) && (
                <div className="flex justify-between gap-3 text-[#2E7D32]">
                  <span className="min-w-0 truncate" title={order.couponCode}>
                    Coupon{order.couponCode ? ` (${order.couponCode})` : ""}
                  </span>
                  <span className="shrink-0">- Rs. {couponDiscountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery fee</span>
                <span className="font-semibold text-[#26231F]">Rs. {order.deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-[#DED6C8] pt-2 text-base font-bold text-[#4A3628]">
                <span>Total payable</span>
                <span>Rs. {order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Action CTAs */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/orders"
            className="w-full sm:w-auto px-6 py-3 bg-[#F1ECE2] hover:bg-[#DED6C8] text-[#4A3628] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors border border-[#DED6C8]"
          >
            Track Order Status
          </Link>
          <Link
            href="/books"
            className="w-full sm:w-auto px-6 py-3 bg-[#4A3628] text-[#FFFDF8] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#352D27] transition-colors shadow-md"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#26231F]">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-[#B58A3A] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <OrderSuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
