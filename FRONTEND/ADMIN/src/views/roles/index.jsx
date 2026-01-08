import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Divider,
  Paper,
  Pagination
} from '@mui/material';
import { IconPlus, IconEye, IconShieldLock, IconDeviceFloppy, IconX, IconEdit, IconSearch } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { useRoles } from '../../hooks/roles/RolesHooks';
import { usePermissions } from '../../hooks/roles/PermissionHooks';
import { useEffect } from 'react';

const PermissionsDialog = ({ role, open, onClose }) => {
  const {
    permissions,
    modules,
    loading,
    saving,
    isDirty,
    updatePermission,
    savePermissions
  } = usePermissions(role?.roleId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Permissions for {role?.roleName}</Typography>
        <IconButton onClick={onClose} size="small">
          <IconX size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Module</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>View</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Create</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Update</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Delete</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Approve</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from(new Set(modules.map(m => m.group))).map((group) => (
                  <React.Fragment key={group}>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell colSpan={6} sx={{ fontWeight: 700, py: 1 }}>
                        {group}
                      </TableCell>
                    </TableRow>
                    {modules
                      .filter(m => m.group === group)
                      .map((m) => {
                        const perm = permissions.find(p => p.module === m.module) || {};
                        return (
                          <TableRow key={m.module} hover>
                            <TableCell sx={{ fontWeight: 600, pl: 4 }}>{m.module}</TableCell>
                            <TableCell align="center">
                              {m.actions.includes('view') && (
                                <Checkbox 
                                  size="small"
                                  checked={!!perm.canView} 
                                  onChange={(e) => updatePermission(m.module, null, 'canView', e.target.checked)} 
                                />
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {m.actions.includes('create') && (
                                <Checkbox 
                                  size="small"
                                  checked={!!perm.canCreate} 
                                  onChange={(e) => updatePermission(m.module, null, 'canCreate', e.target.checked)} 
                                />
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {m.actions.includes('update') && (
                                <Checkbox 
                                  size="small"
                                  checked={!!perm.canUpdate} 
                                  onChange={(e) => updatePermission(m.module, null, 'canUpdate', e.target.checked)} 
                                />
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {m.actions.includes('delete') && (
                                <Checkbox 
                                  size="small"
                                  checked={!!perm.canDelete} 
                                  onChange={(e) => updatePermission(m.module, null, 'canDelete', e.target.checked)} 
                                />
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {m.actions.includes('approve') && (
                                <Checkbox 
                                  size="small"
                                  checked={!!perm.canApprove} 
                                  onChange={(e) => updatePermission(m.module, null, 'canApprove', e.target.checked)} 
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<IconDeviceFloppy />} 
          disabled={!isDirty || saving || loading}
          onClick={async () => {
            await savePermissions();
            onClose();
          }}
        >
          {saving ? 'Saving...' : 'Save Permissions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Roles = () => {
  const navigate = useNavigate();
  const {
    roles,
    loading,
    openDialog,
    editMode,
    formData,
    pagination,
    isDirty,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    handlePageChange,
    handleFilterChange,
    updateFormData
  } = useRoles();

  const [permDialog, setPermDialog] = useState({ open: false, role: null });
  const [search, setSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange('search', search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, handleFilterChange]);

  const handleOpenPermissions = (role) => {
    setPermDialog({ open: true, role });
  };

  const handleClosePermissions = () => {
    setPermDialog({ open: false, role: null });
  };

  const handleViewRole = (roleId) => {
    navigate(`/roles/${roleId}`);
  };

  return (
    <MainCard 
      title="Roles"
      secondary={
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<IconPlus />} 
          onClick={() => handleOpenDialog()}
        >
          Add Role
        </Button>
      }
    >
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                )
              }}
              size="small"
            />
          </Grid>
        </Grid>
      </Box>

      <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>SNo</TableCell>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Role ID</TableCell>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Role Name</TableCell>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Created By</TableCell>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontSize: '1rem', fontWeight: 600 }}>Permissions</TableCell>
              <TableCell align="center" sx={{ fontSize: '1rem', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">No roles found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role, index) => (
                <TableRow key={role.roleId} hover>
                  <TableCell sx={{ fontSize: '0.95rem' }}>{(pagination.currentPage - 1) * pagination.pageSize + index + 1}</TableCell>
                  <TableCell sx={{ fontSize: '0.95rem' }}>{role.roleId}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {role.roleName}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.95rem' }}>{role.createdby || role.createdBy || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={role.status ? 'Active' : 'Inactive'}
                      size="small"
                      color={role.status ? 'success' : 'default'}
                      sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="secondary" size="small" onClick={() => handleOpenPermissions(role)} title="Permissions">
                      <IconShieldLock size={20} />
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" size="small" onClick={() => handleViewRole(role.roleId)} title="View Details">
                      <IconEye size={20} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!loading && pagination.totalItems > 0 && (
        <Stack direction="row" justifyContent="center" sx={{ py: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={(event, value) => handlePageChange(event, value - 1)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Stack>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Role' : 'Add New Role'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Role Name"
                value={formData.roleName}
                onChange={(e) => updateFormData('roleName', e.target.value)}
                required
                disabled={editMode}
              />
            </Grid>
            {editMode && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => updateFormData('status', e.target.value)}
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!isDirty}
          >
            {editMode ? 'Save Changes' : 'Create Role'}
          </Button>
        </DialogActions>
      </Dialog>

      <PermissionsDialog 
        role={permDialog.role} 
        open={permDialog.open} 
        onClose={handleClosePermissions} 
      />
    </MainCard>
  );
};

export default Roles;
