import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Avatar,
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
  Typography,
  IconButton
} from '@mui/material';
import { IconArrowLeft, IconDeviceFloppy, IconUpload, IconX } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { useUserEdit } from '../../hooks/users/UserEditHooks';
import { API_BASE_URL } from '../../config/apiConfig';

const BASE_URL = API_BASE_URL.replace('/api', '');

const UserEdit = () => {
  const { userId } = useParams();
  const { 
    formData, 
    loading, 
    saving, 
    roles, 
    isDirty, 
    updateFormData, 
    updateSellerData, 
    updateShopAddressData,
    updateUserAddressData,
    updateBankDetailsData,
    handleSubmit, 
    handleCancel 
  } = useUserEdit(userId);

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
              disabled
              helperText="Email cannot be changed"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  updateFormData('phone', value);
                }
              }}
              inputProps={{ maxLength: 10 }}
              helperText="Must be 10 digits"
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

          {/* User Addresses */}
          {formData.addresses && formData.addresses.length > 0 && (
            <>
              <Grid item xs={12}>
                <Typography variant="h4" sx={{ color: 'primary.main', mt: 2 }}>User Addresses</Typography>
              </Grid>
              {formData.addresses.map((address, index) => (
                <Grid item xs={12} key={index}>
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>Address {index + 1}</Typography>
                    <Grid container spacing={2}>
                      {!isSeller && (
                        <>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Recipient Name"
                              value={address.name || ''}
                              onChange={(e) => updateUserAddressData(index, 'name', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Recipient Email"
                              value={address.email || ''}
                              onChange={(e) => updateUserAddressData(index, 'email', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Recipient Phone"
                              value={address.phone || ''}
                              onChange={(e) => updateUserAddressData(index, 'phone', e.target.value)}
                            />
                          </Grid>
                        </>
                      )}
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Door No"
                          value={address.doorNo || ''}
                          onChange={(e) => updateUserAddressData(index, 'doorNo', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Street"
                          value={address.street || ''}
                          onChange={(e) => updateUserAddressData(index, 'street', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Landmark"
                          value={address.landmark || ''}
                          onChange={(e) => updateUserAddressData(index, 'landmark', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="City"
                          value={address.city || ''}
                          onChange={(e) => updateUserAddressData(index, 'city', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="District"
                          value={address.district || ''}
                          onChange={(e) => updateUserAddressData(index, 'district', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="State"
                          value={address.state || ''}
                          onChange={(e) => updateUserAddressData(index, 'state', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Country"
                          value={address.country || ''}
                          onChange={(e) => updateUserAddressData(index, 'country', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Pincode"
                          value={address.pincode || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 6) {
                              updateUserAddressData(index, 'pincode', value);
                            }
                          }}
                          inputProps={{ maxLength: 6 }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              ))}
            </>
          )}

          {isSeller && (
            <>
              <Grid item xs={12}>
                <Typography variant="h4" sx={{ color: 'primary.main', mt: 2 }}>Seller Information</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Shop Name"
                  value={formData.sellerInfo.shopName}
                  onChange={(e) => updateSellerData('shopName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="GSTIN"
                  value={formData.sellerInfo.gstin}
                  onChange={(e) => updateSellerData('gstin', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="PAN Number"
                  value={formData.sellerInfo.panNumber}
                  onChange={(e) => updateSellerData('panNumber', e.target.value)}
                />
              </Grid>

              {/* Shop Logo Section */}
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Shop Logo</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={formData.sellerInfo.shopLogoPreview || (formData.sellerInfo.shopLogo ? (formData.sellerInfo.shopLogo.startsWith('http') ? formData.sellerInfo.shopLogo : `${BASE_URL}${formData.sellerInfo.shopLogo}`) : '')}
                    sx={{ width: 100, height: 100, borderRadius: 2 }}
                    variant="rounded"
                  />
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="shop-logo-file"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateSellerData('shopLogoPreview', reader.result);
                            updateSellerData('shopLogoFile', file);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label htmlFor="shop-logo-file">
                      <Button variant="outlined" component="span" startIcon={<IconUpload />}>
                        Upload Logo
                      </Button>
                    </label>
                    {formData.sellerInfo.shopLogoFile && (
                      <IconButton 
                        color="error" 
                        onClick={() => {
                          updateSellerData('shopLogoPreview', null);
                          updateSellerData('shopLogoFile', null);
                        }}
                        sx={{ ml: 1 }}
                      >
                        <IconX />
                      </IconButton>
                    )}
                  </Box>
                </Stack>
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

              {/* Shop Address */}
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Shop Address</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Door No"
                  value={formData.sellerInfo.shopAddress?.doorNo || ''}
                  onChange={(e) => updateShopAddressData('doorNo', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Street"
                  value={formData.sellerInfo.shopAddress?.street || ''}
                  onChange={(e) => updateShopAddressData('street', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Landmark"
                  value={formData.sellerInfo.shopAddress?.landmark || ''}
                  onChange={(e) => updateShopAddressData('landmark', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.sellerInfo.shopAddress?.city || ''}
                  onChange={(e) => updateShopAddressData('city', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="District"
                  value={formData.sellerInfo.shopAddress?.district || ''}
                  onChange={(e) => updateShopAddressData('district', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.sellerInfo.shopAddress?.state || ''}
                  onChange={(e) => updateShopAddressData('state', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.sellerInfo.shopAddress?.country || ''}
                  onChange={(e) => updateShopAddressData('country', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Pincode"
                  value={formData.sellerInfo.shopAddress?.pincode || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) {
                      updateShopAddressData('pincode', value);
                    }
                  }}
                  inputProps={{ maxLength: 6 }}
                />
              </Grid>
              
              {/* Bank Details */}
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Bank Details</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Account Holder Name"
                  value={formData.sellerInfo.bankDetails?.accountHolderName || ''}
                  onChange={(e) => updateBankDetailsData('accountHolderName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bank Name"
                  value={formData.sellerInfo.bankDetails?.bankName || ''}
                  onChange={(e) => updateBankDetailsData('bankName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Account Number"
                  value={formData.sellerInfo.bankDetails?.accountNumber || ''}
                  onChange={(e) => updateBankDetailsData('accountNumber', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="IFSC Code"
                  value={formData.sellerInfo.bankDetails?.ifscCode || ''}
                  onChange={(e) => updateBankDetailsData('ifscCode', e.target.value)}
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
