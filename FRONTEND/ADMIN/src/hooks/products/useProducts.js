import { useState, useCallback, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Swal from 'sweetalert2';

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productType, setProductType] = useState('admin'); // 'admin' or 'seller'
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0
    });

    // For filtering
    const [filters, setFilters] = useState({
        search: '',
        mainCategoryId: '',
        subCategoryId: '',
        status: '',
        approvalStatus: ''
    });

    const buildQueryString = useCallback((page, currentFilters) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', pagination.pageSize);

        if (currentFilters.search) params.append('search', currentFilters.search);
        if (currentFilters.mainCategoryId) params.append('mainCategoryId', currentFilters.mainCategoryId);
        if (currentFilters.subCategoryId) params.append('subCategoryId', currentFilters.subCategoryId);
        if (currentFilters.status) params.append('status', currentFilters.status);
        if (currentFilters.approvalStatus) params.append('approvalStatus', currentFilters.approvalStatus);

        return params.toString();
    }, [pagination.pageSize]);

    const fetchProducts = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const queryString = buildQueryString(page, filters);
            const endpoint = productType === 'seller' 
                ? API_ENDPOINTS.PRODUCTS.GET_ALL_SELLER 
                : API_ENDPOINTS.PRODUCTS.GET_ALL;
            
            const response = await axios.get(`${endpoint}?${queryString}`);

            if (response.data.success) {
                const { products: productsData, pagination: paginationData } = response.data.data;
                setProducts(productsData);
                if (paginationData) {
                    setPagination(prev => {
                        if (
                            prev.currentPage === paginationData.page &&
                            prev.pageSize === paginationData.limit &&
                            prev.totalItems === paginationData.total &&
                            prev.totalPages === paginationData.pages
                        ) {
                            return prev;
                        }
                        return {
                            currentPage: paginationData.page,
                            pageSize: paginationData.limit,
                            totalItems: paginationData.total,
                            totalPages: paginationData.pages
                        };
                    });
                }
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Fetch products error:', error);
            Swal.fire('Error', 'Failed to fetch products', 'error');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [buildQueryString, filters, productType]);

    // Initial fetch
    useEffect(() => {
        fetchProducts(pagination.currentPage);
    }, [fetchProducts, pagination.currentPage]);

    const handlePageChange = useCallback((event, newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage + 1 }));
    }, []);

    const handleTypeChange = useCallback((type) => {
        setProductType(type);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, []);

    const handleFilterChange = useCallback((key, value) => {
        if (key === 'limit') {
            setPagination(prev => {
                if (prev.pageSize === value) return prev;
                return { ...prev, pageSize: value, currentPage: 1 };
            });
        } else {
            setFilters(prev => {
                if (prev[key] === value) return prev;
                return { ...prev, [key]: value };
            });
            setPagination(prev => {
                if (prev.currentPage === 1) return prev;
                return { ...prev, currentPage: 1 };
            });
        }
    }, []);

    const deleteProduct = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Product has been deleted.', 'success');
                    fetchProducts(pagination.currentPage);
                }
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to delete product', 'error');
            }
        }
    };

    const createProduct = async (productFormData) => {
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const response = await axios.post(API_ENDPOINTS.PRODUCTS.CREATE, productFormData, config);
            if (response.data.success) {
                Swal.fire('Success', 'Product created successfully', 'success');
                fetchProducts(1); // Go to first page
                return true;
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to create product', 'error');
            return false;
        }
    };

    const updateProduct = async (id, productFormData) => {
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const response = await axios.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), productFormData, config);
            if (response.data.success) {
                Swal.fire('Success', 'Product updated successfully', 'success');
                fetchProducts(pagination.currentPage);
                return true;
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to update product', 'error');
            return false;
        }
    };

    const updateProductApproval = async (id, approvalStatus, rejectionReason = null) => {
        try {
            const response = await axios.patch(API_ENDPOINTS.PRODUCTS.UPDATE_APPROVAL(id), {
                approvalStatus,
                rejectionReason
            });
            if (response.data.success) {
                Swal.fire('Success', `Product ${approvalStatus} successfully`, 'success');
                fetchProducts(pagination.currentPage);
                return true;
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to update approval status', 'error');
            return false;
        }
    };

    const listFromCatalog = async (listingData) => {
        try {
            const response = await axios.post(API_ENDPOINTS.PRODUCTS.LIST_CATALOG, listingData);
            if (response.data.success) {
                Swal.fire('Success', 'Product listed in our shop successfully', 'success');
                return true;
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to list product', 'error');
            return false;
        }
    };

    return {
        products,
        loading,
        pagination,
        filters,
        productType,
        handlePageChange,
        handleTypeChange,
        handleFilterChange,
        fetchProducts,
        deleteProduct,
        createProduct,
        updateProduct,
        updateProductApproval,
        listFromCatalog
    };
};
