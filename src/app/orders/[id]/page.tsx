"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, MapPin, Truck } from "lucide-react";

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
    deliveryNotes?: string;
  };
  items: {
    bookId: string;
    title: string;
    coverImage: string;
    price: number;
    discountPercentage: number;
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

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        setIsLoading(true);
        const res = await fetchApi<OrderDetail>(`/orders/${id}`);
        if (res.success && res.data) {
          setOrder(res.data);
        } else {
          setError("Order not found");
        }
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#26231F]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#B58A3A] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#26231F]">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto px-4 py-20 text-center">
          <h2 className="font-serif-luxury text-2xl font-bold text-[#26231F] mb-2">
            Order Not Found
          </h2>
          <p className="text-[#6F6A61] text-sm mb-6">
            Unable to locate order with ID: {id}.
          </p>
          <Link
            href="/orders"
            className="px-6 py-2.5 bg-[#4A3628] text-[#FFFDF8] font-semibold text-xs rounded-xl inline-block hover:bg-[#352D27] shadow-md"
          >
            Back to My Orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const itemDiscountAmount =
    order.itemDiscountAmount ??
    (order.couponDiscountAmount !== undefined
      ? Math.max(0, order.discountAmount - order.couponDiscountAmount)
      : order.discountAmount);
  const couponDiscountAmount = order.couponDiscountAmount ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#26231F]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6F6A61] hover:text-[#4A3628] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>

        <div className="bg-[#FFFDF8] p-6 sm:p-10 rounded-3xl border border-[#DED6C8] space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DED6C8] pb-4 gap-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#B58A3A] font-semibold">
                Official Order Receipt
              </span>
              <h1 className="font-mono text-2xl font-bold text-[#4A3628]">
                {order.orderNumber}
              </h1>
              <p className="text-xs text-[#6F6A61] mt-0.5">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-[#F1ECE2] border border-[#DED6C8] text-[#2E7D32] text-xs font-bold">
                Order: {order.orderStatus}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F1ECE2] border border-[#DED6C8] text-[#4A3628] text-xs font-semibold">
                Payment: {order.paymentStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-[#F8F5EF] rounded-xl border border-[#DED6C8] space-y-1">
              <div className="flex items-center gap-1.5 text-[#B58A3A] font-semibold mb-2">
                <MapPin className="w-4 h-4" />
                <span>Customer Shipping Address</span>
              </div>
              <p className="font-bold text-[#26231F]">{order.customer.name}</p>
              <p className="text-[#6F6A61]">{order.customer.phone}</p>
              {order.customer.email && (
                <p className="text-[#6F6A61]">{order.customer.email}</p>
              )}
              <p className="text-[#6F6A61] mt-2">{order.customer.area}</p>
              <p className="text-[#6F6A61]">
                {order.customer.city}, {order.customer.province}
              </p>
              {order.customer.landmark && (
                <p className="text-[#6F6A61] italic">Landmark: {order.customer.landmark}</p>
              )}
            </div>

            <div className="p-4 bg-[#F8F5EF] rounded-xl border border-[#DED6C8] space-y-1">
              <div className="flex items-center gap-1.5 text-[#B58A3A] font-semibold mb-2">
                <Truck className="w-4 h-4" />
                <span>Payment & Shipping Method</span>
              </div>
              <p className="text-[#6F6A61]">
                Payment Method: <span className="font-bold text-[#26231F]">{order.paymentMethod}</span>
              </p>
              <p className="text-[#6F6A61]">
                Courier: <span className="font-bold text-[#26231F]">Standard Doorstep Delivery</span>
              </p>
              {order.customer.deliveryNotes && (
                <p className="text-[#6F6A61] mt-2 italic">
                  Notes: &quot;{order.customer.deliveryNotes}&quot;
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3 pt-2">
            <h4 className="font-serif-luxury text-sm font-bold text-[#26231F]">
              Purchased Books ({order.items.length})
            </h4>
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-3 bg-[#F8F5EF] rounded-xl border border-[#DED6C8]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative aspect-[3/4] w-12 rounded overflow-hidden bg-[#F1ECE2] border border-[#DED6C8] shrink-0">
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

          {/* Financial Breakdown */}
          <div className="p-4 bg-[#F1ECE2] rounded-xl border border-[#DED6C8] space-y-2 text-xs text-[#6F6A61]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[#26231F]">
                Rs. {order.subtotal.toLocaleString()}
              </span>
            </div>
            {itemDiscountAmount > 0 && (
              <div className="flex justify-between text-[#2E7D32]">
                <span>Catalog Savings</span>
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
              <span>Delivery Fee</span>
              <span className="font-semibold text-[#26231F]">
                Rs. {order.deliveryFee.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#4A3628] pt-2 border-t border-[#DED6C8]">
              <span>Total Payable</span>
              <span>Rs. {order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
