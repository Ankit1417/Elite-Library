"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CakeSlice,
  ChevronRight,
  Gift,
  Heart,
  LogOut,
  Package,
  ShoppingBag,
  User,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchApi } from "@/lib/api";
import { Customer, useAuth } from "@/lib/authContext";
import { useWishlist } from "@/lib/wishlistContext";
import { useCart } from "@/lib/cartContext";

function dateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function todayInputValue() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function BirthdayRewardsForm({ customer }: { customer: Customer }) {
  const { setCustomer } = useAuth();
  const [dateOfBirth, setDateOfBirth] = useState(dateInputValue(customer.dateOfBirth));
  const [birthdayOffersEnabled, setBirthdayOffersEnabled] = useState(
    customer.birthdayOffersEnabled ?? false
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!dateOfBirth) {
      setError("Please choose your birthday before saving.");
      return;
    }

    if (dateOfBirth > todayInputValue()) {
      setError("Your birthday cannot be in the future.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetchApi<{ customer: Customer }>("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ dateOfBirth, birthdayOffersEnabled }),
      });

      if (response.success && response.data.customer) {
        setCustomer(response.data.customer);
        setSuccess("Your birthday reward preferences have been saved.");
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "We could not save your birthday preferences."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      id="birthday-rewards"
      className="scroll-mt-28 rounded-2xl border border-[#DED6C8] bg-[#FFFDF8] p-5"
      aria-labelledby="birthday-rewards-heading"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B58A3A]/15 text-[#B58A3A]">
          <CakeSlice className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B58A3A]">
            A gift for your special day
          </p>
          <h2
            id="birthday-rewards-heading"
            className="font-serif-luxury text-lg font-bold text-[#26231F]"
          >
            Birthday Rewards
          </h2>
        </div>
      </div>

      <p className="mt-2 text-sm leading-5 text-[#6F6A61]">
        Add your birthday and receive a special birthday gift from Elite Library.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="dateOfBirth"
              className="mb-1.5 block text-xs font-semibold text-[#4A3628]"
            >
              Date of birth
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              required
              max={todayInputValue()}
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
              className="w-full rounded-xl border border-[#DED6C8] bg-[#FFFDF8] px-3.5 py-2.5 text-sm text-[#26231F] outline-none transition focus:border-[#B58A3A] focus:ring-2 focus:ring-[#B58A3A]/20"
            />
          </div>

<button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-[#4A3628] px-5 py-2.5 text-xs font-bold text-[#FFFDF8] shadow-sm transition-colors hover:bg-[#352D27] focus:outline-none focus:ring-2 focus:ring-[#B58A3A] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Birthday"}
          </button>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            checked={birthdayOffersEnabled}
            onChange={(event) => setBirthdayOffersEnabled(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#B58A3A]"
          />
          <span>
            <span className="block text-xs font-semibold text-[#26231F]">
              Notify me about birthday offers and special deals
            </span>
            <span className="mt-0.5 block text-[11px] leading-4 text-[#6F6A61]">
              You can opt out at any time without removing your birthday.
            </span>
          </span>
        </label>

        {customer.birthdayUpdatedAt && (
          <p className="text-[11px] italic text-[#6F6A61]">
            Last updated {new Date(customer.birthdayUpdatedAt).toLocaleDateString()}.
            Birthday changes are limited by the account security policy.
          </p>
        )}

        <div aria-live="polite" className="space-y-2">
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-[#8C2D19]/25 bg-[#FFF4F1] px-3 py-2 text-xs text-[#8C2D19]"
            >
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg border border-[#2E7D32]/25 bg-[#F3FAF3] px-3 py-2 text-xs text-[#2E7D32]">
              {success}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}

function ShortcutItem({
  href,
  label,
  icon: Icon,
  count,
}: {
  href: string;
  label: string;
  icon: typeof User;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 transition-all duration-200 hover:border-[#B58A3A]/40 hover:bg-[#F8F5EF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A3A]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#B58A3A]/10 text-[#B58A3A]">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="flex-1 text-sm font-semibold text-[#26231F]">{label}</span>
      {typeof count === "number" && count > 0 && (
        <span className="rounded-full bg-[#B58A3A]/15 px-2 py-0.5 text-[11px] font-bold text-[#B58A3A]">
          {count}
        </span>
      )}
      <ChevronRight
        className="h-4 w-4 text-[#B58A3A] transition-transform duration-200 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { wishlistIds } = useWishlist();
  const { totalItems: cartCount } = useCart();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F1ECE2] text-[#26231F] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-3 border-[#B58A3A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#6F6A61]">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !customer) {
    return (
      <div className="min-h-screen bg-[#F1ECE2] text-[#26231F] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-[#6F6A61] mb-4">Please log in to view your account.</p>
          <Link
            href="/login?redirect=account"
            className="px-6 py-2.5 bg-[#4A3628] text-[#FFFDF8] rounded-xl hover:bg-[#352D27] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1ECE2] text-[#26231F] flex flex-col">
      <Navbar />
      <main className="w-full max-w-[1200px] flex-1 mx-auto px-4 py-8 sm:px-6 sm:py-10">
        <div className="overflow-hidden rounded-3xl border border-[#DED6C8] bg-[#FFFDF8] shadow-sm">
          {/* Header */}
          <header className="bg-[#2B1F16] px-6 py-6 text-[#FFFDF8] sm:px-8 sm:py-7">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B58A3A]">
                  Your private library
                </p>
                <h1 className="font-serif-luxury mt-1 text-3xl font-bold sm:text-4xl">
                  My Account
                </h1>
              </div>
              <p className="pb-1 text-sm text-[#DED6C8]">
                Welcome back,{" "}
                <span className="font-semibold text-[#FFFDF8]">{customer.name}.</span>
              </p>
            </div>
          </header>

          {/* Dashboard */}
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.8fr_1fr]">
            {/* Left column */}
            <div className="min-w-0 space-y-6">
              {/* Profile Information */}
              <section
                className="rounded-2xl border border-[#DED6C8] bg-[#FFFDF8] p-5"
                aria-labelledby="profile-heading"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DED6C8] bg-[#F8F5EF]">
                    <User className="h-5 w-5 text-[#B58A3A]" aria-hidden="true" />
                  </span>
                  <div>
                    <h2
                      id="profile-heading"
                      className="font-serif-luxury text-lg font-bold text-[#26231F]"
                    >
                      Profile Information
                    </h2>
                    <p className="text-xs text-[#6F6A61]">Your contact details</p>
                  </div>
                </div>

                <dl className="mt-3 divide-y divide-[#DED6C8]/70">
                  <div className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-sm text-[#6F6A61]">Name</dt>
                    <dd className="text-sm font-medium text-[#26231F]">{customer.name}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-sm text-[#6F6A61]">Phone</dt>
                    <dd className="text-sm font-medium text-[#26231F]">{customer.phone}</dd>
                  </div>
                  {customer.email && (
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[#6F6A61]">Email</dt>
                      <dd className="truncate text-sm font-medium text-[#26231F]">
                        {customer.email}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>

              <BirthdayRewardsForm
                key={`${customer.id}:${customer.dateOfBirth ?? "none"}:${customer.birthdayOffersEnabled}`}
                customer={customer}
              />
            </div>

{/* Right column: shortcuts */}
            <aside className="min-w-0">
              <section
                className="rounded-2xl border border-[#DED6C8] bg-[#FFFDF8] p-4"
                aria-labelledby="account-shortcuts-heading"
              >
                <h2
                  id="account-shortcuts-heading"
                  className="px-2.5 pb-1 font-serif-luxury text-base font-bold text-[#26231F]"
                >
                  Your Elite Library
                </h2>
                <nav className="flex flex-col pt-1" aria-label="Account shortcuts">
                  <ShortcutItem href="/orders" label="My Orders" icon={ShoppingBag} />
                  <ShortcutItem
                    href="/wishlist"
                    label="My Wishlist"
                    icon={Heart}
                    count={wishlistIds.length}
                  />
                  <ShortcutItem href="/coupons" label="My Coupons" icon={Gift} />
                  <ShortcutItem href="/notifications" label="Notifications" icon={Bell} />
                  <ShortcutItem href="/cart" label="My Cart" icon={Package} count={cartCount} />
                </nav>

                <div className="mt-2 border-t border-[#DED6C8] pt-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium text-[#8C2D19] transition-colors hover:bg-[#FFF4F1] hover:text-[#681F12] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A3A]"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign Out
                  </button>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}