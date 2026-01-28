import React from "react";
import toast from "react-hot-toast";

interface Coupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  description?: string;
  isApplicable?: boolean;
}

interface CouponCardProps {
  coupon: Coupon;
  onApply: (code: string) => void;
  isApplied?: boolean;
}

const CouponCard: React.FC<CouponCardProps> = ({ coupon, onApply, isApplied }) => {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(coupon.code);
    toast.success("Coupon code copied!");
  };

  const isApplicable = coupon.isApplicable !== false;

  return (
    <div 
      onClick={() => isApplicable && !isApplied && onApply(coupon.code)}
      className={`relative min-w-[155px] h-[44px] bg-white rounded border border-dashed cursor-pointer overflow-hidden transition-all duration-300 flex items-center group ${
        isApplied 
          ? "border-green-500 bg-green-50" 
          : isApplicable 
            ? "border-blue/40 hover:border-blue bg-white shadow-sm hover:shadow-md" 
            : "border-gray-300 opacity-60 grayscale cursor-not-allowed"
      }`}
    >
      {/* Semi-circle cutouts */}
      <div className="absolute -top-1.5 left-[30%] w-3 h-3 bg-gray-2 rounded-full border-b border-dashed border-inherit"></div>
      <div className="absolute -bottom-1.5 left-[30%] w-3 h-3 bg-gray-2 rounded-full border-t border-dashed border-inherit"></div>

      {/* Left Section: Discount */}
      <div className="w-[30%] h-full flex flex-col items-center justify-center border-r border-dashed border-inherit px-1 text-center bg-gray-50/50">
        <p className="text-[12px] font-black text-dark leading-none">
          {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
        </p>
        <p className="text-[7px] font-bold text-gray-500 uppercase tracking-tighter mt-0.5">OFF</p>
      </div>

      {/* Right Section: Code & Info */}
      <div className="flex-1 h-full flex flex-col justify-center px-2 gap-0">
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-black uppercase tracking-wider ${
            isApplied ? "text-green-600" : "text-blue"
          }`}>
            {coupon.code}
          </span>
          <button 
            onClick={handleCopy}
            className="text-gray-400 hover:text-blue transition-colors"
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[9px] text-gray-500 font-bold">
            {isApplied ? (
              <span className="text-green-600 flex items-center gap-0.5 uppercase">
                APPLIED
              </span>
            ) : isApplicable ? (
              `₹${coupon.minOrderValue}+`
            ) : (
              `Locked`
            )}
          </p>
          {!isApplied && isApplicable && (
             <span className="text-[9px] font-black text-blue group-hover:underline">APPLY</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponCard;
