export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.0.23:5000/api';
export const BASE_URL = API_BASE_URL.replace('/api', '');

export const API_ENDPOINTS = {
  AUTH: {
    ADMIN_LOGIN: '/admin/login',
    ADMIN_PROFILE: '/admin/profile',
    FORGOT_PASSWORD: '/admin/forgot-password',
    VALIDATE_OTP: '/admin/validate-otp',
    SET_NEW_PASSWORD: '/admin/set-new-password',
    PICKUP_ADDRESSES: '/admin/pickup-addresses'
  },
  USERS: {
    GET_ALL: '/admin/users',
    GET_BY_ID: (userId) => `/admin/users/${userId}`,
    ADD: '/admin/users',
    UPDATE: (userId) => `/admin/users/${userId}`,
    DELETE: (userId) => `/admin/users/${userId}`
  },
  ROLES: {
    GET_ALL: '/admin/roles',
    GET_BY_ID: (roleId) => `/admin/roles/${roleId}`,
    CREATE: '/admin/roles',
    UPDATE: (roleId) => `/admin/roles/${roleId}`,
    DELETE: (roleId) => `/admin/roles/${roleId}`
  },
  CATEGORIES: {
    GET_ALL: '/categories/main', // Fetches main categories
    GET_BY_ID: (id) => `/categories/main/${id}`, // Now exists!
    CREATE: '/categories/main',
    UPDATE: (id) => `/categories/main/${id}`,
    DELETE: (id) => `/categories/main/${id}`,
    // Subcategories - adding specific keys if useful, though hooks might manually build URLs
    CREATE_SUB: '/categories/sub',
    UPDATE_SUB: (id) => `/categories/sub/${id}`,
    DELETE_SUB: (id) => `/categories/sub/${id}`,
    GET_SUB_BY_PARENT: (parentId) => `/categories/sub/${parentId}`
  },
  PRODUCTS: {
    GET_ALL: '/products/admin/getproducts', // Admin specific list
    GET_ALL_SELLER: '/products/admin/seller-products', // NEW: Seller products for admin
    GET_SELLERS_LIST: '/products/admin/sellers-list', // NEW: Get all sellers
    GET_BY_ID: (id) => `/products/admin/${id}`, // Use public route for details
    CREATE: '/products/admin',
    ADD_VARIANT: (masterProductId) => `/products/admin/add-variant/${masterProductId}`,
    UPDATE: (id) => `/products/admin/${id}`,
    UPDATE_APPROVAL: (id) => `/products/admin/update-approval/${id}`,
    DELETE: (id) => `/products/admin/${id}`
  },
  ORDERS: {
    GET_ALL: '/orders/admin',
    GET_BY_ID: (id) => `/orders/admin/${id}`,
    UPDATE_STATUS: (id) => `/orders/admin/${id}/status`
  },
  KYC: {
    GET_ALL: '/admin/sellers/kyc',
    GET_BY_ID: (userId) => `/admin/sellers/kyc/${userId}`,
    UPDATE_STATUS: (userId) => `/admin/sellers/kyc/${userId}/status`
  },
  PERMISSIONS: {
    GET_MODULES: '/admin/permissions/modules',
    GET_BY_ROLE: (roleId) => `/admin/roles/${roleId}/permissions`,
    UPDATE_BY_ROLE: (roleId) => `/admin/roles/${roleId}/permissions`
  },
  DASHBOARD: {
    GET_STATS: '/dashboard/admin/stats'
  },
  CONTACTS: {
    GET_ALL: '/contact',
    DELETE: (id) => `/contact/${id}` // Added for potential future use
  },
  SELLER_CONTACTS: {
    GET_ALL: '/contact/seller',
    GET_BY_ID: (id) => `/contact/seller/${id}`,
    UPDATE_STATUS: (id) => `/contact/seller/${id}/status`,
    DELETE: (id) => `/contact/seller/${id}`
  },
  SEARCH: {
    GLOBAL: '/search/global'
  },
  PROMOTIONS: {
    OFFERS: {
      GET_ALL: '/admin/promotions/offers',
      GET_BY_ID: (id) => `/admin/promotions/offers/${id}`,
      CREATE: '/admin/promotions/offers',
      UPDATE: (id) => `/admin/promotions/offers/${id}`,
      DELETE: (id) => `/admin/promotions/offers/${id}`
    },
    COUPONS: {
      GET_ALL: '/admin/promotions/coupons',
      GET_BY_ID: (id) => `/admin/promotions/coupons/${id}`,
      CREATE: '/admin/promotions/coupons',
      UPDATE: (id) => `/admin/promotions/coupons/${id}`,
      DELETE: (id) => `/admin/promotions/coupons/${id}`
    },
    WEBSITE: {
      GET_OFFERS: '/promotions/offers',
      GET_PRODUCT_OFFERS: (productId) => `/promotions/offers/product/${productId}`,
      GET_COUPONS: '/promotions/coupons',
      VERIFY_COUPON: '/promotions/coupons/verify'
    }
  }
};
