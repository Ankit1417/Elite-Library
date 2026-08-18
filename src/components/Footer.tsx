import Link from "next/link";
import { Mail, Phone, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#2F2923] border-t border-[#4A3628] text-[#DED6C8] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link
              href="/"
              className="flex items-center shrink-0 group"
              aria-label="Elite Library Home"
            >
              <Image
                src="/Elite_logo.png"
                alt="Elite Library"
                width={180}
                height={70}
                className="h-[100px] w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </Link>
            <p className="text-xs text-[#B5A898] leading-relaxed">
              Curated luxury online bookstore delivering hardbound classics, philosophical works, and rare intellectual masterworks.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif-luxury text-[#FFFDF8] text-sm font-bold uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/books" className="text-[#DED6C8] hover:text-[#B58A3A] transition-colors">
                  All Books
                </Link>
              </li>
              <li>
                <Link href="/books?sort=discount" className="text-[#DED6C8] hover:text-[#B58A3A] transition-colors">
                  Special Discounts
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-[#DED6C8] hover:text-[#B58A3A] transition-colors">
                  View Cart
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-[#DED6C8] hover:text-[#B58A3A] transition-colors">
                  Order Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-serif-luxury text-[#FFFDF8] text-sm font-bold uppercase tracking-wider mb-4">
              Assistance
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-[#DED6C8]">
                <Phone className="w-3.5 h-3.5 text-[#B58A3A]" />
                <span>+977 980-4989784</span>
              </li>
              <li className="flex items-center gap-2 text-[#DED6C8]">
                <Mail className="w-3.5 h-3.5 text-[#B58A3A]" />
                <span>concierge@elitelibrary.com</span>
              </li>
              <li className="flex items-center gap-2 text-[#DED6C8] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B58A3A]" />
                <span>Cash on Delivery (COD)</span>
              </li>
            </ul>
          </div>

          {/* Admin link */}
          <div>
            <h4 className="font-serif-luxury text-[#FFFDF8] text-sm font-bold uppercase tracking-wider mb-4">
              Address
            </h4>
            <p className="text-xs text-[#B5A898] mb-3">
              All Over Nepal.
            </p>
            <Link
              href="https://maps.app.goo.gl/Z8VPGfyHw5uU1hGQ8"
              className="inline-block px-4 py-2 bg-[#4A3628] border border-[#B58A3A]/40 rounded-lg text-xs font-semibold text-[#FFFDF8] hover:bg-[#B58A3A] hover:text-[#2F2923] transition-all"
            >
              Taplejung Phungling, Nepal
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-[#4A3628] text-center text-xs text-[#B5A898]">
          <p>© {new Date().getFullYear()} Elite Library. All rights reserved. Crafted for book enthusiasts.</p>
        </div>
      </div>
    </footer>
  );
}

