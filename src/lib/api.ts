const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: unknown;
}

let isRedirectingToLogin = false;

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

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

  try {
    const res = await fetch(url, config);
    const data = await res.json();

    if (!res.ok) {
      // Handle 401 Unauthorized - redirect to login for admin routes
      // Exclude /admin/auth/me to let the layout handle it
      if (res.status === 401 && endpoint.startsWith("/admin") && endpoint !== "/admin/auth/me") {
        if (!isRedirectingToLogin) {
          isRedirectingToLogin = true;
          if (typeof window !== "undefined") {
            window.location.href = "/admin/login";
          }
        }
        throw new Error("Session expired. Please log in again.");
      }
      throw new Error(data.message || `HTTP error! status: ${res.status}`);
    }

    return data as ApiResponse<T>;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected network error occurred");
  }
}
