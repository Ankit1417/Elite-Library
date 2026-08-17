"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Gift,
  ShoppingBag,
  TicketPercent,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/authContext";

type CouponStatus = "ACTIVE" | "USED" | "EXPIRED";
type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

interface DealSummary {
  _id?: string;
  name: string;
  type: "GENERAL" | "BIRTHDAY";
  discountType: DiscountType;
  discountValue: number;
}

interface IssuedCoupon {
  _id: string;
  dealId: DealSummary | string;
  code: string;
  displayCode?: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscountAmount?: number;
  issuedAt: string;
  validFrom: string;
  expiresAt: string;
  usedAt?: string;
  usedOrderId?: string | { _id: string; orderNumber?: string };
  status: "ACTIVE" | "USED" | "EXPIRED" | "REVOKED";
}

function couponDisplayCode(coupon: IssuedCoupon) {
  return coupon.displayCode || coupon.code;
}

interface CouponsResponse {
  coupons: IssuedCoupon[];
  total: number;
  page: number;
  pages: number;
}

function dealName(coupon: IssuedCoupon) {
  return typeof coupon.dealId === "object" ? coupon.dealId.name : "Elite Library Reward";
}

function orderId(coupon: IssuedCoupon) {
  if (!coupon.usedOrderId) return null;
  return typeof coupon.usedOrderId === "string"
    ? coupon.usedOrderId
    : coupon.usedOrderId._id;
}

function discountLabel(coupon: IssuedCoupon) {
  return coupon.discountType === "PERCENTAGE"
    ? `${coupon.discountValue}% OFF`
    : `Rs. ${coupon.discountValue.toLocaleString()} OFF`;
}

export default function CouponsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<CouponStatus>("ACTIVE");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [coupons, setCoupons] = useState<IssuedCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadCoupons = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ status, page: String(page), limit: "12" });
      const response = await fetchApi<CouponsResponse>(
        `/coupons/my-coupons?${query.toString()}`
      );
      if (response.success) {
        setCoupons(response.data.coupons);
        setPages(Math.max(1, response.data.pages));
        setTotal(response.data.total);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "We could not load your coupons."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, page, status]);

  useEffect(() => {
    const loadId = window.setTimeout(() => void loadCoupons(), 0);
    return () => window.clearTimeout(loadId);
  }, [loadCoupons]);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(null), 2_000);
    } catch {
      setError("Copying was blocked by your browser. Select the code and copy it manually.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#B58A3A] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center px-4">
        <div className="max-w-md rounded-3xl border border-[#DED6C8] bg-[#FFFDF8] p-8 text-center shadow-sm">
          <Gift className="mx-auto h-10 w-10 text-[#B58A3A]" aria-hidden="true" />
          <h1 className="font-serif-luxury mt-4 text-2xl font-bold">Your rewards are private</h1>
          <p className="mt-2 text-sm text-[#6F6A61]">Sign in to view coupons issued especially for you.</p>
          <Link href="/login?redirect=coupons" className="mt-6 inline-block rounded-xl bg-[#4A3628] px-6 py-3 text-xs font-bold text-[#FFFDF8]">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5EF] text-[#26231F] flex flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <header className="border-b border-[#DED6C8] pb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B58A3A]">Exclusively yours</p>
          <h1 className="font-serif-luxury mt-1 text-3xl font-bold">My Coupons</h1>
          <p className="mt-1 text-sm text-[#6F6A61]">Keep every Elite Library reward close at hand.</p>
        </header>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex self-start rounded-xl border border-[#DED6C8] bg-[#FFFDF8] p-1" role="group" aria-label="Coupon status">
            {(["ACTIVE", "USED", "EXPIRED"] as CouponStatus[]).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={status === value}
                onClick={() => {
                  setStatus(value);
                  setPage(1);
                }}
                className={`rounded-lg px-4 py-2 text-xs font-bold capitalize transition-colors ${
                  status === value ? "bg-[#4A3628] text-[#FFFDF8]" : "text-[#6F6A61] hover:text-[#4A3628]"
                }`}
              >
                {value.toLowerCase()}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#6F6A61]">{total} {total === 1 ? "coupon" : "coupons"}</p>
        </div>

        {error && (
          <div role="alert" className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-[#8C2D19]/25 bg-[#FFF4F1] p-4 text-xs text-[#8C2D19]">
            <span>{error}</span>
            <button type="button" onClick={() => void loadCoupons()} className="font-bold underline underline-offset-4">Try again</button>
          </div>
        )}

        <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2" aria-live="polite" aria-busy={isLoading}>
          {isLoading ? (
            [0, 1, 2, 3].map((item) => <div key={item} className="h-64 animate-pulse rounded-3xl bg-[#F1ECE2]" />)
          ) : coupons.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-[#DED6C8] bg-[#FFFDF8] px-6 py-16 text-center">
              <TicketPercent className="mx-auto h-11 w-11 text-[#DED6C8]" aria-hidden="true" />
              <h2 className="font-serif-luxury mt-4 text-xl font-bold">No {status.toLowerCase()} coupons</h2>
              <p className="mt-1 text-sm text-[#6F6A61]">Birthday and special campaign rewards will appear here.</p>
            </div>
          ) : (
            coupons.map((coupon) => {
              const linkedOrderId = orderId(coupon);
              const displayCode = couponDisplayCode(coupon);
              return (
                <article key={coupon._id} className="relative overflow-hidden rounded-3xl border border-[#DED6C8] bg-[#FFFDF8] shadow-sm">
                  <div className="absolute inset-y-0 left-0 w-1.5 bg-[#B58A3A]" />
                  <div className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B58A3A]">Elite Library Reward</p>
                        <h2 className="font-serif-luxury mt-1 text-xl font-bold">{dealName(coupon)}</h2>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${coupon.status === "ACTIVE" ? "bg-[#E8F5E9] text-[#2E7D32]" : coupon.status === "USED" ? "bg-[#F1ECE2] text-[#4A3628]" : "bg-[#F4ECE8] text-[#8C2D19]"}`}>
                        {coupon.status}
                      </span>
                    </div>

                    <p className="font-serif-luxury mt-5 text-4xl font-bold text-[#4A3628]">{discountLabel(coupon)}</p>

                    <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-dashed border-[#B58A3A]/60 bg-[#F8F5EF] p-3">
                      <code className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-sm font-bold tracking-wider text-[#26231F]" title={displayCode}>{displayCode}</code>
                      <button
                        type="button"
                        onClick={() => void copyCode(displayCode)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#4A3628] px-3 py-2 text-[11px] font-bold text-[#FFFDF8]"
                        aria-label={`Copy coupon code ${displayCode}`}
                      >
                        {copiedCode === displayCode ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                        {copiedCode === displayCode ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <dl className="mt-4 grid grid-cols-1 gap-2 text-xs text-[#6F6A61] sm:grid-cols-2">
                      <div><dt className="inline">Valid until: </dt><dd className="inline font-semibold text-[#26231F]">{new Date(coupon.expiresAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</dd></div>
                      {coupon.minimumOrderAmount > 0 && <div><dt className="inline">Minimum order: </dt><dd className="inline font-semibold text-[#26231F]">Rs. {coupon.minimumOrderAmount.toLocaleString()}</dd></div>}
                      {coupon.maximumDiscountAmount && <div><dt className="inline">Maximum discount: </dt><dd className="inline font-semibold text-[#26231F]">Rs. {coupon.maximumDiscountAmount.toLocaleString()}</dd></div>}
                      {coupon.usedAt && <div><dt className="inline">Used on: </dt><dd className="inline font-semibold text-[#26231F]">{new Date(coupon.usedAt).toLocaleDateString()}</dd></div>}
                    </dl>

                    <div className="mt-5 flex flex-wrap gap-3">
                      {coupon.status === "ACTIVE" && (
                        <Link href="/books" className="inline-flex items-center gap-2 rounded-xl bg-[#B58A3A] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#9E7730]">
                          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                          Shop Now
                        </Link>
                      )}
                      {coupon.status === "USED" && linkedOrderId && (
                        <Link href={`/orders/${linkedOrderId}`} className="rounded-xl border border-[#DED6C8] bg-[#F8F5EF] px-4 py-2.5 text-xs font-bold text-[#4A3628] hover:border-[#B58A3A]/50">
                          View Order
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {!isLoading && pages > 1 && (
          <nav aria-label="Coupon pages" className="mt-8 flex items-center justify-center gap-3">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-xl border border-[#DED6C8] bg-[#FFFDF8] p-2.5 text-[#4A3628] disabled:opacity-40" aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="text-xs font-semibold text-[#6F6A61]">Page {page} of {pages}</span>
            <button type="button" onClick={() => setPage((current) => Math.min(pages, current + 1))} disabled={page === pages} className="rounded-xl border border-[#DED6C8] bg-[#FFFDF8] p-2.5 text-[#4A3628] disabled:opacity-40" aria-label="Next page">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        )}
      </main>
      <Footer />
    </div>
  );
}
