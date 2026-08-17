export type DealType = "GENERAL" | "BIRTHDAY";
export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";
export type CouponStatus = "ACTIVE" | "USED" | "EXPIRED" | "REVOKED";

export interface Deal {
  _id: string;
  name: string;
  description?: string;
  type: DealType;
  couponCodePrefix: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  validFrom: string;
  validUntil: string;
  birthdayValidityDays?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usageCount?: number;
  isActive: boolean;
  notificationTitle?: string;
  notificationMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DealsListResponse {
  deals: Deal[];
  total: number;
  page: number;
  pages: number;
}

export interface DealAnalytics {
  deal: Partial<Deal> & Pick<Deal, "name" | "type" | "discountType" | "discountValue">;
  coupons: {
    issued: number;
    used: number;
    active: number;
    expired: number;
    unused: number;
  };
  orders?: {
    revenue: number;
    totalDiscount: number;
  };
}

export interface CouponCustomer {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface CouponOrder {
  _id: string;
  orderNumber?: string;
}

export interface IssuedCoupon {
  _id: string;
  userId: string | CouponCustomer;
  code: string;
  displayCode?: string;
  issuedAt: string;
  validFrom: string;
  expiresAt: string;
  usedAt?: string;
  usedOrderId?: string | CouponOrder;
  status: CouponStatus;
  birthdayYear?: number;
}

export interface IssuedCouponsResponse {
  coupons: IssuedCoupon[];
  total: number;
  page: number;
  pages: number;
}
