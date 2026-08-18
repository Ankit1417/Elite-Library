"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { ArrowRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroBook {
  _id: string;
  title: string;
  slug: string;
  author: string;
  coverImage: string;
  finalPrice: number;
  price: number;
  discountPercentage: number;
  averageRating?: number;
  reviewCount?: number;
  stockQuantity: number;
}

interface HomepageSettings {
  isHeroEnabled: boolean;
  heroMode: "BOOKS" | "IMAGE" | "VIDEO";
  heroEyebrow?: string;
  heroTitle?: string;
  heroHighlightedText?: string;
  heroDescription?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  heroImage?: string;
  heroVideoUrl?: string;
  heroRotationEnabled?: boolean;
  heroRotationInterval?: number;
  heroBackgroundAnimation?: "NONE" | "SOFT_GRADIENT" | "FLOATING_LIGHT";
  // Populated from DB
  heroBookIds?: HeroBook[];
}

// ─── Book Showcase Component ──────────────────────────────────────────────────

function BookShowcase({
  books,
  rotationEnabled,
  intervalMs,
}: {
  books: HeroBook[];
  rotationEnabled: boolean;
  intervalMs: number;
}) {
  const [active, setActive] = useState(0);
  const [entering, setEntering] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Reset active index when the books array reference changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(0);
    setEntering(true);
  }, [books]);

  // Auto-rotate
  useEffect(() => {
    if (!rotationEnabled || prefersReduced || books.length <= 1) return;
    timerRef.current = setTimeout(() => {
      setEntering(false);
      setTimeout(() => {
        setActive((a) => (a + 1) % books.length);
        setEntering(true);
      }, 350);
    }, intervalMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, books.length, intervalMs, rotationEnabled, prefersReduced]);

  if (books.length === 0) return null;

  // Pick which books to display in the 3-book arrangement
  const n = books.length;
  const i0 = active;
  const i1 = (active + 1) % n;
  const i2 = (active + 2) % n;
  const displayBooks = n === 1 ? [books[0]] : n === 2 ? [books[i0], books[i1]] : [books[i0], books[i1], books[i2]];

  return (
    <div className="relative flex items-center justify-center w-full h-full select-none">
      {/* Background decorative circle */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-neutral-100 to-white opacity-60 scale-[0.85] blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      {/* 3-book stacked layout */}
      <div className="relative flex items-end justify-center gap-3 sm:gap-4 px-4">
        {/* Back-left book */}
        {displayBooks.length >= 3 && (
          <Link
            href={`/books/${displayBooks[2].slug}`}
            tabIndex={-1}
            className="relative flex-shrink-0 w-24 sm:w-28 md:w-32 lg:w-36 transition-transform duration-500 hover:scale-105"
            style={{ transform: "translateY(16px) rotate(-6deg)", zIndex: 1 }}
          >
            <div className="relative aspect-[3/4.2] rounded-r-lg rounded-l-xs overflow-hidden shadow-xl border-y border-r border-neutral-200/60 opacity-85 hover:opacity-100 transition-all duration-300 bg-neutral-100">
              <Image
                src={displayBooks[2].coverImage}
                alt={displayBooks[2].title}
                fill
                className="object-cover"
                sizes="140px"
                unoptimized
              />
              <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/25 via-white/10 to-transparent pointer-events-none" />
            </div>
          </Link>
        )}

        {/* Main / center book */}
        <Link
          href={`/books/${displayBooks[0].slug}`}
          className="relative flex-shrink-0 w-36 sm:w-44 md:w-52 lg:w-60 group transition-transform duration-500 hover:scale-103"
          style={{ zIndex: 3 }}
        >
          <div
            className={`relative aspect-[3/4.2] rounded-r-xl rounded-l-xs overflow-hidden shadow-2xl shadow-neutral-950/25 border-y border-r border-neutral-200/80 bg-neutral-100 transition-all duration-500 ${
              entering ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2"
            }`}
          >
            <Image
              src={displayBooks[0].coverImage}
              alt={displayBooks[0].title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, (max-width: 1024px) 208px, 240px"
              priority
              unoptimized
            />
            {/* Book Spine Highlight Overlay */}
            <div className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/30 via-white/15 to-transparent pointer-events-none" />
            {/* Premium Gold Badge if discounted */}
            {displayBooks[0].discountPercentage > 0 && (
              <div className="absolute top-2.5 right-2.5 bg-[#B58A3A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                -{displayBooks[0].discountPercentage}%
              </div>
            )}
          </div>
          {/* Hover tooltip */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none w-max max-w-[200px]">
            <div className="bg-[#111] text-white text-[11px] font-medium rounded-lg px-3 py-2 shadow-xl text-center leading-snug border border-neutral-800">
              <p className="line-clamp-1 font-semibold">{displayBooks[0].title}</p>
              <p className="text-[#B58A3A] font-bold mt-0.5">Rs. {displayBooks[0].finalPrice.toLocaleString()}</p>
            </div>
          </div>
        </Link>

        {/* Right book */}
        {displayBooks.length >= 2 && (
          <Link
            href={`/books/${displayBooks[1].slug}`}
            tabIndex={-1}
            className="relative flex-shrink-0 w-24 sm:w-28 md:w-32 lg:w-36 transition-transform duration-500 hover:scale-105"
            style={{ transform: "translateY(24px) rotate(5deg)", zIndex: 2 }}
          >
            <div className="relative aspect-[3/4.2] rounded-r-lg rounded-l-xs overflow-hidden shadow-xl border-y border-r border-neutral-200/60 opacity-85 hover:opacity-100 transition-all duration-300 bg-neutral-100">
              <Image
                src={displayBooks[1].coverImage}
                alt={displayBooks[1].title}
                fill
                className="object-cover"
                sizes="140px"
                unoptimized
              />
              <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/25 via-white/10 to-transparent pointer-events-none" />
            </div>
          </Link>
        )}
      </div>

      {/* Dot indicators */}
      {books.length > 1 && !prefersReduced && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1.5" aria-hidden="true">
          {books.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setEntering(false);
                setTimeout(() => { setActive(idx); setEntering(true); }, 350);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                idx === active ? "bg-[#B58A3A] w-4" : "bg-neutral-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Background Animation ─────────────────────────────────────────────────────

function BackgroundAnimation({ type }: { type: "NONE" | "SOFT_GRADIENT" | "FLOATING_LIGHT" }) {
  if (type === "NONE") return null;

  if (type === "SOFT_GRADIENT") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gradient-radial from-amber-50/60 to-transparent rounded-full animate-[drift_12s_ease-in-out_infinite]" />
        <div className="absolute -bottom-20 -left-20 w-[350px] h-[350px] bg-gradient-radial from-stone-100/80 to-transparent rounded-full animate-[drift_15s_ease-in-out_infinite_reverse]" />
      </div>
    );
  }

  if (type === "FLOATING_LIGHT") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full bg-amber-100/30 blur-3xl"
            style={{
              width: `${180 + i * 60}px`,
              height: `${180 + i * 60}px`,
              top: `${20 + i * 25}%`,
              right: `${5 + i * 10}%`,
              animation: `drift ${10 + i * 3}s ease-in-out infinite ${i % 2 === 0 ? "" : "reverse"}`,
            }}
          />
        ))}
      </div>
    );
  }

  return null;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <section className="relative bg-white border-b border-neutral-100 overflow-hidden" style={{ minHeight: 620 }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-[45%_55%] gap-12 items-center" style={{ minHeight: 620 }}>
        <div className="space-y-5 animate-pulse">
          <div className="h-3 w-28 bg-neutral-100 rounded" />
          <div className="h-12 w-3/4 bg-neutral-100 rounded" />
          <div className="h-4 w-full bg-neutral-100 rounded" />
          <div className="h-4 w-2/3 bg-neutral-100 rounded" />
          <div className="flex gap-3 pt-2">
            <div className="h-12 w-40 bg-neutral-100 rounded-xl" />
            <div className="h-12 w-32 bg-neutral-100 rounded-xl" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <div className="w-28 aspect-[2/3] bg-neutral-100 rounded-lg animate-pulse" style={{ transform: "rotate(-6deg)" }} />
          <div className="w-44 aspect-[2/3] bg-neutral-100 rounded-xl animate-pulse" />
          <div className="w-28 aspect-[2/3] bg-neutral-100 rounded-lg animate-pulse" style={{ transform: "rotate(5deg)" }} />
        </div>
      </div>
    </section>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HeroSection() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [fallbackBooks, setFallbackBooks] = useState<HeroBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Force re-render when reduced motion state changes (not critical, just defensive)
  const [, forceRender] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    const mq = typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    const handler = () => forceRender();
    mq?.addEventListener("change", handler);
    return () => mq?.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [settingsRes, fallbackRes] = await Promise.allSettled([
          fetchApi<HomepageSettings>("/homepage"),
          fetchApi<{ books: HeroBook[] }>("/books?isFeatured=true&limit=6"),
        ]);

        if (settingsRes.status === "fulfilled" && settingsRes.value.success) {
          setSettings(settingsRes.value.data);
        }
        if (fallbackRes.status === "fulfilled" && fallbackRes.value.success) {
          setFallbackBooks(fallbackRes.value.data.books ?? []);
        }
      } catch {
        // Non-critical — hero degrades gracefully
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);

  if (isLoading) return <HeroSkeleton />;
  if (!settings?.isHeroEnabled) return null;

  // Resolve which books to display
  const heroBooks: HeroBook[] =
    settings.heroBookIds && settings.heroBookIds.length > 0
      ? settings.heroBookIds
      : fallbackBooks;

  const mode = settings.heroMode ?? "BOOKS";
  const animation = settings.heroBackgroundAnimation ?? "SOFT_GRADIENT";
  const rotationEnabled = settings.heroRotationEnabled ?? true;
  const intervalMs = Math.min(15000, Math.max(2500, settings.heroRotationInterval ?? 4000));

  const headline = settings.heroTitle || "Discover Your Next Great Read";
  const highlighted = settings.heroHighlightedText || "";
  const eyebrow = settings.heroEyebrow || "CURATED FOR YOU";
  const description =
    settings.heroDescription ||
    "Explore carefully selected books across fiction, business, technology, self-growth and more.";
  const primaryText = settings.primaryButtonText || "Browse Collection";
  const primaryUrl = settings.primaryButtonLink || "/books";
  const secondaryText = settings.secondaryButtonText || "View Deals";
  const secondaryUrl = settings.secondaryButtonLink || "/books?sort=discount";

  return (
    <section
      className="relative bg-white border-b border-neutral-100 overflow-hidden"
      style={{ minHeight: 620 }}
    >
      {/* Background animation layer */}
      <BackgroundAnimation type={animation} />

      <div
        className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[45%_55%] gap-10 lg:gap-16 items-center py-14 lg:py-20"
        style={{ minHeight: 620 }}
      >
        {/* ── Left: Text Content ──────────────────────────────────────────── */}
        <div className="space-y-6 order-2 lg:order-1 text-center lg:text-left">
          {/* Eyebrow */}
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#B58A3A]">
            {eyebrow}
          </p>

          {/* Headline */}
          <h1
            className="font-bold text-[#111] leading-[1.08] tracking-tight"
            style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)" }}
          >
            {headline}
            {highlighted && (
              <>
                {" "}
                <span className="text-[#B58A3A]">{highlighted}</span>
              </>
            )}
          </h1>

          {/* Description */}
          <p className="text-base text-neutral-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
            {description}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 pt-2">
            <Link
              href={primaryUrl}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#111] text-white font-semibold text-sm rounded-xl hover:bg-[#222] transition-colors shadow-md group"
            >
              <span>{primaryText}</span>
              <ArrowRight className="w-4 h-4 text-[#B58A3A] group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href={secondaryUrl}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-[#B58A3A] text-[#B58A3A] font-semibold text-sm rounded-xl hover:bg-amber-50 transition-colors"
            >
              {secondaryText}
            </Link>
          </div>

          {/* Mini stats */}
          <div className="hidden sm:flex items-center gap-6 pt-3 lg:justify-start justify-center">
            {[
              { value: "10,000+", label: "Books" },
              { value: "4.8★", label: "Rating" },
              { value: "Free", label: "Delivery" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-base font-bold text-[#111]">{value}</p>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Visual ────────────────────────────────────────────────── */}
        <div
          className="order-1 lg:order-2 flex items-center justify-center"
          style={{ minHeight: 380 }}
        >
          {mode === "BOOKS" && heroBooks.length > 0 && (
            <BookShowcase
              books={heroBooks}
              rotationEnabled={rotationEnabled}
              intervalMs={intervalMs}
            />
          )}

          {mode === "IMAGE" && settings.heroImage && (
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-neutral-100">
              <Image
                src={settings.heroImage}
                alt="Hero"
                fill
                className="object-cover"
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>
          )}

          {mode === "VIDEO" && settings.heroVideoUrl && (
            <div className="relative w-full max-w-lg aspect-video rounded-2xl overflow-hidden shadow-2xl border border-neutral-100">
              {/* Video intentionally has no captions — muted ambient visual only */}
              <video
                src={settings.heroVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                poster={settings.heroImage || undefined}
              />
            </div>
          )}

          {/* Fallback: mode mismatch or empty */}
          {((mode === "BOOKS" && heroBooks.length === 0) ||
            (mode === "IMAGE" && !settings.heroImage) ||
            (mode === "VIDEO" && !settings.heroVideoUrl)) && (
            <div className="w-full max-w-sm aspect-[3/4] rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-300 text-sm">
              Configure hero in admin
            </div>
          )}
        </div>
      </div>

      {/* Inline keyframes for drift animation */}
      <style>{`
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(20px, -15px) scale(1.04); }
          66%       { transform: translate(-10px, 10px) scale(0.97); }
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </section>
  );
}
