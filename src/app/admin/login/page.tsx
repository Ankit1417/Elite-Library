"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Lock, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetchApi("/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });

      if (res.success) {
        router.replace("/admin");
      } else {
        setError(res.message || "Invalid credentials");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card-accent p-8 rounded-3xl border border-[#d4af37]/30 shadow-2xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 mx-auto mb-3">
            <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-semibold">
            Administrative Portal
          </span>
          <h1 className="font-serif-luxury text-2xl font-bold text-slate-100 mt-1">
            Elite Library Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to manage catalog, categories, and customer orders.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Email or Phone
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="admin@elitelibrary.com or 98XXXXXXXX"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/10 mt-2"
          >
            {isLoading ? "Signing in..." : "Sign In to Admin Portal"}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
          <Link href="/" className="hover:text-amber-200 transition-colors">
            ← Return to Customer Bookstore
          </Link>
        </div>
      </div>
    </div>
  );
}
