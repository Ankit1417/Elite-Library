"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Package } from "lucide-react";

interface OrderDetail {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    city: string;
  };
  items: {
    title: string;
    coverImage: string;
    finalPrice: number;
    quantity: number;
  }[];
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

// Helper functions for badges
function getOrderStatusBadge(status: string) {
  const styles: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: "bg-[#F1ECE2]", text: "text-[#8B6F47]" },
    CONFIRMED: { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]" },
    PROCESSING: { bg: "bg-[#E3F2FD]", text: "text-[#1565C0]" },
    SHIPPED: { bg: "bg-[#FFF3E0]", text: "text-[#E65100]" },
    DELIVERED: { bg: "bg-[#F1ECE2]", text: "text-[#4A3628]" },
    CANCELLED: { bg: "bg-[#FFEBEE]", text: "text-[#C62828]" },
  };
  const style = styles[status] || styles.PENDING;
  return (
    <span className={`px-2.5 py-1 rounded-full border border-[#DED6C8] text-[10px] font-semibold ${style.bg} ${style.text}`}>
      {status}
    </span>
  );
}

function getPaymentStatusBadge(status: string) {
  const styles: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: "bg-[#F1ECE2]", text: "text-[#8B6F47]" },
    PAID: { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]" },
    FAILED: { bg: "bg-[#FFEBEE]", text: "text-[#C62828]" },
    REFUNDED: { bg: "bg-[#F1ECE2]", text: "text-[#4A3628]" },
  };
  const style = styles[status] || styles.PENDING;
  return (
    <span className={`px-2.5 py-1 rounded-full border border-[#DED6C8] text-[10px] font-semibold ${style.bg} ${style.text}`}>
      {status}
    </span>
  );
}

function getPaymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    COD: "Cash on Delivery",
    ESEWA: "eSewa",
  };
  return labels[method] || method;
}

export default function OrdersPage() {
  const { customer, isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomerOrders = async () => {
      if (!isAuthenticated || !customer) {
        setIsLoading(false);
        return;
      }

      try {
        const ordersRes = await fetchApi<{ orders: OrderDetail[] }>("/orders/my-orders");
        if (ordersRes.success && ordersRes.data.orders) {
          setOrders(ordersRes.data.orders);
        }
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };
    loadCustomerOrders();
  }, [isAuthenticated, customer]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setError(null);
      setSearchResult(null);

      const res = await fetchApi<OrderDetail>(
        `/orders/number/${encodeURIComponent(searchQuery.trim())}`
      );

      if (res.success && res.data) {
        setSearchResult(res.data);
      } else {
        setError("No order found with that order number.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to lookup order.");
    } finally {
      setIsSearching(false);
    }
  };

  if (authLoading || isLoading) {
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

  // If customer is logged in, show their orders
  if (isAuthenticated && customer) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#26231F]">
        <Navbar />

        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          {/* Header */}
          <div className="border-b border-[#DED6C8] pb-6 mb-8">
            <span className="text-xs uppercase tracking-widest text-[#B58A3A] font-semibold">
              My Account
            </span>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#26231F] mt-1">
              My Orders
            </h1>
            <p className="text-sm text-[#6F6A61] mt-2">
              Your recent purchases and delivery status
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-4 rounded-xl bg-[#F1ECE2] border border-[#DED6C8] text-[#8C2D19] text-sm mb-6">
              {error}
            </div>
          )}

          {/* Empty State */}
          {orders.length === 0 && !error ? (
            <div className="bg-[#FFFDF8] p-8 sm:p-12 rounded-2xl border border-[#DED6C8] text-center shadow-xs">
              <Package className="w-16 h-16 text-[#6F6A61] mx-auto mb-4" />
              <h3 className="font-serif-luxury text-xl font-bold text-[#26231F] mb-2">
                No Orders Yet
              </h3>
              <p className="text-sm text-[#6F6A61] mb-6 max-w-md mx-auto">
                You haven&apos;t placed any orders yet. Start browsing our collection of premium books!
              </p>
              <Link
                href="/books"
                className="px-8 py-3 bg-[#4A3628] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#352D27] transition-all inline-block shadow-md"
              >
                Browse Books
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order._id}
                  href={`/orders/${order._id}`}
                  className="block bg-[#FFFDF8] p-6 rounded-2xl border border-[#DED6C8] hover:border-[#B58A3A]/60 transition-all shadow-xs"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="font-mono text-sm font-bold text-[#4A3628]">
                          {order.orderNumber}
                        </span>
                        {getOrderStatusBadge(order.orderStatus)}
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </div>
                      <p className="text-xs text-[#6F6A61] mb-2">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-[#6F6A61]">
                        <span>{order.items.length} {order.items.length === 1 ? 'Book' : 'Books'}</span>
                        <span>•</span>
                        <span>{getPaymentMethodLabel(order.paymentMethod)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between lg:justify-end gap-4">
                      <span className="text-lg font-bold text-[#4A3628]">
                        Rs. {order.totalAmount.toLocaleString()}
                      </span>
                      <span className="px-4 py-2 bg-[#F8F5EF] border border-[#DED6C8] rounded-lg text-xs font-semibold text-[#4A3628] hover:bg-[#F1ECE2] transition-colors">
                        View Order
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Secondary: Track Another Order */}
          <div className="mt-12 pt-8 border-t border-[#DED6C8]">
            <h2 className="font-serif-luxury text-lg font-bold text-[#26231F] mb-4">
              Track Another Order
            </h2>
            <div className="bg-[#FFFDF8] p-6 rounded-2xl border border-[#DED6C8] max-w-xl shadow-xs">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F6A61]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter Order Number (e.g. EL-XXXX)..."
                    required
                    className="w-full bg-[#F8F5EF] border border-[#DED6C8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#26231F] placeholder-[#6F6A61] focus:outline-none focus:border-[#B58A3A]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-6 py-2.5 bg-[#4A3628] text-[#FFFDF8] font-bold text-xs rounded-xl hover:bg-[#352D27] disabled:opacity-50 transition-all shadow-md"
                >
                  {isSearching ? "Searching..." : "Track"}
                </button>
              </form>
              {error && searchResult === null && (
                <p className="text-xs text-[#8C2D19] mt-3">{error}</p>
              )}
              {searchResult && (
                <div className="mt-4 p-4 bg-[#F8F5EF] rounded-xl border border-[#DED6C8]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#6F6A61]">Order Found</span>
                      <p className="font-mono text-sm font-bold text-[#4A3628]">{searchResult.orderNumber}</p>
                    </div>
                    <Link
                      href={`/orders/${searchResult._id}`}
                      className="text-xs text-[#4A3628] hover:text-[#B58A3A] underline font-semibold"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Public order lookup for non-authenticated users
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#26231F]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="border-b border-[#DED6C8] pb-6 mb-8 text-center">
          <span className="text-xs uppercase tracking-widest text-[#B58A3A] font-semibold">
            Track Purchase Status
          </span>
          <h1 className="font-serif-luxury text-3xl font-bold text-[#26231F] mt-1">
            Order Lookup
          </h1>
          <p className="text-sm text-[#6F6A61] mt-2">
            Enter your order reference code (e.g. EL-XXXX-XXXX) to track your delivery status.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-[#FFFDF8] p-6 rounded-2xl border border-[#DED6C8] mb-8 max-w-xl mx-auto shadow-xs">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F6A61]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Order Number (e.g. EL-XXXX)..."
                required
                className="w-full bg-[#F8F5EF] border border-[#DED6C8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#26231F] placeholder-[#6F6A61] focus:outline-none focus:border-[#B58A3A]"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-2.5 bg-[#4A3628] text-[#FFFDF8] font-bold text-xs rounded-xl hover:bg-[#352D27] disabled:opacity-50 transition-all shadow-md"
            >
              {isSearching ? "Searching..." : "Track"}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-[#F1ECE2] border border-[#DED6C8] text-[#8C2D19] text-xs text-center font-medium max-w-xl mx-auto mb-8">
            {error}
          </div>
        )}

        {/* Order Details Result */}
        {searchResult && (
          <div className="bg-[#FFFDF8] p-6 sm:p-8 rounded-2xl border border-[#DED6C8] space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DED6C8] pb-4 gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#6F6A61]">
                  Order Code
                </span>
                <h3 className="font-mono text-lg font-bold text-[#4A3628]">
                  {searchResult.orderNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {getOrderStatusBadge(searchResult.orderStatus)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-[#F8F5EF] rounded-xl border border-[#DED6C8]">
                <span className="text-[#6F6A61] block mb-0.5">Customer Name</span>
                <span className="font-bold text-[#26231F]">{searchResult.customer.name}</span>
              </div>
              <div className="p-3 bg-[#F8F5EF] rounded-xl border border-[#DED6C8]">
                <span className="text-[#6F6A61] block mb-0.5">Destination</span>
                <span className="font-bold text-[#26231F]">{searchResult.customer.city}</span>
              </div>
              <div className="p-3 bg-[#F8F5EF] rounded-xl border border-[#DED6C8]">
                <span className="text-[#6F6A61] block mb-0.5">Total Amount</span>
                <span className="font-bold text-[#4A3628]">
                  Rs. {searchResult.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-serif-luxury text-sm font-bold text-[#26231F]">
                Items in Order ({searchResult.items.length})
              </h4>
              {searchResult.items.map((item, idx) => (
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
                        Quantity: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#4A3628]">
                    Rs. {(item.finalPrice * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <Link
                href={`/orders/${searchResult._id}`}
                className="text-xs text-[#4A3628] hover:text-[#B58A3A] underline font-semibold transition-colors"
              >
                View Full Receipt Details →
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

