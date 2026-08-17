"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CakeSlice,
  Gift,
  LogOut,
  Package,
  ShoppingBag,
  User,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchApi } from "@/lib/api";
import { Customer, useAuth } from "@/lib/authContext";

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
      className="scroll-mt-28 rounded-2xl border border-[#B58A3A]/30 bg-[#F8F5EF] p-5 sm:p-6"
      aria-labelledby="birthday-rewards-heading"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4A3628] text-[#F8F5EF]">
          <CakeSlice className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B58A3A]">
            A gift for your special day
          </p>
          <h2
            id="birthday-rewards-heading"
            className="font-serif-luxury text-xl font-bold text-[#26231F]"
          >
            Birthday Rewards
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#6F6A61]">
            Add your birthday and receive a special birthday gift from Elite Library.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="dateOfBirth" className="mb-1.5 block text-xs font-semibold text-[#4A3628]">
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
            className="w-full max-w-sm rounded-xl border border-[#DED6C8] bg-[#FFFDF8] px-3.5 py-2.5 text-sm text-[#26231F] outline-none transition focus:border-[#B58A3A] focus:ring-2 focus:ring-[#B58A3A]/20"
          />
          {customer.birthdayUpdatedAt && (
            <p className="mt-1.5 text-[11px] text-[#6F6A61]">
              Last updated {new Date(customer.birthdayUpdatedAt).toLocaleDateString()}. For your
              protection, birthday changes are limited by the account security policy.
            </p>
          )}
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#DED6C8] bg-[#FFFDF8] p-3.5">
          <input
            type="checkbox"
            checked={birthdayOffersEnabled}
            onChange={(event) => setBirthdayOffersEnabled(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#B58A3A]"
          />
          <span>
            <span className="block text-xs font-bold text-[#26231F]">
              Notify me about birthday offers and special deals.
            </span>
            <span className="mt-0.5 block text-[11px] leading-4 text-[#6F6A61]">
              You can opt out at any time without removing your birthday.
            </span>
          </span>
        </label>

        <div aria-live="polite">
          {error && (
            <p role="alert" className="rounded-xl border border-[#8C2D19]/25 bg-[#FFF4F1] p-3 text-xs text-[#8C2D19]">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl border border-[#2E7D32]/25 bg-[#F3FAF3] p-3 text-xs text-[#2E7D32]">
              {success}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-[#4A3628] px-5 py-2.5 text-xs font-bold text-[#FFFDF8] shadow-sm transition-colors hover:bg-[#352D27] focus:outline-none focus:ring-2 focus:ring-[#B58A3A] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          {isSaving ? "Saving preferences..." : "Save Birthday Rewards"}
        </button>
      </form>
    </section>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading: authLoading, logout } = useAuth();

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
      <main className="w-full max-w-5xl flex-1 mx-auto px-4 py-10 sm:px-6 sm:py-12">
        <div className="overflow-hidden rounded-3xl border border-[#DED6C8] bg-[#FFFDF8] shadow-xl">
          <div className="bg-[#2B1F16] p-7 text-[#FFFDF8] sm:p-9">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B58A3A]">
              Your private library
            </p>
            <h1 className="font-serif-luxury mt-1 text-3xl font-bold">My Account</h1>
            <p className="mt-1 text-sm text-[#DED6C8]">Welcome back, {customer.name}.</p>
          </div>

          <div className="space-y-8 p-6 sm:p-8">
            <section className="flex items-start gap-4" aria-labelledby="profile-heading">
              <div className="w-12 h-12 rounded-full bg-[#F8F5EF] border border-[#DED6C8] flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-[#B58A3A]" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h2 id="profile-heading" className="font-serif-luxury text-xl font-bold text-[#26231F] mb-2">
                  Profile Information
                </h2>
                <div className="space-y-2 text-sm">
                  <p><span className="text-[#6F6A61]">Name:</span>{" "}<span className="font-medium">{customer.name}</span></p>
                  <p><span className="text-[#6F6A61]">Phone:</span>{" "}<span className="font-medium">{customer.phone}</span></p>
                  {customer.email && (
                    <p><span className="text-[#6F6A61]">Email:</span>{" "}<span className="font-medium">{customer.email}</span></p>
                  )}
                </div>
              </div>
            </section>

            <BirthdayRewardsForm
              key={`${customer.id}:${customer.dateOfBirth ?? "none"}:${customer.birthdayOffersEnabled}`}
              customer={customer}
            />

            <section aria-labelledby="account-shortcuts-heading">
              <h2 id="account-shortcuts-heading" className="font-serif-luxury mb-3 text-lg font-bold">
                Your Elite Library
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { href: "/orders", label: "My Orders", icon: ShoppingBag },
                  { href: "/coupons", label: "My Coupons", icon: Gift },
                  { href: "/notifications", label: "Notifications", icon: Bell },
                  { href: "/cart", label: "My Cart", icon: Package },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-xl border border-[#DED6C8] bg-[#F8F5EF] p-4 transition-colors hover:border-[#B58A3A]/50 hover:bg-[#F1ECE2]"
                    >
                      <Icon className="h-5 w-5 text-[#B58A3A]" aria-hidden="true" />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>

            <div className="border-t border-[#DED6C8] pt-6">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 font-medium text-[#8C2D19] transition-colors hover:text-[#681F12]"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
