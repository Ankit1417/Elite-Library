"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CakeSlice, X } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/authContext";

const PROMPT_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

function wasDismissedRecently(value?: string | null) {
  if (!value) return false;
  const dismissedAt = Date.parse(value);
  return Number.isFinite(dismissedAt) && Date.now() - dismissedAt < PROMPT_COOLDOWN_MS;
}

export default function BirthdayRewardsPrompt() {
  const pathname = usePathname();
  const { customer, isAuthenticated, refreshAuth } = useAuth();
  const [dismissedCustomerId, setDismissedCustomerId] = useState<string | null>(null);
  const [isDismissing, setIsDismissing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shouldHide =
    pathname === "/account" ||
    !isAuthenticated ||
    !customer ||
    Boolean(customer.dateOfBirth) ||
    dismissedCustomerId === customer.id ||
    wasDismissedRecently(customer.birthdayPromptDismissedAt);

  if (shouldHide) return null;

  const dismissPrompt = async () => {
    setIsDismissing(true);
    setError(null);

    try {
      await fetchApi("/auth/birthday-prompt/dismiss", { method: "PATCH" });
      setDismissedCustomerId(customer.id);
      await refreshAuth();
    } catch (dismissError) {
      setError(
        dismissError instanceof Error
          ? dismissError.message
          : "We could not save your choice. Please try again."
      );
    } finally {
      setIsDismissing(false);
    }
  };

  return (
    <aside
      aria-label="Birthday rewards reminder"
      className="fixed right-4 top-[104px] z-30 w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-2xl border border-[#B58A3A]/35 bg-[#FFFDF8] shadow-[0_18px_50px_rgba(43,31,22,0.18)] sm:right-6"
    >
      <div className="flex gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1ECE2] text-[#B58A3A]">
          <CakeSlice className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-serif-luxury text-base font-bold text-[#211C18]">
            Your birthday deserves a new book.
          </p>
          <p className="mt-1 text-xs leading-5 text-[#68615B]">
            Add your birthday and receive a special Elite Library birthday offer.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link
              href="/account#birthday-rewards"
              className="rounded-lg bg-[#4A3628] px-3.5 py-2 text-xs font-bold text-[#FFFDF8] transition-colors hover:bg-[#352D27] focus:outline-none focus:ring-2 focus:ring-[#B58A3A] focus:ring-offset-2"
            >
              Add Birthday
            </Link>
            <button
              type="button"
              onClick={dismissPrompt}
              disabled={isDismissing}
              className="text-xs font-semibold text-[#68615B] transition-colors hover:text-[#4A3628] disabled:cursor-wait disabled:opacity-60"
            >
              {isDismissing ? "Saving..." : "Maybe Later"}
            </button>
          </div>

          {error && (
            <p className="mt-2 text-[11px] leading-4 text-[#8C2D19]" role="alert">
              {error}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={dismissPrompt}
          disabled={isDismissing}
          aria-label="Dismiss birthday reminder"
          className="h-7 w-7 shrink-0 rounded-lg text-[#68615B] transition-colors hover:bg-[#F1ECE2] hover:text-[#211C18] disabled:opacity-50"
        >
          <X className="mx-auto h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
