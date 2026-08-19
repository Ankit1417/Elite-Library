"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { ArrowLeft, MapPin, Save, ShieldAlert, Truck } from "lucide-react";

interface AdminOrderDetail {
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
  adminNotes?: string;
  createdAt: string;
}

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        setIsLoading(true);
        const res = await fetchApi<AdminOrderDetail>(`/admin/orders/${id}`);
        if (res.success && res.data) {
          setOrder(res.data);
          setOrderStatus(res.data.orderStatus);
          setPaymentStatus(res.data.paymentStatus);
          setAdminNotes(res.data.adminNotes || "");
        }
      } catch (err) {
        console.error("Failed to load order details", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  const handleUpdateStatus = async () => {
    try {
      setMessage(null);
      const res = await fetchApi(`/admin/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });
      if (res.success) {
        setMessage("Order status updated successfully!");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleSaveNotes = async () => {
    try {
      setIsSavingNotes(true);
      setMessage(null);
      const res = await fetchApi(`/admin/orders/${id}/notes`, {
        method: "PATCH",
        body: JSON.stringify({ adminNotes }),
      });
      if (res.success) {
        setMessage("Admin notes saved successfully!");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save admin notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-[#B58A3A] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!order) return null;

  const itemDiscountAmount =
    order.itemDiscountAmount ??
    (order.couponDiscountAmount !== undefined
      ? Math.max(0, order.discountAmount - order.couponDiscountAmount)
      : order.discountAmount);
  const couponDiscountAmount = order.couponDiscountAmount ?? 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#716A61] hover:text-[#B58A3A] transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Customer Orders List</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#B58A3A] font-semibold">
            Order Record
          </span>
          <h1 className="font-mono text-3xl font-bold text-[#27231F] mt-1">
            {order.orderNumber}
          </h1>
          <span className="text-xs text-[#716A61] block mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32] text-xs font-semibold">
          {message}
        </div>
      )}

      {/* Status Management Panel */}
      <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#DED6CA] space-y-4">
        <h3 className="font-serif-luxury font-bold text-base text-[#27231F] border-b border-[#DED6CA] pb-3 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#B58A3A]" />
          <span>Fulfillment &amp; Payment Control</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#27231F] block mb-1">
              Order Fulfillment Status
            </label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="w-full bg-[#1C1917] border border-[#4A3628] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F0E8] focus:outline-none focus:border-[#B58A3A]"
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#27231F] block mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full bg-[#1C1917] border border-[#4A3628] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F0E8] focus:outline-none focus:border-[#B58A3A]"
            >
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleUpdateStatus}
          className="px-6 py-2.5 bg-[#B58A3A] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#9A7330] transition-all shadow-md"
        >
          Update Statuses
        </button>
      </div>

      {/* Customer Info & Shipping */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#DED6CA] space-y-2">
          <div className="flex items-center gap-2 text-[#B58A3A] font-semibold border-b border-[#DED6CA] pb-2">
            <MapPin className="w-4 h-4" />
            <span>Customer Shipping Details</span>
          </div>
          <p className="font-bold text-[#27231F] text-sm">{order.customer.name}</p>
          <p className="text-[#4A3628]">Phone: {order.customer.phone}</p>
          {order.customer.email && (
            <p className="text-[#716A61]">Email: {order.customer.email}</p>
          )}
          <p className="text-[#4A3628] mt-2 font-medium">{order.customer.area}</p>
          <p className="text-[#716A61]">
            {order.customer.city}, {order.customer.province}
          </p>
          {order.customer.landmark && (
            <p className="text-[#716A61] italic">Landmark: {order.customer.landmark}</p>
          )}
        </div>

        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#DED6CA] space-y-2">
          <div className="flex items-center gap-2 text-[#B58A3A] font-semibold border-b border-[#DED6CA] pb-2">
            <Truck className="w-4 h-4" />
            <span>Order Instructions</span>
          </div>
          <p className="text-[#4A3628]">
            Payment Method: <span className="font-bold text-[#27231F]">{order.paymentMethod}</span>
          </p>
          {order.customer.deliveryNotes ? (
            <p className="text-[#27231F] mt-2 bg-[#F6F2EA] p-3 rounded-xl border border-[#DED6CA]">
              Customer Note: &quot;{order.customer.deliveryNotes}&quot;
            </p>
          ) : (
            <p className="text-[#716A61] italic">No delivery notes provided by customer.</p>
          )}
        </div>
      </div>

      {/* Ordered Items Breakdown */}
      <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#DED6CA] space-y-4">
        <h3 className="font-serif-luxury font-bold text-base text-[#27231F] border-b border-[#DED6CA] pb-3">
          Ordered Books ({order.items.length})
        </h3>

        <div className="space-y-3">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 p-3 bg-[#1C1917] rounded-xl border border-[#4A3628]"
            >
              <div className="flex items-center gap-3">
                <div className="relative aspect-[3/4] w-12 rounded overflow-hidden bg-[#27231F] shrink-0">
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h5 className="font-serif-luxury text-xs font-semibold text-[#F5F0E8]">
                    {item.title}
                  </h5>
                  <span className="text-[11px] text-[#A39A8D]">
                    Qty: {item.quantity} × Rs. {item.finalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold text-[#B58A3A]">
                Rs. {(item.finalPrice * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-[#1C1917] rounded-xl border border-[#4A3628] space-y-2 text-xs text-[#D4C5A9]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-[#F5F0E8]">
              Rs. {order.subtotal.toLocaleString()}
            </span>
          </div>
          {itemDiscountAmount > 0 && (
            <div className="flex justify-between text-[#6DB56D]">
              <span>Catalog Savings</span>
              <span>- Rs. {itemDiscountAmount.toLocaleString()}</span>
            </div>
          )}
          {(couponDiscountAmount > 0 || order.couponCode) && (
            <div className="flex justify-between gap-3 text-[#6DB56D]">
              <span className="min-w-0 truncate" title={order.couponCode}>
                Coupon{order.couponCode ? ` (${order.couponCode})` : ""}
              </span>
              <span className="shrink-0">- Rs. {couponDiscountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-semibold text-[#F5F0E8]">
              Rs. {order.deliveryFee.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold text-[#B58A3A] pt-2 border-t border-[#4A3628]">
            <span>Total Payable</span>
            <span>Rs. {order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Internal Admin Notes */}
      <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#DED6CA] space-y-4">
        <h3 className="font-serif-luxury font-bold text-base text-[#27231F] border-b border-[#DED6CA] pb-3">
          Internal Admin Notes
        </h3>

        <textarea
          rows={3}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Private notes for staff (e.g. Courier tracking #, customer contact log)..."
          className="w-full bg-[#1C1917] border border-[#4A3628] rounded-xl p-3 text-xs text-[#F5F0E8] placeholder-[#6B6259] focus:outline-none focus:border-[#B58A3A]"
        />

        <button
          onClick={handleSaveNotes}
          disabled={isSavingNotes}
          className="px-5 py-2.5 bg-[#4A3628] text-[#B58A3A] font-bold text-xs rounded-xl hover:bg-[#352D27] transition-colors inline-flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSavingNotes ? "Saving..." : "Save Admin Notes"}</span>
        </button>
      </div>
    </div>
  );
}
