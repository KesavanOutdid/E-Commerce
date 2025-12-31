import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Swal from 'sweetalert2';

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    roleName: '',
    status: true
  });

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.ROLES.GET_ALL);
      if (response.data.success) {
        setRoles(response.data.data || []);
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch roles', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleOpenDialog = (role = null) => {
    const data = role 
      ? { roleName: role.roleName || '', status: role.status ?? true }
      : { roleName: '', status: true };
    
    setEditMode(!!role);
    setCurrentRole(role);
    setFormData(data);
    setInitialData(data);
    setIsDirty(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentRole(null);
    setInitialData(null);
    setIsDirty(false);
  };

  const handleSubmit = async () => {
    try {
      if (editMode && currentRole) {
        const response = await axios.put(API_ENDPOINTS.ROLES.UPDATE(currentRole.roleId), formData);
        if (response.data.success) {
          Swal.fire('Success', 'Role updated successfully', 'success');
          fetchRoles();
          handleCloseDialog();
        }
      } else {
        const response = await axios.post(API_ENDPOINTS.ROLES.CREATE, formData);
        if (response.data.success) {
          Swal.fire('Success', 'Role created successfully', 'success');
          fetchRoles();
          handleCloseDialog();
        }
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (initialData) {
        const hasChanges = Object.keys(initialData).some(key => initialData[key] !== newData[key]);
        setIsDirty(hasChanges);
      } else {
        setIsDirty(true);
      }
      return newData;
    });
  };

  return {
    roles,
    loading,
    openDialog,
    editMode,
    formData,
    isDirty,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    updateFormData
  };
};

export const useRoleDetail = (roleId) => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ roleName: '', status: true });
  const [initialData, setInitialData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const fetchRole = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.ROLES.GET_BY_ID(roleId));
      if (response.data.success) {
        setRole(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch role:', error);
      Swal.fire('Error', 'Failed to load role data', 'error');
      navigate('/roles');
    } finally {
      setLoading(false);
    }
  }, [roleId, navigate]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  const handleOpenDialog = () => {
    const data = { roleName: role?.roleName || '', status: role?.status ?? true };
    setFormData(data);
    setInitialData(data);
    setIsDirty(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsDirty(false);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.put(API_ENDPOINTS.ROLES.UPDATE(roleId), formData);
      if (response.data.success) {
        Swal.fire('Success', 'Role updated successfully', 'success');
        fetchRole();
        handleCloseDialog();
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Update failed', 'error');
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      const hasChanges = initialData[field] !== value;
      setIsDirty(hasChanges);
      return newData;
    });
  };

  const handleBackToRoles = () => {
    navigate(-1);
  };

  return {
    role,
    loading,
    openDialog,
    formData,
    isDirty,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    updateFormData,
    handleBackToRoles
  };
};
