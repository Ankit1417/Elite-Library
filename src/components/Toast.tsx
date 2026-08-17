"use client";

import { useCart } from "@/lib/cartContext";
import { CheckCircle } from "lucide-react";

export default function Toast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#4A3628] text-[#FFFDF8] border border-[#B58A3A]/60 px-5 py-3.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <CheckCircle className="w-5 h-5 text-[#B58A3A] shrink-0" />
      <span className="text-sm font-medium tracking-wide">{toastMessage}</span>
    </div>
  );
}

