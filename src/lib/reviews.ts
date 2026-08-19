import { fetchApi } from "./api";

export type ReviewStatus = "published" | "hidden" | "rejected";
export type ReviewSort = "newest" | "highest" | "lowest";

export interface Review {
  _id: string;
  book: string;
  customer: {
    _id: string;
    name: string;
  };
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  reviewCount: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewEligibility {
  authenticated: boolean;
  eligible: boolean;
  hasReviewed: boolean;
  review: Review | null;
}

export interface ReviewsResult {
  reviews: Review[];
  total: number;
  page: number;
  pages: number;
}

export interface ReviewInput {
  rating: number;
  title?: string;
  comment?: string;
}

export async function getBookReviews(
  bookId: string,
  options: { page?: number; limit?: number; sort?: ReviewSort } = {}
): Promise<ReviewsResult> {
  const query = new URLSearchParams();
  if (options.page) query.append("page", String(options.page));
  if (options.limit) query.append("limit", String(options.limit));
  if (options.sort) query.append("sort", options.sort);
  const res = await fetchApi<ReviewsResult>(
    `/books/${bookId}/reviews?${query.toString()}`
  );
  return res.data;
}

export async function getReviewSummary(
  bookId: string
): Promise<ReviewSummary> {
  const res = await fetchApi<ReviewSummary>(`/books/${bookId}/reviews/summary`);
  return res.data;
}

export async function getMyReviewStatus(
  bookId: string
): Promise<ReviewEligibility> {
  const res = await fetchApi<ReviewEligibility>(`/books/${bookId}/reviews/me`);
  return res.data;
}

export async function createReview(
  bookId: string,
  input: ReviewInput
): Promise<Review> {
  const res = await fetchApi<{ review: Review }>(`/books/${bookId}/reviews`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data.review;
}

export async function updateReview(
  reviewId: string,
  input: ReviewInput
): Promise<Review> {
  const res = await fetchApi<{ review: Review }>(`/reviews/${reviewId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return res.data.review;
}

export async function deleteReview(reviewId: string): Promise<void> {
  await fetchApi(`/reviews/${reviewId}`, { method: "DELETE" });
}