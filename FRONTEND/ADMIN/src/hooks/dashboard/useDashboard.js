import { useState, useCallback, useEffect, useRef } from 'react';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS } from '../../config/apiConfig';

export const useDashboard = () => {
    const savedFilter = typeof window !== 'undefined' ? localStorage.getItem('dashboardFilter') : 'thisMonth';
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState(savedFilter || 'thisMonth');
    const retryCountRef = useRef(0);
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;

    const fetchDashboardStats = useCallback(async (currentFilter = 'thisMonth', retryCount = 0) => {
        try {
            setLoading(true);
            setError(null);
            
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000);
            
            const response = await axios.get(
                `${API_ENDPOINTS.DASHBOARD.GET_STATS}?filter=${currentFilter}`,
                { signal: controller.signal }
            );
            
            clearTimeout(timeout);
            
            if (response.data.success && response.data.data) {
                setStats(response.data.data);
                retryCountRef.current = 0;
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                setError('Request timeout. Please try again.');
            } else if (error.response?.status === 401) {
                setError('Unauthorized access. Please login again.');
            } else if (error.response?.status >= 500) {
                if (retryCount < MAX_RETRIES) {
                    retryCountRef.current = retryCount + 1;
                    setTimeout(() => {
                        fetchDashboardStats(currentFilter, retryCount + 1);
                    }, RETRY_DELAY * (retryCount + 1));
                    return;
                }
                setError('Server error. Please try again later.');
            } else {
                setError(error.message || 'Failed to fetch dashboard data');
            }
            console.error('Dashboard stats error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardStats(filter);
    }, [fetchDashboardStats, filter]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        if (typeof window !== 'undefined') {
            localStorage.setItem('dashboardFilter', newFilter);
        }
    };

    return {
        stats,
        loading,
        error,
        filter,
        handleFilterChange,
        refreshStats: () => fetchDashboardStats(filter)
    };
};
