"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  formatNotificationTime,
  getNotificationHref,
  NOTIFICATIONS_CHANGED_EVENT,
  NotificationItem,
  NotificationTypeIcon,
} from "@/components/NotificationBell";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/authContext";

interface NotificationsResponse {
  notifications: NotificationItem[];
  total: number;
  page: number;
  pages: number;
}

type NotificationFilter = "ALL" | "UNREAD";

function notifyBellToRefresh() {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [filter, setFilter] = useState<NotificationFilter>("ALL");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ page: String(page), limit: "12" });
      if (filter === "UNREAD") query.set("unreadOnly", "true");
      const response = await fetchApi<NotificationsResponse>(
        `/notifications?${query.toString()}`
      );
      if (response.success) {
        setNotifications(response.data.notifications);
        setPages(Math.max(1, response.data.pages));
        setTotal(response.data.total);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "We could not load your notifications."
      );
    } finally {
      setIsLoading(false);
    }
  }, [filter, isAuthenticated, page]);

  useEffect(() => {
    const loadId = window.setTimeout(() => void loadNotifications(), 0);
    return () => window.clearTimeout(loadId);
  }, [loadNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetchApi(`/notifications/${notificationId}/read`, { method: "PATCH" });
      if (filter === "UNREAD") {
        setNotifications((current) => current.filter((item) => item._id !== notificationId));
        setTotal((current) => Math.max(0, current - 1));
      } else {
        setNotifications((current) =>
          current.map((item) =>
            item._id === notificationId ? { ...item, isRead: true } : item
          )
        );
      }
      notifyBellToRefresh();
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : "Unable to mark notification read.");
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetchApi("/notifications/read-all", { method: "PATCH" });
      if (filter === "UNREAD") {
        setNotifications([]);
        setTotal(0);
      } else {
        setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      }
      notifyBellToRefresh();
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : "Unable to mark notifications read.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#B58A3A] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center px-4">
        <div className="max-w-md rounded-3xl border border-[#DED6C8] bg-[#FFFDF8] p-8 text-center shadow-sm">
          <Bell className="mx-auto h-10 w-10 text-[#B58A3A]" aria-hidden="true" />
          <h1 className="font-serif-luxury mt-4 text-2xl font-bold text-[#26231F]">Your notifications are private</h1>
          <p className="mt-2 text-sm text-[#6F6A61]">Sign in to see reward and order updates.</p>
          <Link href="/login?redirect=notifications" className="mt-6 inline-block rounded-xl bg-[#4A3628] px-6 py-3 text-xs font-bold text-[#FFFDF8]">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const hasUnread = notifications.some((notification) => !notification.isRead);

  return (
    <div className="min-h-screen bg-[#F8F5EF] text-[#26231F] flex flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <header className="flex flex-col gap-5 border-b border-[#DED6C8] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B58A3A]">Your reading journey</p>
            <h1 className="font-serif-luxury mt-1 text-3xl font-bold">Notifications</h1>
            <p className="mt-1 text-sm text-[#6F6A61]">Birthday gifts, offers, and order updates in one place.</p>
          </div>
          {hasUnread && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DED6C8] bg-[#FFFDF8] px-4 py-2.5 text-xs font-bold text-[#4A3628] transition-colors hover:border-[#B58A3A]/50 hover:bg-[#F1ECE2]"
            >
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
              Mark all as read
            </button>
          )}
        </header>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex rounded-xl border border-[#DED6C8] bg-[#FFFDF8] p-1" role="group" aria-label="Notification filter">
            {(["ALL", "UNREAD"] as NotificationFilter[]).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => {
                  setFilter(value);
                  setPage(1);
                }}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
                  filter === value ? "bg-[#4A3628] text-[#FFFDF8]" : "text-[#6F6A61] hover:text-[#4A3628]"
                }`}
              >
                {value === "ALL" ? "All" : "Unread"}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#6F6A61]">{total} {total === 1 ? "notification" : "notifications"}</p>
        </div>

        {error && (
          <div role="alert" className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-[#8C2D19]/25 bg-[#FFF4F1] p-4 text-xs text-[#8C2D19]">
            <span>{error}</span>
            <button type="button" onClick={() => void loadNotifications()} className="font-bold underline underline-offset-4">Try again</button>
          </div>
        )}

        <section className="mt-5 space-y-3" aria-live="polite" aria-busy={isLoading}>
          {isLoading ? (
            [0, 1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-[#F1ECE2]" />)
          ) : notifications.length === 0 ? (
            <div className="rounded-3xl border border-[#DED6C8] bg-[#FFFDF8] px-6 py-16 text-center">
              <Bell className="mx-auto h-10 w-10 text-[#DED6C8]" aria-hidden="true" />
              <h2 className="font-serif-luxury mt-4 text-xl font-bold">{filter === "UNREAD" ? "You are all caught up" : "No notifications yet"}</h2>
              <p className="mt-1 text-sm text-[#6F6A61]">Updates from Elite Library will be collected here.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <article
                key={notification._id}
                className={`rounded-2xl border p-4 sm:p-5 ${notification.isRead ? "border-[#DED6C8] bg-[#FFFDF8]" : "border-[#B58A3A]/35 bg-[#F1ECE2]"}`}
              >
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4A3628] text-[#FFFDF8]">
                    <NotificationTypeIcon type={notification.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-serif-luxury text-base font-bold">{notification.title}</h2>
                          {!notification.isRead && <span className="h-2 w-2 rounded-full bg-[#B58A3A]" aria-label="Unread" />}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-[#6F6A61]">{notification.message}</p>
                      </div>
                      <time dateTime={notification.createdAt} className="shrink-0 text-[11px] font-medium text-[#9A7240]" title={new Date(notification.createdAt).toLocaleString()}>
                        {formatNotificationTime(notification.createdAt)}
                      </time>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <Link href={getNotificationHref(notification)} className="text-xs font-bold text-[#4A3628] underline decoration-[#B58A3A] underline-offset-4">
                        View details
                      </Link>
                      {!notification.isRead && (
                        <button type="button" onClick={() => void markAsRead(notification._id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6F6A61] hover:text-[#4A3628]">
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        {!isLoading && pages > 1 && (
          <nav aria-label="Notification pages" className="mt-8 flex items-center justify-center gap-3">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-xl border border-[#DED6C8] bg-[#FFFDF8] p-2.5 text-[#4A3628] disabled:opacity-40" aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="text-xs font-semibold text-[#6F6A61]">Page {page} of {pages}</span>
            <button type="button" onClick={() => setPage((current) => Math.min(pages, current + 1))} disabled={page === pages} className="rounded-xl border border-[#DED6C8] bg-[#FFFDF8] p-2.5 text-[#4A3628] disabled:opacity-40" aria-label="Next page">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        )}
      </main>
      <Footer />
    </div>
  );
}
