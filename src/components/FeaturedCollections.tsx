import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  bookCount?: number;
}

interface FeaturedCollectionsProps {
  categories: CategoryItem[];
}

export default function FeaturedCollections({ categories }: FeaturedCollectionsProps) {
  const featuredCategories = categories.slice(0, 4);

  if (featuredCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-14 bg-[#F7F3EF] border-b border-[#DED6C8]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-semibold text-[#B58A3A] uppercase tracking-widest block">
              Curated Selections
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#211C18] mt-1">
              Featured Collections
            </h2>
            <p className="text-sm text-[#68615B] mt-2">
              Handpicked selections for the discerning reader
            </p>
          </div>
          <Link
            href="/categories"
            className="hidden sm:flex items-center gap-1 text-xs font-semibold text-[#2B1F16] hover:text-[#B58A3A] transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredCategories.map((category) => (
            <Link
              key={category._id}
              href={`/categories/${category.slug}`}
              className="group"
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#DED6C8] bg-[#FFFDF8] shadow-xs hover:shadow-md hover:border-[#B58A3A]/60 transition-all">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#F7F3EF] to-[#DED6C8]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B1F16]/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-serif-luxury text-lg font-bold text-[#F7F3EF] mb-1">
                    {category.name}
                  </h3>
                  {category.bookCount !== undefined && (
                    <p className="text-xs text-[#B58A3A]">
                      {category.bookCount} {category.bookCount === 1 ? 'Book' : 'Books'}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#2B1F16] hover:text-[#B58A3A] transition-colors group"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
