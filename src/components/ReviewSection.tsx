"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Pencil, Star, Trash2, X } from "lucide-react";
import StarRating from "@/components/StarRating";
import { useAuth } from "@/lib/authContext";
import { useCart } from "@/lib/cartContext";
import {
  createReview,
  deleteReview,
  getBookReviews,
  getMyReviewStatus,
  getReviewSummary,
  Review,
  ReviewEligibility,
  ReviewSort,
  ReviewSummary,
  updateReview,
} from "@/lib/reviews";

const REVIEWS_PER_PAGE = 5;

const SORT_LABELS: { value: ReviewSort; label: string }[] = [
  { value: "newest", label: "Most Recent" },
  { value: "highest", label: "Highest Rated" },
  { value: "lowest", label: "Lowest Rated" },
];

function formatReviewDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function DistributionBar({ rating, count, total }: { rating: number; count: number; total: number }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <span className="w-3 font-bold text-[#26231F]">{rating}</span>
      <Star className="h-3.5 w-3.5 text-[#B58A3A] fill-[#B58A3A]" aria-hidden="true" />
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F1ECE2]">
        <div
          className="h-full rounded-full bg-[#B58A3A]/80 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-6 text-right text-[#6F6A61] tabular-nums">{count}</span>
    </div>
  );
}

function ReviewCard({
  review,
  isMine,
  onEdit,
  onDelete,
}: {
  review: Review;
  isMine: boolean;
  onEdit: (review: Review) => void;
  onDelete: (review: Review) => void;
}) {
  return (
    <article className="rounded-2xl border border-[#DED6C8] bg-[#FFFDF8] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {review.title && (
            <h4 className="font-serif-luxury text-base font-bold text-[#26231F] leading-snug">
              {review.title}
            </h4>
          )}
          <StarRating value={review.rating} sizeClassName="w-3.5 h-3.5" />
        </div>
        {isMine && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(review)}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#4A3628] transition-colors hover:bg-[#F1ECE2]"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(review)}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#8C2D19] transition-colors hover:bg-[#FFF4F1]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6F6A61]">
        <span className="font-semibold text-[#4A3628]">
          {review.customer?.name ?? "Verified Customer"}
        </span>
        {review.isVerifiedPurchase && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#2E7D32]/30 bg-[#E8F5E9] px-2 py-0.5 text-[10px] font-bold text-[#2E7D32]">
            <BadgeCheck className="h-3 w-3" aria-hidden="true" />
            Verified Purchase
          </span>
        )}
        <span>
          Reviewed on {formatReviewDate(review.createdAt) || "recently"}
        </span>
      </div>

      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#26231F]">
        {review.comment}
      </p>
    </article>
  );
}

function ReviewAction({
  isAuthenticated,
  authLoading,
  eligibilityLoading,
  eligibility,
  bookSlug,
  myReview,
  onWrite,
  onEdit,
  onDelete,
}: {
  isAuthenticated: boolean;
  authLoading: boolean;
  eligibilityLoading: boolean;
  eligibility: ReviewEligibility | null;
  bookSlug: string;
  myReview: Review | null;
  onWrite: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (authLoading) {
    return <div className="h-10 w-44 animate-pulse rounded-xl bg-[#F1ECE2]" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-[#6F6A61]">
          Sign in to share your thoughts about this book.
        </p>
        <Link
          href={`/login?redirect=${encodeURIComponent(`/books/${bookSlug}`)}`}
          className="rounded-xl bg-[#4A3628] px-4 py-2.5 text-xs font-bold text-[#FFFDF8] transition-colors hover:bg-[#352D27]"
        >
          Sign in to write a review
        </Link>
      </div>
    );
  }

  if (eligibilityLoading) {
    return <div className="h-10 w-44 animate-pulse rounded-xl bg-[#F1ECE2]" />;
  }

  if (!eligibility) {
    return null;
  }

  if (eligibility.hasReviewed && myReview) {
    return (
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#B58A3A]">
            Your Review
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StarRating value={myReview.rating} sizeClassName="h-4 w-4" />
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1 rounded-lg border border-[#DED6C8] px-3 py-1.5 text-xs font-semibold text-[#4A3628] transition-colors hover:border-[#B58A3A]/50 hover:bg-[#F1ECE2]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1 rounded-lg border border-[#DED6C8] px-3 py-1.5 text-xs font-semibold text-[#8C2D19] transition-colors hover:border-[#8C2D19]/40 hover:bg-[#FFF4F1]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    );
  }

  if (!eligibility.eligible) {
    return (
      <p className="max-w-lg text-sm leading-6 text-[#6F6A61]">
        Only verified customers who purchased this book through Elite Library
        can leave a review. Your review will be available once your order is
        completed.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={onWrite}
      className="rounded-xl bg-[#4A3628] px-5 py-2.5 text-xs font-bold text-[#FFFDF8] shadow-sm transition-colors hover:bg-[#352D27] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A3A] focus-visible:ring-offset-2"
    >
      Write a Review
    </button>
  );
}

export default function ReviewSection({
  bookId,
  bookSlug,
}: {
  bookId: string;
  bookSlug: string;
}) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useCart();

  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState<ReviewSort>("newest");
  const [listLoading, setListLoading] = useState(true);
  const [listLoadingMore, setListLoadingMore] = useState(false);
  const [listError, setListError] = useState(false);

  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formRating, setFormRating] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const loadSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      setSummaryError(false);
      const data = await getReviewSummary(bookId);
      setSummary(data);
    } catch {
      setSummaryError(true);
    } finally {
      setSummaryLoading(false);
    }
  }, [bookId]);

  const loadReviews = useCallback(
    async (targetSort: ReviewSort, targetPage: number, append: boolean) => {
      try {
        if (append) setListLoadingMore(true);
        else setListLoading(true);
        setListError(false);
        const data = await getBookReviews(bookId, {
          page: targetPage,
          limit: REVIEWS_PER_PAGE,
          sort: targetSort,
        });
        setReviews((prev) => (append ? [...prev, ...data.reviews] : data.reviews));
        setPage(data.page);
        setTotalPages(data.pages);
      } catch {
        setListError(true);
      } finally {
        setListLoading(false);
        setListLoadingMore(false);
      }
    },
    [bookId]
  );

  const loadEligibility = useCallback(async () => {
    if (authLoading || !isAuthenticated) {
      setEligibility(null);
      return;
    }
    try {
      setEligibilityLoading(true);
      const data = await getMyReviewStatus(bookId);
      setEligibility(data);
    } catch {
      // Non-fatal: the section still works for guests / public reviews.
    } finally {
      setEligibilityLoading(false);
    }
  }, [bookId, authLoading, isAuthenticated]);

  useEffect(() => {
    const id = window.setTimeout(() => void loadSummary(), 0);
    return () => window.clearTimeout(id);
  }, [loadSummary]);

  useEffect(() => {
    const id = window.setTimeout(() => void loadReviews(sort, 1, false), 0);
    return () => window.clearTimeout(id);
  }, [sort, loadReviews]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const id = window.setTimeout(() => void loadEligibility(), 0);
      return () => window.clearTimeout(id);
    } else if (!authLoading && !isAuthenticated) {
      const timer = window.setTimeout(() => {
        setEligibility(null);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [authLoading, isAuthenticated, loadEligibility]);

  const openCreateForm = () => {
    setEditingReview(null);
    setFormRating(0);
    setFormTitle("");
    setFormComment("");
    setFormError(null);
    setFormOpen(true);
  };

  const openEditForm = (review: Review) => {
    setEditingReview(review);
    setFormRating(review.rating);
    setFormTitle(review.title ?? "");
    setFormComment(review.comment);
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingReview(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (formRating < 1) {
      setFormError("Please select a rating.");
      return;
    }
    if (formComment.trim().length < 10) {
      setFormError("Review must contain at least 10 characters.");
      return;
    }

    try {
      setFormSubmitting(true);
      const input = {
        rating: formRating,
        title: formTitle.trim(),
        comment: formComment.trim(),
      };
      if (editingReview) {
        await updateReview(editingReview._id, input);
        showToast("Review updated successfully.");
      } else {
        await createReview(bookId, input);
        showToast("Review submitted successfully.");
      }
      closeForm();
      await Promise.all([
        loadSummary(),
        loadReviews(sort, 1, false),
        loadEligibility(),
      ]);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "We could not save your review."
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteSubmitting(true);
      await deleteReview(deleteTarget._id);
      showToast("Review deleted successfully.");
      setDeleteTarget(null);
      await Promise.all([
        loadSummary(),
        loadReviews(sort, 1, false),
        loadEligibility(),
      ]);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Could not delete your review."
      );
      setDeleteTarget(null);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const loadMore = () => {
    if (page < totalPages) loadReviews(sort, page + 1, true);
  };

  const myReview = eligibility?.review ?? null;

  return (
    <section
      id="ratings-reviews"
      className="scroll-mt-28 pt-10"
      aria-labelledby="ratings-reviews-heading"
    >
      <h2
        id="ratings-reviews-heading"
        className="font-serif-luxury mb-6 text-2xl font-bold text-[#26231F]"
      >
        Ratings &amp; Reviews
      </h2>

      {/* Rating summary + distribution */}
      <div className="rounded-2xl border border-[#DED6C8] bg-[#FFFDF8] p-5 shadow-xs sm:p-6">
        {summaryLoading ? (
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            <div className="space-y-2">
              <div className="h-12 w-20 animate-pulse rounded-xl bg-[#F1ECE2]" />
              <div className="h-4 w-32 animate-pulse rounded-lg bg-[#F1ECE2]" />
            </div>
            <div className="space-y-2.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-3.5 animate-pulse rounded-full bg-[#F1ECE2]" />
              ))}
            </div>
          </div>
        ) : summaryError ? (
          <div className="flex flex-col items-start gap-3 py-2 sm:flex-row sm:items-center">
            <p className="text-sm text-[#8C2D19]">
              Reviews could not be loaded. Please try again.
            </p>
            <button
              type="button"
              onClick={() => void loadSummary()}
              className="rounded-lg border border-[#DED6C8] px-3 py-1.5 text-xs font-bold text-[#4A3628] transition-colors hover:border-[#B58A3A]"
            >
              Retry
            </button>
          </div>
        ) : summary ? (
          <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
            <div className="text-center md:text-left">
              <p className="font-serif-luxury text-5xl font-bold text-[#26231F]">
                {summary.reviewCount > 0 ? summary.averageRating.toFixed(1) : "—"}
              </p>
              <StarRating value={summary.averageRating} sizeClassName="h-4.5 w-4.5" />
              <p className="mt-1.5 text-xs text-[#6F6A61]">
                {summary.reviewCount > 0
                  ? `Based on ${summary.reviewCount} ${
                      summary.reviewCount === 1 ? "review" : "reviews"
                    }`
                  : "No reviews yet"}
              </p>
            </div>

            <div className="min-w-0">
              <div className="space-y-2">
                {([5, 4, 3, 2, 1] as const).map((rating) => (
                  <DistributionBar
                    key={rating}
                    rating={rating}
                    count={summary.distribution[rating]}
                    total={summary.reviewCount}
                  />
                ))}
              </div>

              <div className="mt-5 border-t border-[#DED6C8]/70 pt-4">
                <ReviewAction
                  isAuthenticated={isAuthenticated}
                  authLoading={authLoading}
                  eligibilityLoading={eligibilityLoading}
                  eligibility={eligibility}
                  bookSlug={bookSlug}
                  myReview={myReview}
                  onWrite={openCreateForm}
                  onEdit={() => {
                    if (myReview) openEditForm(myReview);
                  }}
                  onDelete={() => {
                    if (myReview) setDeleteTarget(myReview);
                  }}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Review list */}
      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-serif-luxury text-lg font-bold text-[#26231F]">
            Customer Reviews
          </h3>
          <div className="flex items-center gap-2">
            <label htmlFor="review-sort" className="text-xs font-semibold text-[#6F6A61]">
              Sort by:
            </label>
            <select
              id="review-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as ReviewSort)}
              className="rounded-lg border border-[#DED6C8] bg-[#FFFDF8] px-2.5 py-1.5 text-xs font-medium text-[#26231F] focus:border-[#B58A3A] focus:outline-none"
            >
              {SORT_LABELS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {listLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-[#DED6C8] bg-[#F1ECE2]/60" />
            ))}
          </div>
        ) : listError ? (
          <div className="flex flex-col items-start gap-3 py-4 sm:flex-row sm:items-center">
            <p className="text-sm text-[#8C2D19]">
              Reviews could not be loaded. Please try again.
            </p>
            <button
              type="button"
              onClick={() => void loadReviews(sort, 1, false)}
              className="rounded-lg border border-[#DED6C8] px-3 py-1.5 text-xs font-bold text-[#4A3628] transition-colors hover:border-[#B58A3A]"
            >
              Retry
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#DED6C8] bg-[#F8F5EF] px-5 py-8 text-center text-sm text-[#6F6A61]">
            No reviews yet. Be the first to share your thoughts about this book.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  isMine={Boolean(myReview && myReview._id === review._id)}
                  onEdit={openEditForm}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>

            {page < totalPages && (
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={listLoadingMore}
                  className="rounded-xl border border-[#DED6C8] bg-[#FFFDF8] px-5 py-2.5 text-xs font-bold text-[#4A3628] transition-colors hover:border-[#B58A3A]/60 hover:bg-[#F1ECE2] disabled:cursor-wait disabled:opacity-60"
                >
                  {listLoadingMore ? "Loading..." : "Load More Reviews"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

{/* Write / Edit review modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#211C18]/50 px-4 py-10 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#DED6C8] bg-[#FFFDF8] p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B58A3A]">
                  {editingReview ? "Update your review" : "Share your experience"}
                </p>
                <h3 className="font-serif-luxury text-xl font-bold text-[#26231F]">
                  {editingReview ? "Edit Review" : "Write a Review"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close review form"
                className="rounded-lg p-1.5 text-[#68615B] transition-colors hover:bg-[#F8F5EF] hover:text-[#211C18]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <span className="mb-1.5 block text-xs font-semibold text-[#4A3628]">
                  Your Rating *
                </span>
                <StarRating value={formRating} onChange={setFormRating} />
              </div>

              <div>
                <label htmlFor="review-title" className="mb-1.5 block text-xs font-semibold text-[#4A3628]">
                  Review Title{" "}
                  <span className="font-normal text-[#6F6A61]">(optional)</span>
                </label>
                <input
                  id="review-title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  maxLength={120}
                  placeholder="Catchy summary of your review"
                  className="w-full rounded-xl border border-[#DED6C8] bg-[#F8F5EF] px-3.5 py-2.5 text-sm text-[#26231F] placeholder-[#68615B] focus:border-[#B58A3A] focus:outline-none focus:ring-1 focus:ring-[#B58A3A]"
                />
              </div>

              <div>
                <label htmlFor="review-comment" className="mb-1.5 block text-xs font-semibold text-[#4A3628]">
                  Your Review *
                </label>
                <textarea
                  id="review-comment"
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  rows={4}
                  minLength={10}
                  maxLength={2000}
                  placeholder="What did you like or dislike about this book?"
                  className="w-full resize-y rounded-xl border border-[#DED6C8] bg-[#F8F5EF] px-3.5 py-2.5 text-sm text-[#26231F] placeholder-[#68615B] focus:border-[#B58A3A] focus:outline-none focus:ring-1 focus:ring-[#B58A3A]"
                />
                <p className="mt-1 text-[11px] text-[#6F6A61]">
                  {formComment.trim().length}/2000 characters{" "}
                  {formComment.trim().length > 0 && formComment.trim().length < 10
                    ? `— at least 10 required (${10 - formComment.trim().length} more)`
                    : ""}
                </p>
              </div>

              {formError && (
                <p
                  role="alert"
                  className="rounded-lg border border-[#8C2D19]/25 bg-[#FFF4F1] px-3 py-2 text-xs text-[#8C2D19]"
                >
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-[#DED6C8] pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={formSubmitting}
                  className="rounded-xl border border-[#DED6C8] px-4 py-2.5 text-xs font-bold text-[#4A3628] transition-colors hover:bg-[#F8F5EF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="rounded-xl bg-[#4A3628] px-5 py-2.5 text-xs font-bold text-[#FFFDF8] transition-colors hover:bg-[#352D27] disabled:cursor-wait disabled:opacity-60"
                >
                  {formSubmitting
                    ? "Submitting..."
                    : editingReview
                      ? "Update Review"
                      : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

{/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#211C18]/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#DED6C8] bg-[#FFFDF8] p-6 shadow-2xl">
            <h3 className="font-serif-luxury text-lg font-bold text-[#26231F]">
              Delete your review?
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#6F6A61]">
              This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteSubmitting}
                className="rounded-xl border border-[#DED6C8] px-4 py-2.5 text-xs font-bold text-[#4A3628] transition-colors hover:bg-[#F8F5EF]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deleteSubmitting}
                className="rounded-xl bg-[#8C2D19] px-4 py-2.5 text-xs font-bold text-[#FFFDF8] transition-colors hover:bg-[#681F12] disabled:cursor-wait disabled:opacity-60"
              >
                {deleteSubmitting ? "Deleting..." : "Delete Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}