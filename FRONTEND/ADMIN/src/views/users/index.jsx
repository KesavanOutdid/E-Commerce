import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  Chip,
  Stack,
  Pagination
} from '@mui/material';
import { IconPlus, IconEye, IconSearch } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { useUsers } from '../../hooks/users/UsersHooks';

const Users = () => {
  const {
    users,
    roles,
    loading,
    openDialog,
    editMode,
    formData,
    pagination,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    handleViewUser,
    handlePageChange,
    handleFilterChange,
    updateFormData
  } = useUsers();

  const [search, setSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange('search', search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, handleFilterChange]);

  return (
    <MainCard 
      title="Users"
      secondary={
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<IconPlus />} 
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      }
    >
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search users..."
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
        <Table sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>SNo</TableCell>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Phone</TableCell>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Roles</TableCell>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>KYC Status</TableCell>
              <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontSize: '1rem', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow key={user.userId} hover>
                  <TableCell sx={{ fontSize: '0.95rem' }}>{(pagination.currentPage - 1) * pagination.pageSize + index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {user.firstName} {user.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.95rem' }}>{user.email}</TableCell>
                  <TableCell sx={{ fontSize: '0.95rem' }}>{user.phone || '-'}</TableCell>
                  <TableCell>
                    {user.roleNames?.map((roleName, index) => (
                      <Chip 
                        key={index} 
                        label={roleName} 
                        size="small" 
                        variant="outlined" 
                        sx={{ mr: 0.5, fontSize: '0.75rem', fontWeight: 500 }} 
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    {user.roles?.includes(2) ? (
                      <Chip
                        label={user.sellerInfo?.kycApproved ? 'Approved' : 'Pending'}
                        size="small"
                        color={user.sellerInfo?.kycApproved ? 'success' : 'warning'}
                        sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                      />
                    ) : (
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status ? 'Active' : 'Inactive'}
                      size="small"
                      color={user.status ? 'success' : 'default'}
                      sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" size="small" onClick={() => handleViewUser(user.userId)} title="View">
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
        <DialogTitle>{editMode ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => updateFormData('firstName', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => updateFormData('lastName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                helperText={editMode ? 'Leave blank to keep current password' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Roles</InputLabel>
                <Select
                  multiple
                  value={formData.roles}
                  onChange={(e) => updateFormData('roles', e.target.value)}
                  label="Roles"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const role = roles.find(r => r.roleId === value);
                        return (
                          <Typography key={value} variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                            {role ? role.roleName : value}
                          </Typography>
                        );
                      })}
                    </Box>
                  )}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.roleId} value={role.roleId}>
                      {role.roleName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default Users;
