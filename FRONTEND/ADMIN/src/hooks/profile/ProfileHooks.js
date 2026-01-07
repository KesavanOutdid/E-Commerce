import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

export const useProfile = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    profileImage: ''
  });
  const [isDirty, setIsDirty] = useState(false);
  const [initialData, setInitialData] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.AUTH.ADMIN_PROFILE);
      if (response.data.success) {
        const data = response.data.data;
        setProfile(data);
        const formValues = {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          profileImage: data.profileImage || ''
        };
        setFormData(formValues);
        setInitialData(formValues);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      Swal.fire('Error', 'Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfileData = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (initialData) {
        const hasChanges = Object.keys(initialData).some((key) => initialData[key] !== newData[key]);
        setIsDirty(hasChanges);
      }
      return newData;
    });
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      
      const data = new FormData();
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('phone', formData.phone);
      
      if (formData.profileImage instanceof File) {
        data.append('profileImage', formData.profileImage);
      } else if (formData.profileImage) {
        data.append('profileImage', formData.profileImage);
      }

      const response = await axios.put(API_ENDPOINTS.AUTH.ADMIN_PROFILE, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        Swal.fire('Success', 'Profile updated successfully', 'success');
        const updatedData = response.data.data;
        setProfile(updatedData);
        setInitialData({
          firstName: updatedData.firstName || '',
          lastName: updatedData.lastName || '',
          phone: updatedData.phone || '',
          profileImage: updatedData.profileImage || ''
        });
        setIsDirty(false);
        updateUser(updatedData);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    loading,
    saving,
    formData,
    isDirty,
    updateProfileData,
    handleUpdateProfile,
    fetchProfile
  };
};
