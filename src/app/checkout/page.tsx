"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useCart } from "@/lib/cartContext";
import { useAuth } from "@/lib/authContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import { Check, TicketPercent, Truck, Wallet, X } from "lucide-react";

interface PaymentMethods {
  cod: boolean;
  esewa: boolean;
  deliveryFee: number;
}

interface CouponValidationResponse {
  valid: boolean;
  dealName: string;
  discountAmount: number;
  subtotal: number;
  itemDiscountAmount: number;
  merchandiseAmount: number;
  totalAfterCoupon: number;
  coupon: {
    code: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
    maximumDiscountAmount?: number;
    expiresAt: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, subtotal, discountSavings, finalTotal, showToast } =
    useCart();
  const { customer, isLoading: authLoading } = useAuth();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({
    cod: false,
    esewa: false,
    deliveryFee: 0,
  });
  const deliveryFee = cart.length > 0 ? paymentMethods.deliveryFee : 0;
  const [selectedPayment, setSelectedPayment] = useState<"COD" | "ESEWA">("COD");
  const [isLoading, setIsLoading] = useState(true);
  const [paymentSettingsError, setPaymentSettingsError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    province: "Bagmati Province",
    city: "Kathmandu",
    area: "",
    landmark: "",
    deliveryNotes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse | null>(null);
  const [appliedCouponCartSignature, setAppliedCouponCartSignature] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const cartSignature = cart
    .map((item) => `${item.bookId}:${item.quantity}`)
    .sort()
    .join("|");
  const activeCoupon =
    appliedCoupon && appliedCouponCartSignature === cartSignature
      ? appliedCoupon
      : null;
  const couponNeedsRefresh = Boolean(appliedCoupon && !activeCoupon);
  const displayedSubtotal = activeCoupon?.subtotal ?? subtotal;
  const displayedCatalogSavings =
    activeCoupon?.itemDiscountAmount ?? discountSavings;
  const displayedMerchandiseTotal =
    activeCoupon?.merchandiseAmount ?? finalTotal;
  const couponDiscount = Math.min(
    displayedMerchandiseTotal,
    Math.max(0, activeCoupon?.discountAmount ?? 0)
  );
  const merchandiseTotal = Math.max(0, displayedMerchandiseTotal - couponDiscount);
  const grandTotal = merchandiseTotal + deliveryFee;

  useEffect(() => {
    const loadData = async () => {
      try {
        setPaymentSettingsError(null);
        const paymentRes = await fetchApi<PaymentMethods>("/payment/payment-methods");
        if (paymentRes.success && paymentRes.data) {
          setPaymentMethods(paymentRes.data);
          // Select first available payment method
          if (paymentRes.data.cod) {
            setSelectedPayment("COD");
          } else if (paymentRes.data.esewa) {
            setSelectedPayment("ESEWA");
          }
        }
      } catch {
        setPaymentSettingsError(
          "Checkout payment options could not be loaded. Please refresh and try again."
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Pre-fill form with customer data when available
  useEffect(() => {
    if (customer) {
      setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          name: customer.name,
          phone: customer.phone,
          email: customer.email || "",
        }));
      }, 0);
    }
  }, [customer]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#26231F]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#B58A3A] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#26231F]">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto px-4 py-20 text-center">
          <h2 className="font-serif-luxury text-2xl font-bold text-[#26231F] mb-2">
            Authentication Required
          </h2>
          <p className="text-[#6F6A61] text-sm mb-6">
            Please log in to complete your purchase.
          </p>
          <Link
            href="/login?redirect=checkout"
            className="px-6 py-3 bg-[#4A3628] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#352D27] transition-all inline-block shadow-md"
          >
            Sign In
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#26231F]">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto px-4 py-20 text-center">
          <h2 className="font-serif-luxury text-2xl font-bold text-[#26231F] mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-[#6F6A61] text-sm mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/books"
            className="px-6 py-3 bg-[#4A3628] text-[#FFFDF8] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#352D27] transition-all inline-block shadow-md"
          >
            Browse Books
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async () => {
    const normalizedCode = couponCode.trim().toUpperCase();
    setCouponError(null);

    if (!normalizedCode) {
      setCouponError("Enter a coupon code to continue.");
      return;
    }

    try {
      setIsApplyingCoupon(true);
      const response = await fetchApi<CouponValidationResponse>("/coupons/validate", {
        method: "POST",
        body: JSON.stringify({
          code: normalizedCode,
          items: cart.map((item) => ({
            bookId: item.bookId,
            quantity: item.quantity,
          })),
        }),
      });

      if (response.success && response.data.valid) {
        setAppliedCoupon(response.data);
        setAppliedCouponCartSignature(cartSignature);
        setCouponCode(response.data.coupon.code);
      } else {
        setAppliedCoupon(null);
        setAppliedCouponCartSignature(null);
        setCouponError(response.message || "This coupon could not be applied.");
      }
    } catch (applyError) {
      setAppliedCoupon(null);
      setAppliedCouponCartSignature(null);
      setCouponError(
        applyError instanceof Error ? applyError.message : "This coupon could not be applied."
      );
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setAppliedCouponCartSignature(null);
    setCouponCode("");
    setCouponError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const selectedPaymentEnabled =
      selectedPayment === "COD" ? paymentMethods.cod : paymentMethods.esewa;
    if (!selectedPaymentEnabled) {
      setErrorMessage("Please choose an available payment method before placing your order.");
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.province.trim() ||
      !formData.city.trim() ||
      !formData.area.trim()
    ) {
      setErrorMessage("Please fill in all required shipping fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        customer: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          province: formData.province.trim(),
          city: formData.city.trim(),
          area: formData.area.trim(),
          landmark: formData.landmark.trim() || undefined,
          deliveryNotes: formData.deliveryNotes.trim() || undefined,
        },
        items: cart.map((i) => ({
          bookId: i.bookId,
          quantity: i.quantity,
        })),
        paymentMethod: selectedPayment,
        ...(activeCoupon ? { couponCode: activeCoupon.coupon.code } : {}),
      };

      const res = await fetchApi<{ orderNumber: string }>("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success && res.data?.orderNumber) {
        clearCart();
        showToast("Order placed successfully!");
        router.push(`/order-success?orderNumber=${res.data.orderNumber}`);
      } else {
        setErrorMessage(res.message || "Failed to place order");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMessage(err.message);
      else setErrorMessage("Order submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#26231F]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="border-b border-[#DED6C8] pb-6 mb-8">
          <span className="text-xs uppercase tracking-widest text-[#B58A3A] font-semibold">
            Finalize Purchase
          </span>
          <h1 className="font-serif-luxury text-3xl font-bold text-[#26231F] mt-1">
            Checkout
          </h1>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-[#F1ECE2] border border-[#DED6C8] text-[#8C2D19] text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Shipping Info Form (Left 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Details */}
            <div className="bg-[#FFFDF8] p-6 rounded-2xl border border-[#DED6C8] space-y-4 shadow-xs">
              <h3 className="font-serif-luxury text-lg font-bold text-[#26231F] border-b border-[#DED6C8] pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#4A3628] text-[#FFFDF8] text-xs flex items-center justify-center font-sans font-bold">
                  1
                </span>
                <span>Shipping & Contact Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#26231F] block mb-1">
                    Full Name <span className="text-[#8C2D19]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Eleanor Vance"
                    required
                    className="w-full bg-[#F8F5EF] border border-[#DED6C8] rounded-xl px-3.5 py-2.5 text-xs text-[#26231F] placeholder-[#6F6A61] focus:outline-none focus:border-[#B58A3A]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#26231F] block mb-1">
                    Phone Number <span className="text-[#8C2D19]">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9841234567"
                    required
                    className="w-full bg-[#F8F5EF] border border-[#DED6C8] rounded-xl px-3.5 py-2.5 text-xs text-[#26231F] placeholder-[#6F6A61] focus:outline-none focus:border-[#B58A3A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#26231F] block mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. eleanor@example.com"
                  className="w-full bg-[#F8F5EF] border border-[#DED6C8] rounded-xl px-3.5 py-2.5 text-xs text-[#26231F] placeholder-[#6F6A61] focus:outline-none focus:border-[#B58A3A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-[#26231F] block mb-1">
                    Province <span className="text-[#8C2D19]">*</span>
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className="w-full bg-[#F8F5EF] border border-[#DED6C8] rounded-xl px-3.5 py-2.5 text-xs text-[#26231F] focus:outline-none focus:border-[#B58A3A]"
                  >
                    <option value="Koshi Province">Koshi Province</option>
                    <option value="Madhesh Province">Madhesh Province</option>
                    <option value="Bagmati Province">Bagmati Province</option>
                    <option value="Gandaki Province">Gandaki Province</option>
                    <option value="Lumbini Province">Lumbini Province</option>
                    <option value="Karnali Province">Karnali Province</option>
                    <option value="Sudurpashchim Province">Sudurpashchim Province</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#26231F] block mb-1">
                    City <span className="text-[#8C2D19]">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Kathmandu"
                    required
                    className="w-full bg-[#F8F5EF] border border-[#DED6C8] rounded-xl px-3.5 py-2.5 text-xs text-[#26231F] focus:outline-none focus:border-[#B58A3A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#26231F] block mb-1">
                  Area / Street Address <span className="text-[#8C2D19]">*</span>
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="House number, street, locality name"
                  required
                  className="w-full bg-[#F8F5EF] border border-[#DED6C8] rounded-xl px-3.5 py-2.5 text-xs text-[#26231F] focus:outline-none focus:border-[#B58A3A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#26231F] block mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    placeholder="e.g. Near Central Park"
                    className="w-full bg-[#F8F5EF] border border-[#DED6C8] rounded-xl px-3.5 py-2.5 text-xs text-[#26231F] focus:outline-none focus:border-[#B58A3A]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#26231F] block mb-1">
                    Delivery Notes (Optional)
                  </label>
                  <input
                    type="text"
                    name="deliveryNotes"
                    value={formData.deliveryNotes}
                    onChange={handleChange}
                    placeholder="Special instructions for courier"
                    className="w-full bg-[#F8F5EF] border border-[#DED6C8] rounded-xl px-3.5 py-2.5 text-xs text-[#26231F] focus:outline-none focus:border-[#B58A3A]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-[#FFFDF8] p-6 rounded-2xl border border-[#DED6C8] space-y-4 shadow-xs">
              <h3 className="font-serif-luxury text-lg font-bold text-[#26231F] border-b border-[#DED6C8] pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#4A3628] text-[#FFFDF8] text-xs flex items-center justify-center font-sans font-bold">
                  2
                </span>
                <span>Payment Method</span>
              </h3>

              {(!paymentMethods.cod && !paymentMethods.esewa) && (
                <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold text-center">
                  {paymentSettingsError ||
                    "No payment methods are currently available. Please contact support."}
                </div>
              )}

              {paymentMethods.cod && (
                <button
                  type="button"
                  onClick={() => setSelectedPayment("COD")}
                  className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${
                    selectedPayment === "COD"
                      ? "bg-[#F1ECE2] border-2 border-[#B58A3A]"
                      : "bg-[#F8F5EF] border-2 border-[#DED6C8] hover:border-[#B58A3A]/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#4A3628] text-[#FFFDF8] flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-serif-luxury font-bold text-sm text-[#26231F]">
                        Cash on Delivery (COD)
                      </h4>
                      <p className="text-xs text-[#6F6A61]">
                        Pay securely with cash upon delivery of your book parcel.
                      </p>
                    </div>
                  </div>
                  {selectedPayment === "COD" && (
                    <div className="w-5 h-5 rounded-full bg-[#4A3628] flex items-center justify-center text-[#FFFDF8]">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              )}

              {paymentMethods.esewa && (
                <button
                  type="button"
                  onClick={() => setSelectedPayment("ESEWA")}
                  className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${
                    selectedPayment === "ESEWA"
                      ? "bg-[#F1ECE2] border-2 border-[#B58A3A]"
                      : "bg-[#F8F5EF] border-2 border-[#DED6C8] hover:border-[#B58A3A]/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-700 text-[#FFFDF8] flex items-center justify-center">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-serif-luxury font-bold text-sm text-[#26231F]">
                        eSewa
                      </h4>
                      <p className="text-xs text-[#6F6A61]">
                        Pay securely using your eSewa wallet.
                      </p>
                    </div>
                  </div>
                  {selectedPayment === "ESEWA" && (
                    <div className="w-5 h-5 rounded-full bg-[#4A3628] flex items-center justify-center text-[#FFFDF8]">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Order Review Box (Right 5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-[#FFFDF8] p-6 rounded-2xl border border-[#DED6C8] space-y-4 sticky top-24 shadow-xs">
              <h3 className="font-serif-luxury text-lg font-bold text-[#26231F] border-b border-[#DED6C8] pb-3">
                Review Items ({cart.length})
              </h3>

              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {cart.map((item) => (
                  <div
                    key={item.bookId}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F8F5EF] border border-[#DED6C8]"
                  >
                    <div className="relative aspect-[3/4] w-12 rounded overflow-hidden bg-[#F1ECE2] border border-[#DED6C8] shrink-0">
                      <Image
                        src={item.coverImage}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-serif-luxury text-xs font-semibold text-[#26231F] truncate">
                        {item.title}
                      </h5>
                      <span className="text-[11px] text-[#6F6A61] block">
                        Qty: {item.quantity} × Rs. {item.finalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#4A3628]">
                        Rs. {(item.finalPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#DED6C8] pt-4">
                <label htmlFor="couponCode" className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-[#26231F]">
                  <TicketPercent className="h-4 w-4 text-[#B58A3A]" aria-hidden="true" />
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    id="couponCode"
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={couponCode}
                    disabled={isApplyingCoupon}
                    aria-invalid={Boolean(couponError)}
                    aria-describedby="coupon-feedback"
                    onChange={(event) => {
                      const nextCode = event.target.value.toUpperCase();
                      setCouponCode(nextCode);
                      setCouponError(null);
                      if (activeCoupon && nextCode !== activeCoupon.coupon.code) {
                        setAppliedCoupon(null);
                        setAppliedCouponCartSignature(null);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleApplyCoupon();
                      }
                    }}
                    placeholder="e.g. BDAY20-A7K92P"
                    className="min-w-0 flex-1 rounded-xl border border-[#DED6C8] bg-[#F8F5EF] px-3.5 py-2.5 font-mono text-xs uppercase tracking-wide text-[#26231F] outline-none transition focus:border-[#B58A3A] focus:ring-2 focus:ring-[#B58A3A]/20 disabled:opacity-60"
                  />
                  {activeCoupon ? (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#DED6C8] bg-[#F8F5EF] px-3.5 py-2.5 text-xs font-bold text-[#8C2D19] transition-colors hover:bg-[#F1ECE2]"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleApplyCoupon()}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="rounded-xl bg-[#4A3628] px-4 py-2.5 text-xs font-bold text-[#FFFDF8] transition-colors hover:bg-[#352D27] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isApplyingCoupon ? "Checking..." : "Apply"}
                    </button>
                  )}
                </div>

                <div id="coupon-feedback" className="mt-2" aria-live="polite">
                  {couponError && <p role="alert" className="text-[11px] text-[#8C2D19]">{couponError}</p>}
                  {activeCoupon && (
                    <div className="rounded-xl border border-[#2E7D32]/25 bg-[#F3FAF3] p-3">
                      <div className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2E7D32]" aria-hidden="true" />
                        <div>
                          <p className="text-xs font-bold text-[#2E7D32]">{activeCoupon.dealName}</p>
                          <p className="mt-0.5 text-[11px] text-[#416B43]">
                            {activeCoupon.coupon.discountType === "PERCENTAGE"
                              ? `${activeCoupon.coupon.discountValue}% discount applied`
                              : `Rs. ${activeCoupon.coupon.discountValue.toLocaleString()} discount applied`}
                            {activeCoupon.coupon.maximumDiscountAmount
                              ? ` (maximum Rs. ${activeCoupon.coupon.maximumDiscountAmount.toLocaleString()})`
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {couponNeedsRefresh && (
                    <p role="status" className="text-[11px] text-[#8C2D19]">
                      Your cart changed. Apply the coupon again to refresh its discount.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#6F6A61] pt-3 border-t border-[#DED6C8]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#26231F] font-semibold">
                    Rs. {displayedSubtotal.toLocaleString()}
                  </span>
                </div>

                  {displayedCatalogSavings > 0 && (
                    <div className="flex justify-between text-[#2E7D32]">
                    <span>Catalog Savings</span>
                    <span>- Rs. {displayedCatalogSavings.toLocaleString()}</span>
                  </div>
                )}

                {activeCoupon && (
                  <div className="flex justify-between gap-3 text-[#2E7D32]">
                    <span className="min-w-0 truncate" title={activeCoupon.coupon.code}>
                      Coupon ({activeCoupon.coupon.code})
                    </span>
                    <span className="shrink-0">- Rs. {couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Standard Delivery</span>
                  <span className="text-[#26231F] font-semibold">
                    Rs. {deliveryFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-[#4A3628] pt-3 border-t border-[#DED6C8]">
                  <span>Payable Amount</span>
                  <span>Rs. {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  isApplyingCoupon ||
                  couponNeedsRefresh ||
                  (selectedPayment === "COD"
                    ? !paymentMethods.cod
                    : !paymentMethods.esewa)
                }
                className="w-full py-4 bg-[#4A3628] text-[#FFFDF8] font-bold rounded-xl text-sm hover:bg-[#352D27] disabled:opacity-50 transition-all shadow-md mt-4"
              >
                {!paymentMethods.cod && !paymentMethods.esewa
                  ? "Payment Unavailable"
                  : couponNeedsRefresh
                  ? "Reapply Coupon to Continue"
                  : isSubmitting
                  ? "Processing Order..."
                  : selectedPayment === "COD"
                    ? "Confirm & Place COD Order"
                    : "Continue to eSewa"}
              </button>
            </div>
          </div>
        </form>
      </main>

      <Toast />
      <Footer />
    </div>
  );
}
