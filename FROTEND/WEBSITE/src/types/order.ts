export interface OrderItem {
  productId: string;
  productName: string;
  qty: number;
  price: string;
  salePrice: number | null;
  totalPrice: number;
  gst: number;
  subTotal: number;
  images: string[];
  stock: string | number;
  mainCategoryId: string;
  subCategoryId: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface StatusHistory {
  status: string;
  timestamp: string;
  updatedBy: string;
  note?: string;
}

export interface Order {
  _id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  totalPrice: number;
  gst: number;
  subTotal: number;
  grandTotal: number;
  codFees?: number;
  codFee?: number;
  shippingFees?: number;
  couponId?: string | null;
  couponCode?: string | null;
  discountAmount?: number;
  offerId?: string | null;
  offerCode?: string | null;
  offerDiscount?: number;
  deliveryAddress: {
    name: string;
    phone: string;
    email: string;
    doorNo?: string;
    street: string;
    landmark: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentType: string;
  paymentStatus: string;
  orderStatus: string;
  statusHistory?: StatusHistory[];
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  time?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface OrderHistoryResponse {
  success: boolean;
  message: string;
  data: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
