"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { fetchApi } from "@/lib/api";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  GripVertical,
  Image as ImageIcon,
  Loader2,
  PlayCircle,
  Save,
  Search,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type HeroMode = "BOOKS" | "IMAGE" | "VIDEO";
type BackgroundAnimation = "NONE" | "SOFT_GRADIENT" | "FLOATING_LIGHT";

interface BookOption {
  _id: string;
  title: string;
  slug: string;
  author: string;
  coverImage: string;
  finalPrice: number;
}

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
  heroMode: HeroMode;
  heroBookIds: BookOption[];
  heroRotationEnabled: boolean;
  heroRotationInterval: number;
  heroVideoUrl?: string;
  heroVideoPublicId?: string;
  heroBackgroundAnimation: BackgroundAnimation;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? "bg-[#B58A3A]" : "bg-neutral-200"
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function FieldLabel({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
      {children}
      {note && <span className="font-normal text-neutral-400 ml-1">{note}</span>}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  maxLength,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-[#B58A3A] focus:ring-1 focus:ring-[#B58A3A]/30 transition-colors placeholder-neutral-400"
      />
      {maxLength && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-5">
      <h2 className="text-sm font-bold text-[#111] border-b border-neutral-100 pb-3">{title}</h2>
      {children}
    </div>
  );
}

// ─── Hero Books Selector ───────────────────────────────────────────────────────

function HeroBooksSelector({
  selected,
  onChange,
}: {
  selected: BookOption[];
  onChange: (books: BookOption[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookOption[]>([]);
  const [searching, setSearching] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    try {
      setSearching(true);
      const res = await fetchApi<{ books: BookOption[] }>(
        `/books?search=${encodeURIComponent(q)}&limit=8`
      );
      if (res.success && res.data?.books) {
        setResults(res.data.books);
      }
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => { void search(query); }, 350);
    return () => clearTimeout(id);
  }, [query, search]);

  const addBook = (book: BookOption) => {
    if (selected.length >= 8) return;
    if (selected.some((b) => b._id === book._id)) return;
    onChange([...selected, book]);
    setQuery("");
    setResults([]);
  };

  const removeBook = (id: string) => {
    onChange(selected.filter((b) => b._id !== id));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const arr = [...selected];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    onChange(arr);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <FieldLabel note={`${selected.length}/8 selected`}>Search &amp; Add Books</FieldLabel>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type book title or author..."
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-[#B58A3A] focus:ring-1 focus:ring-[#B58A3A]/30"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B58A3A] animate-spin" />
          )}
        </div>

        {/* Results dropdown */}
        {results.length > 0 && (
          <div className="mt-1 border border-neutral-200 rounded-xl overflow-hidden shadow-md bg-white max-h-64 overflow-y-auto">
            {results.map((book) => {
              const isAdded = selected.some((b) => b._id === book._id);
              return (
                <button
                  key={book._id}
                  type="button"
                  onClick={() => addBook(book)}
                  disabled={isAdded || selected.length >= 8}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    isAdded
                      ? "bg-amber-50 cursor-default"
                      : "hover:bg-neutral-50 cursor-pointer"
                  }`}
                >
                  <div className="relative w-8 h-11 rounded flex-shrink-0 overflow-hidden border border-neutral-200 bg-neutral-100">
                    {book.coverImage && (
                      <Image src={book.coverImage} alt={book.title} fill className="object-cover" unoptimized />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-neutral-800 line-clamp-1">{book.title}</p>
                    <p className="text-[11px] text-neutral-400">{book.author}</p>
                  </div>
                  {isAdded ? (
                    <span className="text-[10px] font-bold text-[#B58A3A] flex-shrink-0">Added</span>
                  ) : (
                    <span className="text-[10px] font-bold text-neutral-400 flex-shrink-0">Add</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected books list */}
      {selected.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-neutral-500 font-medium">Selected Hero Books (drag or use arrows to reorder)</p>
          {selected.map((book, idx) => (
            <div
              key={book._id}
              className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100"
            >
              <GripVertical className="w-4 h-4 text-neutral-300 flex-shrink-0" />
              <div className="relative w-8 h-11 rounded flex-shrink-0 overflow-hidden border border-neutral-200 bg-neutral-100">
                {book.coverImage && (
                  <Image src={book.coverImage} alt={book.title} fill className="object-cover" unoptimized />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-neutral-800 line-clamp-1">{book.title}</p>
                <p className="text-[11px] text-neutral-400 line-clamp-1">{book.author}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg hover:bg-neutral-200 disabled:opacity-30 text-neutral-500"
                  title="Move up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === selected.length - 1}
                  className="p-1.5 rounded-lg hover:bg-neutral-200 disabled:opacity-30 text-neutral-500"
                  title="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeBook(book._id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected.length === 0 && (
        <p className="text-xs text-neutral-400 text-center py-4 border border-dashed border-neutral-200 rounded-xl">
          No books selected. Search above to add books to the hero showcase.
          <br />
          <span className="text-neutral-300">If none selected, featured books are used as fallback.</span>
        </p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminHomepagePage() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Helper to update a field
  const set = <K extends keyof HomepageSettings>(key: K, value: HomepageSettings[K]) => {
    setSettings((prev) => ({ ...prev!, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetchApi<HomepageSettings>("/homepage");
      if (res.success && res.data) {
        setSettings({
          ...res.data,
          heroBookIds: Array.isArray(res.data.heroBookIds) ? res.data.heroBookIds : [],
          heroMode: res.data.heroMode ?? "BOOKS",
          heroRotationEnabled: res.data.heroRotationEnabled ?? true,
          heroRotationInterval: res.data.heroRotationInterval ?? 4000,
          heroBackgroundAnimation: res.data.heroBackgroundAnimation ?? "SOFT_GRADIENT",
        });
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    if (!settings) return;
    try {
      setIsSaving(true);
      // Send book IDs (not full objects)
      const payload = {
        ...settings,
        heroBookIds: settings.heroBookIds.map((b) =>
          typeof b === "string" ? b : b._id
        ),
      };
      const res = await fetchApi<HomepageSettings>("/homepage", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (res.success) {
        setMessage({ type: "success", text: "Homepage settings saved successfully" });
        setHasUnsavedChanges(false);
        // Reload to get populated books back
        await loadSettings();
      } else {
        setMessage({ type: "error", text: "Failed to save settings" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setIsSaving(false);
    }
  };

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
        setHasUnsavedChanges(true);
        setMessage({ type: "success", text: "Image uploaded" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#B58A3A] animate-spin" />
      </div>
    );
  }

  const mode = settings?.heroMode ?? "BOOKS";

  return (
    <div className="space-y-6 pb-28">
      {/* Top Page Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#111]">Homepage Hero Configuration</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure how the hero section appears to visitors on your store
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <button
              onClick={() => {
                void loadSettings();
                setHasUnsavedChanges(false);
                setMessage(null);
              }}
              type="button"
              className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
            >
              Discard Changes
            </button>
          )}
          <button
            onClick={() => void handleSave()}
            disabled={isSaving}
            type="button"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#B58A3A] text-white font-bold text-xs rounded-xl hover:bg-[#9E7730] disabled:opacity-50 transition-all shadow-md active:scale-95"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Hero Status */}
          <Card title="Hero Section Visibility">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-700">Show Hero on Homepage</p>
                <p className="text-xs text-neutral-400 mt-0.5">Disable to hide the hero entirely</p>
              </div>
              <Toggle
                id="hero-enabled"
                checked={settings?.isHeroEnabled ?? true}
                onChange={(v) => set("isHeroEnabled", v)}
              />
            </div>
          </Card>

          {/* Hero Mode */}
          <Card title="Hero Mode">
            <p className="text-xs text-neutral-500 -mt-2">Choose what to display on the right side of the hero</p>
            <div className="grid grid-cols-3 gap-3">
              {(["BOOKS", "IMAGE", "VIDEO"] as HeroMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set("heroMode", m)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-semibold ${
                    mode === m
                      ? "border-[#B58A3A] bg-amber-50 text-[#B58A3A]"
                      : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                  }`}
                >
                  {m === "BOOKS" && <Eye className="w-5 h-5" />}
                  {m === "IMAGE" && <ImageIcon className="w-5 h-5" />}
                  {m === "VIDEO" && <Video className="w-5 h-5" />}
                  <span>{m === "BOOKS" ? "Book Showcase" : m === "IMAGE" ? "Static Image" : "Video"}</span>
                </button>
              ))}
            </div>

            {/* BOOKS sub-settings */}
            {mode === "BOOKS" && (
              <div className="space-y-5 pt-4 border-t border-neutral-100">
                <HeroBooksSelector
                  selected={settings?.heroBookIds ?? []}
                  onChange={(books) => set("heroBookIds", books)}
                />

                {/* Rotation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div>
                      <p className="text-xs font-semibold text-neutral-700">Auto-Rotate Books</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Cycle through selected books</p>
                    </div>
                    <Toggle
                      id="rotation-enabled"
                      checked={settings?.heroRotationEnabled ?? true}
                      onChange={(v) => set("heroRotationEnabled", v)}
                    />
                  </div>

                  {settings?.heroRotationEnabled && (
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                      <p className="text-xs font-semibold text-neutral-700 mb-2">
                        Rotation Speed
                        <span className="font-normal text-neutral-400 ml-1">
                          {((settings?.heroRotationInterval ?? 4000) / 1000).toFixed(1)}s
                        </span>
                      </p>
                      <input
                        type="range"
                        min={2500}
                        max={15000}
                        step={500}
                        value={settings?.heroRotationInterval ?? 4000}
                        onChange={(e) => set("heroRotationInterval", Number(e.target.value))}
                        className="w-full accent-[#B58A3A]"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                        <span>Fast (2.5s)</span>
                        <span>Slow (15s)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* IMAGE sub-settings */}
            {mode === "IMAGE" && (
              <div className="pt-4 border-t border-neutral-100 space-y-4">
                <FieldLabel>Hero Image</FieldLabel>
                <div className="relative aspect-video max-w-md bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200">
                  {settings?.heroImage ? (
                    <Image src={settings.heroImage} alt="Hero" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-2">
                      <ImageIcon className="w-8 h-8 text-neutral-300" />
                      <span className="text-xs">No image uploaded</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-800 text-white text-xs font-semibold rounded-xl hover:bg-neutral-700 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? "Uploading..." : settings?.heroImage ? "Replace Image" : "Upload Image"}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="hidden" />
                  </label>
                  {settings?.heroImage && (
                    <button
                      type="button"
                      onClick={() => { set("heroImage", ""); set("heroImagePublicId", ""); }}
                      className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* VIDEO sub-settings */}
            {mode === "VIDEO" && (
              <div className="pt-4 border-t border-neutral-100 space-y-4">
                <FieldLabel>Hero Video URL</FieldLabel>
                <p className="text-xs text-neutral-400 -mt-3">Paste a direct video URL (Cloudinary or other CDN)</p>
                <TextInput
                  value={settings?.heroVideoUrl ?? ""}
                  onChange={(v) => set("heroVideoUrl", v)}
                  placeholder="https://..."
                />
                {settings?.heroVideoUrl && (
                  <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
                    <video
                      src={settings.heroVideoUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      poster={settings.heroImage || undefined}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                      <PlayCircle className="w-10 h-10 text-white/80" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Background Animation */}
          <Card title="Background Animation">
            <p className="text-xs text-neutral-500 -mt-2">Subtle CSS animation behind the hero</p>
            <div className="grid grid-cols-3 gap-3">
              {(["NONE", "SOFT_GRADIENT", "FLOATING_LIGHT"] as BackgroundAnimation[]).map((anim) => {
                const labels: Record<BackgroundAnimation, string> = {
                  NONE: "None",
                  SOFT_GRADIENT: "Soft Gradient",
                  FLOATING_LIGHT: "Floating Light",
                };
                const current = settings?.heroBackgroundAnimation ?? "SOFT_GRADIENT";
                return (
                  <button
                    key={anim}
                    type="button"
                    onClick={() => set("heroBackgroundAnimation", anim)}
                    className={`py-3 px-4 rounded-xl border-2 text-xs font-semibold transition-all ${
                      current === anim
                        ? "border-[#B58A3A] bg-amber-50 text-[#B58A3A]"
                        : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                    }`}
                  >
                    {labels[anim]}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Hero Content */}
          <Card title="Hero Content">
            <div className="space-y-4">
              <div>
                <FieldLabel note="(small text above heading)">Eyebrow Text</FieldLabel>
                <TextInput
                  value={settings?.heroEyebrow ?? ""}
                  onChange={(v) => set("heroEyebrow", v)}
                  maxLength={60}
                  placeholder="CURATED FOR YOU"
                />
              </div>
              <div>
                <FieldLabel>Main Headline</FieldLabel>
                <TextInput
                  value={settings?.heroTitle ?? ""}
                  onChange={(v) => set("heroTitle", v)}
                  maxLength={100}
                  placeholder="Discover Your Next Great Read"
                />
              </div>
              <div>
                <FieldLabel note="(renders in gold)">Highlighted Word / Phrase</FieldLabel>
                <TextInput
                  value={settings?.heroHighlightedText ?? ""}
                  onChange={(v) => set("heroHighlightedText", v)}
                  maxLength={60}
                  placeholder="Leave blank to disable"
                />
              </div>
              <div>
                <FieldLabel>Supporting Description</FieldLabel>
                <textarea
                  value={settings?.heroDescription ?? ""}
                  onChange={(e) => set("heroDescription", e.target.value)}
                  maxLength={250}
                  rows={3}
                  placeholder="Explore carefully selected books..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-[#B58A3A] focus:ring-1 focus:ring-[#B58A3A]/30 resize-none"
                />
                <p className="text-[11px] text-neutral-400 mt-1 text-right">
                  {(settings?.heroDescription ?? "").length}/250
                </p>
              </div>
            </div>
          </Card>

          {/* CTA Buttons */}
          <Card title="Call to Action Buttons">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Primary Button Label</FieldLabel>
                <TextInput
                  value={settings?.primaryButtonText ?? ""}
                  onChange={(v) => set("primaryButtonText", v)}
                  maxLength={40}
                  placeholder="Browse Collection"
                />
              </div>
              <div>
                <FieldLabel>Primary Button URL</FieldLabel>
                <TextInput
                  value={settings?.primaryButtonLink ?? ""}
                  onChange={(v) => set("primaryButtonLink", v)}
                  placeholder="/books"
                />
              </div>
              <div>
                <FieldLabel>Secondary Button Label</FieldLabel>
                <TextInput
                  value={settings?.secondaryButtonText ?? ""}
                  onChange={(v) => set("secondaryButtonText", v)}
                  maxLength={40}
                  placeholder="View Deals"
                />
              </div>
              <div>
                <FieldLabel>Secondary Button URL</FieldLabel>
                <TextInput
                  value={settings?.secondaryButtonLink ?? ""}
                  onChange={(v) => set("secondaryButtonLink", v)}
                  placeholder="/books?sort=discount"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* ── Right Column: Live Preview ────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-4 sticky top-6">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#B58A3A]" />
              <h2 className="text-sm font-bold text-[#111]">Hero Preview</h2>
            </div>

            {/* Mini preview */}
            <div className="bg-neutral-50 rounded-xl border border-neutral-100 p-4 space-y-3">
              {/* Eyebrow */}
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#B58A3A]">
                {settings?.heroEyebrow || "CURATED FOR YOU"}
              </p>

              {/* Headline */}
              <p className="text-sm font-bold text-[#111] leading-snug">
                {settings?.heroTitle || "Discover Your Next Great Read"}
                {settings?.heroHighlightedText && (
                  <span className="text-[#B58A3A]"> {settings.heroHighlightedText}</span>
                )}
              </p>

              {/* Description */}
              <p className="text-[11px] text-neutral-500 line-clamp-2 leading-snug">
                {settings?.heroDescription || "Explore carefully selected books..."}
              </p>

              {/* CTAs */}
              <div className="flex gap-2 pt-1">
                <div className="flex-1 py-2 bg-[#111] text-white text-[10px] font-bold rounded-lg text-center">
                  {settings?.primaryButtonText || "Browse Collection"}
                </div>
                <div className="flex-1 py-2 border border-[#B58A3A] text-[#B58A3A] text-[10px] font-bold rounded-lg text-center">
                  {settings?.secondaryButtonText || "View Deals"}
                </div>
              </div>

              {/* Visual side preview */}
              {mode === "BOOKS" && settings?.heroBookIds && settings.heroBookIds.length > 0 && (
                <div className="flex items-end justify-center gap-2 pt-2">
                  {settings.heroBookIds.slice(0, 3).map((book, i) => (
                    <div
                      key={book._id}
                      className={`relative rounded overflow-hidden border border-neutral-200 bg-neutral-100 flex-shrink-0 ${
                        i === 1 ? "w-14 h-20 shadow-lg z-10" : "w-10 h-14 opacity-70"
                      }`}
                      style={{
                        transform:
                          i === 0 ? "rotate(-5deg) translateY(4px)" :
                          i === 2 ? "rotate(5deg) translateY(6px)" :
                          "none",
                      }}
                    >
                      {book.coverImage && (
                        <Image src={book.coverImage} alt={book.title} fill className="object-cover" unoptimized sizes="56px" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {mode === "IMAGE" && settings?.heroImage && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-neutral-200 mt-2">
                  <Image src={settings.heroImage} alt="Hero" fill className="object-cover" unoptimized />
                </div>
              )}
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${settings?.isHeroEnabled ? "bg-green-400" : "bg-neutral-300"}`}
              />
              <span className="text-xs text-neutral-500">
                {settings?.isHeroEnabled ? "Hero is Live" : "Hero is Disabled"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Save Bar */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-[#1F1A17] text-white border-t border-[#352D27] p-4 shadow-2xl z-50 transition-all">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B58A3A] animate-pulse" />
              <span className="text-xs font-semibold text-neutral-200">You have unsaved changes</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { void loadSettings(); setHasUnsavedChanges(false); setMessage(null); }}
                type="button"
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Discard
              </button>
              <button
                onClick={() => void handleSave()}
                disabled={isSaving}
                type="button"
                className="flex items-center gap-2 px-6 py-2.5 bg-[#B58A3A] text-white font-bold text-xs rounded-xl hover:bg-[#9E7730] disabled:opacity-50 transition-all shadow-lg active:scale-95"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
