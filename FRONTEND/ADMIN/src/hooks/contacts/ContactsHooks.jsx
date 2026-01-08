import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Swal from 'sweetalert2';

export const useContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const fetchContacts = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_ENDPOINTS.CONTACTS.GET_ALL}?page=${page}&limit=${pagination.limit}`);
            if (response.data.success) {
                setContacts(response.data.data || []);
                if (response.data.pagination) {
                    const { page, ...rest } = response.data.pagination;
                    setPagination({ ...rest, currentPage: page });
                }
            }
        } catch (error) {
            console.error('Fetch contacts error:', error);
            Swal.fire('Error', 'Failed to fetch contact messages', 'error');
        } finally {
            setLoading(false);
        }
    }, [pagination.limit]);

    const handlePageChange = useCallback((event, newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage + 1 }));
    }, []);

    useEffect(() => {
        fetchContacts(pagination.currentPage);
    }, [fetchContacts, pagination.currentPage]);

    return {
        contacts,
        loading,
        pagination,
        handlePageChange,
        refreshContacts: () => fetchContacts(pagination.currentPage)
    };
};
