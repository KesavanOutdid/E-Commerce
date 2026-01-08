import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Swal from 'sweetalert2';

export const useSellerContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [filters, setFilters] = useState({
        status: ''
    });

    const fetchContacts = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            let url = `${API_ENDPOINTS.SELLER_CONTACTS.GET_ALL}?page=${page}&limit=${pagination.limit}`;
            if (filters.status !== '') {
                url += `&status=${filters.status}`;
            }
            const response = await axios.get(url);
            if (response.data.success) {
                setContacts(response.data.data || []);
                if (response.data.pagination) {
                    const { page, ...rest } = response.data.pagination;
                    setPagination({ ...rest, currentPage: page });
                }
            }
        } catch (error) {
            console.error('Fetch seller contacts error:', error);
            Swal.fire('Error', 'Failed to fetch seller contact messages', 'error');
        } finally {
            setLoading(false);
        }
    }, [pagination.limit, filters.status]);

    const handlePageChange = useCallback((event, newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage + 1 }));
    }, []);

    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, []);

    const updateContactStatus = async (id, status) => {
        try {
            const response = await axios.put(API_ENDPOINTS.SELLER_CONTACTS.UPDATE_STATUS(id), { status });
            if (response.data.success) {
                Swal.fire('Success', 'Contact status updated', 'success');
                fetchContacts(pagination.currentPage);
                return true;
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to update status', 'error');
            return false;
        }
    };

    const deleteContact = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This message will be permanently deleted!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.delete(API_ENDPOINTS.SELLER_CONTACTS.DELETE(id));
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Message deleted.', 'success');
                    fetchContacts(pagination.currentPage);
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete message', 'error');
            }
        }
    };

    useEffect(() => {
        fetchContacts(pagination.currentPage);
    }, [fetchContacts, pagination.currentPage]);

    return {
        contacts,
        loading,
        pagination,
        filters,
        handlePageChange,
        handleFilterChange,
        updateContactStatus,
        deleteContact,
        refreshContacts: () => fetchContacts(pagination.currentPage)
    };
};
