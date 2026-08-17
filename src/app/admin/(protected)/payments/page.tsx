"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Wallet, Truck } from "lucide-react";

interface PaymentSettings {
  cod: boolean;
  esewa: boolean;
}

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({ cod: true, esewa: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetchApi<PaymentSettings>("/payment/payment-methods");
        if (res.success && res.data) {
          setSettings(res.data);
        }
      } catch (err: unknown) {
        if (err instanceof Error) setMessage({ type: "error", text: err.message });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetchApi<PaymentSettings>("/payment/settings", {
        method: "PUT",
        body: JSON.stringify({
          cashOnDeliveryEnabled: settings.cod,
          esewaEnabled: settings.esewa,
        }),
      });

      if (res.success) {
        setMessage({ type: "success", text: "Payment settings updated successfully" });
      } else {
        setMessage({ type: "error", text: res.message || "Failed to update settings" });
      }
    } catch (err: unknown) {
      if (err instanceof Error) setMessage({ type: "error", text: err.message });
      else setMessage({ type: "error", text: "Failed to update settings" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#B58A3A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-luxury text-2xl font-bold text-[#26231F]">Payment Settings</h1>
        <p className="text-sm text-[#6F6A61] mt-1">
          Manage available payment methods for customer checkout
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold ${
            message.type === "success"
              ? "bg-emerald-950/80 border border-emerald-800 text-emerald-200"
              : "bg-rose-950/80 border border-rose-800 text-rose-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-[#FFFDF8] rounded-2xl border border-[#DED6C8] p-6 space-y-6 shadow-xs">
        {/* Cash on Delivery Toggle */}
        <div className="flex items-center justify-between p-4 bg-[#F8F5EF] rounded-xl border border-[#DED6C8]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#4A3628] text-[#FFFDF8] flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif-luxury font-bold text-[#26231F]">Cash on Delivery</h3>
              <p className="text-xs text-[#6F6A61] mt-0.5">
                Customers pay with cash upon delivery
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.cod}
              onChange={(e) => setSettings({ ...settings, cod: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#DED6C8] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#B58A3A]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4A3628]" />
          </label>
        </div>

        {/* eSewa Toggle */}
        <div className="flex items-center justify-between p-4 bg-[#F8F5EF] rounded-xl border border-[#DED6C8]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-700 text-[#FFFDF8] flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif-luxury font-bold text-[#26231F]">eSewa</h3>
              <p className="text-xs text-[#6F6A61] mt-0.5">
                Customers pay using eSewa wallet
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.esewa}
              onChange={(e) => setSettings({ ...settings, esewa: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#DED6C8] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#B58A3A]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4A3628]" />
          </label>
        </div>

        {/* Warning if both disabled */}
        {!settings.cod && !settings.esewa && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold">
            Warning: At least one payment method must be enabled for customers to place orders.
          </div>
        )}

        <div className="pt-4 border-t border-[#DED6C8] flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving || (!settings.cod && !settings.esewa)}
            className="px-6 py-3 bg-[#4A3628] text-[#FFFDF8] font-bold text-sm rounded-xl hover:bg-[#352D27] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
