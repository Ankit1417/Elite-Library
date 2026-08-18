"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchApi } from "@/lib/api";
import { clearCategoryCache } from "@/lib/categories";
import { Edit, FolderPlus, Trash2, Plus } from "lucide-react";

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  bookCount?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetchApi<CategoryItem[]>("/categories?includeInactive=true");
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchApi<CategoryItem[]>("/categories?includeInactive=true")
      .then((res) => {
        if (isMounted && res.success) {
          setCategories(res.data);
        }
      })
      .catch((err) => console.error("Failed to load categories", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const resetForm = () => {
    setIsEditing(null);
    setName("");
    setSlug("");
    setDescription("");
    setImage("");
    setIsActive(true);
    setError(null);
  };

  const handleStartEdit = (cat: CategoryItem) => {
    setIsEditing(cat._id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setIsActive(cat.isActive);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        image: image.trim() || undefined,
        isActive,
      };

      let res;
      if (isEditing) {
        res = await fetchApi(`/categories/${isEditing}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetchApi("/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      if (res.success) {
        clearCategoryCache();
        resetForm();
        fetchCategories();
      } else {
        setError(res.message || "Operation failed");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    try {
      const res = await fetchApi(`/categories/${id}`, { method: "DELETE" });
      if (res.success) {
        clearCategoryCache();
        fetchCategories();
      } else {
        alert(res.message || "Failed to delete category");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Cannot delete category");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl font-bold text-[#27231F]">Categories</h1>
          <p className="text-sm text-[#716A61] mt-1">Organize book categories</p>
        </div>

        <button
          onClick={() => resetForm()}
          className="px-5 py-2.5 bg-[#4A3628] text-[#FFFDF9] font-bold text-xs rounded-xl hover:bg-[#352D27] transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Card (Left 5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#DED6CA] space-y-4 sticky top-6">
            <h3 className="font-serif-luxury font-bold text-lg text-[#27231F] border-b border-[#DED6CA] pb-3 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-[#B58A3A]" />
              <span>{isEditing ? "Edit Category" : "Add New Category"}</span>
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-[#FFEBEE] border border-[#C62828]/30 text-[#C62828] text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#716A61] block mb-1">
                  Category Name <span className="text-[#B58A3A]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Existential Philosophy"
                  required
                  className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-3.5 py-2.5 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#716A61] block mb-1">
                  Slug (Optional)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. existential-philosophy"
                  className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-3.5 py-2.5 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#716A61] block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief synopsis of this genre..."
                  className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl p-3 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#716A61] block mb-1">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#F6F2EA] border border-[#DED6CA] rounded-xl px-3.5 py-2.5 text-xs text-[#27231F] focus:outline-none focus:border-[#B58A3A]"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-[#716A61] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-[#B58A3A] w-4 h-4"
                />
                <span>Active in Store</span>
              </label>

              <div className="flex gap-2 pt-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-1/3 py-2.5 bg-[#F6F2EA] text-[#716A61] font-semibold text-xs rounded-xl border border-[#DED6CA]"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-[#4A3628] text-[#FFFDF9] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#352D27] disabled:opacity-50 transition-all"
                >
                  {isSubmitting
                    ? "Saving..."
                    : isEditing
                    ? "Update Category"
                    : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Categories Table (Right 7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#DED6CA] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#27231F]">
                <thead className="bg-[#F6F2EA] text-[#716A61] uppercase tracking-wider font-semibold border-b border-[#DED6CA]">
                  <tr>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Books</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DED6CA]/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#716A61]">
                        Loading categories...
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#716A61]">
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    categories.map((c) => (
                      <tr key={c._id} className="hover:bg-[#F6F2EA]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {c.image && (
                              <div className="relative aspect-square w-10 rounded overflow-hidden bg-[#F6F2EA] shrink-0">
                                <Image
                                  src={c.image}
                                  alt={c.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-serif-luxury font-bold text-[#27231F] block">
                                {c.name}
                              </span>
                              {c.description && (
                                <span className="text-[11px] text-[#716A61] line-clamp-1">
                                  {c.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[#716A61]">
                          {c.slug}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#27231F]">
                          {c.bookCount || 0}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              c.isActive
                                ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30"
                                : "bg-[#F6F2EA] text-[#716A61] border border-[#DED6CA]"
                            }`}
                          >
                            {c.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStartEdit(c)}
                              className="p-1.5 text-[#B58A3A] hover:bg-[#F6F2EA] rounded transition-colors"
                              title="Edit Category"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(c._id, c.name)}
                              className="p-1.5 text-[#C62828] hover:bg-[#FFEBEE] rounded transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
