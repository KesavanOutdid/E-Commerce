import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Swal from 'sweetalert2';

export const useUserDetail = (userId) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.USERS.GET_BY_ID(userId));
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.ROLES.GET_ALL);
      if (response.data.success) {
        setRoles(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  }, []);

  useEffect(() => {
    fetchUserDetails();
    fetchRoles();
  }, [fetchUserDetails, fetchRoles]);

  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.roleId === roleId);
    return role ? role.roleName : `Role ${roleId}`;
  };

  const handleBackToUsers = () => {
    navigate(-1);
  };

  const handleEditUser = () => {
    navigate(`/users/edit/${userId}`);
  };

  const handleDeleteUser = async () => {
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
          await Swal.fire('Deleted!', 'User has been deleted.', 'success');
          navigate('/users');
        }
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Failed to delete user', 'error');
      }
    }
  };

  return {
    user,
    loading,
    roles,
    getRoleName,
    handleBackToUsers,
    handleEditUser,
    handleDeleteUser
  };
};
