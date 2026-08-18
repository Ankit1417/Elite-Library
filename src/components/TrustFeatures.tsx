import { ShieldCheck, Package, Truck, HeadsetIcon } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    description: "Every book is verified and genuine.",
  },
  {
    icon: Package,
    title: "Premium Packaging",
    description: "Safe and elegant delivery packaging.",
  },
  {
    icon: Truck,
    title: "Cash on Delivery",
    description: "Pay conveniently at your doorstep.",
  },
  {
    icon: HeadsetIcon,
    title: "Dedicated Support",
    description: "We're here whenever you need help.",
  },
];

export default function TrustFeatures() {
  return (
    <section className="border-b border-neutral-100 bg-neutral-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-neutral-100">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-center gap-3 px-5 py-5 sm:py-6 hover:bg-white transition-colors duration-200"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Icon className="w-4.5 h-4.5 text-[#B58A3A]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#111] leading-tight">{title}</p>
                <p className="text-[11px] text-neutral-400 leading-snug mt-0.5 line-clamp-1 hidden sm:block">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
