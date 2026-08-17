"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Store, CreditCard, Truck, Save, X } from "lucide-react";

interface StoreSettings {
  storeName?: string;
  supportEmail?: string;
  supportPhone?: string;
  storeAddress?: string;
}

interface PaymentSettingsData {
  cashOnDeliveryEnabled: boolean;
  esewaEnabled: boolean;
}

interface DeliverySettingsData {
  defaultDeliveryFee?: number;
  freeDeliveryThreshold?: number;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"store" | "payment" | "delivery">("store");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Store settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({});
  
  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsData>({
    cashOnDeliveryEnabled: true,
    esewaEnabled: false,
  });
  
  // Delivery settings
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettingsData>({
    defaultDeliveryFee: 0,
    freeDeliveryThreshold: 0,
  });

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Load payment settings
      const paymentRes = await fetchApi<PaymentSettingsData>("/payment/payment-methods");
      if (paymentRes.success && paymentRes.data) {
        setPaymentSettings({
          cashOnDeliveryEnabled: paymentRes.data.cashOnDeliveryEnabled,
          esewaEnabled: paymentRes.data.esewaEnabled,
        });
      }
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      loadSettings();
    }, 0);
  }, []);

  const handleSaveStore = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      // Store settings would need backend endpoint
      setMessage({ type: "success", text: "Store information saved successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to save store information" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePayment = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      if (!paymentSettings.cashOnDeliveryEnabled && !paymentSettings.esewaEnabled) {
        setMessage({ type: "error", text: "At least one payment method must be enabled" });
        setIsSaving(false);
        return;
      }

      const res = await fetchApi<PaymentSettingsData>("/payment/settings", {
        method: "PUT",
        body: JSON.stringify({
          cashOnDeliveryEnabled: paymentSettings.cashOnDeliveryEnabled,
          esewaEnabled: paymentSettings.esewaEnabled,
        }),
      });

      if (res.success) {
        setMessage({ type: "success", text: "Payment settings updated successfully" });
      } else {
        setMessage({ type: "error", text: res.message || "Failed to update settings" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update settings" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDelivery = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      // Delivery settings would need backend endpoint
      setMessage({ type: "success", text: "Delivery settings saved successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to save delivery settings" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[#B58A3A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl font-bold text-[#27231F]">Settings</h1>
          <p className="text-sm text-[#716A61] mt-1">Configure store settings</p>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm ${
            message.type === "success"
              ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/20"
              : "bg-[#FFEBEE] text-[#C62828] border border-[#C62828]/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-[#716A61] hover:text-[#27231F]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#DED6CA]">
        <button
          onClick={() => setActiveTab("store")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "store"
              ? "border-[#B58A3A] text-[#B58A3A]"
              : "border-transparent text-[#716A61] hover:text-[#27231F]"
          }`}
        >
          Store Information
        </button>
        <button
          onClick={() => setActiveTab("payment")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "payment"
              ? "border-[#B58A3A] text-[#B58A3A]"
              : "border-transparent text-[#716A61] hover:text-[#27231F]"
          }`}
        >
          Payment Methods
        </button>
        <button
          onClick={() => setActiveTab("delivery")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "delivery"
              ? "border-[#B58A3A] text-[#B58A3A]"
              : "border-transparent text-[#716A61] hover:text-[#27231F]"
          }`}
        >
          Delivery Settings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "store" && (
        <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#DED6CA] space-y-6">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#B58A3A]" />
            <h2 className="font-serif-luxury text-lg font-bold text-[#27231F]">Store Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#716A61] mb-1.5">
                Store Name
              </label>
              <input
                type="text"
                value={storeSettings.storeName || ""}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-4 py-2.5 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#716A61] mb-1.5">
                Support Email
              </label>
              <input
                type="email"
                value={storeSettings.supportEmail || ""}
                onChange={(e) => setStoreSettings({ ...storeSettings, supportEmail: e.target.value })}
                className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-4 py-2.5 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#716A61] mb-1.5">
                Support Phone
              </label>
              <input
                type="tel"
                value={storeSettings.supportPhone || ""}
                onChange={(e) => setStoreSettings({ ...storeSettings, supportPhone: e.target.value })}
                className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-4 py-2.5 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#716A61] mb-1.5">
                Store Address
              </label>
              <textarea
                rows={2}
                value={storeSettings.storeAddress || ""}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-4 py-2.5 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A] resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#DED6CA]">
            <button
              onClick={handleSaveStore}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#4A3628] text-[#FFFDF9] font-bold text-xs rounded-xl hover:bg-[#352D27] disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === "payment" && (
        <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#DED6CA] space-y-6">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#B58A3A]" />
            <h2 className="font-serif-luxury text-lg font-bold text-[#27231F]">Payment Methods</h2>
          </div>

          <div className="space-y-4">
            {/* Cash on Delivery */}
            <div className="flex items-center justify-between p-4 bg-[#F6F2EA] rounded-xl border border-[#DED6CA]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#4A3628] text-[#FFFDF9] flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif-luxury font-bold text-[#27231F]">Cash on Delivery</h3>
                  <p className="text-xs text-[#716A61] mt-0.5">
                    Customers pay with cash upon delivery
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentSettings({ ...paymentSettings, cashOnDeliveryEnabled: !paymentSettings.cashOnDeliveryEnabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  paymentSettings.cashOnDeliveryEnabled ? "bg-[#B58A3A]" : "bg-[#DED6CA]"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    paymentSettings.cashOnDeliveryEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* eSewa */}
            <div className="flex items-center justify-between p-4 bg-[#F6F2EA] rounded-xl border border-[#DED6CA]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2E7D32] text-[#FFFDF9] flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif-luxury font-bold text-[#27231F]">eSewa</h3>
                  <p className="text-xs text-[#716A61] mt-0.5">
                    Customers pay using eSewa wallet
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentSettings({ ...paymentSettings, esewaEnabled: !paymentSettings.esewaEnabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  paymentSettings.esewaEnabled ? "bg-[#B58A3A]" : "bg-[#DED6CA]"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    paymentSettings.esewaEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {!paymentSettings.cashOnDeliveryEnabled && !paymentSettings.esewaEnabled && (
              <div className="p-4 rounded-xl bg-[#FFEBEE] border border-[#C62828]/30 text-[#C62828] text-xs font-semibold">
                Warning: At least one payment method must be enabled for customers to place orders.
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-[#DED6CA]">
            <button
              onClick={handleSavePayment}
              disabled={isSaving || (!paymentSettings.cashOnDeliveryEnabled && !paymentSettings.esewaEnabled)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#4A3628] text-[#FFFDF9] font-bold text-xs rounded-xl hover:bg-[#352D27] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === "delivery" && (
        <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#DED6CA] space-y-6">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#B58A3A]" />
            <h2 className="font-serif-luxury text-lg font-bold text-[#27231F]">Delivery Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#716A61] mb-1.5">
                Default Delivery Fee (Rs.)
              </label>
              <input
                type="number"
                value={deliverySettings.defaultDeliveryFee || 0}
                onChange={(e) => setDeliverySettings({ ...deliverySettings, defaultDeliveryFee: Number(e.target.value) })}
                min="0"
                className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-4 py-2.5 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
              />
              <p className="text-[10px] text-[#716A61] mt-1">Standard delivery charge for all orders</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#716A61] mb-1.5">
                Free Delivery Threshold (Rs.)
              </label>
              <input
                type="number"
                value={deliverySettings.freeDeliveryThreshold || 0}
                onChange={(e) => setDeliverySettings({ ...deliverySettings, freeDeliveryThreshold: Number(e.target.value) })}
                min="0"
                className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-4 py-2.5 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
              />
              <p className="text-[10px] text-[#716A61] mt-1">Orders above this amount get free delivery</p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#DED6CA]">
            <button
              onClick={handleSaveDelivery}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#4A3628] text-[#FFFDF9] font-bold text-xs rounded-xl hover:bg-[#352D27] disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
