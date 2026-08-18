"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  sizeClassName?: string;
}

/**
 * Reusable star rating display + interactive selector.
 * When `onChange` is provided the stars become radio-style buttons with
 * hover preview, keyboard access and 1-5 integer values.
 */
export default function StarRating({
  value,
  onChange,
  sizeClassName = "w-5 h-5",
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const active = onChange ? (hoverValue || value) : value;
  const rounded = Math.round(active);
  const interactive = Boolean(onChange);

  return (
    <span
      className="inline-flex items-center gap-0.5"
      role={interactive ? "radiogroup" : undefined}
      aria-label={interactive ? "Your rating" : `Rated ${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rounded;
        const starEl = (
          <Star
            aria-hidden="true"
            className={`${sizeClassName} ${
              filled
                ? "text-[#B58A3A] fill-[#B58A3A]"
                : "text-[#DED6C8]"
            } transition-colors duration-200`}
          />
        );

        if (!onChange) return <span key={star}>{starEl}</span>;

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            onFocus={() => setHoverValue(star)}
            onBlur={() => setHoverValue(0)}
            onClick={() => onChange(star)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                onChange(Math.min(5, star + 1));
              } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                onChange(Math.max(1, star - 1));
              }
            }}
            className="rounded p-0.5 transition-transform duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A3A]"
          >
            {starEl}
          </button>
        );
      })}
    </span>
  );
}