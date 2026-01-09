import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Swal from 'sweetalert2';

export const usePickupAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.AUTH.PICKUP_ADDRESSES);
      if (response.data.success) {
        setAddresses(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch pickup addresses:', error);
      // Don't show error if it's just 404/empty
      if (error.response?.status !== 404) {
        Swal.fire('Error', 'Failed to load pickup addresses', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = async (addressData) => {
    try {
      setProcessing(true);
      const response = await axios.post(API_ENDPOINTS.AUTH.PICKUP_ADDRESSES, addressData);
      if (response.data.success) {
        setAddresses(response.data.data || []);
        Swal.fire('Success', 'Pickup address added successfully', 'success');
        return true;
      }
    } catch (error) {
      console.error('Add pickup address error:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to add pickup address', 'error');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const updateAddress = async (addressId, addressData) => {
    try {
      setProcessing(true);
      const response = await axios.put(`${API_ENDPOINTS.AUTH.PICKUP_ADDRESSES}/${addressId}`, addressData);
      if (response.data.success) {
        setAddresses(response.data.data || []);
        Swal.fire('Success', 'Pickup address updated successfully', 'success');
        return true;
      }
    } catch (error) {
      console.error('Update pickup address error:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to update pickup address', 'error');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        setProcessing(true);
        const response = await axios.delete(`${API_ENDPOINTS.AUTH.PICKUP_ADDRESSES}/${addressId}`);
        if (response.data.success) {
          setAddresses(response.data.data || []);
          Swal.fire('Deleted!', 'Pickup address has been deleted.', 'success');
          return true;
        }
      }
    } catch (error) {
      console.error('Delete pickup address error:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to delete pickup address', 'error');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  return {
    addresses,
    loading,
    processing,
    addAddress,
    updateAddress,
    deleteAddress,
    fetchAddresses
  };
};
