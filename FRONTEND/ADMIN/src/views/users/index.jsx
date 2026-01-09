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
import Swal from 'sweetalert2';

const Users = () => {
  const {
    users,
    roles,
    loading,
    openDialog,
    editMode,
    formData,
    pagination,
    filters,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    handleViewUser,
    handlePageChange,
    handleFilterChange,
    updateKycStatus,
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

  const handleKycApprovalClick = async (user) => {
    if (!user.sellerInfo) return;
    
    // If already approved, show current status
    if (user.sellerInfo.kycApproved) {
      Swal.fire({
        title: 'KYC Status',
        text: `${user.firstName}'s KYC is already APPROVED`,
        icon: 'info'
      });
      return;
    }

    const { sellerInfo } = user;
    const { bankDetails, shopAddress } = sellerInfo;

    // Initial KYC Approval/Rejection with Details
    const result = await Swal.fire({
      title: 'KYC Approval',
      html: `
        <div style="text-align: left; font-size: 0.9rem; max-height: 400px; overflow-y: auto; padding: 15px; border: 1px solid #eee; border-radius: 8px; background: #fafafa;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <div style="color: #2196f3; font-weight: 700; font-size: 1rem; border-bottom: 2px solid #e3f2fd; margin-bottom: 12px; padding-bottom: 5px;">Company Details</div>
              <div style="margin-bottom: 8px;"><strong>Company Name:</strong> ${sellerInfo.shopName || 'N/A'}</div>
              <div style="margin-bottom: 8px;"><strong>GSTIN:</strong> ${sellerInfo.gstin || 'N/A'}</div>
              <div style="margin-bottom: 8px;"><strong>PAN:</strong> ${sellerInfo.panNumber || 'N/A'}</div>
            </div>
            
            <div>
              <div style="color: #2196f3; font-weight: 700; font-size: 1rem; border-bottom: 2px solid #e3f2fd; margin-bottom: 12px; padding-bottom: 5px;">Bank Details</div>
              <div style="margin-bottom: 8px;"><strong>Bank Name:</strong> ${bankDetails?.bankName || 'N/A'}</div>
              <div style="margin-bottom: 8px;"><strong>A/C Holder:</strong> ${bankDetails?.accountHolderName || 'N/A'}</div>
              <div style="margin-bottom: 8px;"><strong>A/C Number:</strong> ${bankDetails?.accountNumber || 'N/A'}</div>
              <div style="margin-bottom: 8px;"><strong>IFSC:</strong> ${bankDetails?.ifscCode || 'N/A'}</div>
            </div>
          </div>
          
          <div>
            <div style="color: #2196f3; font-weight: 700; font-size: 1rem; border-bottom: 2px solid #e3f2fd; margin-bottom: 12px; padding-bottom: 5px;">Business Address</div>
            <div style="line-height: 1.5;">
              ${shopAddress?.doorNo || ''} ${shopAddress?.street || ''},<br>
              ${shopAddress?.landmark ? shopAddress.landmark + ',' : ''} ${shopAddress?.city || ''},<br>
              ${shopAddress?.district || ''} ${shopAddress?.state || ''} - ${shopAddress?.pincode || ''}
            </div>
          </div>
        </div>
        
      `,
      width: '500px',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Approve',
      denyButtonText: 'Reject',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2e7d32',
      denyButtonColor: '#d32f2f',
    });

    if (result.isConfirmed) {
      const { value: commission } = await Swal.fire({
        title: 'Approve KYC',
        text: `Enter commission percentage for ${user.firstName}`,
        input: 'number',
        inputLabel: 'Commission %',
        inputValue: 10,
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value || value < 0 || value > 100) {
            return 'Please enter a valid percentage (0-100)';
          }
        }
      });

      if (commission) {
        await updateKycStatus(user.userId, 'approve', { commissionPercentage: commission });
      }
    } else if (result.isDenied) {
      const { value: reason } = await Swal.fire({
        title: 'Rejection Reason',
        input: 'textarea',
        inputLabel: 'Please provide a reason for KYC rejection',
        inputPlaceholder: 'Type your reason here...',
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'You need to write something!';
          }
        }
      });

      if (reason) {
        await updateKycStatus(user.userId, 'reject', { reason });
      }
    }
  };

  const getKycChip = (user) => {
    if (!user.roles?.includes(2)) {
      return <Typography variant="body1" sx={{ color: 'text.secondary' }}>-</Typography>;
    }

    const info = user.sellerInfo;
    let label = 'PENDING';
    let color = { bg: '#fff8e1', text: '#f57f17', border: '#ffecb3' };

    if (info?.kycApproved) {
      label = 'APPROVED';
      color = { bg: '#e8f5e9', text: '#2e7d32', border: '#c8e6c9' };
    } else if (info?.kycRejectionReason) {
      label = 'REJECTED';
      color = { bg: '#ffeede', text: '#d32f2f', border: '#ffcdd2' };
    }

    return (
      <Chip
        label={label}
        size="small"
        onClick={() => handleKycApprovalClick(user)}
        sx={{
          bgcolor: color.bg,
          color: color.text,
          fontWeight: 600,
          borderRadius: '16px',
          border: '1px solid',
          borderColor: color.border,
          textTransform: 'uppercase',
          fontSize: '0.65rem',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: color.border
          }
        }}
      />
    );
  };

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
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>KYC Status</InputLabel>
              <Select
                value={filters.kycStatus || ''}
                label="KYC Status"
                onChange={(e) => handleFilterChange('kycStatus', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
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
                {getKycChip(user)}
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
