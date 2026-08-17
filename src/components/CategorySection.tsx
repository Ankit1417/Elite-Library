import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

interface CategorySectionProps {
  categories: CategoryItem[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-16 border-b border-[#DED6C8] bg-[#F8F5EF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B58A3A] font-semibold">
              Curated Genres
            </span>
            <h2 className="font-serif-luxury text-3xl font-bold text-[#26231F] mt-1">
              Browse by Category
            </h2>
          </div>
          <Link
            href="/books"
            className="text-xs font-semibold text-[#4A3628] hover:text-[#B58A3A] flex items-center gap-1 group transition-colors"
          >
            <span>View All Genres</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/categories/${cat.slug}`}
              className="group relative flex flex-col rounded-xl overflow-hidden bg-[#FFFDF8] border border-[#DED6C8] hover:border-[#B58A3A] p-4 transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md"
            >
              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#F1ECE2] mb-3 border border-[#DED6C8]/60">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#F1ECE2] text-[#6F6A61] text-xs font-serif-luxury font-bold">
                    {cat.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-[#26231F]/10 group-hover:bg-transparent transition-colors" />
              </div>
              <h3 className="font-serif-luxury text-sm font-bold text-[#26231F] group-hover:text-[#B58A3A] transition-colors line-clamp-1 text-center">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

