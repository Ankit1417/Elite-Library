"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchApi } from "./api";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: string | null;
  birthdayOffersEnabled: boolean;
  birthdayUpdatedAt?: string | null;
  birthdayPromptDismissedAt?: string | null;
}

interface AuthContextType {
  customer: Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setCustomer: (customer: Customer | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      const res = await fetchApi<{ customer: Customer }>("/auth/me");
      if (res.success && res.data.customer) {
        setCustomer(res.data.customer);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    }
  };

  const logout = async () => {
    try {
      await fetchApi("/auth/logout", { method: "POST" });
    } catch {
      // Ignore logout errors
    } finally {
      setCustomer(null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    // Defer refreshAuth to avoid synchronous setState
    setTimeout(() => {
      refreshAuth().finally(() => {
        if (isMounted) setIsLoading(false);
      });
    }, 0);
    return () => { isMounted = false; };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        customer,
        isLoading,
        isAuthenticated: !!customer,
        refreshAuth,
        logout,
        setCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
