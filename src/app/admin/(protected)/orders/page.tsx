"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { Eye, Search, SlidersHorizontal } from "lucide-react";

interface AdminOrderItem {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    city: string;
  };
  items: {
    title: string;
    quantity: number;
    finalPrice: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (statusFilter) query.append("status", statusFilter);

      const res = await fetchApi<{ orders: AdminOrderItem[] }>(
        `/admin/orders?${query.toString()}`
      );
      if (res.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error("Failed to load admin orders", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const query = new URLSearchParams();
    if (search) query.append("search", search);
    if (statusFilter) query.append("status", statusFilter);

    fetchApi<{ orders: AdminOrderItem[] }>(`/admin/orders?${query.toString()}`)
      .then((res) => {
        if (isMounted && res.success) {
          setOrders(res.data.orders);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [search, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetchApi(`/admin/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (res.success) {
        fetchOrders();
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-[#FFF8E1] border border-[#B58A3A]/30 text-[#B58A3A]";
      case "CONFIRMED":
        return "bg-[#E3F2FD] border border-[#1976D2]/30 text-[#1976D2]";
      case "PROCESSING":
        return "bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32]";
      case "SHIPPED":
        return "bg-[#F3E5F5] border border-[#7B1FA2]/30 text-[#7B1FA2]";
      case "DELIVERED":
        return "bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32]";
      case "CANCELLED":
        return "bg-[#FFEBEE] border border-[#C62828]/30 text-[#C62828]";
      default:
        return "bg-[#F6F2EA] border border-[#DED6CA] text-[#716A61]";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl font-bold text-[#27231F]">Orders</h1>
          <p className="text-sm text-[#716A61] mt-1">Manage customer orders</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#DED6CA] flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716A61]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, phone..."
            className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl pl-10 pr-4 py-2 text-xs text-[#27231F] placeholder-[#716A61] focus:outline-none focus:border-[#B58A3A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-[#B58A3A]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-3 py-2 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#DED6CA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#27231F]">
            <thead className="bg-[#F6F2EA] text-[#716A61] uppercase tracking-wider font-semibold border-b border-[#DED6CA]">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DED6CA]/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#716A61]">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#716A61]">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-[#F6F2EA]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${ord._id}`}
                        className="font-mono font-bold text-[#B58A3A] hover:text-[#4A3628]"
                      >
                        {ord.orderNumber}
                      </Link>
                    </td>

                    <td className="px-4 py-3 font-medium text-[#27231F]">
                      <div>{ord.customer.name}</div>
                      <div className="text-[11px] text-[#716A61]">{ord.customer.city}</div>
                    </td>

                    <td className="px-4 py-3 text-[#716A61]">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 font-bold text-[#27231F]">
                      Rs. {ord.totalAmount.toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-[#F6F2EA] text-[#716A61] border border-[#DED6CA] text-[10px]">
                        {ord.paymentMethod}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                        className={`text-[11px] font-bold rounded-lg px-2.5 py-1 border focus:outline-none ${getStatusBadgeStyle(ord.orderStatus)}`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${ord._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F2EA] text-[#27231F] text-[10px] font-semibold rounded-lg hover:bg-[#DED6CA] transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
