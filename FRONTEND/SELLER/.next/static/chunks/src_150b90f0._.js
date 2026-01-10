(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/src_150b90f0._.js", {

"[project]/src/services/productService.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "productService": (()=>productService)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/axios.ts [app-client] (ecmascript)");
;
const productService = {
    createProduct: async (formData)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/api/products/seller', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    addVariant: async (masterProductId, formData)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/api/products/seller/add-variant/${masterProductId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    getProducts: async (page = 1, limit = 10)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/api/products/seller/getproducts?page=${page}&limit=${limit}`);
        return response.data;
    },
    searchProducts: async (search, page = 1, limit = 10)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/api/products/seller/getproducts?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`);
        return response.data;
    },
    getProductById: async (id)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/api/products/seller/${id}`);
        return response.data;
    },
    updateProduct: async (id, formData)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put(`/api/products/seller/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    deleteProduct: async (id)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete(`/api/products/seller/${id}`);
        return response.data;
    },
    checkProductBySlug: async (productName)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/api/products/seller/check-slug', {
            productName
        });
        return response.data;
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/hooks/useProducts.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "useProducts": (()=>useProducts)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$productService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/productService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hot-toast/dist/index.mjs [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const useProducts = ()=>{
    _s();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [totalPages, setTotalPages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [totalProducts, setTotalProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const fetchProducts = async (page = 1, limit = 10)=>{
        setLoading(true);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$productService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productService"].getProducts(page, limit);
            if (response.success) {
                const productsList = response.data.products || [];
                const pagination = response.data.pagination || {};
                setProducts(productsList);
                setTotalPages(pagination.pages || 1);
                setTotalProducts(pagination.total || productsList.length);
                return response.data;
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(response.message || 'Failed to fetch products');
                return null;
            }
        } catch (error) {
            console.error('Fetch products error:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(error.response?.data?.message || error.message || 'Failed to fetch products');
            return null;
        } finally{
            setLoading(false);
        }
    };
    const searchProducts = async (search, page = 1, limit = 10)=>{
        setLoading(true);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$productService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productService"].searchProducts(search, page, limit);
            if (response.success) {
                const productsList = response.data.products || [];
                const pagination = response.data.pagination || {};
                setProducts(productsList);
                setTotalPages(pagination.pages || 1);
                setTotalProducts(pagination.total || productsList.length);
                return response.data;
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(response.message || 'Failed to search products');
                return null;
            }
        } catch (error) {
            console.error('Search products error:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(error.response?.data?.message || error.message || 'Failed to search products');
            return null;
        } finally{
            setLoading(false);
        }
    };
    const fetchProductById = async (id)=>{
        setLoading(true);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$productService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productService"].getProductById(id);
            if (response.success) {
                return response.data;
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(response.message || 'Failed to fetch product');
                return null;
            }
        } catch (error) {
            console.error('Fetch product error:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(error.response?.data?.message || error.message || 'Failed to fetch product');
            return null;
        } finally{
            setLoading(false);
        }
    };
    const createProduct = async (formData)=>{
        setLoading(true);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$productService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productService"].createProduct(formData);
            if (response.success) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].success(response.message || 'Product created successfully');
                return response.data || true;
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(response.message || 'Failed to create product');
                return null;
            }
        } catch (error) {
            console.error('Create product error:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(error.response?.data?.message || error.message || 'Failed to create product');
            return null;
        } finally{
            setLoading(false);
        }
    };
    const addVariant = async (masterProductId, formData)=>{
        setLoading(true);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$productService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productService"].addVariant(masterProductId, formData);
            if (response.success) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].success(response.message || 'Variant added successfully');
                return response.data || true;
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(response.message || 'Failed to add variant');
                return null;
            }
        } catch (error) {
            console.error('Add variant error:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(error.response?.data?.message || error.message || 'Failed to add variant');
            return null;
        } finally{
            setLoading(false);
        }
    };
    const updateProduct = async (id, formData)=>{
        setLoading(true);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$productService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productService"].updateProduct(id, formData);
            if (response.success) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].success(response.message || 'Product updated successfully');
                return response.data || true;
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(response.message || 'Failed to update product');
                return null;
            }
        } catch (error) {
            console.error('Update product error:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(error.response?.data?.message || error.message || 'Failed to update product');
            return null;
        } finally{
            setLoading(false);
        }
    };
    const deleteProduct = async (id)=>{
        setLoading(true);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$productService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productService"].deleteProduct(id);
            if (response.success) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].success(response.message || 'Product deleted successfully');
                return true;
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(response.message || 'Failed to delete product');
                return false;
            }
        } catch (error) {
            console.error('Delete product error:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(error.response?.data?.message || error.message || 'Failed to delete product');
            return false;
        } finally{
            setLoading(false);
        }
    };
    const checkProductBySlug = async (productName)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$productService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productService"].checkProductBySlug(productName);
            return response;
        } catch (error) {
            console.error('Check product slug error:', error);
            return null;
        }
    };
    return {
        loading,
        products,
        totalPages,
        totalProducts,
        fetchProducts,
        searchProducts,
        fetchProductById,
        createProduct,
        addVariant,
        updateProduct,
        deleteProduct,
        checkProductBySlug
    };
};
_s(useProducts, "ia/zQrEpDyelAj5gwtwh5ZUUBmA=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/services/categoryService.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "categoryService": (()=>categoryService)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/axios.ts [app-client] (ecmascript)");
;
const categoryService = {
    getMainCategories: async ()=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/api/categories/main');
        return response.data;
    },
    getSubCategories: async (mainCategoryId)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/api/categories/sub/${mainCategoryId}`);
        return response.data;
    },
    getSubCategoryById: async (subCategoryId)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/api/categories/subcategory/${subCategoryId}`);
        return response.data;
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/hooks/useCategories.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "useCategories": (()=>useCategories)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$categoryService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/categoryService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hot-toast/dist/index.mjs [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const useCategories = ()=>{
    _s();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [mainCategories, setMainCategories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [subCategories, setSubCategories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const fetchMainCategories = async ()=>{
        setLoading(true);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$categoryService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categoryService"].getMainCategories();
            if (response.success) {
                const categories = response.data.categories || [];
                setMainCategories(categories);
                return categories;
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(response.message || 'Failed to fetch main categories');
                return [];
            }
        } catch (error) {
            console.error('Fetch main categories error:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(error.response?.data?.message || error.message || 'Failed to fetch main categories');
            return [];
        } finally{
            setLoading(false);
        }
    };
    const fetchSubCategories = async (mainCategoryId)=>{
        setLoading(true);
        setSubCategories([]);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$categoryService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categoryService"].getSubCategories(mainCategoryId);
            if (response.success) {
                setSubCategories(response.data);
                return response.data;
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(response.message || 'Failed to fetch sub categories');
                setSubCategories([]);
                return [];
            }
        } catch (error) {
            console.error('Fetch sub categories error:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(error.response?.data?.message || error.message || 'Failed to fetch sub categories');
            setSubCategories([]);
            return [];
        } finally{
            setLoading(false);
        }
    };
    const fetchSubCategoryById = async (subCategoryId)=>{
        setLoading(true);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$categoryService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categoryService"].getSubCategoryById(subCategoryId);
            if (response.success) {
                return response.data;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Fetch sub category error:', error);
            return null;
        } finally{
            setLoading(false);
        }
    };
    return {
        loading,
        mainCategories,
        subCategories,
        fetchMainCategories,
        fetchSubCategories,
        fetchSubCategoryById
    };
};
_s(useCategories, "77kxO8YnZqUqJWo6bQp9Du9L6x8=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/services/pickupAddressService.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "pickupAddressService": (()=>pickupAddressService)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/axios.ts [app-client] (ecmascript)");
;
const pickupAddressService = {
    getPickupAddresses: async ()=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/api/seller/pickup-addresses');
        return response.data;
    },
    addPickupAddress: async (data)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/api/seller/pickup-addresses', data);
        return response.data;
    },
    updatePickupAddress: async (addressId, data)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put(`/api/seller/pickup-addresses/${addressId}`, data);
        return response.data;
    },
    deletePickupAddress: async (addressId)=>{
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete(`/api/seller/pickup-addresses/${addressId}`);
        return response.data;
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/hooks/usePickupAddress.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "usePickupAddress": (()=>usePickupAddress)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$pickupAddressService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/pickupAddressService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hot-toast/dist/index.mjs [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
const usePickupAddress = ()=>{
    _s();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [addresses, setAddresses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const fetchAddresses = async ()=>{
        setLoading(true);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$pickupAddressService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickupAddressService"].getPickupAddresses();
            if (response.success) {
                setAddresses(response.data || []);
                return response.data;
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(response.message || 'Failed to fetch pickup addresses');
                return null;
            }
        } catch (error) {
            console.error('Fetch pickup addresses error:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(error.response?.data?.message || error.message || 'Failed to fetch pickup addresses');
            return null;
        } finally{
            setLoading(false);
        }
    };
    const addAddress = async (data)=>{
        setLoading(true);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$pickupAddressService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickupAddressService"].addPickupAddress(data);
            if (response.success) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].success('Pickup address added successfully');
                setAddresses(response.data || []);
                return response.data;
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(response.message || 'Failed to add pickup address');
                return null;
            }
        } catch (error) {
            console.error('Add pickup address error:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(error.response?.data?.message || error.message || 'Failed to add pickup address');
            return null;
        } finally{
            setLoading(false);
        }
    };
    const updateAddress = async (addressId, data)=>{
        setLoading(true);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$pickupAddressService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickupAddressService"].updatePickupAddress(addressId, data);
            if (response.success) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].success('Pickup address updated successfully');
                setAddresses(response.data || []);
                return response.data;
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(response.message || 'Failed to update pickup address');
                return null;
            }
        } catch (error) {
            console.error('Update pickup address error:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(error.response?.data?.message || error.message || 'Failed to update pickup address');
            return null;
        } finally{
            setLoading(false);
        }
    };
    const deleteAddress = async (addressId)=>{
        setLoading(true);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$pickupAddressService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pickupAddressService"].deletePickupAddress(addressId);
            if (response.success) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].success('Pickup address deleted successfully');
                setAddresses(response.data || []);
                return response.data;
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(response.message || 'Failed to delete pickup address');
                return null;
            }
        } catch (error) {
            console.error('Delete pickup address error:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error(error.response?.data?.message || error.message || 'Failed to delete pickup address');
            return null;
        } finally{
            setLoading(false);
        }
    };
    return {
        loading,
        addresses,
        fetchAddresses,
        addAddress,
        updateAddress,
        deleteAddress
    };
};
_s(usePickupAddress, "WLLfzPZkJX1ozF4OEPy9YvcCOjA=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/components/Common/Breadcrumb.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
;
const Breadcrumb = ({ pageName, pageDescription })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "dark:bg-darkmode relative z-10 overflow-hidden pb-[30px] pt-[100px]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "from-stroke/0 via-stroke to-stroke/0 dark:via-dark-3 absolute bottom-0 left-0 h-px w-full bg-linear-to-r"
            }, void 0, false, {
                fileName: "[project]/src/app/components/Common/Breadcrumb.tsx",
                lineNumber: 10,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container mx-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "-mx-4 flex flex-wrap items-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full px-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-black mb-4 text-3xl font-bold sm:text-4xl md:text-[40px] md:leading-[1.2] dark:text-white",
                                    style: {
                                        color: '#611F69'
                                    },
                                    children: pageName
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Common/Breadcrumb.tsx",
                                    lineNumber: 15,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-base",
                                    children: pageDescription
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Common/Breadcrumb.tsx",
                                    lineNumber: 18,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "flex items-center justify-center gap-[10px]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/",
                                                className: "text-black flex items-center gap-[10px] text-base font-medium dark:text-white dark:text-opacity-50",
                                                children: "Home"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Common/Breadcrumb.tsx",
                                                lineNumber: 24,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Common/Breadcrumb.tsx",
                                            lineNumber: 23,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-body-color flex items-center gap-[10px] text-base font-medium",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-body-color dark:text-white dark:text-opacity-50",
                                                        style: {
                                                            color: '#611F69'
                                                        },
                                                        children: " / "
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Common/Breadcrumb.tsx",
                                                        lineNumber: 33,
                                                        columnNumber: 41
                                                    }, this),
                                                    pageName
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/components/Common/Breadcrumb.tsx",
                                                lineNumber: 32,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/components/Common/Breadcrumb.tsx",
                                            lineNumber: 31,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/Common/Breadcrumb.tsx",
                                    lineNumber: 22,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Common/Breadcrumb.tsx",
                            lineNumber: 14,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/components/Common/Breadcrumb.tsx",
                        lineNumber: 13,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/components/Common/Breadcrumb.tsx",
                    lineNumber: 12,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/Common/Breadcrumb.tsx",
                lineNumber: 11,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/components/Common/Breadcrumb.tsx",
        lineNumber: 9,
        columnNumber: 9
    }, this);
};
_c = Breadcrumb;
const __TURBOPACK__default__export__ = Breadcrumb;
var _c;
__turbopack_context__.k.register(_c, "Breadcrumb");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/components/Skeleton/ProductForm/index.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
const ProductFormSkeleton = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "animate-pulse",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-2xl shadow-xl p-8 border border-gray-100",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-8 bg-gray-200 rounded w-48 mb-2"
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                            lineNumber: 6,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-4 bg-gray-200 rounded w-64"
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                            lineNumber: 7,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                    lineNumber: 5,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-6 bg-gray-200 rounded w-40 mb-4"
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                            lineNumber: 11,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-4 bg-gray-300 rounded w-32 mb-2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                lineNumber: 15,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-12 bg-gray-200 rounded-md"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                lineNumber: 16,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                        lineNumber: 14,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-4 bg-gray-300 rounded w-28 mb-2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                        lineNumber: 20,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-12 bg-gray-200 rounded-md"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                        lineNumber: 21,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                lineNumber: 19,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-4 bg-gray-300 rounded w-28 mb-2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                        lineNumber: 24,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-12 bg-gray-200 rounded-md"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                        lineNumber: 25,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                lineNumber: 23,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                        lineNumber: 18,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-4 bg-gray-300 rounded w-36 mb-2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                lineNumber: 29,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-20 bg-gray-200 rounded-md"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                lineNumber: 30,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                        lineNumber: 28,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-4 bg-gray-300 rounded w-28 mb-2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                lineNumber: 33,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-32 bg-gray-200 rounded-md"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                lineNumber: 34,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                        lineNumber: 32,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                lineNumber: 13,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                            lineNumber: 12,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                    lineNumber: 10,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-6 bg-gray-200 rounded w-40 mb-4"
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                            lineNumber: 41,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-3 gap-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-4 bg-gray-300 rounded w-24 mb-2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                lineNumber: 45,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-12 bg-gray-200 rounded-md"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                lineNumber: 46,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                        lineNumber: 44,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-4 bg-gray-300 rounded w-24 mb-2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                lineNumber: 49,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-12 bg-gray-200 rounded-md"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                lineNumber: 50,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                        lineNumber: 48,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-4 bg-gray-300 rounded w-20 mb-2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                lineNumber: 53,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-12 bg-gray-200 rounded-md"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                lineNumber: 54,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                        lineNumber: 52,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                lineNumber: 43,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                            lineNumber: 42,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                    lineNumber: 40,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-6 bg-gray-200 rounded w-40 mb-4"
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                            lineNumber: 61,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                                children: [
                                    ...Array(4)
                                ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-4 bg-gray-300 rounded w-20 mb-2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                lineNumber: 66,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-12 bg-gray-200 rounded-md"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                                lineNumber: 67,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                        lineNumber: 65,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                lineNumber: 63,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                            lineNumber: 62,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-6 bg-gray-200 rounded w-40 mb-4"
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                            lineNumber: 75,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-xl",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-12 bg-gray-200 rounded-md mb-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                    lineNumber: 77,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 md:grid-cols-5 gap-4",
                                    children: [
                                        ...Array(5)
                                    ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-32 bg-gray-200 rounded-lg"
                                        }, i, false, {
                                            fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                            lineNumber: 80,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                                    lineNumber: 78,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                            lineNumber: 76,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                    lineNumber: 74,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-end gap-4 mt-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-10 bg-gray-200 rounded-lg w-24"
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                            lineNumber: 87,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-10 bg-gray-300 rounded-lg w-32"
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                            lineNumber: 88,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
                    lineNumber: 86,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
            lineNumber: 4,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/components/Skeleton/ProductForm/index.tsx",
        lineNumber: 3,
        columnNumber: 5
    }, this);
};
_c = ProductFormSkeleton;
const __TURBOPACK__default__export__ = ProductFormSkeleton;
var _c;
__turbopack_context__.k.register(_c, "ProductFormSkeleton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(site)/products/add/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>AddProductPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useProducts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useProducts.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useCategories$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useCategories.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$usePickupAddress$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/usePickupAddress.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Common$2f$Breadcrumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Common/Breadcrumb.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Skeleton$2f$ProductForm$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/components/Skeleton/ProductForm/index.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@iconify/react/dist/iconify.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hot-toast/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
function AddProductPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { user, isAuthenticated, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const { loading: productLoading, createProduct, addVariant, checkProductBySlug } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useProducts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProducts"])();
    const { loading: categoryLoading, mainCategories, subCategories, fetchMainCategories, fetchSubCategories } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useCategories$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCategories"])();
    const { loading: pickupLoading, addresses: pickupAddresses, fetchAddresses } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$usePickupAddress$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePickupAddress"])();
    const hasFetchedCategories = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const hasFetchedAddresses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        productName: '',
        mainCategoryId: '',
        subCategoryId: '',
        description: '',
        shortDescription: '',
        brand: '',
        warranty: ''
    });
    const [highlights, setHighlights] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [specifications, setSpecifications] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [showHighlights, setShowHighlights] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showSpecifications, setShowSpecifications] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [masterImages, setMasterImages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [masterImagePreviews, setMasterImagePreviews] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [variants, setVariants] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        {
            price: '',
            salePrice: '',
            stock: '',
            deliveryDays: '3',
            pickupAddress: '',
            attributes: [
                {
                    name: '',
                    value: ''
                }
            ],
            imageIndices: [],
            images: []
        }
    ]);
    const [subCategoryAttributes, setSubCategoryAttributes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [commissionPercentage, setCommissionPercentage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [existingProduct, setExistingProduct] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showVariantOnlyMode, setShowVariantOnlyMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const productCheckTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isAutoFillingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AddProductPage.useEffect": ()=>{
            if (isLoading) return;
            if (!isAuthenticated) {
                router.push('/');
                return;
            }
            if (!hasFetchedCategories.current) {
                fetchMainCategories();
                hasFetchedCategories.current = true;
            }
            if (!hasFetchedAddresses.current) {
                fetchAddresses();
                hasFetchedAddresses.current = true;
            }
        }
    }["AddProductPage.useEffect"], [
        isAuthenticated,
        isLoading,
        router
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AddProductPage.useEffect": ()=>{
            if (formData.mainCategoryId) {
                fetchSubCategories(formData.mainCategoryId);
                if (!isAutoFillingRef.current) {
                    setFormData({
                        "AddProductPage.useEffect": (prev)=>({
                                ...prev,
                                subCategoryId: ''
                            })
                    }["AddProductPage.useEffect"]);
                    setSubCategoryAttributes([]);
                }
            }
        }
    }["AddProductPage.useEffect"], [
        formData.mainCategoryId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AddProductPage.useEffect": ()=>{
            const loadSubCategoryAttributes = {
                "AddProductPage.useEffect.loadSubCategoryAttributes": async ()=>{
                    if (formData.subCategoryId && subCategories.length > 0) {
                        const subCategory = subCategories.find({
                            "AddProductPage.useEffect.loadSubCategoryAttributes.subCategory": (cat)=>cat.subCategoryId === formData.subCategoryId || cat._id === formData.subCategoryId
                        }["AddProductPage.useEffect.loadSubCategoryAttributes.subCategory"]);
                        if (subCategory && subCategory.attributes && subCategory.attributes.length > 0) {
                            setSubCategoryAttributes(subCategory.attributes);
                            setCommissionPercentage(subCategory.commissionPercentage || 0);
                            if (!isAutoFillingRef.current) {
                                setVariants({
                                    "AddProductPage.useEffect.loadSubCategoryAttributes": (prev)=>prev.map({
                                            "AddProductPage.useEffect.loadSubCategoryAttributes": (variant)=>({
                                                    ...variant,
                                                    attributes: subCategory.attributes.map({
                                                        "AddProductPage.useEffect.loadSubCategoryAttributes": (attr)=>({
                                                                name: attr.name,
                                                                value: ''
                                                            })
                                                    }["AddProductPage.useEffect.loadSubCategoryAttributes"])
                                                })
                                        }["AddProductPage.useEffect.loadSubCategoryAttributes"])
                                }["AddProductPage.useEffect.loadSubCategoryAttributes"]);
                            } else {
                                setVariants([
                                    {
                                        price: '',
                                        salePrice: '',
                                        stock: '',
                                        deliveryDays: '3',
                                        pickupAddress: '',
                                        attributes: subCategory.attributes.map({
                                            "AddProductPage.useEffect.loadSubCategoryAttributes": (attr)=>({
                                                    name: attr.name,
                                                    value: ''
                                                })
                                        }["AddProductPage.useEffect.loadSubCategoryAttributes"]),
                                        imageIndices: [],
                                        images: []
                                    }
                                ]);
                            }
                        } else {
                            setSubCategoryAttributes([]);
                            setCommissionPercentage(0);
                        }
                    }
                }
            }["AddProductPage.useEffect.loadSubCategoryAttributes"];
            loadSubCategoryAttributes();
        }
    }["AddProductPage.useEffect"], [
        formData.subCategoryId,
        subCategories
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AddProductPage.useEffect": ()=>{
            if (productCheckTimeoutRef.current) {
                clearTimeout(productCheckTimeoutRef.current);
            }
            if (formData.productName.trim().length > 2 && !showVariantOnlyMode) {
                productCheckTimeoutRef.current = setTimeout({
                    "AddProductPage.useEffect": async ()=>{
                        const result = await checkProductBySlug(formData.productName.trim());
                        if (result && result.exists) {
                            setExistingProduct(result.product);
                            if (result.alreadyListed) {
                                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error('You have already listed this product');
                                setShowVariantOnlyMode(false);
                            } else {
                                setShowVariantOnlyMode(true);
                                isAutoFillingRef.current = true;
                                setFormData({
                                    productName: result.product.productName || '',
                                    mainCategoryId: result.product.mainCategoryId || '',
                                    subCategoryId: result.product.subCategoryId || '',
                                    description: result.product.description || '',
                                    shortDescription: result.product.shortDescription || '',
                                    brand: result.product.brand || '',
                                    warranty: result.product.warranty || ''
                                });
                                if (result.product.highlights && result.product.highlights.length > 0) {
                                    setHighlights(result.product.highlights);
                                    setShowHighlights(true);
                                }
                                if (result.product.specifications && result.product.specifications.length > 0) {
                                    setSpecifications(result.product.specifications);
                                    setShowSpecifications(true);
                                }
                                setTimeout({
                                    "AddProductPage.useEffect": ()=>{
                                        isAutoFillingRef.current = false;
                                    }
                                }["AddProductPage.useEffect"], 1000);
                            }
                        } else {
                            setExistingProduct(null);
                            setShowVariantOnlyMode(false);
                        }
                    }
                }["AddProductPage.useEffect"], 500);
            } else if (!showVariantOnlyMode) {
                setExistingProduct(null);
                setShowVariantOnlyMode(false);
            }
            return ({
                "AddProductPage.useEffect": ()=>{
                    if (productCheckTimeoutRef.current) {
                        clearTimeout(productCheckTimeoutRef.current);
                    }
                }
            })["AddProductPage.useEffect"];
        }
    }["AddProductPage.useEffect"], [
        formData.productName
    ]);
    const handleMasterImageChange = (e)=>{
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.length < 1) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error('Please select at least 1 image');
                return;
            }
            if (files.length > 10) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error('You can upload maximum 10 images');
                return;
            }
            const validTypes = [
                'image/png',
                'image/jpeg',
                'image/jpg'
            ];
            const invalidFiles = files.filter((file)=>!validTypes.includes(file.type));
            if (invalidFiles.length > 0) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error('Only PNG, JPG, and JPEG files are allowed');
                return;
            }
            setMasterImages(files);
            const previews = files.map((file)=>URL.createObjectURL(file));
            setMasterImagePreviews(previews);
        }
    };
    const removeMasterImage = (index)=>{
        setMasterImages((prev)=>prev.filter((_, i)=>i !== index));
        setMasterImagePreviews((prev)=>prev.filter((_, i)=>i !== index));
        setVariants((prev)=>prev.map((variant)=>({
                    ...variant,
                    imageIndices: variant.imageIndices.filter((idx)=>idx !== index).map((idx)=>idx > index ? idx - 1 : idx)
                })));
    };
    const addVariantToList = ()=>{
        setVariants([
            ...variants,
            {
                price: '',
                salePrice: '',
                stock: '',
                deliveryDays: '3',
                pickupAddress: '',
                attributes: subCategoryAttributes.map((attr)=>({
                        name: attr.name,
                        value: ''
                    })),
                imageIndices: [],
                images: []
            }
        ]);
    };
    const removeVariant = (index)=>{
        if (variants.length > 1) {
            setVariants(variants.filter((_, i)=>i !== index));
        }
    };
    const updateVariant = (index, field, value)=>{
        setVariants((prev)=>prev.map((variant, i)=>i === index ? {
                    ...variant,
                    [field]: value
                } : variant));
    };
    const updateVariantAttribute = (variantIndex, attrIndex, value)=>{
        setVariants((prev)=>prev.map((variant, i)=>i === variantIndex ? {
                    ...variant,
                    attributes: variant.attributes.map((attr, j)=>j === attrIndex ? {
                            ...attr,
                            value
                        } : attr)
                } : variant));
    };
    const toggleImageIndex = (variantIndex, imageIndex)=>{
        setVariants((prev)=>prev.map((variant, i)=>{
                if (i === variantIndex) {
                    const indices = variant.imageIndices.includes(imageIndex) ? variant.imageIndices.filter((idx)=>idx !== imageIndex) : [
                        ...variant.imageIndices,
                        imageIndex
                    ];
                    return {
                        ...variant,
                        imageIndices: indices
                    };
                }
                return variant;
            }));
    };
    const handleVariantImageChange = (variantIndex, e)=>{
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validTypes = [
                'image/png',
                'image/jpeg',
                'image/jpg'
            ];
            const invalidFiles = files.filter((file)=>!validTypes.includes(file.type));
            if (invalidFiles.length > 0) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error('Only PNG, JPG, and JPEG files are allowed');
                return;
            }
            setVariants((prev)=>prev.map((variant, i)=>i === variantIndex ? {
                        ...variant,
                        images: [
                            ...variant.images,
                            ...files
                        ]
                    } : variant));
        }
    };
    const removeVariantImage = (variantIndex, imageIndex)=>{
        setVariants((prev)=>prev.map((variant, i)=>i === variantIndex ? {
                    ...variant,
                    images: variant.images.filter((_, idx)=>idx !== imageIndex)
                } : variant));
    };
    const addHighlight = ()=>{
        setHighlights([
            ...highlights,
            ''
        ]);
    };
    const removeHighlight = (index)=>{
        setHighlights(highlights.filter((_, i)=>i !== index));
    };
    const updateHighlight = (index, value)=>{
        setHighlights((prev)=>prev.map((h, i)=>i === index ? value : h));
    };
    const addSpecification = ()=>{
        setSpecifications([
            ...specifications,
            {
                name: '',
                value: ''
            }
        ]);
    };
    const removeSpecification = (index)=>{
        setSpecifications(specifications.filter((_, i)=>i !== index));
    };
    const updateSpecification = (index, field, value)=>{
        setSpecifications((prev)=>prev.map((spec, i)=>i === index ? {
                    ...spec,
                    [field]: value
                } : spec));
    };
    const isFormValid = ()=>{
        const validateVariant = (v)=>{
            const priceValid = v.price.trim() !== '';
            const stockValid = v.stock.trim() !== '';
            const imagesValid = v.images.length > 0;
            const attributesValid = v.attributes.every((a)=>{
                const subCatAttr = subCategoryAttributes.find((attr)=>attr.name === a.name);
                const isRequired = subCatAttr?.required ?? true;
                return !isRequired || a.value.trim() !== '';
            });
            return priceValid && stockValid && attributesValid && imagesValid;
        };
        if (showVariantOnlyMode) {
            return variants.every(validateVariant);
        }
        return formData.productName.trim() !== '' && formData.mainCategoryId !== '' && formData.subCategoryId !== '' && formData.description.trim() !== '' && formData.shortDescription.trim() !== '' && variants.every(validateVariant);
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!user?.userId) return;
        if (showVariantOnlyMode && existingProduct) {
            const variantFormData = new FormData();
            const variant = variants[0];
            variantFormData.append('price', variant.price);
            if (variant.salePrice) variantFormData.append('salePrice', variant.salePrice);
            variantFormData.append('stock', variant.stock);
            variantFormData.append('deliveryDays', variant.deliveryDays);
            if (variant.pickupAddress) variantFormData.append('pickupAddress', variant.pickupAddress);
            const validAttributes = variant.attributes.filter((attr)=>{
                const subCatAttr = subCategoryAttributes.find((a)=>a.name === attr.name);
                const isRequired = subCatAttr?.required ?? true;
                return isRequired ? attr.value.trim() !== '' : true;
            }).map((attr)=>{
                const subCatAttr = subCategoryAttributes.find((a)=>a.name === attr.name);
                return {
                    name: attr.name,
                    value: attr.value,
                    required: subCatAttr?.required ?? true
                };
            });
            if (validAttributes.length > 0) {
                variantFormData.append('attributes', JSON.stringify(validAttributes));
            }
            variant.images.forEach((image)=>{
                variantFormData.append('images', image);
            });
            const result = await addVariant(existingProduct.productId, variantFormData);
            if (result) {
                router.push('/products');
            }
            return;
        }
        const selectedSubCategory = subCategories.find((cat)=>cat.subCategoryId === formData.subCategoryId || cat._id === formData.subCategoryId);
        if (!selectedSubCategory) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error('Please select a valid sub-category');
            return;
        }
        const parentCategoryId = selectedSubCategory.parentId || formData.mainCategoryId;
        const productFormData = new FormData();
        productFormData.append('productName', formData.productName);
        productFormData.append('mainCategoryId', parentCategoryId);
        productFormData.append('subCategoryId', formData.subCategoryId);
        productFormData.append('description', formData.description);
        productFormData.append('shortDescription', formData.shortDescription);
        productFormData.append('userId', user.userId);
        productFormData.append('createdby', user.email);
        if (formData.brand) productFormData.append('brand', formData.brand);
        if (formData.warranty) productFormData.append('warranty', formData.warranty);
        const validHighlights = highlights.filter((h)=>h.trim() !== '');
        if (validHighlights.length > 0) {
            productFormData.append('highlights', JSON.stringify(validHighlights));
        }
        const validSpecifications = specifications.filter((s)=>s.name.trim() !== '' && s.value.trim() !== '');
        if (validSpecifications.length > 0) {
            productFormData.append('specifications', JSON.stringify(validSpecifications));
        }
        const variantsData = variants.map((variant)=>({
                price: parseFloat(variant.price),
                salePrice: variant.salePrice ? parseFloat(variant.salePrice) : null,
                stock: parseInt(variant.stock),
                deliveryDays: parseInt(variant.deliveryDays) || 3,
                pickupAddress: variant.pickupAddress || null,
                attributes: variant.attributes.filter((attr)=>{
                    const subCatAttr = subCategoryAttributes.find((a)=>a.name === attr.name);
                    const isRequired = subCatAttr?.required ?? true;
                    return isRequired ? attr.value.trim() !== '' : true;
                }).map((attr)=>{
                    const subCatAttr = subCategoryAttributes.find((a)=>a.name === attr.name);
                    return {
                        name: attr.name,
                        value: attr.value,
                        required: subCatAttr?.required ?? true
                    };
                })
            }));
        productFormData.append('variants', JSON.stringify(variantsData));
        variants.forEach((variant, index)=>{
            variant.images.forEach((image)=>{
                productFormData.append(`variantImages_${index}`, image);
            });
        });
        const result = await createProduct(productFormData);
        if (result) {
            router.push('/products');
        }
    };
    const getVariantImagePreviews = (variantIndex)=>{
        const variant = variants[variantIndex];
        return variant.images.map((file)=>URL.createObjectURL(file));
    };
    if (isLoading || categoryLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Common$2f$Breadcrumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    pageName: "Add Product"
                }, void 0, false, {
                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                    lineNumber: 474,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    style: {
                        backgroundColor: 'rgb(249, 249, 249)'
                    },
                    className: "pb-10",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "container mx-auto max-w-4xl px-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Skeleton$2f$ProductForm$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                            lineNumber: 477,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                        lineNumber: 476,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                    lineNumber: 475,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true);
    }
    if (!isAuthenticated) {
        return null;
    }
    if (!user?.kycApproved) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Common$2f$Breadcrumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    pageName: "Add Product"
                }, void 0, false, {
                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                    lineNumber: 491,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    style: {
                        backgroundColor: 'rgb(249, 249, 249)'
                    },
                    className: "pb-10",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "container mx-auto max-w-4xl px-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-xl shadow p-6 border border-gray-200",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                        icon: "mdi:alert-circle",
                                        className: "mx-auto text-orange-500 mb-4",
                                        width: 64,
                                        height: 64
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                        lineNumber: 496,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-2xl font-bold text-black mb-4",
                                        children: "KYC Verification Required"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                        lineNumber: 497,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-600 mb-6",
                                        children: "You need to complete KYC verification before you can add products."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                        lineNumber: 498,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/kyc",
                                        className: "inline-flex items-center gap-2 bg-primary text-white px-4 py-2 text-sm rounded-lg hover:bg-primary/90 transition",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                icon: "mdi:shield-check",
                                                width: 18,
                                                height: 18
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                lineNumber: 504,
                                                columnNumber: 37
                                            }, this),
                                            "Complete KYC Verification"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                        lineNumber: 501,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                lineNumber: 495,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                            lineNumber: 494,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                        lineNumber: 493,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                    lineNumber: 492,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$components$2f$Common$2f$Breadcrumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                pageName: "Add Product"
            }, void 0, false, {
                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                lineNumber: 517,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                style: {
                    backgroundColor: 'rgb(249, 249, 249)'
                },
                className: "pb-10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto max-w-6xl px-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-xl shadow p-6 border border-gray-200",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-6 flex items-start justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "text-2xl font-bold text-black mb-2",
                                                children: "Add New Product"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                lineNumber: 523,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-gray-600",
                                                children: showVariantOnlyMode ? 'Product already exists in catalog. Add your pricing and stock details.' : 'Fill in the details to add a new product with variants'
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                lineNumber: 524,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                        lineNumber: 522,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/products",
                                        className: "px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                icon: "mdi:arrow-left",
                                                width: 18,
                                                height: 18
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                lineNumber: 533,
                                                columnNumber: 33
                                            }, this),
                                            "Back to Products"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                        lineNumber: 530,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                lineNumber: 521,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                onSubmit: handleSubmit,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-lg font-semibold text-black mb-3 flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                        icon: "mdi:information",
                                                        width: 20,
                                                        height: 20,
                                                        className: "text-primary"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                        lineNumber: 573,
                                                        columnNumber: 37
                                                    }, this),
                                                    "Basic Information"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                lineNumber: 572,
                                                columnNumber: 33
                                            }, this),
                                            showVariantOnlyMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-3 p-3 rounded-lg bg-green-50 border border-green-200",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-medium text-green-800 flex items-center gap-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                            icon: "mdi:check-circle",
                                                            width: 16,
                                                            height: 16
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                            lineNumber: 579,
                                                            columnNumber: 45
                                                        }, this),
                                                        "Product exists, you can add your price and stock"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                    lineNumber: 578,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                lineNumber: 577,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    backgroundColor: 'rgb(249, 249, 249)'
                                                },
                                                className: "p-5 rounded-lg space-y-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-xs font-medium text-gray-700 mb-1.5",
                                                                children: [
                                                                    "Product Name ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-red-500",
                                                                        children: "*"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 587,
                                                                        columnNumber: 58
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 586,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "text",
                                                                value: formData.productName,
                                                                onChange: (e)=>setFormData({
                                                                        ...formData,
                                                                        productName: e.target.value
                                                                    }),
                                                                className: `w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`,
                                                                required: true,
                                                                disabled: showVariantOnlyMode
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 589,
                                                                columnNumber: 41
                                                            }, this),
                                                            existingProduct && !showVariantOnlyMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mt-2 p-2 rounded-lg bg-yellow-50 border border-yellow-200",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs font-medium text-yellow-800 flex items-center gap-1.5",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                            icon: "mdi:alert",
                                                                            width: 16,
                                                                            height: 16
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                            lineNumber: 600,
                                                                            columnNumber: 53
                                                                        }, this),
                                                                        "Similar product exists in catalog"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                    lineNumber: 599,
                                                                    columnNumber: 49
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 598,
                                                                columnNumber: 45
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                        lineNumber: 585,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-1 md:grid-cols-2 gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "block text-xs font-medium text-gray-700 mb-1.5",
                                                                        children: [
                                                                            "Main Category ",
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-red-500",
                                                                                children: "*"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 610,
                                                                                columnNumber: 63
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 609,
                                                                        columnNumber: 45
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                        value: formData.mainCategoryId,
                                                                        onChange: (e)=>setFormData({
                                                                                ...formData,
                                                                                mainCategoryId: e.target.value
                                                                            }),
                                                                        className: `w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`,
                                                                        required: true,
                                                                        disabled: showVariantOnlyMode,
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "",
                                                                                children: "Select Main Category"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 618,
                                                                                columnNumber: 49
                                                                            }, this),
                                                                            mainCategories.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    value: category.categoryId,
                                                                                    children: category.name
                                                                                }, category._id, false, {
                                                                                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                    lineNumber: 620,
                                                                                    columnNumber: 53
                                                                                }, this))
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 612,
                                                                        columnNumber: 45
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 608,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "block text-xs font-medium text-gray-700 mb-1.5",
                                                                        children: [
                                                                            "Sub Category ",
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-red-500",
                                                                                children: "*"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 628,
                                                                                columnNumber: 62
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 627,
                                                                        columnNumber: 45
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                        value: formData.subCategoryId,
                                                                        onChange: (e)=>setFormData({
                                                                                ...formData,
                                                                                subCategoryId: e.target.value
                                                                            }),
                                                                        className: `w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`,
                                                                        required: true,
                                                                        disabled: showVariantOnlyMode || !formData.mainCategoryId,
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "",
                                                                                children: "Select Sub Category"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 636,
                                                                                columnNumber: 49
                                                                            }, this),
                                                                            subCategories.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    value: category.subCategoryId,
                                                                                    children: category.name
                                                                                }, category._id, false, {
                                                                                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                    lineNumber: 638,
                                                                                    columnNumber: 53
                                                                                }, this))
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 630,
                                                                        columnNumber: 45
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 626,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                        lineNumber: 607,
                                                        columnNumber: 37
                                                    }, this),
                                                    subCategoryAttributes.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-3 bg-blue-50 border border-blue-200 rounded-lg",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-blue-800 flex items-center gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                    icon: "mdi:check-circle",
                                                                    width: 16,
                                                                    height: 16
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                    lineNumber: 649,
                                                                    columnNumber: 57
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: subCategoryAttributes.length
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                    lineNumber: 650,
                                                                    columnNumber: 57
                                                                }, this),
                                                                " variant attributes loaded from this category"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                            lineNumber: 648,
                                                            columnNumber: 53
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                        lineNumber: 647,
                                                        columnNumber: 49
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-1 md:grid-cols-2 gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "block text-xs font-medium text-gray-700 mb-1.5",
                                                                        children: "Brand"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 657,
                                                                        columnNumber: 45
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "text",
                                                                        value: formData.brand,
                                                                        onChange: (e)=>setFormData({
                                                                                ...formData,
                                                                                brand: e.target.value
                                                                            }),
                                                                        className: `w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`,
                                                                        placeholder: "e.g., Samsung, Apple",
                                                                        disabled: showVariantOnlyMode
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 660,
                                                                        columnNumber: 45
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 656,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "block text-xs font-medium text-gray-700 mb-1.5",
                                                                        children: "Warranty"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 670,
                                                                        columnNumber: 45
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "text",
                                                                        value: formData.warranty,
                                                                        onChange: (e)=>setFormData({
                                                                                ...formData,
                                                                                warranty: e.target.value
                                                                            }),
                                                                        className: `w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`,
                                                                        placeholder: "e.g., 2 years, 6 months",
                                                                        disabled: showVariantOnlyMode
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 673,
                                                                        columnNumber: 45
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 669,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                        lineNumber: 655,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-xs font-medium text-gray-700 mb-1.5",
                                                                children: [
                                                                    "Short Description ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-red-500",
                                                                        children: "*"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 686,
                                                                        columnNumber: 63
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 685,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                                value: formData.shortDescription,
                                                                onChange: (e)=>setFormData({
                                                                        ...formData,
                                                                        shortDescription: e.target.value
                                                                    }),
                                                                rows: 3,
                                                                className: `w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`,
                                                                required: true,
                                                                disabled: showVariantOnlyMode
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 688,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                        lineNumber: 684,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-xs font-medium text-gray-700 mb-1.5",
                                                                children: [
                                                                    "Description ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-red-500",
                                                                        children: "*"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 700,
                                                                        columnNumber: 57
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 699,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                                value: formData.description,
                                                                onChange: (e)=>setFormData({
                                                                        ...formData,
                                                                        description: e.target.value
                                                                    }),
                                                                rows: 5,
                                                                className: `w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`,
                                                                required: true,
                                                                disabled: showVariantOnlyMode
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 702,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                        lineNumber: 698,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                lineNumber: 584,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                        lineNumber: 571,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-6 grid grid-cols-1 md:grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        className: "text-lg font-semibold text-black mb-3 flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                icon: "mdi:star",
                                                                width: 20,
                                                                height: 20,
                                                                className: "text-primary"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 719,
                                                                columnNumber: 49
                                                            }, this),
                                                            "Highlights (Optional)"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                        lineNumber: 718,
                                                        columnNumber: 45
                                                    }, this),
                                                    showHighlights || highlights.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            backgroundColor: 'rgb(249, 249, 249)'
                                                        },
                                                        className: "p-5 rounded-lg space-y-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-gray-600 mb-3",
                                                                children: "Add key features and highlights of the product"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 724,
                                                                columnNumber: 53
                                                            }, this),
                                                            highlights.map((highlight, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-xs font-medium text-gray-500 w-6",
                                                                            children: [
                                                                                index + 1,
                                                                                "."
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                            lineNumber: 727,
                                                                            columnNumber: 61
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "text",
                                                                            value: highlight,
                                                                            onChange: (e)=>updateHighlight(index, e.target.value),
                                                                            className: `flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`,
                                                                            placeholder: "Enter highlight",
                                                                            disabled: showVariantOnlyMode
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                            lineNumber: 728,
                                                                            columnNumber: 61
                                                                        }, this),
                                                                        !showVariantOnlyMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "button",
                                                                            onClick: ()=>{
                                                                                removeHighlight(index);
                                                                                if (highlights.length === 1) setShowHighlights(false);
                                                                            },
                                                                            className: "p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                                icon: "mdi:close",
                                                                                width: 18,
                                                                                height: 18
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 744,
                                                                                columnNumber: 69
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                            lineNumber: 737,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, index, true, {
                                                                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                    lineNumber: 726,
                                                                    columnNumber: 57
                                                                }, this)),
                                                            !showVariantOnlyMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: addHighlight,
                                                                className: "flex items-center gap-1.5 text-primary hover:text-primary/80 transition text-sm font-medium mt-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                        icon: "mdi:plus-circle",
                                                                        width: 18,
                                                                        height: 18
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 754,
                                                                        columnNumber: 61
                                                                    }, this),
                                                                    "Add Another Highlight"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 750,
                                                                columnNumber: 57
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                        lineNumber: 723,
                                                        columnNumber: 49
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>{
                                                            setShowHighlights(true);
                                                            addHighlight();
                                                        },
                                                        style: {
                                                            backgroundColor: 'rgb(249, 249, 249)'
                                                        },
                                                        className: "w-full p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary transition flex items-center justify-center gap-2 text-gray-600 hover:text-primary",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                icon: "mdi:plus-circle",
                                                                width: 20,
                                                                height: 20
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 768,
                                                                columnNumber: 53
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-medium",
                                                                children: "Add Product Highlights"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 769,
                                                                columnNumber: 53
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                        lineNumber: 760,
                                                        columnNumber: 49
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                lineNumber: 717,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        className: "text-lg font-semibold text-black mb-3 flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                icon: "mdi:clipboard-list",
                                                                width: 20,
                                                                height: 20,
                                                                className: "text-primary"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 777,
                                                                columnNumber: 49
                                                            }, this),
                                                            "Specifications (Optional)"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                        lineNumber: 776,
                                                        columnNumber: 45
                                                    }, this),
                                                    showSpecifications || specifications.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            backgroundColor: 'rgb(249, 249, 249)'
                                                        },
                                                        className: "p-5 rounded-lg space-y-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-gray-600 mb-3",
                                                                children: "Add general product specifications (e.g., Operating System, Processor, etc.)"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 782,
                                                                columnNumber: 53
                                                            }, this),
                                                            specifications.map((spec, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "text",
                                                                            value: spec.name,
                                                                            onChange: (e)=>updateSpecification(index, 'name', e.target.value),
                                                                            className: `w-1/3 rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`,
                                                                            placeholder: "Name (e.g., Processor)",
                                                                            disabled: showVariantOnlyMode
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                            lineNumber: 785,
                                                                            columnNumber: 61
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "text",
                                                                            value: spec.value,
                                                                            onChange: (e)=>updateSpecification(index, 'value', e.target.value),
                                                                            className: `flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-primary ${showVariantOnlyMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`,
                                                                            placeholder: "Value (e.g., Snapdragon 8 Gen 2)",
                                                                            disabled: showVariantOnlyMode
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                            lineNumber: 793,
                                                                            columnNumber: 61
                                                                        }, this),
                                                                        !showVariantOnlyMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "button",
                                                                            onClick: ()=>{
                                                                                removeSpecification(index);
                                                                                if (specifications.length === 1) setShowSpecifications(false);
                                                                            },
                                                                            className: "p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                                icon: "mdi:close",
                                                                                width: 18,
                                                                                height: 18
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 809,
                                                                                columnNumber: 69
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                            lineNumber: 802,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, index, true, {
                                                                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                    lineNumber: 784,
                                                                    columnNumber: 57
                                                                }, this)),
                                                            !showVariantOnlyMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: addSpecification,
                                                                className: "flex items-center gap-1.5 text-primary hover:text-primary/80 transition text-sm font-medium mt-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                        icon: "mdi:plus-circle",
                                                                        width: 18,
                                                                        height: 18
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 819,
                                                                        columnNumber: 61
                                                                    }, this),
                                                                    "Add Another Specification"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 815,
                                                                columnNumber: 57
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                        lineNumber: 781,
                                                        columnNumber: 49
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>{
                                                            setShowSpecifications(true);
                                                            addSpecification();
                                                        },
                                                        style: {
                                                            backgroundColor: 'rgb(249, 249, 249)'
                                                        },
                                                        className: "w-full p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary transition flex items-center justify-center gap-2 text-gray-600 hover:text-primary",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                icon: "mdi:plus-circle",
                                                                width: 20,
                                                                height: 20
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 833,
                                                                columnNumber: 53
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-medium",
                                                                children: "Add Product Specifications"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 834,
                                                                columnNumber: 53
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                        lineNumber: 825,
                                                        columnNumber: 49
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                lineNumber: 775,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                        lineNumber: 715,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between mb-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        className: "text-lg font-semibold text-black flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                icon: "mdi:layers",
                                                                width: 20,
                                                                height: 20,
                                                                className: "text-primary"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 844,
                                                                columnNumber: 41
                                                            }, this),
                                                            "Product Variants ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-red-500",
                                                                children: "*"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 845,
                                                                columnNumber: 58
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                        lineNumber: 843,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: addVariantToList,
                                                        disabled: showVariantOnlyMode ? !subCategoryAttributes.length : false,
                                                        className: `flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition font-medium ${showVariantOnlyMode && !subCategoryAttributes.length ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90'}`,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                icon: "mdi:plus",
                                                                width: 16,
                                                                height: 16
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 856,
                                                                columnNumber: 41
                                                            }, this),
                                                            "Add Variant"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                        lineNumber: 847,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                lineNumber: 842,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-4",
                                                children: variants.map((variant, variantIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            backgroundColor: 'rgb(249, 249, 249)'
                                                        },
                                                        className: "p-5 rounded-lg border border-gray-300",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center justify-between mb-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                        className: "text-base font-semibold text-black",
                                                                        children: [
                                                                            "Variant ",
                                                                            variantIndex + 1
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 864,
                                                                        columnNumber: 49
                                                                    }, this),
                                                                    variants.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        onClick: ()=>removeVariant(variantIndex),
                                                                        className: "p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                            icon: "mdi:delete",
                                                                            width: 18,
                                                                            height: 18
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                            lineNumber: 870,
                                                                            columnNumber: 57
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 866,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 863,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "space-y-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "grid grid-cols-1 md:grid-cols-3 gap-3",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        className: "block text-xs font-medium text-gray-700 mb-1.5",
                                                                                        children: [
                                                                                            "Price (₹) ",
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-red-500",
                                                                                                children: "*"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                lineNumber: 879,
                                                                                                columnNumber: 71
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 878,
                                                                                        columnNumber: 57
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                        type: "number",
                                                                                        value: variant.price,
                                                                                        onChange: (e)=>updateVariant(variantIndex, 'price', e.target.value),
                                                                                        className: "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary",
                                                                                        required: true
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 881,
                                                                                        columnNumber: 57
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 877,
                                                                                columnNumber: 53
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        className: "block text-xs font-medium text-gray-700 mb-1.5",
                                                                                        children: "Sale Price (₹)"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 890,
                                                                                        columnNumber: 57
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                        type: "number",
                                                                                        value: variant.salePrice,
                                                                                        onChange: (e)=>updateVariant(variantIndex, 'salePrice', e.target.value),
                                                                                        className: "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 893,
                                                                                        columnNumber: 57
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 889,
                                                                                columnNumber: 53
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        className: "block text-xs font-medium text-gray-700 mb-1.5",
                                                                                        children: [
                                                                                            "Stock ",
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-red-500",
                                                                                                children: "*"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                lineNumber: 899,
                                                                                                columnNumber: 67
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 898,
                                                                                        columnNumber: 57
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                        type: "number",
                                                                                        value: variant.stock,
                                                                                        onChange: (e)=>updateVariant(variantIndex, 'stock', e.target.value),
                                                                                        className: "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary",
                                                                                        required: true
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 901,
                                                                                        columnNumber: 57
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 897,
                                                                                columnNumber: 53
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: variant.salePrice && parseFloat(variant.salePrice) > 0 && commissionPercentage > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "col-span-6 p-3 bg-blue-50 border border-blue-200 rounded-lg",
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-start gap-2",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                                                icon: "mdi:information-outline",
                                                                                                className: "text-blue-600 mt-0.5",
                                                                                                width: 16,
                                                                                                height: 16
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                lineNumber: 913,
                                                                                                columnNumber: 69
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "flex-1",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                        className: "text-xs text-blue-900 font-medium mb-1",
                                                                                                        children: [
                                                                                                            "Platform Commission: ",
                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                                                                children: [
                                                                                                                    commissionPercentage,
                                                                                                                    "%"
                                                                                                                ]
                                                                                                            }, void 0, true, {
                                                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                                lineNumber: 916,
                                                                                                                columnNumber: 98
                                                                                                            }, this)
                                                                                                        ]
                                                                                                    }, void 0, true, {
                                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                        lineNumber: 915,
                                                                                                        columnNumber: 73
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                        className: "text-xs text-blue-700",
                                                                                                        children: [
                                                                                                            "The platform will deduct ",
                                                                                                            commissionPercentage,
                                                                                                            "% from each sale. Commission breakdown is displayed below the sale price for each variant."
                                                                                                        ]
                                                                                                    }, void 0, true, {
                                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                        lineNumber: 918,
                                                                                                        columnNumber: 73
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                lineNumber: 914,
                                                                                                columnNumber: 69
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 912,
                                                                                        columnNumber: 65
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                    lineNumber: 911,
                                                                                    columnNumber: 61
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 909,
                                                                                columnNumber: 53
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: variant.salePrice && parseFloat(variant.salePrice) > 0 && commissionPercentage > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "col-span-6 p-3 bg-green-50 border border-green-200 rounded-lg space-y-1",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "flex justify-between items-center text-xs",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "text-gray-600",
                                                                                                    children: "Sale Price:"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                    lineNumber: 930,
                                                                                                    columnNumber: 69
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "font-semibold text-gray-900",
                                                                                                    children: [
                                                                                                        "₹",
                                                                                                        parseFloat(variant.salePrice).toFixed(2)
                                                                                                    ]
                                                                                                }, void 0, true, {
                                                                                                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                    lineNumber: 931,
                                                                                                    columnNumber: 69
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                            lineNumber: 929,
                                                                                            columnNumber: 65
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "flex justify-between items-center text-xs",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "text-red-600",
                                                                                                    children: [
                                                                                                        "Platform Fee (",
                                                                                                        commissionPercentage,
                                                                                                        "%):"
                                                                                                    ]
                                                                                                }, void 0, true, {
                                                                                                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                    lineNumber: 934,
                                                                                                    columnNumber: 69
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "font-semibold text-red-600",
                                                                                                    children: [
                                                                                                        "- ₹",
                                                                                                        (parseFloat(variant.salePrice) * commissionPercentage / 100).toFixed(2)
                                                                                                    ]
                                                                                                }, void 0, true, {
                                                                                                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                    lineNumber: 935,
                                                                                                    columnNumber: 69
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                            lineNumber: 933,
                                                                                            columnNumber: 65
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "flex justify-between items-center text-xs pt-1 border-t border-green-300",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "text-green-700 font-medium",
                                                                                                    children: "You Receive:"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                    lineNumber: 938,
                                                                                                    columnNumber: 69
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "font-bold text-green-700",
                                                                                                    children: [
                                                                                                        "₹",
                                                                                                        (parseFloat(variant.salePrice) * (100 - commissionPercentage) / 100).toFixed(2)
                                                                                                    ]
                                                                                                }, void 0, true, {
                                                                                                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                    lineNumber: 939,
                                                                                                    columnNumber: 69
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                            lineNumber: 937,
                                                                                            columnNumber: 65
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                    lineNumber: 928,
                                                                                    columnNumber: 61
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 926,
                                                                                columnNumber: 53
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 876,
                                                                        columnNumber: 49
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "grid grid-cols-1 md:grid-cols-2 gap-3",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        className: "block text-xs font-medium text-gray-700 mb-1.5",
                                                                                        children: "Delivery Days"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 948,
                                                                                        columnNumber: 57
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                        type: "number",
                                                                                        value: variant.deliveryDays,
                                                                                        onChange: (e)=>updateVariant(variantIndex, 'deliveryDays', e.target.value),
                                                                                        className: "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 951,
                                                                                        columnNumber: 57
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 947,
                                                                                columnNumber: 53
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                        className: "block text-xs font-medium text-gray-700 mb-1.5",
                                                                                        children: "Pickup Address"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 959,
                                                                                        columnNumber: 57
                                                                                    }, this),
                                                                                    pickupAddresses.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "max-h-40 overflow-y-auto border border-gray-300 rounded-md bg-white",
                                                                                        children: pickupAddresses.map((address)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "flex items-start gap-2 p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0",
                                                                                                onClick: ()=>updateVariant(variantIndex, 'pickupAddress', address.id),
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                        type: "radio",
                                                                                                        name: `pickup-address-${variantIndex}`,
                                                                                                        checked: variant.pickupAddress === address.id,
                                                                                                        onChange: ()=>updateVariant(variantIndex, 'pickupAddress', address.id),
                                                                                                        className: "mt-0.5 cursor-pointer"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                        lineNumber: 970,
                                                                                                        columnNumber: 73
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                        className: "flex-1 text-xs",
                                                                                                        children: [
                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                className: "font-semibold text-gray-900",
                                                                                                                children: address.name
                                                                                                            }, void 0, false, {
                                                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                                lineNumber: 978,
                                                                                                                columnNumber: 77
                                                                                                            }, this),
                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                className: "text-gray-600",
                                                                                                                children: [
                                                                                                                    address.addressLine1,
                                                                                                                    address.landmark && `, ${address.landmark}`
                                                                                                                ]
                                                                                                            }, void 0, true, {
                                                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                                lineNumber: 979,
                                                                                                                columnNumber: 77
                                                                                                            }, this),
                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                className: "text-gray-600",
                                                                                                                children: [
                                                                                                                    address.city,
                                                                                                                    ", ",
                                                                                                                    address.district,
                                                                                                                    ", ",
                                                                                                                    address.state,
                                                                                                                    " - ",
                                                                                                                    address.pincode
                                                                                                                ]
                                                                                                            }, void 0, true, {
                                                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                                lineNumber: 983,
                                                                                                                columnNumber: 77
                                                                                                            }, this),
                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                                                className: "text-gray-600",
                                                                                                                children: [
                                                                                                                    "Phone: ",
                                                                                                                    address.phone
                                                                                                                ]
                                                                                                            }, void 0, true, {
                                                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                                lineNumber: 986,
                                                                                                                columnNumber: 77
                                                                                                            }, this)
                                                                                                        ]
                                                                                                    }, void 0, true, {
                                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                        lineNumber: 977,
                                                                                                        columnNumber: 73
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, address.id, true, {
                                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                lineNumber: 965,
                                                                                                columnNumber: 69
                                                                                            }, this))
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 963,
                                                                                        columnNumber: 61
                                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "text-xs text-gray-500 p-3 border border-gray-300 rounded-md bg-gray-50",
                                                                                        children: [
                                                                                            "No pickup addresses available. Please add one from the",
                                                                                            ' ',
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                                                href: "/pickup-addresses",
                                                                                                className: "text-primary hover:underline",
                                                                                                children: "Pickup Addresses"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                lineNumber: 994,
                                                                                                columnNumber: 65
                                                                                            }, this),
                                                                                            ' ',
                                                                                            "page."
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 992,
                                                                                        columnNumber: 61
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 958,
                                                                                columnNumber: 53
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 946,
                                                                        columnNumber: 49
                                                                    }, this),
                                                                    subCategoryAttributes.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                className: "block text-xs font-medium text-gray-700 mb-2",
                                                                                children: [
                                                                                    "Variant Attributes ",
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-red-500",
                                                                                        children: "*"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 1006,
                                                                                        columnNumber: 80
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 1005,
                                                                                columnNumber: 57
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "text-xs text-gray-600 mb-2",
                                                                                children: "These attributes are specific to this variant"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 1008,
                                                                                columnNumber: 57
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "grid grid-cols-1 md:grid-cols-2 gap-3",
                                                                                children: variant.attributes.map((attr, attrIndex)=>{
                                                                                    const subCatAttr = subCategoryAttributes.find((a)=>a.name === attr.name);
                                                                                    const isRequired = subCatAttr?.required ?? true;
                                                                                    const inputType = subCatAttr?.type === 'number' ? 'number' : subCatAttr?.type === 'boolean' ? 'text' : 'text';
                                                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                                className: "block text-xs text-gray-600 mb-1",
                                                                                                children: [
                                                                                                    attr.name,
                                                                                                    " ",
                                                                                                    isRequired && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "text-red-500",
                                                                                                        children: "*"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                        lineNumber: 1018,
                                                                                                        columnNumber: 104
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                lineNumber: 1017,
                                                                                                columnNumber: 73
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                type: inputType,
                                                                                                value: attr.value,
                                                                                                onChange: (e)=>updateVariantAttribute(variantIndex, attrIndex, e.target.value),
                                                                                                className: "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-primary",
                                                                                                placeholder: `Enter ${attr.name.toLowerCase()}`,
                                                                                                required: isRequired
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                lineNumber: 1020,
                                                                                                columnNumber: 73
                                                                                            }, this)
                                                                                        ]
                                                                                    }, attrIndex, true, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 1016,
                                                                                        columnNumber: 69
                                                                                    }, this);
                                                                                })
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 1009,
                                                                                columnNumber: 57
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 1004,
                                                                        columnNumber: 53
                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "p-3 bg-yellow-50 border border-yellow-200 rounded-lg",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-xs text-yellow-800 flex items-center gap-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                                    icon: "mdi:alert",
                                                                                    width: 16,
                                                                                    height: 16
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                    lineNumber: 1036,
                                                                                    columnNumber: 61
                                                                                }, this),
                                                                                "Please select a sub-category to load variant attributes"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                            lineNumber: 1035,
                                                                            columnNumber: 57
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 1034,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                className: "block text-xs font-medium text-gray-700 mb-2",
                                                                                children: [
                                                                                    "Variant Images ",
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-red-500",
                                                                                        children: "*"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 1044,
                                                                                        columnNumber: 72
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 1043,
                                                                                columnNumber: 53
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "mb-3",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                        type: "file",
                                                                                        accept: "image/png,image/jpeg,image/jpg",
                                                                                        multiple: true,
                                                                                        onChange: (e)=>handleVariantImageChange(variantIndex, e),
                                                                                        className: "w-full text-sm"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 1047,
                                                                                        columnNumber: 57
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-xs text-gray-500 mt-1",
                                                                                        children: "Upload product images (PNG, JPG, JPEG)"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 1054,
                                                                                        columnNumber: 57
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 1046,
                                                                                columnNumber: 53
                                                                            }, this),
                                                                            variant.images.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "mt-3 bg-white p-3 rounded-lg border border-gray-200",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                        className: "text-xs font-medium text-gray-700 mb-2",
                                                                                        children: [
                                                                                            "Uploaded images (",
                                                                                            variant.images.length,
                                                                                            "):"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 1060,
                                                                                        columnNumber: 61
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "grid grid-cols-5 gap-2",
                                                                                        children: variant.images.map((file, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "relative group",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                                                        src: URL.createObjectURL(file),
                                                                                                        alt: `Variant ${variantIndex + 1} Image ${idx + 1}`,
                                                                                                        className: "w-full h-32 object-cover rounded-lg border border-gray-300"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                        lineNumber: 1064,
                                                                                                        columnNumber: 73
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                                        type: "button",
                                                                                                        onClick: ()=>removeVariantImage(variantIndex, idx),
                                                                                                        className: "absolute -top-1 -right-1 p-0.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition",
                                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                                                            icon: "mdi:close",
                                                                                                            width: 14,
                                                                                                            height: 14
                                                                                                        }, void 0, false, {
                                                                                                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                            lineNumber: 1073,
                                                                                                            columnNumber: 77
                                                                                                        }, this)
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                        lineNumber: 1069,
                                                                                                        columnNumber: 73
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, idx, true, {
                                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                                lineNumber: 1063,
                                                                                                columnNumber: 69
                                                                                            }, this))
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                        lineNumber: 1061,
                                                                                        columnNumber: 61
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                                lineNumber: 1059,
                                                                                columnNumber: 57
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                        lineNumber: 1042,
                                                                        columnNumber: 49
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                                lineNumber: 875,
                                                                columnNumber: 45
                                                            }, this)
                                                        ]
                                                    }, variantIndex, true, {
                                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                        lineNumber: 862,
                                                        columnNumber: 41
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                lineNumber: 860,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                        lineNumber: 841,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>router.push('/products'),
                                                className: "flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium",
                                                children: "Cancel"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                lineNumber: 1088,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "submit",
                                                disabled: productLoading || !isFormValid(),
                                                className: "flex-1 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                                                children: productLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                            icon: "mdi:loading",
                                                            className: "animate-spin",
                                                            width: 18,
                                                            height: 18
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                            lineNumber: 1100,
                                                            columnNumber: 45
                                                        }, this),
                                                        "Creating..."
                                                    ]
                                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$iconify$2f$react$2f$dist$2f$iconify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                            icon: "mdi:check-circle",
                                                            width: 18,
                                                            height: 18
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                            lineNumber: 1105,
                                                            columnNumber: 45
                                                        }, this),
                                                        showVariantOnlyMode ? 'Add Variant' : 'Create Product'
                                                    ]
                                                }, void 0, true)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                                lineNumber: 1094,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                        lineNumber: 1087,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                                lineNumber: 569,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(site)/products/add/page.tsx",
                        lineNumber: 520,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(site)/products/add/page.tsx",
                    lineNumber: 519,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(site)/products/add/page.tsx",
                lineNumber: 518,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true);
}
_s(AddProductPage, "a33mMQdPJqHsoyQe/3yXUFVUzf4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useProducts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProducts"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useCategories$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCategories"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$usePickupAddress$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePickupAddress"]
    ];
});
_c = AddProductPage;
var _c;
__turbopack_context__.k.register(_c, "AddProductPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_150b90f0._.js.map