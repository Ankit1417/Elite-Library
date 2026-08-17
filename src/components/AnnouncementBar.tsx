import { Truck, ShieldCheck, RotateCcw } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="bg-[#2B1F16] text-[#F7F3EF] py-3 px-6">
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs">
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-[#B58A3A]" />
          <span className="font-medium">Free Delivery on Orders Over Rs. 2,999</span>
        </div>
        <div className="hidden sm:block w-px h-3 bg-[#B58A3A]/30" />
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#B58A3A]" />
          <span className="font-medium">100% Authentic Books</span>
        </div>
        <div className="hidden sm:block w-px h-3 bg-[#B58A3A]/30" />
        <div className="flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5 text-[#B58A3A]" />
          <span className="font-medium">Easy Returns</span>
        </div>
      </div>
    </div>
  );
}
