"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Customer, useAuth } from "@/lib/authContext";
import { Lock, Mail, Phone, User } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { setCustomer } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !phone || !password) {
      setError("Name, phone, and password are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetchApi<{ customer: Customer }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, phone, email, password, confirmPassword }),
      });

      if (res.success && res.data.customer) {
        // Set customer directly from signup response
        setCustomer(res.data.customer);
        router.push(redirect);
      } else {
        setError(res.message || "Signup failed");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1ECE2] text-[#26231F] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FFFDF8] p-8 rounded-3xl border border-[#DED6C8] shadow-xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B58A3A] to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 mx-auto mb-3">
            <User className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[#B58A3A] font-semibold">
            Customer Portal
          </span>
          <h1 className="font-serif-luxury text-2xl font-bold text-[#26231F] mt-1">
            Create Account
          </h1>
          <p className="text-sm text-[#6F6A61] mt-1">
            Join our community of book lovers
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#4A3628] block mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F6A61]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full bg-[#F8F5EF] border border-[#DED6C8] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#26231F] placeholder-[#6F6A61] focus:outline-none focus:border-[#B58A3A]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#4A3628] block mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F6A61]" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="98XXXXXXXX"
                className="w-full bg-[#F8F5EF] border border-[#DED6C8] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#26231F] placeholder-[#6F6A61] focus:outline-none focus:border-[#B58A3A]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#4A3628] block mb-1.5">
              Email (Optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F6A61]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-[#F8F5EF] border border-[#DED6C8] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#26231F] placeholder-[#6F6A61] focus:outline-none focus:border-[#B58A3A]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#4A3628] block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F6A61]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full bg-[#F8F5EF] border border-[#DED6C8] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#26231F] placeholder-[#6F6A61] focus:outline-none focus:border-[#B58A3A]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#4A3628] block mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F6A61]" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full bg-[#F8F5EF] border border-[#DED6C8] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#26231F] placeholder-[#6F6A61] focus:outline-none focus:border-[#B58A3A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[#B58A3A] to-amber-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/10 mt-2"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="pt-4 border-t border-[#DED6C8] text-center text-sm text-[#6F6A61]">
          <p className="mb-2">Already have an account?</p>
          <Link
            href="/login"
            className="text-[#B58A3A] font-semibold hover:text-amber-700 transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="pt-4 border-t border-[#DED6C8] text-center text-xs text-[#6F6A61]">
          <Link href="/" className="hover:text-[#B58A3A] transition-colors">
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F1ECE2] text-[#26231F] flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-[#B58A3A] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
