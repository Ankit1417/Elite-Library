import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  bookCount?: number;
}

interface CategorySectionProps {
  categories: CategoryItem[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-14 sm:py-16 bg-white border-b border-neutral-100">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B58A3A] mb-1.5">
              Browse by Genre
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111] leading-tight">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/books"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#B58A3A] transition-colors group"
          >
            <span>Explore All Books</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid - Responsive 2/3/6 columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/categories/${cat.slug}`}
              className="group relative flex flex-col rounded-2xl overflow-hidden bg-white border border-neutral-200/80 hover:border-[#B58A3A]/60 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
            >
              {/* Image Container with overlay & zoom */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-neutral-100 text-[#B58A3A] text-xl font-bold font-serif-luxury">
                    {cat.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {/* Subtle gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                
                {/* Floating Arrow Badge */}
                <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#B58A3A]" />
                </div>
              </div>

              {/* Title & Info Footer */}
              <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 bg-white">
                <h3 className="text-xs sm:text-sm font-bold text-[#111] group-hover:text-[#B58A3A] transition-colors leading-snug line-clamp-2">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-1 font-medium group-hover:text-[#B58A3A]/80 transition-colors">
                  {cat.bookCount !== undefined ? `${cat.bookCount} Books` : "Explore Genre →"}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile "View All" */}
        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/books"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B58A3A] hover:text-[#9E7730] transition-colors"
          >
            Explore All Genres <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
