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
      shopName: '',
      gstin: '',
      panNumber: '',
      kycApproved: false,
      shopAddress: {
        doorNo: '',
        street: '',
        landmark: '',
        city: '',
        district: '',
        state: '',
        country: '',
        pincode: ''
      },
      bankDetails: {
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        bankName: ''
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
          addresses: (user.addresses || []).map(addr => ({
            name: addr.name || '',
            email: addr.email || '',
            phone: addr.phone || '',
            doorNo: addr.doorNo || '',
            street: addr.street || '',
            landmark: addr.landmark || '',
            city: addr.city || '',
            district: addr.district || '',
            state: addr.state || '',
            country: addr.country || 'India',
            pincode: addr.pincode || ''
          })),
          sellerInfo: user.sellerInfo ? {
            shopName: user.sellerInfo.shopName || '',
            gstin: user.sellerInfo.gstin || '',
            panNumber: user.sellerInfo.panNumber || '',
            kycApproved: user.sellerInfo.kycApproved ?? false,
            shopAddress: {
              doorNo: user.sellerInfo.shopAddress?.doorNo || '',
              street: user.sellerInfo.shopAddress?.street || '',
              landmark: user.sellerInfo.shopAddress?.landmark || '',
              city: user.sellerInfo.shopAddress?.city || '',
              district: user.sellerInfo.shopAddress?.district || '',
              state: user.sellerInfo.shopAddress?.state || '',
              country: user.sellerInfo.shopAddress?.country || 'India',
              pincode: user.sellerInfo.shopAddress?.pincode || ''
            },
            bankDetails: {
              accountNumber: user.sellerInfo.bankDetails?.accountNumber || '',
              ifscCode: user.sellerInfo.bankDetails?.ifscCode || '',
              accountHolderName: user.sellerInfo.bankDetails?.accountHolderName || '',
              bankName: user.sellerInfo.bankDetails?.bankName || ''
            },
            shopLogo: user.sellerInfo.shopLogo || ''
          } : {
            shopName: '',
            gstin: '',
            panNumber: '',
            kycApproved: false,
            shopAddress: {
              doorNo: '',
              street: '',
              landmark: '',
              city: '',
              district: '',
              state: '',
              country: '',
              pincode: ''
            },
            bankDetails: {
              accountNumber: '',
              ifscCode: '',
              accountHolderName: '',
              bankName: ''
            },
            shopLogo: ''
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

  const updateBusinessAddressData = (field, value) => {
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

  const updateBankDetailsData = (field, value) => {
    setFormData((prev) => {
      const newBankDetails = { ...prev.sellerInfo.bankDetails, [field]: value };
      const newSellerInfo = { ...prev.sellerInfo, bankDetails: newBankDetails };
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      // Basic Validations
      if (formData.phone && formData.phone.length !== 10) {
        Swal.fire('Error', 'Phone number must be exactly 10 digits', 'error');
        return;
      }

      for (let i = 0; i < formData.addresses.length; i++) {
        const addr = formData.addresses[i];
        if (addr.pincode && addr.pincode.length !== 6) {
          Swal.fire('Error', `Pincode in Address ${i + 1} must be exactly 6 digits`, 'error');
          return;
        }
      }

      if (formData.roles.includes(2)) {
        if (formData.sellerInfo.shopAddress?.pincode && formData.sellerInfo.shopAddress.pincode.length !== 6) {
          Swal.fire('Error', 'Business Pincode must be exactly 6 digits', 'error');
          return;
        }
      }

      setSaving(true);
      
      // Use FormData to support image uploads
      const data = new FormData();
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('status', formData.status);
      data.append('roles', JSON.stringify(formData.roles));
      data.append('addresses', JSON.stringify(formData.addresses));
      
      // Seller info needs special handling for nested objects and files
      if (formData.roles.includes(2)) {
        const sellerInfoToTags = {
          shopName: formData.sellerInfo.shopName,
          gstin: formData.sellerInfo.gstin,
          panNumber: formData.sellerInfo.panNumber,
          kycApproved: formData.sellerInfo.kycApproved,
          shopAddress: formData.sellerInfo.shopAddress,
          bankDetails: formData.sellerInfo.bankDetails
        };
        data.append('sellerInfo', JSON.stringify(sellerInfoToTags));
        
        if (formData.sellerInfo.shopLogoFile) {
          data.append('shopLogo', formData.sellerInfo.shopLogoFile);
        }
      }

      const response = await axios.put(API_ENDPOINTS.USERS.UPDATE(userId), data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
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
    updateBusinessAddressData,
    updateUserAddressData,
    updateBankDetailsData,
    handleSubmit,
    handleCancel
  };
};
