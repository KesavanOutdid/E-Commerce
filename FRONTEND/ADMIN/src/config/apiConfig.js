export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.0.50:5000/api';
export const BASE_URL = API_BASE_URL.replace('/api', '');

export const API_ENDPOINTS = {
  AUTH: {
    ADMIN_LOGIN: '/admin/login',
    ADMIN_PROFILE: '/admin/profile',
    FORGOT_PASSWORD: '/admin/forgot-password',
    VALIDATE_OTP: '/admin/validate-otp',
    SET_NEW_PASSWORD: '/admin/set-new-password'
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
    GET_BY_ID: (id) => `/products/admin/${id}`, // Use public route for details
    CREATE: '/products/admin',
    UPDATE: (id) => `/products/admin/${id}`,
    UPDATE_APPROVAL: (id) => `/products/admin/${id}/approval`,
    DELETE: (id) => `/products/admin/${id}`
  },
  ORDERS: {
    GET_ALL: '/orders/admin',
    GET_BY_ID: (id) => `/orders/admin/${id}`,
    UPDATE_STATUS: (id) => `/orders/admin/${id}/status`
  },
  PERMISSIONS: {
    GET_MODULES: '/admin/permissions/modules',
    GET_BY_ROLE: (roleId) => `/admin/roles/${roleId}/permissions`,
    UPDATE_BY_ROLE: (roleId) => `/admin/roles/${roleId}/permissions`
  },
  DASHBOARD: {
    GET_STATS: '/dashboard/admin/stats'
  }
};
