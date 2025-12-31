import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Switch,
  FormControlLabel,
  Stack,
  Typography
} from '@mui/material';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { useUserEdit } from '../../hooks/users/UserEditHooks';

const UserEdit = () => {
  const { userId } = useParams();
  const { formData, loading, saving, roles, isDirty, updateFormData, updateSellerData, handleSubmit, handleCancel } = useUserEdit(userId);

  if (loading) {
    return (
      <MainCard title="Edit User">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  const isSeller = formData.roles.includes(2);

  return (
    <MainCard
      title={`Edit User: ${formData.firstName} ${formData.lastName}`}
      secondary={
        <Button variant="outlined" startIcon={<IconArrowLeft />} onClick={handleCancel}>
          Cancel
        </Button>
      }
    >
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => updateFormData('lastName', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
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
                        <Typography key={value} variant="body1" sx={{ fontWeight: 600, mr: 1 }}>
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
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.status}
                  onChange={(e) => updateFormData('status', e.target.checked)}
                  color="primary"
                />
              }
              label={formData.status ? 'Account Active' : 'Account Inactive'}
            />
          </Grid>

          {isSeller && (
            <>
              <Grid item xs={12}>
                <Typography variant="h4" sx={{ color: 'primary.main', mt: 2 }}>Seller Approvals</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.sellerInfo.kycApproved}
                      onChange={(e) => updateSellerData('kycApproved', e.target.checked)}
                      color="success"
                    />
                  }
                  label={formData.sellerInfo.kycApproved ? 'KYC Approved' : 'KYC Pending'}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.sellerInfo.isLive}
                      onChange={(e) => updateSellerData('isLive', e.target.checked)}
                      color="success"
                    />
                  }
                  label={formData.sellerInfo.isLive ? 'Shop Is Live' : 'Shop Offline'}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Commission Percentage (%)"
                  type="number"
                  value={formData.sellerInfo.commissionPercentage}
                  onChange={(e) => updateSellerData('commissionPercentage', parseFloat(e.target.value))}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" color="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <IconDeviceFloppy />}
                disabled={saving || !isDirty}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </MainCard>
  );
};

export default UserEdit;
