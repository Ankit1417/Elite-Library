import { ShieldCheck, Package, Truck, HeadsetIcon } from "lucide-react";

export default function TrustFeatures() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Authentic Editions",
      description: "Every book is 100% original and carefully verified.",
    },
    {
      icon: Package,
      title: "Premium Packaging",
      description: "Luxury packaging for a premium unboxing.",
    },
    {
      icon: Truck,
      title: "Cash on Delivery",
      description: "Pay conveniently at your doorstep.",
    },
    {
      icon: HeadsetIcon,
      title: "Dedicated Support",
      description: "We're here to help you every step of the way.",
    },
  ];

  return (
    <section className="py-10 bg-[#FFFDF8] border-b border-[#DED6C8]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-[#F7F3EF] border border-[#DED6C8] shadow-xs hover:shadow-sm transition-shadow">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#FFFDF8] border border-[#DED6C8] flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#B58A3A]" />
                </div>
                <div>
                  <h3 className="font-serif-luxury text-sm font-bold text-[#211C18] mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-[#68615B] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
