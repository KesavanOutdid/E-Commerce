import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS } from '../../config/apiConfig';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';

export const useCategories = () => {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0
    });
    const [filters, setFilters] = useState({
        search: ''
    });
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        status: true,
        createdBy: user?.email || ''
    });

    useEffect(() => {
        if (user?.email) {
            setFormData(prev => ({ ...prev, createdBy: user.email }));
        }
    }, [user]);

    const fetchCategories = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            let url = `${API_ENDPOINTS.CATEGORIES.GET_ALL}?page=${page}&limit=${pagination.pageSize}`;
            if (filters.search) {
                url += `&search=${encodeURIComponent(filters.search)}`;
            }
            const response = await axios.get(url);
            if (response.data.success) {
                // Handle different response structures
                const responseData = response.data.data;
                let categoriesData = [];
                let paginationData = null;

                if (Array.isArray(responseData)) {
                    categoriesData = responseData;
                } else if (responseData && Array.isArray(responseData.categories)) {
                    categoriesData = responseData.categories;
                    // Check if pagination is inside data or at root
                    paginationData = responseData.pagination || response.data.pagination;
                }

                setCategories(categoriesData);

                if (paginationData) {
                    setPagination(prev => {
                        if (
                            prev.currentPage === paginationData.currentPage &&
                            prev.pageSize === paginationData.pageSize &&
                            prev.totalItems === paginationData.totalItems &&
                            prev.totalPages === paginationData.totalPages
                        ) {
                            return prev;
                        }
                        return { ...prev, ...paginationData };
                    });
                }
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Fetch categories error:', error);
            Swal.fire('Error', 'Failed to fetch categories', 'error');
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.pageSize, filters]);

    const handlePageChange = useCallback((event, newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage + 1 }));
    }, []);

    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => {
            if (prev[key] === value) return prev;
            return { ...prev, [key]: value };
        });
        setPagination(prev => {
            if (prev.currentPage === 1) return prev;
            return { ...prev, currentPage: 1 };
        });
    }, []);

    useEffect(() => {
        fetchCategories(pagination.currentPage);
    }, [fetchCategories, pagination.currentPage]);

    const handleOpenDialog = useCallback((category = null) => {
        if (category) {
            setEditMode(true);
            setCurrentCategory(category);
            setFormData({
                name: category.name || '',
                image: category.image || '',
                status: category.status !== undefined ? category.status : true,
                createdBy: category.createdBy || 'admin@gmail.com'
            });
        } else {
            setEditMode(false);
            setCurrentCategory(null);
            setFormData({
                name: '',
                image: '',
                status: true,
                createdBy: 'admin@gmail.com'
            });
        }
        setOpenDialog(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setOpenDialog(false);
        setEditMode(false);
        setCurrentCategory(null);
    }, []);

    const handleSubmit = async () => {
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('status', formData.status);
            data.append('createdBy', formData.createdBy);

            if (formData.image instanceof File) {
                data.append('image', formData.image);
            }

            const config = { headers: { 'Content-Type': 'multipart/form-data' } };

            if (editMode && currentCategory) {
                const response = await axios.put(API_ENDPOINTS.CATEGORIES.UPDATE(currentCategory._id || currentCategory.id), data, config);
                if (response.data.success) {
                    Swal.fire('Success', 'Category updated successfully', 'success');
                    fetchCategories(pagination.currentPage);
                    handleCloseDialog();
                }
            } else {
                const response = await axios.post(API_ENDPOINTS.CATEGORIES.CREATE, data, config);
                if (response.data.success) {
                    Swal.fire('Success', 'Category created successfully', 'success');
                    fetchCategories(pagination.currentPage);
                    handleCloseDialog();
                }
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', error.response?.data?.message || 'Operation failed', 'error');
        }
    };

    const handleDeleteCategory = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this category!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Category has been deleted.', 'success');
                    fetchCategories(pagination.currentPage);
                }
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to delete category', 'error');
            }
        }
    };

    const updateFormData = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    return {
        categories,
        loading,
        openDialog,
        editMode,
        formData,
        pagination,
        filters,
        handleOpenDialog,
        handleCloseDialog,
        handlePageChange,
        handleFilterChange,
        handleSubmit,
        handleDeleteCategory,
        updateFormData
    };
};
