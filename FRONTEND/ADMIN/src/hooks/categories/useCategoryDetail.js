import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Swal from 'sweetalert2';

export const useCategoryDetail = (categoryId) => {
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [subCategories, setSubCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false); // For editing main category
    const [openSubDialog, setOpenSubDialog] = useState(false); // For adding/editing subcategory
    const [editMode, setEditMode] = useState(false);
    const [currentSubCategory, setCurrentSubCategory] = useState(null);

    // Form data for main category (Backend requires: name, createdBy)
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        status: true,
        createdBy: 'admin@gmail.com' // Should come from auth context
    });

    // Form data for sub category (Backend requires: name, parentId, level, createdBy)
    const [subFormData, setSubFormData] = useState({
        name: '',
        image: '',
        status: true,
        parentId: '',
        level: 2,
        commissionPercentage: 0,
        createdBy: 'admin@gmail.com', // Should come from auth context
        attributes: []
    });

    const fetchSubCategories = useCallback(async () => {
        try {
            const response = await axios.get(API_ENDPOINTS.CATEGORIES.GET_SUB_BY_PARENT(categoryId));
            if (response.data.success) {
                setSubCategories(response.data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch subcategories", error);
        }
    }, [categoryId]);

    const fetchCategoryDetail = useCallback(async () => {
        if (!categoryId) return;
        try {
            setLoading(true);

            // 1. Try to fetch specific category by ID (Preferred method)
            try {
                const response = await axios.get(API_ENDPOINTS.CATEGORIES.GET_BY_ID(categoryId));
                if (response.data.success && response.data.data) {
                    setCategory(response.data.data);
                    fetchSubCategories();
                    return;
                }
            } catch (err) {
                console.warn('GET_BY_ID failed, trying GET_ALL fallback...', err);
            }

            // 2. Fallback: Fetch ALL main categories (Legacy support)
            const response = await axios.get(API_ENDPOINTS.CATEGORIES.GET_ALL);

            if (response.data.success) {
                const responseData = response.data.data;
                let allCategories = [];
                
                if (Array.isArray(responseData)) {
                    allCategories = responseData;
                } else if (responseData && Array.isArray(responseData.categories)) {
                    allCategories = responseData.categories;
                }

                // Find the specific category
                const foundCategory = allCategories.find(c => (c._id === categoryId || c.categoryId === categoryId));

                if (foundCategory) {
                    setCategory(foundCategory);
                    fetchSubCategories();
                } else {
                    console.error('Category not found in list');
                    setCategory(null);
                }
            }
        } catch (error) {
            console.error('Fetch category detail error:', error);
            Swal.fire('Error', 'Failed to fetch category details', 'error');
        } finally {
            setLoading(false);
        }
    }, [categoryId, fetchSubCategories]);

    useEffect(() => {
        fetchCategoryDetail();
    }, [fetchCategoryDetail]);

    // Main Category Handlers
    const handleEditCategory = () => {
        setFormData({
            name: category.name || '',
            image: category.image || '',
            status: category.status ?? true,
            createdBy: category.createdBy || 'admin@gmail.com'
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleUpdateCategory = async () => {
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('status', formData.status);
            data.append('createdBy', formData.createdBy);

            if (formData.image instanceof File) {
                data.append('image', formData.image);
            }

            const config = { headers: { 'Content-Type': 'multipart/form-data' } };

            const response = await axios.put(API_ENDPOINTS.CATEGORIES.UPDATE(categoryId), data, config);
            if (response.data.success) {
                Swal.fire('Success', 'Category updated successfully', 'success');
                fetchCategoryDetail();
                handleCloseDialog();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Update failed', 'error');
        }
    };

    const handleDeleteCategory = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Delete this category? This might affect subcategories.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.delete(API_ENDPOINTS.CATEGORIES.DELETE(categoryId));
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Category deleted.', 'success');
                    navigate('/categories');
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete category', 'error');
            }
        }
    };

    // Sub Category Handlers
    const handleOpenSubDialog = (subCategory = null) => {
        if (subCategory) {
            setEditMode(true);
            setCurrentSubCategory(subCategory);
            setSubFormData({
                name: subCategory.name || '',
                image: subCategory.image || '',
                status: subCategory.status ?? true,
                parentId: categoryId,
                level: subCategory.level || 2,
                commissionPercentage: subCategory.commissionPercentage || 0,
                createdBy: subCategory.createdBy || 'admin@gmail.com',
                attributes: subCategory.attributes || []
            });
        } else {
            setEditMode(false);
            setCurrentSubCategory(null);
            setSubFormData({
                name: '',
                image: '',
                status: true,
                parentId: categoryId, // Parent ID must be set for creation
                level: 2,
                commissionPercentage: 0,
                createdBy: 'admin@gmail.com',
                attributes: []
            });
        }
        setOpenSubDialog(true);
    };

    const handleCloseSubDialog = () => {
        setOpenSubDialog(false);
        setEditMode(false);
        setCurrentSubCategory(null);
    };

    const handleSubmitSubCategory = async () => {
        try {
            if (editMode && currentSubCategory) {
                const response = await axios.put(API_ENDPOINTS.CATEGORIES.UPDATE_SUB(currentSubCategory._id || currentSubCategory.id), subFormData);
                if (response.data.success) {
                    Swal.fire('Success', 'Subcategory updated', 'success');
                    fetchCategoryDetail(); // Refresh both to be safe
                    handleCloseSubDialog();
                }
            } else {
                const response = await axios.post(API_ENDPOINTS.CATEGORIES.CREATE_SUB, subFormData);
                if (response.data.success) {
                    Swal.fire('Success', 'Subcategory created', 'success');
                    fetchCategoryDetail();
                    handleCloseSubDialog();
                }
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Operation failed', 'error');
        }
    };

    const handleDeleteSubCategory = async (subId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Delete this subcategory?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.delete(API_ENDPOINTS.CATEGORIES.DELETE_SUB(subId));
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Subcategory deleted.', 'success');
                    fetchCategoryDetail();
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete subcategory', 'error');
            }
        }
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateSubFormData = (field, value) => {
        setSubFormData(prev => ({ ...prev, [field]: value }));
    };

    // Attributes Handlers
    const handleAddAttribute = () => {
        setSubFormData(prev => ({
            ...prev,
            attributes: [...(prev.attributes || []), { name: '', slug: '', type: 'text', required: false }]
        }));
    };

    const handleRemoveAttribute = (index) => {
        setSubFormData(prev => ({
            ...prev,
            attributes: prev.attributes.filter((_, i) => i !== index)
        }));
    };

    const handleAttributeChange = (index, field, value) => {
        setSubFormData(prev => {
            const newAttributes = [...prev.attributes];
            newAttributes[index] = { ...newAttributes[index], [field]: value };

            // Auto-generate slug from name - STRICTLY LOWERCASE
            if (field === 'name') {
                newAttributes[index].slug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            }

            return { ...prev, attributes: newAttributes };
        });
    };

    return {
        category,
        subCategories,
        loading,
        openDialog,
        openSubDialog,
        editMode,
        formData,
        subFormData,
        handleEditCategory,
        handleCloseDialog,
        handleUpdateCategory,
        handleDeleteCategory,
        handleOpenSubDialog,
        handleCloseSubDialog,
        handleSubmitSubCategory,
        handleDeleteSubCategory,
        updateFormData,
        updateSubFormData,
        handleAddAttribute,
        handleRemoveAttribute,
        handleAttributeChange
    };
};
