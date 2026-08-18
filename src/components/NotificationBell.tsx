"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpenCheck,
  CakeSlice,
  CheckCheck,
  Gift,
  Info,
  PackageCheck,
  Truck,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/authContext";

export const NOTIFICATIONS_CHANGED_EVENT = "elite-library:notifications-changed";

export type NotificationType =
  | "BIRTHDAY_REWARD"
  | "ORDER_PLACED"
  | "ORDER_CONFIRMED"
  | "ORDER_PROCESSING"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "ORDER_REFUNDED"
  | "DEAL"
  | "SYSTEM";

export interface NotificationItem {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: NotificationItem[];
  total: number;
  page: number;
  pages: number;
}

export function getNotificationHref(notification: NotificationItem) {
  const orderId = notification.data?.orderId;
  if (typeof orderId === "string" && orderId) return `/orders/${orderId}`;

  if (notification.type === "BIRTHDAY_REWARD" || notification.type === "DEAL") {
    return "/coupons";
  }

  if (notification.type.startsWith("ORDER_")) return "/orders";
  return "/notifications";
}

export function formatNotificationTime(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Recently";

  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const ranges: { limit: number; divisor: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { limit: 60, divisor: 1, unit: "second" },
    { limit: 3_600, divisor: 60, unit: "minute" },
    { limit: 86_400, divisor: 3_600, unit: "hour" },
    { limit: 604_800, divisor: 86_400, unit: "day" },
    { limit: 2_592_000, divisor: 604_800, unit: "week" },
    { limit: 31_536_000, divisor: 2_592_000, unit: "month" },
    { limit: Number.POSITIVE_INFINITY, divisor: 31_536_000, unit: "year" },
  ];
  const absoluteSeconds = Math.abs(seconds);
  const range = ranges.find((candidate) => absoluteSeconds < candidate.limit) ?? ranges[0];

  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    Math.round(seconds / range.divisor),
    range.unit
  );
}

export function NotificationTypeIcon({ type }: { type: NotificationType }) {
  const iconClassName = "h-4 w-4";

  if (type === "BIRTHDAY_REWARD") {
    return <CakeSlice className={iconClassName} aria-hidden="true" />;
  }
  if (type === "DEAL") return <Gift className={iconClassName} aria-hidden="true" />;
  if (type === "ORDER_SHIPPED") {
    return <Truck className={iconClassName} aria-hidden="true" />;
  }
  if (type === "ORDER_DELIVERED") {
    return <BookOpenCheck className={iconClassName} aria-hidden="true" />;
  }
  if (type.startsWith("ORDER_")) {
    return <PackageCheck className={iconClassName} aria-hidden="true" />;
  }
  return <Info className={iconClassName} aria-hidden="true" />;
}

function announceNotificationChange() {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

export default function NotificationBell() {
  const router = useRouter();
  const { isAuthenticated, customer, isLoading: authLoading } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadUnreadCount = useCallback(async () => {
    if (authLoading || !isAuthenticated || !customer) return;

    try {
      const response = await fetchApi<{ count: number }>("/notifications/unread-count");
      if (response.success) setUnreadCount(response.data.count);
    } catch {
      // Keep the last known count during a transient refresh failure.
    }
  }, [authLoading, isAuthenticated, customer]);

  const loadRecentNotifications = useCallback(async () => {
    if (authLoading || !isAuthenticated || !customer) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApi<NotificationsResponse>(
        "/notifications?page=1&limit=5"
      );
      if (response.success) setNotifications(response.data.notifications);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Notifications are temporarily unavailable."
      );
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, customer]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !customer) {
      const timer = setTimeout(() => {
        setUnreadCount(0);
      }, 0);
      return () => clearTimeout(timer);
    }

    const initialLoadId = window.setTimeout(() => void loadUnreadCount(), 0);
    const intervalId = window.setInterval(loadUnreadCount, 60_000);
    const refresh = () => void loadUnreadCount();
    window.addEventListener("focus", refresh);
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);

    return () => {
      window.clearTimeout(initialLoadId);
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
    };
  }, [authLoading, isAuthenticated, customer, loadUnreadCount]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isAuthenticated || !customer) return null;

  const toggleDropdown = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) void loadRecentNotifications();
  };

  const markAllAsRead = async () => {
    try {
      await fetchApi("/notifications/read-all", { method: "PATCH" });
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
      announceNotificationChange();
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : "Unable to mark notifications read.");
    }
  };

  const openNotification = async (notification: NotificationItem) => {
    const href = getNotificationHref(notification);

    if (!notification.isRead) {
      try {
        await fetchApi(`/notifications/${notification._id}/read`, { method: "PATCH" });
        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id ? { ...item, isRead: true } : item
          )
        );
        setUnreadCount((current) => Math.max(0, current - 1));
        announceNotificationChange();
      } catch {
        // Navigation remains available if the read receipt fails.
      }
    }

    setIsOpen(false);
    router.push(href);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={isOpen}
        aria-controls="notification-popover"
        className="relative flex items-center justify-center rounded-xl border border-[#DED6C8] bg-[#FFFDF8] p-2.5 text-[#2B1F16] shadow-xs transition-all hover:border-[#B58A3A]/60 hover:bg-[#EDE7DF] focus:outline-none focus:ring-2 focus:ring-[#B58A3A] focus:ring-offset-2"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8C2D19] px-1 text-[9px] font-bold text-white shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id="notification-popover"
          className="absolute right-0 top-full z-50 mt-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#DED6C8] bg-[#FFFDF8] shadow-[0_24px_70px_rgba(43,31,22,0.22)]"
        >
          <div className="flex items-center justify-between border-b border-[#DED6C8] px-4 py-3.5">
            <div>
              <p className="font-serif-luxury text-base font-bold text-[#211C18]">Notifications</p>
              <p className="text-[11px] text-[#68615B]">
                {unreadCount > 0 ? `${unreadCount} waiting for you` : "You are all caught up"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-[#4A3628] transition-colors hover:bg-[#F1ECE2]"
              >
                <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[25rem] overflow-y-auto" aria-live="polite">
            {isLoading ? (
              <div className="space-y-3 p-4" aria-label="Loading notifications">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-16 animate-pulse rounded-xl bg-[#F1ECE2]" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-xs text-[#8C2D19]" role="alert">{error}</p>
                <button
                  type="button"
                  onClick={() => void loadRecentNotifications()}
                  className="mt-3 text-xs font-bold text-[#4A3628] underline decoration-[#B58A3A] underline-offset-4"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Bell className="mx-auto h-8 w-8 text-[#DED6C8]" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-[#4A3628]">Nothing new yet</p>
                <p className="mt-1 text-xs text-[#68615B]">
                  Order and reward updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => void openNotification(notification)}
                  className={`flex w-full gap-3 border-b border-[#DED6C8]/70 px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-[#F8F5EF] ${
                    notification.isRead ? "bg-[#FFFDF8]" : "bg-[#F1ECE2]/65"
                  }`}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4A3628] text-[#F8F5EF]">
                    <NotificationTypeIcon type={notification.type} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="line-clamp-1 text-xs font-bold text-[#211C18]">
                        {notification.title}
                      </span>
                      {!notification.isRead && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#B58A3A]" aria-label="Unread" />
                      )}
                    </span>
                    <span className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-[#68615B]">
                      {notification.message}
                    </span>
                    <span className="mt-1 block text-[10px] font-medium text-[#9A7240]">
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="block border-t border-[#DED6C8] bg-[#F8F5EF] px-4 py-3 text-center text-xs font-bold text-[#4A3628] transition-colors hover:text-[#B58A3A]"
          >
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
}
