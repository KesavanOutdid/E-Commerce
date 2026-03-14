export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.0.46:5000";
export const SELLER_URL = process.env.NEXT_PUBLIC_SELLER_URL || "http://192.168.0.40:4000";

export const API_ENDPOINTS = {
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  SUBCATEGORIES: (id: string) => `${API_BASE_URL}/api/categories/subcategory/${id}`,
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCT_FILTERS: `${API_BASE_URL}/api/products/filters`,
  SEARCH_PRODUCTS: `${API_BASE_URL}/api/products/search`,
  BEST_SELLERS: `${API_BASE_URL}/api/products/best-sellers`,
  PRODUCT_DETAILS: (id: string) => `${API_BASE_URL}/api/products/${id}`,
  PRODUCTS_BY_SUBCATEGORY: (subCategoryId: string) => `${API_BASE_URL}/api/products/subcategory/${subCategoryId}`,
  REGISTER: `${API_BASE_URL}/api/user/register`,
  SEND_OTP: `${API_BASE_URL}/api/user/register/send-otp`,
  LOGIN: `${API_BASE_URL}/api/user/login`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/user/forgot-password`,
  VALIDATE_OTP: `${API_BASE_URL}/api/user/validate-otp`,
  SET_NEW_PASSWORD: `${API_BASE_URL}/api/user/set-new-password`,
  USER_PROFILE: `${API_BASE_URL}/api/user/profile`,
  WISHLIST: `${API_BASE_URL}/api/wishlist`,
  ADD_TO_WISHLIST: `${API_BASE_URL}/api/wishlist/add`,
  REMOVE_FROM_WISHLIST: (id: string) => `${API_BASE_URL}/api/wishlist/remove/${id}`,
  
  // Address Endpoints
  ADDRESSES: `${API_BASE_URL}/api/user/addresses`,
  ADDRESS_DETAIL: (index: number) => `${API_BASE_URL}/api/user/addresses/${index}`,
  
  // Cart Endpoints
  CART: `${API_BASE_URL}/api/cart`,
  ADD_TO_CART: `${API_BASE_URL}/api/cart/add`,
  UPDATE_CART: (productId: string) => `${API_BASE_URL}/api/cart/update/${productId}`,
  REMOVE_FROM_CART: (productId: string) => `${API_BASE_URL}/api/cart/remove/${productId}`,
  CLEAR_CART: `${API_BASE_URL}/api/cart/clear`,

  // Order Endpoints
  CREATE_ORDER: `${API_BASE_URL}/api/orders/create`,
  VERIFY_ORDER: `${API_BASE_URL}/api/orders/verify`,
  ORDER_HISTORY: (page: number, limit: number) => `${API_BASE_URL}/api/orders/history?page=${page}&limit=${limit}`,
  ORDER_DETAILS: (orderId: string) => `${API_BASE_URL}/api/orders/detail/${orderId}`,
  CONTACT: `${API_BASE_URL}/api/contact`,
  NEWSLETTER_SUBSCRIBE: `${API_BASE_URL}/api/newsletter/subscribe`,
  NEWSLETTER: `${API_BASE_URL}/api/newsletter`,
  PRODUCT_PROMOTIONS: (productId: string) => `${API_BASE_URL}/api/promotions/offers/product/${productId}`,
  PRODUCT_COUPONS: (productId: string) => `${API_BASE_URL}/api/promotions/coupons/product/${productId}`,
  VERIFY_COUPON: `${API_BASE_URL}/api/promotions/coupons/verify`,
  REVIEWS: `${API_BASE_URL}/api/reviews`,
  PRODUCT_REVIEWS: (productId: string) => `${API_BASE_URL}/api/reviews/product/${productId}`,
};
