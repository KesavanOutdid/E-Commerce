import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Swal from 'sweetalert2';

export const usePermissions = (roleId) => {
  const [permissions, setPermissions] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const fetchData = useCallback(async () => {
    if (!roleId) return;
    try {
      setLoading(true);
      const [modulesRes, permissionsRes] = await Promise.all([
        axios.get(API_ENDPOINTS.PERMISSIONS.GET_MODULES),
        axios.get(API_ENDPOINTS.PERMISSIONS.GET_BY_ROLE(roleId))
      ]);

      if (modulesRes.data.success) {
        setModules(modulesRes.data.data);
      }

      if (permissionsRes.data.success) {
        setPermissions(permissionsRes.data.data || []);
      }
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to fetch permissions data:', error);
      Swal.fire('Error', 'Failed to load permissions data', 'error');
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updatePermission = (module, submodule, field, value) => {
    setPermissions((prev) => {
      const existingIdx = prev.findIndex(p => p.module === module && p.submodule === submodule);
      let newPermissions = [...prev];
      
      if (existingIdx > -1) {
        newPermissions[existingIdx] = { ...newPermissions[existingIdx], [field]: value };
      } else {
        newPermissions.push({
          module,
          submodule,
          canCreate: false,
          canView: false,
          canUpdate: false,
          canDelete: false,
          canApprove: false,
          [field]: value
        });
      }
      setIsDirty(true);
      return newPermissions;
    });
  };

  const savePermissions = async () => {
    try {
      setSaving(true);
      const response = await axios.post(API_ENDPOINTS.PERMISSIONS.UPDATE_BY_ROLE(roleId), {
        permissions
      });
      if (response.data.success) {
        Swal.fire('Success', 'Permissions updated successfully', 'success');
        setIsDirty(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to save permissions:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save permissions', 'error');
    } finally {
      setSaving(false);
    }
  };

  return {
    permissions,
    modules,
    loading,
    saving,
    isDirty,
    updatePermission,
    savePermissions,
    refreshPermissions: fetchData
  };
};
