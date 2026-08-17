"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Banknote,
  BellRing,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Gift,
  LoaderCircle,
  ReceiptText,
  Tag,
  TicketCheck,
  TicketX,
  Users,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import type {
  CouponCustomer,
  CouponOrder,
  CouponStatus,
  Deal,
  DealAnalytics,
  IssuedCoupon,
  IssuedCouponsResponse,
} from "../types";

type CouponFilter = "ALL" | CouponStatus;

function formatDate(value?: string, includeTime = false): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function formatRupees(value = 0): string {
  return `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)}`;
}

function formatDiscount(deal: Deal): string {
  return deal.discountType === "PERCENTAGE"
    ? `${deal.discountValue}% off`
    : `${formatRupees(deal.discountValue)} off`;
}

function getCustomer(value: IssuedCoupon["userId"]): CouponCustomer | null {
  return typeof value === "string" ? null : value;
}

function getOrder(value: IssuedCoupon["usedOrderId"]): CouponOrder | null {
  return !value || typeof value === "string" ? null : value;
}

function getOrderId(value: IssuedCoupon["usedOrderId"]): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value._id;
}

const couponStatusStyles: Record<CouponStatus, string> = {
  ACTIVE: "border-[#4E7A59]/20 bg-[#EEF7F0] text-[#356442]",
  USED: "border-[#526C91]/20 bg-[#EDF2F8] text-[#405A7E]",
  EXPIRED: "border-[#B7772B]/20 bg-[#FFF5E7] text-[#99601F]",
  REVOKED: "border-[#C75B4A]/20 bg-[#FFF2EF] text-[#A43D30]",
};

export default function AdminDealDetailsPage() {
  const params = useParams<{ id: string }>();
  const dealId = params.id;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [analytics, setAnalytics] = useState<DealAnalytics | null>(null);
  const [coupons, setCoupons] = useState<IssuedCoupon[]>([]);
  const [couponTotal, setCouponTotal] = useState(0);
  const [couponPages, setCouponPages] = useState(1);
  const [couponPage, setCouponPage] = useState(1);
  const [couponFilter, setCouponFilter] = useState<CouponFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [currentTimestamp] = useState(() => Date.now());

  useEffect(() => {
    if (!dealId) return;
    let isCurrentRequest = true;

    const couponQuery = new URLSearchParams({ page: String(couponPage), limit: "15" });
    if (couponFilter !== "ALL") couponQuery.set("status", couponFilter);

    Promise.all([
        fetchApi<Deal>(`/admin/deals/${encodeURIComponent(dealId)}`),
        fetchApi<DealAnalytics>(`/admin/deals/${encodeURIComponent(dealId)}/analytics`),
        fetchApi<IssuedCouponsResponse>(
          `/admin/deals/${encodeURIComponent(dealId)}/coupons?${couponQuery.toString()}`
        ),
      ])
      .then(([dealResponse, analyticsResponse, couponsResponse]) => {
        if (!isCurrentRequest) return;
        if (!dealResponse.success) throw new Error(dealResponse.message || "Deal not found.");
        if (!analyticsResponse.success) {
          throw new Error(analyticsResponse.message || "Unable to load deal analytics.");
        }
        if (!couponsResponse.success) {
          throw new Error(couponsResponse.message || "Unable to load issued coupons.");
        }

        setDeal(dealResponse.data);
        setAnalytics(analyticsResponse.data);
        setCoupons(couponsResponse.data.coupons || []);
        setCouponTotal(couponsResponse.data.total || 0);
        setCouponPages(Math.max(1, couponsResponse.data.pages || 1));
      })
      .catch((loadError: unknown) => {
        if (!isCurrentRequest) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load deal details.");
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [couponFilter, couponPage, dealId, refreshVersion]);

  const retryLoad = () => {
    setIsLoading(true);
    setError(null);
    setRefreshVersion((current) => current + 1);
  };

  if (isLoading && !deal) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#B58A3A]" />
          <p className="mt-3 text-sm font-semibold text-[#716A61]">Loading campaign intelligence...</p>
        </div>
      </div>
    );
  }

  if (error && !deal) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-[#C75B4A]/20 bg-[#FFFDF9] p-8 text-center shadow-sm">
        <TicketX className="mx-auto h-9 w-9 text-[#A43D30]" />
        <h2 className="mt-4 font-serif-luxury text-2xl font-bold text-[#27231F]">Couldn’t open this deal</h2>
        <p className="mt-2 text-sm text-[#716A61]">{error}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/admin/deals" className="rounded-xl border border-[#DED6CA] px-4 py-2.5 text-xs font-bold text-[#5D554C] hover:bg-[#F6F2EA]">
            Back to Deals
          </Link>
          <button type="button" onClick={retryLoad} className="rounded-xl bg-[#4A3628] px-4 py-2.5 text-xs font-bold text-[#FFFDF9]">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!deal || !analytics) return null;

  const startsAt = new Date(deal.validFrom).getTime();
  const endsAt = new Date(deal.validUntil).getTime();
  const lifecycle = !deal.isActive
    ? "Disabled"
    : currentTimestamp < startsAt
      ? "Scheduled"
      : currentTimestamp > endsAt
        ? "Expired"
        : "Active";
  const lifecycleClass =
    lifecycle === "Active"
      ? "border-[#4E7A59]/25 bg-[#EEF7F0] text-[#356442]"
      : lifecycle === "Scheduled"
        ? "border-[#B58A3A]/25 bg-[#FFF8E8] text-[#8B6B3A]"
        : lifecycle === "Expired"
          ? "border-[#C75B4A]/20 bg-[#FFF2EF] text-[#A43D30]"
          : "border-[#D8CEBF] bg-[#F6F2EA] text-[#716A61]";

  const metrics = [
    {
      label: "Coupons Issued",
      value: analytics.coupons.issued,
      helper: "All customer coupons",
      icon: TicketCheck,
      accent: "bg-[#F8EFD9] text-[#8B6B3A]",
    },
    {
      label: "Coupons Used",
      value: analytics.coupons.used,
      helper: "Completed redemptions",
      icon: CheckCircle2,
      accent: "bg-[#EAF4EC] text-[#356442]",
    },
    {
      label: "Unused",
      value: analytics.coupons.unused,
      helper: "Still available",
      icon: Clock3,
      accent: "bg-[#EDF2F8] text-[#405A7E]",
    },
    {
      label: "Expired",
      value: analytics.coupons.expired,
      helper: "Past validity",
      icon: TicketX,
      accent: "bg-[#FFF2EF] text-[#A43D30]",
    },
    {
      label: "Coupon Revenue",
      value: formatRupees(analytics.orders?.revenue || 0),
      helper: "Order value generated",
      icon: Banknote,
      accent: "bg-[#F2EDF7] text-[#70548A]",
    },
    {
      label: "Discount Given",
      value: formatRupees(analytics.orders?.totalDiscount || 0),
      helper: "Customer savings",
      icon: CircleDollarSign,
      accent: "bg-[#F7ECF2] text-[#8B5571]",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin/deals" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#716A61] transition hover:text-[#8B6B3A]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Deals
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${lifecycleClass}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {lifecycle}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DED6CA] bg-[#FFFDF9] px-2.5 py-1 text-[10px] font-bold text-[#5D554C]">
              {deal.type === "BIRTHDAY" ? <Gift className="h-3 w-3 text-[#8B5571]" /> : <Tag className="h-3 w-3 text-[#8B6B3A]" />}
              {deal.type === "BIRTHDAY" ? "Birthday campaign" : "General campaign"}
            </span>
          </div>
          <h2 className="mt-2 font-serif-luxury text-3xl font-bold tracking-tight text-[#27231F]">{deal.name}</h2>
          <p className="mt-1 max-w-2xl text-sm text-[#716A61]">{deal.description || "No campaign description has been added."}</p>
        </div>
        <div className="rounded-xl border border-[#D8CEBF] bg-[#FFFDF9] px-4 py-3 text-right shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8A8178]">Coupon family</p>
          <p className="mt-1 font-mono text-base font-black tracking-[0.12em] text-[#4A3628]">
            {deal.couponCodePrefix}{deal.type === "BIRTHDAY" ? "-XXXXXX" : ""}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[#B42318]/20 bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]" role="alert">
          {error}
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-2xl border border-[#DED6CA] bg-[#FFFDF9] p-4 shadow-sm shadow-[#3A2D24]/[0.03]">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${metric.accent}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-4 truncate text-2xl font-black tracking-tight text-[#27231F]">{metric.value}</p>
              <p className="mt-1 text-xs font-bold text-[#4F4942]">{metric.label}</p>
              <p className="mt-0.5 text-[10px] text-[#8A8178]">{metric.helper}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <div className="overflow-hidden rounded-2xl border border-[#392C24] bg-[#241D18] text-[#FFFDF9] shadow-lg shadow-[#352D27]/10">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-7">
            <div className="max-w-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D3A951]">Offer configuration</p>
              <div className="mt-3 flex items-end gap-3">
                <p className="font-serif-luxury text-4xl font-black text-[#E3BD70]">{formatDiscount(deal)}</p>
                <span className="pb-1 text-xs text-[#AFA49A]">
                  {deal.usageLimit ? `${deal.usageLimit} total uses` : "Unlimited uses"}
                </span>
              </div>
              <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                <DetailItem label="Minimum order" value={deal.minimumOrderAmount ? formatRupees(deal.minimumOrderAmount) : "No minimum"} />
                <DetailItem label="Maximum discount" value={deal.maximumDiscountAmount ? formatRupees(deal.maximumDiscountAmount) : "No cap"} />
                <DetailItem label="Usage per customer" value={`${deal.usageLimitPerUser || 1} time${(deal.usageLimitPerUser || 1) === 1 ? "" : "s"}`} />
                {deal.type === "BIRTHDAY" && (
                  <DetailItem label="Coupon lifetime" value={`${deal.birthdayValidityDays || 0} days after issue`} />
                )}
              </div>
            </div>
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#D3A951]/20 bg-[#D3A951]/10">
              <BadgePercent className="h-9 w-9 text-[#D3A951]" />
            </div>
          </div>
          <div className="grid border-t border-white/10 sm:grid-cols-2">
            <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4 sm:border-b-0 sm:border-r">
              <CalendarDays className="h-4 w-4 text-[#D3A951]" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8F847B]">Starts</p>
                <p className="mt-0.5 text-xs font-semibold text-[#E7DFD8]">{formatDate(deal.validFrom, true)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4">
              <CalendarDays className="h-4 w-4 text-[#D3A951]" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8F847B]">Ends</p>
                <p className="mt-0.5 text-xs font-semibold text-[#E7DFD8]">{formatDate(deal.validUntil, true)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#DED6CA] bg-[#FFFDF9] p-6">
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-[#B58A3A]" />
            <h3 className="font-serif-luxury text-lg font-bold text-[#27231F]">Customer message</h3>
          </div>
          {deal.notificationTitle || deal.notificationMessage ? (
            <div className="mt-5 rounded-2xl border border-[#E0D6C7] bg-[#F9F5ED] p-4">
              <p className="text-sm font-bold text-[#27231F]">
                {deal.notificationTitle || "A special Elite Library offer"}
              </p>
              <p className="mt-2 text-xs leading-5 text-[#716A61]">
                {deal.notificationMessage || "Customers will receive the default campaign message."}
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-[#D8CEBF] bg-[#FBF8F2] p-5 text-center">
              <BellRing className="mx-auto h-5 w-5 text-[#AAA095]" />
              <p className="mt-2 text-xs font-semibold text-[#716A61]">Default notification copy will be used.</p>
            </div>
          )}
          <div className="mt-5 flex items-center gap-2 border-t border-[#E7E0D5] pt-4 text-[11px] text-[#8A8178]">
            <ReceiptText className="h-3.5 w-3.5 text-[#B58A3A]" />
            Campaign created {formatDate(deal.createdAt)}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#DED6CA] bg-[#FFFDF9]">
        <div className="flex flex-col gap-3 border-b border-[#DED6CA] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8EFD9] text-[#8B6B3A]">
              <Users className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-[#27231F]">Issued customers</h3>
              <p className="text-[11px] text-[#716A61]">{couponTotal} coupon{couponTotal === 1 ? "" : "s"} in this view</p>
            </div>
          </div>
          <select
            value={couponFilter}
            onChange={(event) => {
              setIsLoading(true);
              setError(null);
              setCouponFilter(event.target.value as CouponFilter);
              setCouponPage(1);
            }}
            className="rounded-xl border border-[#DED6CA] bg-[#F9F6F0] px-3.5 py-2.5 text-xs font-semibold text-[#5D554C] outline-none focus:border-[#B58A3A]"
            aria-label="Filter issued coupons by status"
          >
            <option value="ALL">All coupon statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="USED">Used</option>
            <option value="EXPIRED">Expired</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="border-b border-[#DED6CA] bg-[#F6F2EA]">
              <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#716A61]">
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Coupon</th>
                <th className="px-4 py-3.5">Issued</th>
                <th className="px-4 py-3.5">Expires</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E0D5]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <LoaderCircle className="mx-auto h-5 w-5 animate-spin text-[#B58A3A]" />
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <TicketCheck className="mx-auto h-7 w-7 text-[#B7ACA0]" />
                    <p className="mt-3 font-serif-luxury text-lg font-bold text-[#27231F]">No issued coupons</p>
                    <p className="mt-1 text-xs text-[#716A61]">
                      {couponFilter === "ALL" ? "Coupons will appear here after they are issued." : "No coupons match this status."}
                    </p>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const customer = getCustomer(coupon.userId);
                  const order = getOrder(coupon.usedOrderId);
                  const orderId = getOrderId(coupon.usedOrderId);
                  return (
                    <tr key={coupon._id} className="transition hover:bg-[#FBF8F2]">
                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-[#27231F]">{customer?.name || "Customer"}</p>
                        <p className="mt-0.5 text-[10px] text-[#8A8178]">{customer?.email || customer?.phone || "Account details unavailable"}</p>
                      </td>
                      <td className="px-4 py-4">
                        <code className="rounded-lg border border-[#E0D6C7] bg-[#F6F2EA] px-2.5 py-1.5 text-[11px] font-bold tracking-[0.08em] text-[#4A3628]">
                          {coupon.displayCode || coupon.code}
                        </code>
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold text-[#5D554C]">{formatDate(coupon.issuedAt)}</td>
                      <td className="px-4 py-4 text-xs font-semibold text-[#5D554C]">{formatDate(coupon.expiresAt)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${couponStatusStyles[coupon.status]}`}>
                          {coupon.status.charAt(0) + coupon.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {orderId ? (
                          <Link href={`/admin/orders/${orderId}`} className="text-xs font-bold text-[#8B6B3A] hover:text-[#4A3628] hover:underline">
                            {order?.orderNumber || `View ${orderId.slice(-6).toUpperCase()}`}
                          </Link>
                        ) : (
                          <span className="text-xs text-[#A39A8D]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && couponTotal > 0 && (
          <div className="flex flex-col gap-3 border-t border-[#DED6CA] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#716A61]">
              Page <span className="font-bold text-[#27231F]">{couponPage}</span> of {couponPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setError(null);
                  setCouponPage((current) => Math.max(1, current - 1));
                }}
                disabled={couponPage <= 1}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#DED6CA] px-3 py-2 text-xs font-bold text-[#5D554C] transition hover:bg-[#F6F2EA] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setError(null);
                  setCouponPage((current) => Math.min(couponPages, current + 1));
                }}
                disabled={couponPage >= couponPages}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#DED6CA] px-3 py-2 text-xs font-bold text-[#5D554C] transition hover:bg-[#F6F2EA] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8F847B]">{label}</p>
      <p className="mt-1 text-xs font-semibold text-[#E7DFD8]">{value}</p>
    </div>
  );
}
