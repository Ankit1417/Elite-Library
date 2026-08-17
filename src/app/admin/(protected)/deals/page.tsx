"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  CircleOff,
  Edit3,
  Eye,
  Gift,
  LoaderCircle,
  Percent,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import DealFormModal from "./DealFormModal";
import type { Deal, DealsListResponse, DealType } from "./types";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDiscount(deal: Deal): string {
  if (deal.discountType === "PERCENTAGE") return `${deal.discountValue}%`;
  return `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(deal.discountValue)}`;
}

function getDealStatus(deal: Deal, now: number): {
  label: string;
  className: string;
  dotClassName: string;
} {
  const startsAt = new Date(deal.validFrom).getTime();
  const endsAt = new Date(deal.validUntil).getTime();

  if (!deal.isActive) {
    return {
      label: "Disabled",
      className: "border-[#D8CEBF] bg-[#F6F2EA] text-[#716A61]",
      dotClassName: "bg-[#9A9186]",
    };
  }
  if (Number.isFinite(startsAt) && now < startsAt) {
    return {
      label: "Scheduled",
      className: "border-[#B58A3A]/25 bg-[#FFF8E8] text-[#8B6B3A]",
      dotClassName: "bg-[#B58A3A]",
    };
  }
  if (Number.isFinite(endsAt) && now > endsAt) {
    return {
      label: "Expired",
      className: "border-[#C75B4A]/20 bg-[#FFF2EF] text-[#A43D30]",
      dotClassName: "bg-[#C75B4A]",
    };
  }
  return {
    label: "Active",
    className: "border-[#4E7A59]/20 bg-[#EEF7F0] text-[#356442]",
    dotClassName: "bg-[#4E7A59]",
  };
}

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | DealType>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [busyDealId, setBusyDealId] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [currentTimestamp] = useState(() => Date.now());

  useEffect(() => {
    let isCurrentRequest = true;
    const query = new URLSearchParams({ page: String(page), limit: "12" });
    if (search) query.set("search", search);
    if (typeFilter !== "ALL") query.set("type", typeFilter);
    if (statusFilter !== "ALL") query.set("isActive", String(statusFilter === "ACTIVE"));

    fetchApi<DealsListResponse>(`/admin/deals?${query.toString()}`)
      .then((response) => {
        if (!isCurrentRequest) return;
        if (!response.success) throw new Error(response.message || "Unable to load deals.");
        setDeals(response.data.deals || []);
        setTotal(response.data.total || 0);
        setPages(Math.max(1, response.data.pages || 1));
      })
      .catch((loadError: unknown) => {
        if (!isCurrentRequest) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load deals.");
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [page, refreshVersion, search, statusFilter, typeFilter]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setPage(1);
    setSearch(searchInput.trim());
  };

  const clearSearch = () => {
    setIsLoading(true);
    setError(null);
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const openCreateForm = () => {
    setEditingDeal(null);
    setIsFormOpen(true);
  };

  const openEditForm = (deal: Deal) => {
    setEditingDeal(deal);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingDeal(null);
  };

  const handleSaved = (message: string) => {
    closeForm();
    setFeedback(message);
    setIsLoading(true);
    setError(null);
    setRefreshVersion((current) => current + 1);
  };

  const handleToggleStatus = async (deal: Deal) => {
    try {
      setBusyDealId(deal._id);
      const response = await fetchApi<Deal>(`/admin/deals/${deal._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !deal.isActive }),
      });
      if (!response.success) throw new Error(response.message || "Unable to update campaign status.");
      setFeedback(deal.isActive ? "Deal disabled." : "Deal enabled.");
      setIsLoading(true);
      setError(null);
      setRefreshVersion((current) => current + 1);
    } catch (toggleError: unknown) {
      setError(toggleError instanceof Error ? toggleError.message : "Unable to update campaign status.");
    } finally {
      setBusyDealId(null);
    }
  };

  const handleDelete = async (deal: Deal) => {
    const shouldDelete = window.confirm(
      `Delete “${deal.name}”? Deals with issued coupons will be archived by disabling them instead.`
    );
    if (!shouldDelete) return;

    try {
      setBusyDealId(deal._id);
      const response = await fetchApi<Deal | { message: string }>(`/admin/deals/${deal._id}`, {
        method: "DELETE",
      });
      if (!response.success) throw new Error(response.message || "Unable to delete this deal.");
      setFeedback("Deal deleted or archived successfully.");
      setIsLoading(true);
      setError(null);
      if (deals.length === 1 && page > 1) setPage((current) => current - 1);
      else setRefreshVersion((current) => current + 1);
    } catch (deleteError: unknown) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this deal.");
    } finally {
      setBusyDealId(null);
    }
  };

  const activeOnPage = deals.filter((deal) => getDealStatus(deal, currentTimestamp).label === "Active").length;
  const birthdayOnPage = deals.filter((deal) => deal.type === "BIRTHDAY").length;
  const usageOnPage = deals.reduce((sum, deal) => sum + (deal.usageCount || 0), 0);

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="fixed right-5 top-20 z-50 flex items-center gap-2 rounded-xl border border-[#4E7A59]/20 bg-[#F2FAF3] px-4 py-3 text-sm font-semibold text-[#356442] shadow-lg" role="status">
          <Check className="h-4 w-4" />
          {feedback}
        </div>
      )}

      <section className="relative overflow-hidden rounded-[26px] border border-[#392C24] bg-[#241D18] px-6 py-7 text-[#FFFDF9] shadow-xl shadow-[#352D27]/10 sm:px-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-[#D3A951]/15" />
        <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full bg-[#D3A951]/[0.06]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-[#D3A951]">
              <Tag className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.24em]">Offer Management</span>
            </div>
            <h2 className="font-serif-luxury text-3xl font-bold tracking-tight sm:text-4xl">Deals & campaigns</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#C9BFB5]">
              Create thoughtful promotions, control redemption rules, and follow every issued coupon from one place.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D3A951] px-5 py-3 text-sm font-bold text-[#241D18] shadow-lg shadow-black/15 transition hover:bg-[#E0BA6C]"
          >
            <Plus className="h-4 w-4" />
            Create Deal
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Campaigns found", value: total, icon: Tag, accent: "text-[#8B6B3A] bg-[#F8EFD9]" },
          { label: "Active on this page", value: activeOnPage, icon: Percent, accent: "text-[#356442] bg-[#EAF4EC]" },
          { label: "Birthday campaigns", value: birthdayOnPage, icon: Gift, accent: "text-[#8B5571] bg-[#F7ECF2]" },
          { label: "Recorded uses", value: usageOnPage, icon: CalendarClock, accent: "text-[#4F6687] bg-[#EAF0F7]" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-[#DED6CA] bg-[#FFFDF9] p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.accent}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight text-[#27231F]">{item.value}</p>
                <p className="text-[11px] font-semibold text-[#716A61]">{item.label}</p>
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-[#DED6CA] bg-[#FFFDF9]">
        <div className="flex flex-col gap-3 border-b border-[#DED6CA] p-4 xl:flex-row xl:items-center xl:justify-between">
          <form onSubmit={handleSearch} className="flex w-full max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9186]" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by deal name, description, or coupon..."
                className="w-full rounded-xl border border-[#DED6CA] bg-[#F9F6F0] py-2.5 pl-10 pr-10 text-sm text-[#27231F] outline-none transition focus:border-[#B58A3A] focus:ring-2 focus:ring-[#B58A3A]/10"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#9A9186] hover:bg-[#EEE8DE] hover:text-[#27231F]"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="rounded-xl bg-[#4A3628] px-4 py-2.5 text-xs font-bold text-[#FFFDF9] transition hover:bg-[#352D27]"
            >
              Search
            </button>
          </form>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={typeFilter}
              onChange={(event) => {
                setIsLoading(true);
                setError(null);
                setTypeFilter(event.target.value as "ALL" | DealType);
                setPage(1);
              }}
              className="rounded-xl border border-[#DED6CA] bg-[#F9F6F0] px-3.5 py-2.5 text-xs font-semibold text-[#5D554C] outline-none focus:border-[#B58A3A]"
              aria-label="Filter deals by type"
            >
              <option value="ALL">All types</option>
              <option value="GENERAL">General</option>
              <option value="BIRTHDAY">Birthday</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => {
                setIsLoading(true);
                setError(null);
                setStatusFilter(event.target.value as StatusFilter);
                setPage(1);
              }}
              className="rounded-xl border border-[#DED6CA] bg-[#F9F6F0] px-3.5 py-2.5 text-xs font-semibold text-[#5D554C] outline-none focus:border-[#B58A3A]"
              aria-label="Filter deals by status"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Enabled</option>
              <option value="INACTIVE">Disabled</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="m-4 flex items-center justify-between gap-4 rounded-xl border border-[#B42318]/20 bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]" role="alert">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setError(null);
                setRefreshVersion((current) => current + 1);
              }}
              className="shrink-0 font-bold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left">
            <thead className="border-b border-[#DED6CA] bg-[#F6F2EA]">
              <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#716A61]">
                <th className="px-5 py-3.5">Deal Name</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Coupon</th>
                <th className="px-4 py-3.5">Discount</th>
                <th className="px-4 py-3.5">Validity</th>
                <th className="px-4 py-3.5">Usage</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E0D5]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={8} className="px-5 py-3.5">
                      <div className="h-12 animate-pulse rounded-xl bg-[#F1ECE3]" />
                    </td>
                  </tr>
                ))
              ) : deals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1ECE3] text-[#8B6B3A]">
                      <Tag className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-serif-luxury text-xl font-bold text-[#27231F]">No deals found</h3>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-[#716A61]">
                      {search || typeFilter !== "ALL" || statusFilter !== "ALL"
                        ? "Try changing your search or filters."
                        : "Create your first campaign to begin issuing thoughtful customer offers."}
                    </p>
                    {!search && typeFilter === "ALL" && statusFilter === "ALL" && (
                      <button type="button" onClick={openCreateForm} className="mt-4 text-sm font-bold text-[#8B6B3A] hover:text-[#4A3628]">
                        Create a deal
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                deals.map((deal) => {
                  const status = getDealStatus(deal, currentTimestamp);
                  const used = deal.usageCount || 0;
                  const isBusy = busyDealId === deal._id;
                  return (
                    <tr key={deal._id} className="group transition hover:bg-[#FBF8F2]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${deal.type === "BIRTHDAY" ? "bg-[#F7ECF2] text-[#8B5571]" : "bg-[#F8EFD9] text-[#8B6B3A]"}`}>
                            {deal.type === "BIRTHDAY" ? <Gift className="h-4.5 w-4.5" /> : <Tag className="h-4.5 w-4.5" />}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/admin/deals/${deal._id}`} className="block max-w-[230px] truncate font-serif-luxury text-sm font-bold text-[#27231F] hover:text-[#8B6B3A]">
                              {deal.name}
                            </Link>
                            <p className="mt-0.5 max-w-[230px] truncate text-[11px] text-[#8A8178]">
                              {deal.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DED6CA] bg-[#FFFDF9] px-2.5 py-1 text-[10px] font-bold text-[#5D554C]">
                          {deal.type === "BIRTHDAY" && <Gift className="h-3 w-3 text-[#8B5571]" />}
                          {deal.type === "BIRTHDAY" ? "Birthday" : "General"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <code className="rounded-lg border border-[#E0D6C7] bg-[#F6F2EA] px-2.5 py-1.5 text-[11px] font-bold tracking-[0.08em] text-[#4A3628]">
                          {deal.couponCodePrefix}{deal.type === "BIRTHDAY" ? "-••••••" : ""}
                        </code>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-black text-[#27231F]">{formatDiscount(deal)}</p>
                        <p className="mt-0.5 text-[10px] text-[#8A8178]">
                          {deal.discountType === "PERCENTAGE" ? "Percentage" : "Fixed amount"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-[11px] font-semibold text-[#4F4942]">{formatDate(deal.validFrom)}</p>
                        <p className="mt-0.5 text-[10px] text-[#8A8178]">to {formatDate(deal.validUntil)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs font-bold text-[#27231F]">
                          {used} <span className="font-medium text-[#9A9186]">/ {deal.usageLimit || "∞"}</span>
                        </p>
                        {deal.usageLimit ? (
                          <div className="mt-1.5 h-1.5 w-20 overflow-hidden rounded-full bg-[#EAE3D8]">
                            <div
                              className="h-full rounded-full bg-[#B58A3A]"
                              style={{ width: `${Math.min(100, (used / deal.usageLimit) * 100)}%` }}
                            />
                          </div>
                        ) : (
                          <p className="mt-0.5 text-[10px] text-[#8A8178]">Unlimited</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.className}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dotClassName}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/deals/${deal._id}`}
                            className="rounded-lg p-2 text-[#716A61] transition hover:bg-[#EEE8DE] hover:text-[#4A3628]"
                            title="View analytics"
                            aria-label={`View ${deal.name} analytics`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEditForm(deal)}
                            disabled={isBusy}
                            className="rounded-lg p-2 text-[#716A61] transition hover:bg-[#EEE8DE] hover:text-[#4A3628] disabled:opacity-40"
                            title="Edit deal"
                            aria-label={`Edit ${deal.name}`}
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleToggleStatus(deal)}
                            disabled={isBusy}
                            className={`rounded-lg p-2 transition disabled:opacity-40 ${deal.isActive ? "text-[#B7772B] hover:bg-[#FFF4E3]" : "text-[#356442] hover:bg-[#EEF7F0]"}`}
                            title={deal.isActive ? "Disable deal" : "Enable deal"}
                            aria-label={`${deal.isActive ? "Disable" : "Enable"} ${deal.name}`}
                          >
                            {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : deal.isActive ? <CircleOff className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(deal)}
                            disabled={isBusy}
                            className="rounded-lg p-2 text-[#A43D30] transition hover:bg-[#FFF2EF] disabled:opacity-40"
                            title="Delete or archive deal"
                            aria-label={`Delete or archive ${deal.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && deals.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-[#DED6CA] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#716A61]">
              Page <span className="font-bold text-[#27231F]">{page}</span> of {pages} · {total} campaign{total === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setError(null);
                  setPage((current) => Math.max(1, current - 1));
                }}
                disabled={page <= 1}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#DED6CA] px-3 py-2 text-xs font-bold text-[#5D554C] transition hover:bg-[#F6F2EA] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setError(null);
                  setPage((current) => Math.min(pages, current + 1));
                }}
                disabled={page >= pages}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#DED6CA] px-3 py-2 text-xs font-bold text-[#5D554C] transition hover:bg-[#F6F2EA] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {isFormOpen && (
        <DealFormModal
          key={editingDeal?._id || "new-deal"}
          deal={editingDeal}
          onClose={closeForm}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
