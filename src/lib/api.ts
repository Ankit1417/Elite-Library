const RAW_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: unknown;
}

let isRedirectingToLogin = false;

/**
 * Checks whether an error or request was intentionally aborted.
 */
export function isAbortError(error: unknown, signal?: AbortSignal | null): boolean {
  if (signal?.aborted) return true;
  if (error instanceof DOMException && error.name === "AbortError") return true;
  if (
    error instanceof Error &&
    (error.name === "AbortError" ||
      error.message.toLowerCase().includes("aborted") ||
      error.message.toLowerCase().includes("signal is aborted"))
  ) {
    return true;
  }
  return false;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  const method = (options.method || "GET").toUpperCase();

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...((options.headers as Record<string, string>) || {}),
  };

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Required for HTTP-only JWT cookies
  };

  let res: Response;
  try {
    res = await fetch(url, config);
  } catch (error: unknown) {
    const aborted = isAbortError(error, options.signal);

    // Only log real network failures (e.g. ECONNREFUSED, CORS, offline), NEVER intentional aborts
    if (process.env.NODE_ENV === "development" && !aborted) {
      console.error("API request network failure:", {
        method,
        endpoint: normalizedEndpoint,
        resolvedUrl: url,
        cause: error instanceof Error ? error.message : String(error),
      });
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected network error occurred");
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const serverMessage =
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : undefined;

    const errorMessage = serverMessage || `HTTP error! status: ${res.status}`;

    // 401 on check-auth endpoints (/auth/me or /admin/auth/me) is expected for unauthenticated users
    const isExpectedUnauth =
      res.status === 401 &&
      (normalizedEndpoint === "/auth/me" || normalizedEndpoint === "/admin/auth/me");

    if (process.env.NODE_ENV === "development" && !isExpectedUnauth) {
      console.error(
        `API request failed: ${method} ${normalizedEndpoint} → ${res.status}`,
        { resolvedUrl: url, message: errorMessage }
      );
    }

    // Handle 401 Unauthorized - redirect to login for admin routes
    // Exclude /admin/auth/me to let the layout handle it
    if (
      res.status === 401 &&
      normalizedEndpoint.startsWith("/admin") &&
      normalizedEndpoint !== "/admin/auth/me"
    ) {
      if (!isRedirectingToLogin) {
        isRedirectingToLogin = true;
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
      }
      throw new Error("Session expired. Please log in again.");
    }
    throw new Error(errorMessage);
  }

  return data as ApiResponse<T>;
}
