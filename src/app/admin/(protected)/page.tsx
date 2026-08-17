"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  DollarSign,
  ShoppingBag,
} from "lucide-react";

interface DashboardStats {
  books: {
    total: number;
    active: number;
    lowStock: number;
    outOfStock: number;
  };
  orders: {
    total: number;
    pending: number;
    delivered: number;
    totalSales: number;
  };
  recentOrders: {
    _id: string;
    orderNumber: string;
    customer: { name: string; city: string };
    totalAmount: number;
    orderStatus: string;
    createdAt: string;
  }[];
  lowStockList: {
    _id: string;
    title: string;
    coverImage: string;
    stockQuantity: number;
    price: number;
    finalPrice: number;
  }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true);
        const res = await fetchApi<DashboardStats>("/admin/dashboard/stats");
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[#B58A3A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#DED6CA] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#716A61] uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F6F2EA] text-[#B58A3A] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#27231F]">
            Rs. {stats.orders.totalSales.toLocaleString()}
          </p>
          <span className="text-[11px] text-[#716A61] block">
            From delivered orders
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#DED6CA] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#716A61] uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F6F2EA] text-[#B58A3A] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#27231F]">{stats.orders.total}</p>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-[#B58A3A] font-semibold">
              {stats.orders.pending} Pending
            </span>
            <span className="text-[#2E7D32] font-semibold">
              {stats.orders.delivered} Delivered
            </span>
          </div>
        </div>

        {/* Total Books */}
        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#DED6CA] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#716A61] uppercase tracking-wider">
              Catalog Titles
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F6F2EA] text-[#B58A3A] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#27231F]">{stats.books.total}</p>
          <span className="text-[11px] text-[#716A61] block">
            {stats.books.active} Active in store
          </span>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#DED6CA] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#716A61] uppercase tracking-wider">
              Inventory Alerts
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FFEBEE] text-[#C62828] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#C62828]">
            {stats.books.lowStock + stats.books.outOfStock}
          </p>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-[#B58A3A] font-semibold">
              {stats.books.lowStock} Low
            </span>
            <span className="text-[#C62828] font-semibold">
              {stats.books.outOfStock} Out
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Low Stock List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders (Left 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-luxury font-bold text-lg text-[#27231F]">
              Recent Orders
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#B58A3A] hover:text-[#4A3628]"
            >
              View All →
            </Link>
          </div>

          <div className="bg-[#FFFDF9] rounded-2xl border border-[#DED6CA] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#27231F]">
                <thead className="bg-[#F6F2EA] text-[#716A61] uppercase tracking-wider font-semibold border-b border-[#DED6CA]">
                  <tr>
                    <th className="px-4 py-3">Order #</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DED6CA]/60">
                  {stats.recentOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-[#F6F2EA]">
                      <td className="px-4 py-3 font-mono font-bold text-[#B58A3A]">
                        {ord.orderNumber}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#27231F]">
                        {ord.customer.name}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#27231F]">
                        Rs. {ord.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F6F2EA] text-[#716A61] text-[10px] font-semibold">
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/orders/${ord._id}`}
                          className="text-[#B58A3A] hover:text-[#4A3628] font-semibold"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Low Stock Alert List (Right 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-luxury font-bold text-lg text-[#27231F]">
              Low Stock Alerts
            </h3>
            <Link
              href="/admin/books"
              className="text-xs font-semibold text-[#B58A3A] hover:text-[#4A3628]"
            >
              Manage →
            </Link>
          </div>

          <div className="bg-[#FFFDF9] rounded-2xl border border-[#DED6CA] p-4 space-y-3">
            {stats.lowStockList.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#716A61]">
                <CheckCircle className="w-8 h-8 text-[#2E7D32] mx-auto mb-2" />
                <p>All catalog titles have healthy stock levels.</p>
              </div>
            ) : (
              stats.lowStockList.map((bk) => (
                <div
                  key={bk._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F6F2EA] border border-[#DED6CA] gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative aspect-[3/4] w-10 rounded overflow-hidden bg-[#FFFDF9] shrink-0">
                      <Image
                        src={bk.coverImage}
                        alt={bk.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-serif-luxury text-xs font-semibold text-[#27231F] truncate">
                        {bk.title}
                      </h5>
                      <span className="text-[11px] text-[#B58A3A] font-bold">
                        Rs. {bk.finalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        bk.stockQuantity === 0
                          ? "bg-[#FFEBEE] border border-[#C62828]/30 text-[#C62828]"
                          : "bg-[#FFF8E1] border border-[#B58A3A]/30 text-[#B58A3A]"
                      }`}
                    >
                      {bk.stockQuantity === 0 ? "Out of Stock" : `${bk.stockQuantity} Left`}
                    </span>
                    <Link
                      href={`/admin/books/${bk._id}`}
                      className="text-[11px] text-[#B58A3A] hover:text-[#4A3628] block mt-1"
                    >
                      Edit Stock
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
