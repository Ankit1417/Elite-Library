import { fetchApi, isAbortError } from "@/lib/api";
import { CategoryItem } from "@/components/CategorySection";

let cachedCategories: CategoryItem[] | null = null;
let inflightCategoriesPromise: Promise<CategoryItem[]> | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes in-memory cache

export interface GetCategoriesOptions {
  signal?: AbortSignal;
  forceRefresh?: boolean;
}

/**
 * Fetch categories with deduplication and in-memory caching.
 * Multiple components calling this simultaneously share the same in-flight request.
 */
export async function getCategories(
  options?: GetCategoriesOptions
): Promise<CategoryItem[]> {
  const now = Date.now();

  // Return cached result if fresh and not forcing refresh
  if (
    !options?.forceRefresh &&
    cachedCategories !== null &&
    now - lastFetchTime < CACHE_TTL_MS
  ) {
    return cachedCategories;
  }

  // If a request is already in-flight, return the shared promise
  if (inflightCategoriesPromise) {
    return inflightCategoriesPromise;
  }

  inflightCategoriesPromise = (async () => {
    try {
      const res = await fetchApi<CategoryItem[]>("/categories", {
        signal: options?.signal,
      });

      if (res.success && Array.isArray(res.data)) {
        cachedCategories = res.data;
        lastFetchTime = Date.now();
        return res.data;
      }

      return cachedCategories || [];
    } catch (err) {
      if (isAbortError(err, options?.signal)) {
        // Return existing cached data if aborted
        return cachedCategories || [];
      }
      throw err;
    } finally {
      inflightCategoriesPromise = null;
    }
  })();

  return inflightCategoriesPromise;
}

/**
 * Clear the in-memory categories cache (useful after category CRUD operations in admin).
 */
export function clearCategoryCache(): void {
  cachedCategories = null;
  lastFetchTime = 0;
  inflightCategoriesPromise = null;
}
