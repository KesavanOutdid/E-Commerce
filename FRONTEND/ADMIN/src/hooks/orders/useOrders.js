import { useState, useCallback, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Swal from 'sweetalert2';

export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0
    });

    // For filtering
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    const buildQueryString = (page, currentFilters) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', pagination.pageSize);

        if (currentFilters.search) params.append('search', currentFilters.search);
        if (currentFilters.status) params.append('status', currentFilters.status);
        if (currentFilters.startDate) params.append('startDate', currentFilters.startDate);
        if (currentFilters.endDate) params.append('endDate', currentFilters.endDate);

        return params.toString();
    };

    const fetchOrders = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const queryString = buildQueryString(page, filters);
            const response = await axios.get(`${API_ENDPOINTS.ORDERS.GET_ALL}?${queryString}`);

            if (response.data.success) {
                // Modified to handle response where response.data.data IS the orders array
                // and response.data.pagination is the pagination object
                const ordersData = response.data.data;
                const paginationData = response.data.pagination;

                setOrders(ordersData || []);
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
                setOrders([]);
            }
        } catch (error) {
            console.error('Fetch orders error:', error);
            Swal.fire('Error', 'Failed to fetch orders', 'error');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.pageSize, filters]);

    // Initial fetch
    useEffect(() => {
        fetchOrders(pagination.currentPage);
    }, [fetchOrders, pagination.currentPage]);

    const handlePageChange = useCallback((event, newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage + 1 }));
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

    const updateOrderStatus = async (id, status) => {
        try {
            const response = await axios.patch(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), { status });
            if (response.data.success) {
                Swal.fire('Success', 'Order status updated successfully', 'success');
                fetchOrders(pagination.currentPage);
                return true;
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to update order status', 'error');
            return false;
        }
    };

    return {
        orders,
        loading,
        pagination,
        filters,
        handlePageChange,
        handleFilterChange,
        fetchOrders,
        updateOrderStatus
    };
};
