"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchApi } from "@/lib/api";
import { Upload, Save, X, Eye, Trash2, Image as ImageIcon } from "lucide-react";

interface HomepageSettings {
  heroImage?: string;
  heroImagePublicId?: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroHighlightedText?: string;
  heroDescription?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  isHeroEnabled: boolean;
}

export default function AdminHomepagePage() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const loadSettings = async () => {
    try {
      const res = await fetchApi<HomepageSettings>("/homepage");
      if (res.success && res.data) {
        setSettings(res.data);
        setPreviewImage(res.data.heroImage || "");
      }
    } catch {
      // Ignore errors
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      loadSettings();
    }, 0);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("imageType", "homepage");

      const uploadRes = await fetchApi<{ url: string; public_id: string }>("/upload/single", {
        method: "POST",
        body: formData,
      });

      if (uploadRes.success && uploadRes.data) {
        setSettings((prev) => ({
          ...prev!,
          heroImage: uploadRes.data.url,
          heroImagePublicId: uploadRes.data.public_id,
        }));
        setPreviewImage(uploadRes.data.url);
        setHasUnsavedChanges(true);
        setMessage({ type: "success", text: "Image uploaded successfully" });
      } else {
        setMessage({ type: "error", text: uploadRes.message || "Failed to upload image" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to upload image" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setSettings((prev) => ({
      ...prev!,
      heroImage: "",
      heroImagePublicId: "",
    }));
    setPreviewImage("");
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      const res = await fetchApi<HomepageSettings>("/homepage", {
        method: "PATCH",
        body: JSON.stringify(settings),
      });

      if (res.success) {
        setMessage({ type: "success", text: "Homepage settings saved successfully" });
        setHasUnsavedChanges(false);
      } else {
        setMessage({ type: "error", text: "Failed to save settings" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    loadSettings();
    setHasUnsavedChanges(false);
    setMessage(null);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Media Card */}
          <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#DED6CA] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-luxury text-lg font-bold text-[#27231F]">Hero Media</h2>
              {previewImage && (
                <button
                  onClick={handleRemoveImage}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#C62828] hover:bg-[#FFEBEE] rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
            
            <div className="relative aspect-[16/9] max-w-lg bg-[#F6F2EA] rounded-xl overflow-hidden border border-[#DED6CA]">
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt="Hero preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#716A61] space-y-2">
                  <ImageIcon className="w-8 h-8 text-[#B58A3A]/50" />
                  <span className="text-sm">No custom hero image uploaded</span>
                  <span className="text-xs">Upload an image to replace the default hero</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs text-[#716A61]">
                <p className="font-medium mb-1">Recommended:</p>
                <ul className="space-y-0.5 ml-4 list-disc">
                  <li>Landscape image</li>
                  <li>High-resolution image</li>
                  <li>Image formats supported by the server</li>
                </ul>
              </div>
              <label className="flex items-center gap-2 px-4 py-2.5 bg-[#4A3628] text-[#FFFDF9] text-xs font-semibold rounded-xl hover:bg-[#352D27] transition-colors cursor-pointer w-fit">
                <Upload className="w-4 h-4" />
                <span>{isUploading ? "Uploading..." : previewImage ? "Replace Image" : "Upload Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Hero Content Card */}
          <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#DED6CA] space-y-4">
            <h2 className="font-serif-luxury text-lg font-bold text-[#27231F]">Hero Content</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#716A61] mb-1.5">
                  Eyebrow Text
                  <span className="text-[#B58A3A] ml-1">({settings?.heroEyebrow?.length || 0}/50)</span>
                </label>
                <input
                  type="text"
                  value={settings?.heroEyebrow || ""}
                  onChange={(e) => {
                    setSettings((prev) => ({ ...prev!, heroEyebrow: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  maxLength={50}
                  className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-4 py-2.5 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#716A61] mb-1.5">
                  Title
                  <span className="text-[#B58A3A] ml-1">({settings?.heroTitle?.length || 0}/100)</span>
                </label>
                <input
                  type="text"
                  value={settings?.heroTitle || ""}
                  onChange={(e) => {
                    setSettings((prev) => ({ ...prev!, heroTitle: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  maxLength={100}
                  className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-4 py-2.5 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#716A61] mb-1.5">
                  Highlighted Text
                  <span className="text-[#B58A3A] ml-1">({settings?.heroHighlightedText?.length || 0}/50)</span>
                </label>
                <input
                  type="text"
                  value={settings?.heroHighlightedText || ""}
                  onChange={(e) => {
                    setSettings((prev) => ({ ...prev!, heroHighlightedText: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  maxLength={50}
                  className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-4 py-2.5 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#716A61] mb-1.5">
                  Description
                  <span className="text-[#B58A3A] ml-1">({settings?.heroDescription?.length || 0}/200)</span>
                </label>
                <textarea
                  value={settings?.heroDescription || ""}
                  onChange={(e) => {
                    setSettings((prev) => ({ ...prev!, heroDescription: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  rows={3}
                  maxLength={200}
                  className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-4 py-2.5 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Hero CTA Card */}
          <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#DED6CA] space-y-4">
            <h2 className="font-serif-luxury text-lg font-bold text-[#27231F]">Call to Action</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#716A61] mb-1.5">
                  Primary Button Label
                </label>
                <input
                  type="text"
                  value={settings?.primaryButtonText || ""}
                  onChange={(e) => {
                    setSettings((prev) => ({ ...prev!, primaryButtonText: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-4 py-2.5 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#716A61] mb-1.5">
                  Primary Button Link
                </label>
                <input
                  type="text"
                  value={settings?.primaryButtonLink || ""}
                  onChange={(e) => {
                    setSettings((prev) => ({ ...prev!, primaryButtonLink: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-4 py-2.5 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#716A61] mb-1.5">
                  Secondary Button Label
                </label>
                <input
                  type="text"
                  value={settings?.secondaryButtonText || ""}
                  onChange={(e) => {
                    setSettings((prev) => ({ ...prev!, secondaryButtonText: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-4 py-2.5 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#716A61] mb-1.5">
                  Secondary Button Link
                </label>
                <input
                  type="text"
                  value={settings?.secondaryButtonLink || ""}
                  onChange={(e) => {
                    setSettings((prev) => ({ ...prev!, secondaryButtonLink: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-4 py-2.5 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
                />
              </div>
            </div>
          </div>

          {/* Visibility Settings */}
          <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#DED6CA] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-luxury text-lg font-bold text-[#27231F]">Hero Section</h2>
                <p className="text-xs text-[#716A61] mt-1">
                  {settings?.isHeroEnabled ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                      LIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F6F2EA] text-[#716A61] text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#716A61]" />
                      DISABLED
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  setSettings((prev) => ({ ...prev!, isHeroEnabled: !prev!.isHeroEnabled }));
                  setHasUnsavedChanges(true);
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings?.isHeroEnabled ? "bg-[#B58A3A]" : "bg-[#DED6CA]"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    settings?.isHeroEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div className="lg:col-span-1">
          <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#DED6CA] space-y-4 sticky top-6">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#B58A3A]" />
              <h2 className="font-serif-luxury text-lg font-bold text-[#27231F]">Live Preview</h2>
            </div>
            
            <div className="space-y-3">
              <div className="aspect-[4/3] bg-[#F6F2EA] rounded-xl overflow-hidden border border-[#DED6CA]">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Hero preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-[#716A61]">
                    <ImageIcon className="w-8 h-8 text-[#B58A3A]/50" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-[#B58A3A] font-semibold">
                  {settings?.heroEyebrow}
                </p>
                <h3 className="font-serif-luxury text-sm font-bold text-[#27231F] leading-tight">
                  {settings?.heroTitle} <span className="text-[#B58A3A]">{settings?.heroHighlightedText}</span>
                </h3>
                <p className="text-xs text-[#716A61] line-clamp-2">
                  {settings?.heroDescription}
                </p>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-[#4A3628] text-[#FFFDF9] text-[10px] font-semibold rounded-lg text-center">
                  {settings?.primaryButtonText}
                </div>
                <div className="flex-1 px-3 py-2 bg-[#F6F2EA] text-[#4A3628] text-[10px] font-semibold rounded-lg text-center border border-[#DED6CA]">
                  {settings?.secondaryButtonText}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Save Bar */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#FFFDF9] border-t border-[#DED6CA] p-4 shadow-lg z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B58A3A]" />
              <span className="text-xs font-medium text-[#27231F]">Unsaved Changes</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDiscard}
                className="px-4 py-2 text-xs font-medium text-[#716A61] hover:text-[#27231F] transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-[#4A3628] text-[#FFFDF9] font-bold text-xs rounded-xl hover:bg-[#352D27] disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
