"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { CategoryItem } from "@/components/CategorySection";
import { Edit, Plus, Search } from "lucide-react";

interface AdminBookItem {
  _id: string;
  title: string;
  slug: string;
  author: string;
  coverImage: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  stockQuantity: number;
  category?: { name: string; slug: string };
  isActive: boolean;
  updatedAt: string;
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<AdminBookItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    async function loadCategories() {
      const res = await fetchApi<CategoryItem[]>("/categories?includeInactive=true");
      if (res.success) setCategories(res.data);
    }
    loadCategories();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const query = new URLSearchParams();
    query.append("includeInactive", "true");
    if (search) query.append("search", search);
    if (categoryFilter) query.append("category", categoryFilter);

    fetchApi<{ books: AdminBookItem[] }>(`/books?${query.toString()}`)
      .then((res) => {
        if (isMounted && res.success) {
          setBooks(res.data.books);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [search, categoryFilter]);

  const filteredBooks = books.filter((book) => {
    if (stockFilter === "low" && book.stockQuantity > 5) return false;
    if (stockFilter === "out" && book.stockQuantity > 0) return false;
    if (statusFilter === "active" && !book.isActive) return false;
    if (statusFilter === "inactive" && book.isActive) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl font-bold text-[#27231F]">Books</h1>
          <p className="text-sm text-[#716A61] mt-1">Manage your catalog and inventory</p>
        </div>

        <Link
          href="/admin/books/new"
          className="px-5 py-2.5 bg-[#4A3628] text-[#FFFDF9] font-bold text-xs rounded-xl hover:bg-[#352D27] transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#DED6CA] flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716A61]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author..."
            className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl pl-10 pr-4 py-2 text-xs text-[#27231F] placeholder-[#716A61] focus:outline-none focus:border-[#B58A3A]"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-48 bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-3 py-2 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full sm:w-40 bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-3 py-2 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
          >
            <option value="">All Stock</option>
            <option value="low">Low Stock (≤5)</option>
            <option value="out">Out of Stock</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-3 py-2 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#DED6CA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#27231F]">
            <thead className="bg-[#F6F2EA] text-[#716A61] uppercase tracking-wider font-semibold border-b border-[#DED6CA]">
              <tr>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DED6CA]/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#716A61]">
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#716A61]">
                    No books found matching query.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((b) => (
                  <tr key={b._id} className="hover:bg-[#F6F2EA]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative aspect-[3/4] w-10 rounded overflow-hidden bg-[#F6F2EA] shrink-0">
                          <Image
                            src={b.coverImage}
                            alt={b.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/books/${b._id}`}
                            className="font-serif-luxury font-bold text-[#27231F] hover:text-[#B58A3A] block truncate"
                          >
                            {b.title}
                          </Link>
                          <span className="text-[11px] text-[#716A61] block truncate">
                            {b.author}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-medium text-[#27231F]">
                      {b.category?.name || "Uncategorized"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-[#27231F]">
                          Rs. {b.finalPrice.toLocaleString()}
                        </span>
                        {b.discountPercentage > 0 && (
                          <span className="text-[10px] text-[#716A61] line-through">
                            Rs. {b.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          b.stockQuantity === 0
                            ? "text-[#C62828]"
                            : b.stockQuantity <= 5
                            ? "text-[#B58A3A]"
                            : "text-[#2E7D32]"
                        }`}
                      >
                        {b.stockQuantity} copies
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          b.isActive
                            ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30"
                            : "bg-[#F6F2EA] text-[#716A61] border border-[#DED6CA]"
                        }`}
                      >
                        {b.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-[#716A61]">
                      {new Date(b.updatedAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/books/${b._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F2EA] text-[#27231F] text-[10px] font-semibold rounded-lg hover:bg-[#DED6CA] transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
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
