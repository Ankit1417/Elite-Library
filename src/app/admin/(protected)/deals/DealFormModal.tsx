"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  BellRing,
  CalendarDays,
  Gift,
  Percent,
  Save,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import type { Deal, DealType, DiscountType } from "./types";

interface DealFormModalProps {
  deal?: Deal | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface DealFormState {
  name: string;
  type: DealType;
  description: string;
  couponCodePrefix: string;
  discountType: DiscountType;
  discountValue: string;
  minimumOrderAmount: string;
  maximumDiscountAmount: string;
  birthdayValidityDays: string;
  usageLimit: string;
  usageLimitPerUser: string;
  notificationTitle: string;
  notificationMessage: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

const inputClass =
  "w-full rounded-xl border border-[#DED6CA] bg-[#FBF8F2] px-3.5 py-2.5 text-sm text-[#27231F] outline-none transition placeholder:text-[#A39A8D] focus:border-[#B58A3A] focus:ring-2 focus:ring-[#B58A3A]/10";
const labelClass = "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#716A61]";

function toDateTimeInput(value: string | Date): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function createInitialState(deal?: Deal | null): DealFormState {
  if (deal) {
    return {
      name: deal.name,
      type: deal.type,
      description: deal.description || "",
      couponCodePrefix: deal.couponCodePrefix,
      discountType: deal.discountType,
      discountValue: String(deal.discountValue),
      minimumOrderAmount: deal.minimumOrderAmount ? String(deal.minimumOrderAmount) : "",
      maximumDiscountAmount: deal.maximumDiscountAmount
        ? String(deal.maximumDiscountAmount)
        : "",
      birthdayValidityDays: deal.birthdayValidityDays
        ? String(deal.birthdayValidityDays)
        : "7",
      usageLimit: deal.usageLimit ? String(deal.usageLimit) : "",
      usageLimitPerUser: String(deal.usageLimitPerUser || 1),
      notificationTitle: deal.notificationTitle || "",
      notificationMessage: deal.notificationMessage || "",
      validFrom: toDateTimeInput(deal.validFrom),
      validUntil: toDateTimeInput(deal.validUntil),
      isActive: deal.isActive,
    };
  }

  const start = new Date();
  start.setMinutes(0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 30);

  return {
    name: "",
    type: "GENERAL",
    description: "",
    couponCodePrefix: "",
    discountType: "PERCENTAGE",
    discountValue: "10",
    minimumOrderAmount: "",
    maximumDiscountAmount: "",
    birthdayValidityDays: "7",
    usageLimit: "",
    usageLimitPerUser: "1",
    notificationTitle: "",
    notificationMessage: "",
    validFrom: toDateTimeInput(start),
    validUntil: toDateTimeInput(end),
    isActive: true,
  };
}

function optionalNumber(value: string): number | undefined {
  return value.trim() === "" ? undefined : Number(value);
}

function formatRupees(value: number): string {
  return `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)}`;
}

export default function DealFormModal({ deal, onClose, onSaved }: DealFormModalProps) {
  const [form, setForm] = useState<DealFormState>(() => createInitialState(deal));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose]);

  const updateField = <K extends keyof DealFormState>(field: K, value: DealFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return "Deal name is required.";
    if (!form.couponCodePrefix.trim()) return "Coupon prefix is required.";
    if (!form.validFrom || !form.validUntil) return "Start and end dates are required.";
    if (new Date(form.validFrom) >= new Date(form.validUntil)) {
      return "The end date must be later than the start date.";
    }

    const discount = Number(form.discountValue);
    if (!Number.isFinite(discount) || discount <= 0) return "Enter a discount greater than zero.";
    if (form.discountType === "PERCENTAGE" && discount > 100) {
      return "Percentage discounts cannot exceed 100%.";
    }

    const minimumOrder = optionalNumber(form.minimumOrderAmount);
    const maximumDiscount = optionalNumber(form.maximumDiscountAmount);
    if (minimumOrder !== undefined && minimumOrder < 0) return "Minimum order cannot be negative.";
    if (maximumDiscount !== undefined && maximumDiscount < 0) {
      return "Maximum discount cannot be negative.";
    }

    if (form.type === "BIRTHDAY" && Number(form.birthdayValidityDays) < 1) {
      return "Birthday coupon validity must be at least one day.";
    }

    if (form.usageLimit && Number(form.usageLimit) < 1) return "Usage limit must be at least one.";
    if (!Number.isInteger(Number(form.usageLimitPerUser)) || Number(form.usageLimitPerUser) < 1) {
      return "Usage per customer must be a whole number of at least one.";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim() || null,
      couponCodePrefix: form.couponCodePrefix.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minimumOrderAmount: optionalNumber(form.minimumOrderAmount) ?? 0,
      maximumDiscountAmount: optionalNumber(form.maximumDiscountAmount) ?? null,
      birthdayValidityDays:
        form.type === "BIRTHDAY" ? Number(form.birthdayValidityDays) : null,
      usageLimit: optionalNumber(form.usageLimit) ?? null,
      usageLimitPerUser: Number(form.usageLimitPerUser),
      notificationTitle: form.notificationTitle.trim() || null,
      notificationMessage: form.notificationMessage.trim() || null,
      validFrom: new Date(form.validFrom).toISOString(),
      validUntil: new Date(form.validUntil).toISOString(),
      isActive: form.isActive,
    };

    try {
      setIsSubmitting(true);
      const response = await fetchApi<Deal>(deal ? `/admin/deals/${deal._id}` : "/admin/deals", {
        method: deal ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      if (!response.success) throw new Error(response.message || "Unable to save this deal.");
      onSaved(deal ? "Deal updated successfully." : "Deal created successfully.");
    } catch (submissionError: unknown) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to save this deal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const discountValue = Number(form.discountValue) || 0;
  const maximumDiscount = optionalNumber(form.maximumDiscountAmount);
  const minimumOrder = optionalNumber(form.minimumOrderAmount) || 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#17120F]/70 px-3 py-5 backdrop-blur-sm sm:px-6 sm:py-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deal-form-title"
    >
      <div className="w-full max-w-6xl overflow-hidden rounded-[28px] border border-[#D5C7B2] bg-[#FFFDF9] shadow-2xl shadow-black/30">
        <div className="flex items-start justify-between border-b border-[#DED6CA] bg-gradient-to-r from-[#241C17] via-[#30251E] to-[#3D2C20] px-6 py-5 text-[#FFFDF9] sm:px-8">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[#D3A951]/25 bg-[#D3A951]/10">
              <Tag className="h-5 w-5 text-[#D3A951]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#D3A951]">
                Campaign Studio
              </p>
              <h2 id="deal-form-title" className="mt-1 font-serif-luxury text-2xl font-bold">
                {deal ? "Edit Deal" : "Create a New Deal"}
              </h2>
              <p className="mt-1 text-xs text-[#C9BFB5]">
                Configure the offer, redemption rules, and customer message.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-white/10 p-2 text-[#C9BFB5] transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Close deal form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-7 p-6 sm:p-8">
              {error && (
                <div className="rounded-xl border border-[#B42318]/20 bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]" role="alert">
                  {error}
                </div>
              )}

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#B58A3A]" />
                  <h3 className="font-serif-luxury text-lg font-bold text-[#27231F]">Campaign identity</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="deal-name" className={labelClass}>Deal Name *</label>
                    <input
                      id="deal-name"
                      required
                      value={form.name}
                      onChange={(event) => updateField("name", event.target.value)}
                      placeholder="Birthday Book Bonanza"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="deal-type" className={labelClass}>Deal Type *</label>
                    <select
                      id="deal-type"
                      value={form.type}
                      onChange={(event) => updateField("type", event.target.value as DealType)}
                      className={inputClass}
                    >
                      <option value="GENERAL">General</option>
                      <option value="BIRTHDAY">Birthday</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="deal-description" className={labelClass}>Description</label>
                    <textarea
                      id="deal-description"
                      rows={3}
                      value={form.description}
                      onChange={(event) => updateField("description", event.target.value)}
                      placeholder="A concise internal description of this campaign."
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <section className="border-t border-[#E7E0D5] pt-6">
                <div className="mb-4 flex items-center gap-2">
                  <Percent className="h-4 w-4 text-[#B58A3A]" />
                  <h3 className="font-serif-luxury text-lg font-bold text-[#27231F]">Offer rules</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label htmlFor="coupon-prefix" className={labelClass}>Coupon Prefix *</label>
                    <input
                      id="coupon-prefix"
                      required
                      value={form.couponCodePrefix}
                      onChange={(event) =>
                        updateField(
                          "couponCodePrefix",
                          event.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "")
                        )
                      }
                      placeholder="BDAY20"
                      className={`${inputClass} font-mono uppercase tracking-wider`}
                    />
                  </div>
                  <div>
                    <label htmlFor="discount-type" className={labelClass}>Discount Type *</label>
                    <select
                      id="discount-type"
                      value={form.discountType}
                      onChange={(event) =>
                        updateField("discountType", event.target.value as DiscountType)
                      }
                      className={inputClass}
                    >
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="FIXED_AMOUNT">Fixed amount</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="discount-value" className={labelClass}>Discount Value *</label>
                    <input
                      id="discount-value"
                      type="number"
                      min="0.01"
                      max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                      step="0.01"
                      required
                      value={form.discountValue}
                      onChange={(event) => updateField("discountValue", event.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="minimum-order" className={labelClass}>Minimum Order</label>
                    <input
                      id="minimum-order"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.minimumOrderAmount}
                      onChange={(event) => updateField("minimumOrderAmount", event.target.value)}
                      placeholder="No minimum"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="maximum-discount" className={labelClass}>Maximum Discount</label>
                    <input
                      id="maximum-discount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.maximumDiscountAmount}
                      onChange={(event) => updateField("maximumDiscountAmount", event.target.value)}
                      placeholder="No cap"
                      className={inputClass}
                    />
                  </div>
                  {form.type === "BIRTHDAY" && (
                    <div>
                      <label htmlFor="birthday-validity" className={labelClass}>Birthday Validity Days *</label>
                      <input
                        id="birthday-validity"
                        type="number"
                        min="1"
                        max="365"
                        required
                        value={form.birthdayValidityDays}
                        onChange={(event) => updateField("birthdayValidityDays", event.target.value)}
                        className={inputClass}
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="usage-limit" className={labelClass}>Total Usage Limit</label>
                    <input
                      id="usage-limit"
                      type="number"
                      min="1"
                      step="1"
                      value={form.usageLimit}
                      onChange={(event) => updateField("usageLimit", event.target.value)}
                      placeholder="Unlimited"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="usage-per-user" className={labelClass}>Usage Per Customer *</label>
                    <input
                      id="usage-per-user"
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={form.usageLimitPerUser}
                      onChange={(event) => updateField("usageLimitPerUser", event.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <section className="border-t border-[#E7E0D5] pt-6">
                <div className="mb-4 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#B58A3A]" />
                  <h3 className="font-serif-luxury text-lg font-bold text-[#27231F]">Schedule</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="valid-from" className={labelClass}>Start Date *</label>
                    <input
                      id="valid-from"
                      type="datetime-local"
                      required
                      value={form.validFrom}
                      onChange={(event) => updateField("validFrom", event.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="valid-until" className={labelClass}>End Date *</label>
                    <input
                      id="valid-until"
                      type="datetime-local"
                      required
                      value={form.validUntil}
                      onChange={(event) => updateField("validUntil", event.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <section className="border-t border-[#E7E0D5] pt-6">
                <div className="mb-4 flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-[#B58A3A]" />
                  <h3 className="font-serif-luxury text-lg font-bold text-[#27231F]">Customer notification</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="notification-title" className={labelClass}>Notification Title</label>
                    <input
                      id="notification-title"
                      value={form.notificationTitle}
                      onChange={(event) => updateField("notificationTitle", event.target.value)}
                      placeholder="A special gift is waiting"
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="notification-message" className={labelClass}>Notification Message</label>
                    <textarea
                      id="notification-message"
                      rows={3}
                      value={form.notificationMessage}
                      onChange={(event) => updateField("notificationMessage", event.target.value)}
                      placeholder="Tell customers what makes this offer special."
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>
            </div>

            <aside className="border-t border-[#DED6CA] bg-[#F6F2EA] p-6 lg:border-l lg:border-t-0 sm:p-8">
              <div className="sticky top-6 space-y-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B6B3A]">Live preview</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#716A61]">
                    A customer-facing snapshot of the offer.
                  </p>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-[#CDBEAA] bg-[#2A211B] p-5 text-[#FFFDF9] shadow-xl shadow-[#493523]/15">
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-[#D3A951]/20" />
                  <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-[#D3A951]/10" />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-[#D3A951]/25 bg-[#D3A951]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#E3BD70]">
                        {form.type === "BIRTHDAY" ? "Birthday reward" : "Elite offer"}
                      </span>
                      {form.type === "BIRTHDAY" ? (
                        <Gift className="h-5 w-5 text-[#D3A951]" />
                      ) : (
                        <Tag className="h-5 w-5 text-[#D3A951]" />
                      )}
                    </div>
                    <h4 className="mt-5 font-serif-luxury text-xl font-bold">
                      {form.name.trim() || "Your campaign name"}
                    </h4>
                    <div className="mt-3 text-4xl font-black tracking-tight text-[#E3BD70]">
                      {form.discountType === "PERCENTAGE"
                        ? `${discountValue || 0}% OFF`
                        : `${formatRupees(discountValue || 0)} OFF`}
                    </div>
                    <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
                      <p className="text-[9px] uppercase tracking-[0.16em] text-[#9E9389]">Coupon prefix</p>
                      <p className="mt-1 font-mono text-base font-bold tracking-[0.14em] text-[#FFFDF9]">
                        {form.couponCodePrefix || "ELITE"}
                        {form.type === "BIRTHDAY" && "-XXXXXX"}
                      </p>
                    </div>
                    <div className="mt-4 space-y-1.5 text-[11px] text-[#C9BFB5]">
                      <p>{minimumOrder > 0 ? `Minimum order ${formatRupees(minimumOrder)}` : "No minimum order"}</p>
                      <p>{maximumDiscount !== undefined ? `Maximum discount ${formatRupees(maximumDiscount)}` : "No discount cap"}</p>
                      {form.type === "BIRTHDAY" && <p>Valid for {form.birthdayValidityDays || 0} days after issue</p>}
                    </div>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#D8CEBF] bg-[#FFFDF9] p-4">
                  <span>
                    <span className="block text-sm font-bold text-[#27231F]">Campaign active</span>
                    <span className="mt-0.5 block text-[11px] text-[#716A61]">Eligible coupons can be issued and redeemed.</span>
                  </span>
                  <span className="relative inline-flex h-6 w-11 shrink-0">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) => updateField("isActive", event.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="absolute inset-0 rounded-full bg-[#CFC6B9] transition peer-checked:bg-[#8B6B3A]" />
                    <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                  </span>
                </label>
              </div>
            </aside>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#DED6CA] bg-[#FFFDF9] px-6 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-[#D8CEBF] px-5 py-2.5 text-sm font-bold text-[#716A61] transition hover:bg-[#F6F2EA] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A3628] px-6 py-2.5 text-sm font-bold text-[#FFFDF9] shadow-lg shadow-[#4A3628]/15 transition hover:bg-[#352D27] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : deal ? "Save Changes" : "Create Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
