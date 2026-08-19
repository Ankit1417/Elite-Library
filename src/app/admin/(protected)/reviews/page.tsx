"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { Star, BadgeCheck, Search, Trash2 } from "lucide-react";

interface AdminReview {
  _id: string;
  book?: {
    _id: string;
    title: string;
    slug: string;
    coverImage?: string;
  };
  customer?: {
    name: string;
    phone?: string;
  };
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  status: "published" | "hidden" | "rejected";
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
  { value: "rejected", label: "Rejected" },
];

const RATING_OPTIONS = [
  { value: "", label: "All Ratings" },
  { value: "5", label: "5 Stars" },
  { value: "4", label: "4 Stars" },
  { value: "3", label: "3 Stars" },
  { value: "2", label: "2 Stars" },
  { value: "1", label: "1 Star" },
];

function getStatusBadgeStyle(status: string) {
  switch (status) {
    case "published":
      return "bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32]";
    case "hidden":
      return "bg-[#FFF8E1] border border-[#B58A3A]/30 text-[#B58A3A]";
    case "rejected":
      return "bg-[#FFEBEE] border border-[#C62828]/30 text-[#C62828]";
    default:
      return "bg-[#F6F2EA] border border-[#DED6CA] text-[#716A61]";
  }
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= rating ? "text-[#B58A3A] fill-[#B58A3A]" : "text-[#DED6CA]"
          }`}
        />
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadReviews = async (targetPage = 1) => {
    try {
      setIsLoading(true);
      setActionError(null);
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (statusFilter) query.append("status", statusFilter);
      if (ratingFilter) query.append("rating", ratingFilter);
      query.append("page", String(targetPage));
      query.append("limit", "20");

      const res = await fetchApi<{
        reviews: AdminReview[];
        total: number;
        page: number;
        pages: number;
      }>(`/admin/reviews?${query.toString()}`);
      if (res.success) {
        setReviews(res.data.reviews);
        setTotal(res.data.total);
        setPage(res.data.page);
        setPages(res.data.pages || 1);
      }
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Failed to load reviews"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const query = new URLSearchParams();
    if (search) query.append("search", search);
    if (statusFilter) query.append("status", statusFilter);
    if (ratingFilter) query.append("rating", ratingFilter);

    fetchApi<{ reviews: AdminReview[]; total: number; pages: number }>(
      `/admin/reviews?${query.toString()}`
    )
      .then((res) => {
        if (isMounted && res.success) {
          setReviews(res.data.reviews);
          setTotal(res.data.total);
          setPages(res.data.pages || 1);
          setPage(1);
        }
      })
      .catch((err: unknown) => {
        if (isMounted)
          setActionError(
            err instanceof Error ? err.message : "Failed to load reviews"
          );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [search, statusFilter, ratingFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetchApi(`/admin/reviews/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        setActionError(null);
        loadReviews(page);
      }
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update status"
      );
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this review? The book rating will be recalculated."
    );
    if (!confirmed) return;
    try {
      const res = await fetchApi(`/admin/reviews/${id}`, { method: "DELETE" });
      if (res.success) {
        setActionError(null);
        loadReviews(page);
      }
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete review"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl font-bold text-[#27231F]">
            Reviews
          </h1>
          <p className="text-xs text-[#716A61] mt-1">
            {total} total review{total === 1 ? "" : "s"} · published reviews
            drive book ratings
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#716A61]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search book, customer, review..."
              className="pl-9 pr-3 py-2 rounded-xl border border-[#DED6CA] bg-[#FFFDF9] text-xs text-[#27231F] placeholder-[#9A9188] focus:outline-none focus:border-[#B58A3A]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#DED6CA] bg-[#FFFDF9] text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#DED6CA] bg-[#FFFDF9] text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
          >
            {RATING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {actionError && (
        <div className="rounded-xl border border-[#C62828]/30 bg-[#FFEBEE] px-4 py-3 text-xs text-[#C62828]">
          {actionError}
        </div>
      )}

      {/* ── Reviews table ── */}
      <div className="rounded-2xl border border-[#DED6CA] bg-[#FFFDF9] overflow-x-auto">
        <table className="w-full text-left min-w-[880px]">
          <thead>
            <tr className="border-b border-[#DED6CA] text-[10px] uppercase tracking-wider text-[#716A61]">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Book</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Review</th>
              <th className="px-4 py-3">Verified</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#DED6CA]/60">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#716A61]">
                  Loading reviews...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#716A61]">
                  No reviews found.
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review._id} className="hover:bg-[#F6F2EA]">
                  <td className="px-4 py-3">
                    <span className="font-medium text-[#27231F]">
                      {review.customer?.name ?? "Unknown"}
                    </span>
                    {review.customer?.phone && (
                      <span className="block text-[11px] text-[#716A61]">
                        {review.customer.phone}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 max-w-[180px]">
                    {review.book?.slug ? (
                      <Link
                        href={`/books/${review.book.slug}`}
                        target="_blank"
                        className="text-xs font-medium text-[#B58A3A] hover:underline line-clamp-2"
                      >
                        {review.book.title}
                      </Link>
                    ) : (
                      <span className="text-xs text-[#716A61]">
                        Deleted book
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <StarDisplay rating={review.rating} />
                  </td>

                  <td className="px-4 py-3 max-w-[260px]">
                    {review.title && (
                      <span className="block text-xs font-bold text-[#27231F]">
                        {review.title}
                      </span>
                    )}
                    {review.comment && review.comment.trim() ? (
                      <span className="text-[11px] text-[#716A61] line-clamp-2">
                        {review.comment}
                      </span>
                    ) : (
                      <span className="text-[11px] italic text-[#9A9188]">
                        (Rating only)
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {review.isVerifiedPurchase ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#2E7D32]/30 bg-[#E8F5E9] px-2 py-0.5 text-[10px] font-bold text-[#2E7D32]">
                        <BadgeCheck className="h-3 w-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#9A9188]">No</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={review.status}
                      onChange={(e) => handleStatusChange(review._id, e.target.value)}
                      className={`text-[11px] font-bold rounded-lg px-2 py-1 border focus:outline-none ${getStatusBadgeStyle(review.status)}`}
                    >
                      <option value="published">Published</option>
                      <option value="hidden">Hidden</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>

                  <td className="px-4 py-3 text-xs text-[#716A61]">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void handleDelete(review._id)}
                      title="Delete review"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-lg text-[#C62828] hover:bg-[#FFEBEE] transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <button
            disabled={page <= 1}
            onClick={() => loadReviews(page - 1)}
            className="px-4 py-2 rounded-xl border border-[#DED6CA] bg-[#FFFDF9] text-xs font-semibold text-[#27231F] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#B58A3A] transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-[#716A61] font-medium">
            Page {page} of {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => loadReviews(page + 1)}
            className="px-4 py-2 rounded-xl border border-[#DED6CA] bg-[#FFFDF9] text-xs font-semibold text-[#27231F] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#B58A3A] transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}