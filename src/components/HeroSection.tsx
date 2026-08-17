"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi } from "@/lib/api";
import { ArrowRight, Compass } from "lucide-react";

interface HomepageSettings {
  heroImage?: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroHighlightedText?: string;
  heroDescription?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  isHeroEnabled: boolean;
}

export default function HeroSection() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetchApi<HomepageSettings>("/homepage");
        if (res.success && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error("Failed to load homepage settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Default settings if none loaded
  const heroSettings = settings || {
    heroImage: "",
    heroEyebrow: "CURATED SANCTUARY OF EXCEPTIONAL BOOKS",
    heroTitle: "Timeless Literature,",
    heroHighlightedText: "Delivered to Your Library",
    heroDescription: "Discover handpicked leather-bound classics, rare monographs, existential philosophy, and inspiring modern intellect. Crafted for passionate bibliophiles.",
    primaryButtonText: "Explore Collection",
    primaryButtonLink: "/books",
    secondaryButtonText: "Special Offerings",
    secondaryButtonLink: "/books?isFeatured=true",
    isHeroEnabled: true,
  };

  const fallbackImage = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop&q=80";

  if (isLoading) {
    return (
      <section className="relative overflow-hidden h-[520px] lg:h-[580px] border-b border-[#DED6C8] bg-[#F7F3EF]">
        <div className="max-w-[1400px] mx-auto px-6 h-full">
          <div className="grid lg:grid-cols-[52%_48%] gap-8 lg:gap-16 items-center h-full">
            <div className="animate-pulse space-y-4">
              <div className="h-3 bg-[#DED6C8] rounded w-1/2" />
              <div className="h-12 bg-[#DED6C8] rounded w-3/4" />
              <div className="h-4 bg-[#DED6C8] rounded w-full" />
              <div className="h-4 bg-[#DED6C8] rounded w-2/3" />
              <div className="h-12 bg-[#DED6C8] rounded w-1/3 mt-8" />
            </div>
            <div className="aspect-[4/3] bg-[#DED6C8] rounded-2xl animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (!heroSettings.isHeroEnabled) {
    return null;
  }

  return (
    <section className="relative overflow-hidden h-[520px] lg:h-[580px] border-b border-[#DED6C8] bg-[#F7F3EF]">
      {/* Subtle warm ambient graphics */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#B58A3A]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[250px] bg-[#4A3628]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 h-full relative z-10">
        <div className="grid lg:grid-cols-[52%_48%] gap-8 lg:gap-16 items-center h-full">
          {/* Left Side - Content */}
          <div className="text-left order-1">
            {/* Eyebrow - Plain uppercase text, no pill */}
            <p className="text-xs uppercase tracking-widest text-[#B58A3A] mb-4 font-medium">
              {heroSettings.heroEyebrow}
            </p>

            {/* Main Title */}
            <h1 className="font-serif-luxury font-bold tracking-tight text-[#211C18] leading-[1.02] mb-6" style={{ fontSize: "clamp(2.5rem, 4.5vw, 4.5rem)" }}>
              {heroSettings.heroTitle} <br />
              <span className="text-[#B58A3A]">{heroSettings.heroHighlightedText}</span>
            </h1>

            {/* Description */}
            <p className="text-base text-[#68615B] font-light leading-relaxed max-w-[600px] mb-8">
              {heroSettings.heroDescription}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href={heroSettings.primaryButtonLink || "/books"}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#2B1F16] text-[#F7F3EF] font-semibold text-sm hover:bg-[#1F1A17] transition-all shadow-md flex items-center justify-center gap-2 group"
              >
                <span>{heroSettings.primaryButtonText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#B58A3A]" />
              </Link>
              <Link
                href={heroSettings.secondaryButtonLink || "/books?isFeatured=true"}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#F7F3EF] text-[#2B1F16] font-medium text-sm hover:bg-[#EDE7DF] transition-all border border-[#DED6C8] shadow-xs flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-[#B58A3A]" />
                <span>{heroSettings.secondaryButtonText}</span>
              </Link>
            </div>
          </div>

          {/* Right Side - Hero Image */}
          <div className="relative aspect-[4/3] lg:aspect-[3/4] order-2 lg:order-2">
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-[#DED6C8]">
              <Image
                src={heroSettings.heroImage || fallbackImage}
                alt="Hero"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
                priority
              />
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#4A3628]/10 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

