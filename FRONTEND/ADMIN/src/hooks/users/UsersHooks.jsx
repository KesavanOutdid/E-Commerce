import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Swal from 'sweetalert2';

export const useUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    roles: []
  });

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_ENDPOINTS.USERS.GET_ALL}?page=${page}&limit=${pagination.pageSize}`);
      if (response.data.success) {
        const userData = Array.isArray(response.data.data) ? response.data.data : [];
        setUsers(userData);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      Swal.fire('Error', 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize]);

  const handlePageChange = (event, newPage) => {
    fetchUsers(newPage + 1);
  };

  const fetchRoles = useCallback(async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.ROLES.GET_ALL);
      if (response.data.success) {
        setRoles(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch roles', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers(pagination.currentPage);
    fetchRoles();
  }, [fetchUsers, fetchRoles, pagination.currentPage]);

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditMode(true);
      setCurrentUser(user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        roles: user.roles || []
      });
    } else {
      setEditMode(false);
      setCurrentUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        roles: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentUser(null);
  };

  const handleSubmit = async () => {
    try {
      if (editMode && currentUser) {
        const response = await axios.put(API_ENDPOINTS.USERS.UPDATE(currentUser.userId), formData);
        if (response.data.success) {
          Swal.fire('Success', 'User updated successfully', 'success');
          fetchUsers();
          handleCloseDialog();
        }
      } else {
        const response = await axios.post(API_ENDPOINTS.USERS.ADD, formData);
        if (response.data.success) {
          Swal.fire('Success', 'User added successfully', 'success');
          fetchUsers();
          handleCloseDialog();
        }
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this user!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(API_ENDPOINTS.USERS.DELETE(userId));
        if (response.data.success) {
          Swal.fire('Deleted!', 'User has been deleted.', 'success');
          fetchUsers();
        }
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Failed to delete user', 'error');
      }
    }
  };

  const handleViewUser = (userId) => {
    navigate(`/users/${userId}`);
  };

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return {
    users,
    roles,
    loading,
    openDialog,
    editMode,
    currentUser,
    formData,
    pagination,
    handleOpenDialog,
    handleCloseDialog,
    handlePageChange,
    handleSubmit,
    handleDeleteUser,
    handleViewUser,
    updateFormData
  };
};
