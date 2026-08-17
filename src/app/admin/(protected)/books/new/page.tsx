"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { CategoryItem } from "@/components/CategorySection";
import { ArrowLeft, Upload, X } from "lucide-react";

export default function NewBookPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    author: "",
    description: "",
    category: "",
    publisher: "",
    isbn: "",
    language: "English",
    pages: 250,
    publicationYear: new Date().getFullYear(),
    edition: "Standard Edition",
    coverImage: "",
    coverImagePublicId: "",
    additionalImages: [] as string[],
    additionalImagePublicIds: [] as string[],
    price: 2500,
    discountPercentage: 0,
    stockQuantity: 10,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isActive: true,
  });

  useEffect(() => {
    async function loadCategories() {
      const res = await fetchApi<CategoryItem[]>("/categories?includeInactive=true");
      if (res.success && res.data.length > 0) {
        setCategories(res.data);
        setFormData((prev) => ({ ...prev, category: res.data[0]._id }));
      }
    }
    loadCategories();
  }, []);

  const computedFinalPrice =
    Math.round(
      formData.price * (1 - (formData.discountPercentage || 0) / 100) * 100
    ) / 100;

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "cover" | "additional"
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setError(null);

      if (target === "cover") {
        const file = files[0];
        const bodyData = new FormData();
        bodyData.append("image", file);
        bodyData.append("imageType", "cover");

        const res = await fetchApi<{ url: string; public_id: string }>("/upload/single", {
          method: "POST",
          body: bodyData,
        });

        if (res.success && res.data?.url) {
          setFormData((prev) => ({ 
            ...prev, 
            coverImage: res.data.url,
            coverImagePublicId: res.data.public_id || ""
          }));
        }
      } else {
        if (formData.additionalImages.length + files.length > 5) {
          setError("Maximum 5 additional images allowed");
          return;
        }
        
        const bodyData = new FormData();
        Array.from(files).forEach((file) => bodyData.append("images", file));

        const res = await fetchApi<{ url: string; public_id: string }[]>("/upload/multiple", {
          method: "POST",
          body: bodyData,
        });

        if (res.success && res.data) {
          const newUrls = res.data.map((i) => i.url);
          const newPublicIds = res.data.map((i) => i.public_id || "");
          setFormData((prev) => ({
            ...prev,
            additionalImages: [...prev.additionalImages, ...newUrls],
            additionalImagePublicIds: [...prev.additionalImagePublicIds, ...newPublicIds],
          }));
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.author || !formData.category || !formData.coverImage) {
      setError("Title, author, category, and cover image are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetchApi("/books", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (res.success) {
        router.push("/admin/books");
      } else {
        setError(res.message || "Failed to create book");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Error creating book");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href="/admin/books"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-200 transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Books Inventory</span>
      </Link>

      <div>
        <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
          Catalog Expansion
        </span>
        <h1 className="font-serif-luxury text-3xl font-bold text-slate-100 mt-1">
          Add New Book Title
        </h1>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Book Info */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-serif-luxury text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
            1. Title & Authorship
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Book Title <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. The Picture of Dorian Gray"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Author Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="e.g. Oscar Wilde"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Category / Genre <span className="text-amber-400">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-[#d4af37]"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Custom Slug (Optional)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Auto-generated if left empty"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Description / Overview <span className="text-amber-400">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed synopsis of the literary work..."
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-serif-luxury text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
            2. Pricing & Stock Inventory
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Original Price (Rs.) <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData.discountPercentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountPercentage: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Available Stock <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={formData.stockQuantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stockQuantity: Number(e.target.value),
                  })
                }
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">
              Calculated Final Selling Price:
            </span>
            <span className="font-serif-luxury text-xl font-bold gold-gradient-text">
              Rs. {computedFinalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Cloudinary Image Upload Section */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-serif-luxury text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
            3. Media Assets & Covers
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Primary Cover Image <span className="text-amber-400">*</span>
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {formData.coverImage ? (
                <div className="relative aspect-[3/4] w-24 rounded-lg overflow-hidden border border-[#d4af37]">
                  <Image
                    src={formData.coverImage}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, coverImage: "", coverImagePublicId: "" })}
                    className="absolute top-1 right-1 p-1 bg-rose-950/80 text-rose-300 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : null}

              <div className="space-y-2 flex-1">
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="Or enter direct Image URL..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-[#d4af37] text-xs font-semibold text-amber-200 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? "Uploading..." : "Upload Cover File"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleImageUpload(e, "cover")}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Additional Gallery Images (Max 5)
            </label>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {formData.additionalImages.map((img, index) => (
                <div key={index} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-slate-700">
                  <Image
                    src={img}
                    alt={`Gallery ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        additionalImages: prev.additionalImages.filter((_, i) => i !== index),
                        additionalImagePublicIds: prev.additionalImagePublicIds.filter((_, i) => i !== index),
                      }));
                    }}
                    className="absolute top-1 right-1 p-1 bg-rose-950/80 text-rose-300 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-[#d4af37] text-xs font-semibold text-amber-200 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{isUploading ? "Uploading..." : "Upload Gallery Images"}</span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={(e) => handleImageUpload(e, "additional")}
                className="hidden"
                disabled={isUploading || formData.additionalImages.length >= 5}
              />
            </label>
          </div>
        </div>

        {/* Book Specs & Publishing Details */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-serif-luxury text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
            4. Publishing & Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Publisher
              </label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                placeholder="e.g. Penguin Classics"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                ISBN
              </label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="e.g. 978-0140449334"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Language
              </label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-serif-luxury text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
            5. Flags & Display Settings
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData({ ...formData, isFeatured: e.target.checked })
                }
                className="accent-[#d4af37] w-4 h-4"
              />
              <span>Featured Highlight</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isBestSeller}
                onChange={(e) =>
                  setFormData({ ...formData, isBestSeller: e.target.checked })
                }
                className="accent-[#d4af37] w-4 h-4"
              />
              <span>Best Seller</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNewArrival}
                onChange={(e) =>
                  setFormData({ ...formData, isNewArrival: e.target.checked })
                }
                className="accent-[#d4af37] w-4 h-4"
              />
              <span>New Arrival</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="accent-[#d4af37] w-4 h-4"
              />
              <span>Active in Store</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-amber-600 text-slate-950 font-bold rounded-xl text-sm hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/10"
        >
          {isSubmitting ? "Saving Book..." : "Publish Book Title"}
        </button>
      </form>
    </div>
  );
}
