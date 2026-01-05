import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Swal from 'sweetalert2';

export const useUserEdit = (userId) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  const [initialData, setInitialData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roles: [],
    status: true,
    addresses: [],
    sellerInfo: {
      kycApproved: false,
      isLive: false,
      commissionPercentage: 10,
      shopAddress: {
        doorNo: '',
        street: '',
        city: '',
        district: '',
        state: '',
        country: '',
        pincode: ''
      }
    }
  });

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.USERS.GET_BY_ID(userId));
      if (response.data.success) {
        const user = response.data.data;
        const data = {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          roles: user.roles || [],
          status: user.status ?? true,
          addresses: user.addresses || [],
          sellerInfo: user.sellerInfo ? {
            kycApproved: user.sellerInfo.kycApproved ?? false,
            isLive: user.sellerInfo.isLive ?? false,
            commissionPercentage: user.sellerInfo.commissionPercentage ?? 10,
            shopAddress: user.sellerInfo.shopAddress || {
              doorNo: '',
              street: '',
              city: '',
              district: '',
              state: '',
              country: '',
              pincode: ''
            }
          } : {
            kycApproved: false,
            isLive: false,
            commissionPercentage: 10,
            shopAddress: {
              doorNo: '',
              street: '',
              city: '',
              district: '',
              state: '',
              country: '',
              pincode: ''
            }
          }
        };
        setFormData(data);
        setInitialData(data);
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      Swal.fire('Error', 'Failed to load user data', 'error');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  }, [userId, navigate]);

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
    fetchUser();
    fetchRoles();
  }, [fetchUser, fetchRoles]);

  const updateFormData = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Check if dirty by comparing with initialData
      if (initialData) {
        const hasChanges = Object.keys(initialData).some((key) => {
          if (typeof initialData[key] === 'object' && initialData[key] !== null) {
            return JSON.stringify(initialData[key]) !== JSON.stringify(newData[key]);
          }
          return initialData[key] !== newData[key];
        });
        setIsDirty(hasChanges);
      }
      
      return newData;
    });
  };

  const updateSellerData = (field, value) => {
    setFormData((prev) => {
      const newSellerInfo = { ...prev.sellerInfo, [field]: value };
      const newData = { ...prev, sellerInfo: newSellerInfo };
      
      if (initialData) {
        const hasChanges = Object.keys(initialData).some((key) => {
          if (typeof initialData[key] === 'object' && initialData[key] !== null) {
            return JSON.stringify(initialData[key]) !== JSON.stringify(newData[key]);
          }
          return initialData[key] !== newData[key];
        });
        setIsDirty(hasChanges);
      }
      
      return newData;
    });
  };

  const updateShopAddressData = (field, value) => {
    setFormData((prev) => {
      const newShopAddress = { ...prev.sellerInfo.shopAddress, [field]: value };
      const newSellerInfo = { ...prev.sellerInfo, shopAddress: newShopAddress };
      const newData = { ...prev, sellerInfo: newSellerInfo };
      
      if (initialData) {
        const hasChanges = Object.keys(initialData).some((key) => {
          if (typeof initialData[key] === 'object' && initialData[key] !== null) {
            return JSON.stringify(initialData[key]) !== JSON.stringify(newData[key]);
          }
          return initialData[key] !== newData[key];
        });
        setIsDirty(hasChanges);
      }
      
      return newData;
    });
  };

  const updateUserAddressData = (index, field, value) => {
    setFormData((prev) => {
      const newAddresses = [...prev.addresses];
      newAddresses[index] = { ...newAddresses[index], [field]: value };
      const newData = { ...prev, addresses: newAddresses };
      
      if (initialData) {
        const hasChanges = Object.keys(initialData).some((key) => {
          if (typeof initialData[key] === 'object' && initialData[key] !== null) {
            return JSON.stringify(initialData[key]) !== JSON.stringify(newData[key]);
          }
          return initialData[key] !== newData[key];
        });
        setIsDirty(hasChanges);
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const response = await axios.put(API_ENDPOINTS.USERS.UPDATE(userId), formData);
      if (response.data.success) {
        await Swal.fire('Success', 'User updated successfully', 'success');
        navigate(`/users/${userId}`);
      }
    } catch (error) {
      console.error('Update failed:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to update user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return {
    formData,
    loading,
    saving,
    roles,
    isDirty,
    updateFormData,
    updateSellerData,
    updateShopAddressData,
    updateUserAddressData,
    handleSubmit,
    handleCancel
  };
};
