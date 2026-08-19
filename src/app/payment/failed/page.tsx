"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AlertCircle, ArrowLeft, RefreshCw, ShoppingBag } from "lucide-react";

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const reason = searchParams.get("reason");

  const formattedReason =
    reason === "cancelled"
      ? "The payment session was cancelled on the eSewa portal."
      : reason === "missing_callback_data"
      ? "Payment confirmation data was missing from the gateway response."
      : reason
      ? decodeURIComponent(reason)
      : "The transaction could not be completed.";

  return (
    <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      <div className="bg-[#FFFDF8] p-8 sm:p-12 rounded-3xl border border-[#DED6C8] text-center space-y-6 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-[#FBF0EE] text-[#8C2D19] border border-[#F0D5CE] flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-[#8C2D19] font-semibold">
            Transaction Incomplete
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#26231F] mt-1">
            Payment Not Completed
          </h1>
          <p className="text-sm text-[#6F6A61] mt-2 max-w-md mx-auto">
            Your eSewa payment was not completed, and your order has not been marked as paid.
          </p>
        </div>

        {orderNumber && (
          <div className="inline-block px-6 py-3 rounded-2xl bg-[#F8F5EF] border border-[#DED6C8]">
            <span className="text-xs text-[#6F6A61] block mb-0.5">Order Reference</span>
            <span className="font-mono text-lg font-bold text-[#4A3628]">
              {orderNumber}
            </span>
          </div>
        )}

        <div className="p-4 bg-[#F8F5EF] rounded-xl border border-[#DED6C8] text-xs text-[#6F6A61] max-w-md mx-auto">
          <p className="font-semibold text-[#26231F] mb-1">Details:</p>
          <p>{formattedReason}</p>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/orders"
            className="w-full sm:w-auto px-6 py-3 bg-[#4A3628] text-[#FFFDF8] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#352D27] transition-all inline-flex items-center justify-center gap-2 shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>View Orders & Pay</span>
          </Link>
          <Link
            href="/books"
            className="w-full sm:w-auto px-6 py-3 bg-[#F1ECE2] hover:bg-[#DED6C8] text-[#4A3628] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors border border-[#DED6C8] inline-flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#26231F]">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-[#B58A3A] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <PaymentFailedContent />
      </Suspense>
      <Footer />
    </div>
  );
}
