import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Typography,
  Stack,
  TextField
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { useUserDetail } from '../../hooks/users/UserDetailHooks';
import { BASE_URL } from '../../config/apiConfig';
import Swal from 'sweetalert2';

const DetailItem = ({ label, value, color }) => (
  <Box sx={{ mb: 3 }}>
    <Typography 
      variant="caption" 
      sx={{ 
        color: 'text.secondary', 
        fontWeight: 500, 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em',
        display: 'block',
        mb: 0.5
      }}
    >
      {label}
    </Typography>
    {typeof value === 'string' || typeof value === 'number' ? (
      <Typography 
        variant="body1" 
        sx={{ 
          fontWeight: 600, 
          color: color || 'text.primary',
          fontSize: '1rem'
        }}
      >
        {value || '-'}
      </Typography>
    ) : (
      value
    )}
  </Box>
);

const UserDetail = () => {
  const { userId } = useParams();
  const { 
    user, 
    loading, 
    getRoleName, 
    handleBackToUsers, 
    handleEditUser, 
    handleDeleteUser,
    handleApproveKyc,
    handleRejectKyc
  } = useUserDetail(userId);

  const handleApproveClick = async () => {
    if (!user.sellerInfo) return;

    const { sellerInfo } = user;
    const { bankDetails, shopAddress } = sellerInfo;

    // Initial KYC Approval/Rejection Modal (Product Approval style) with Details
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
      handleApproveKyc('approve');
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
        handleRejectKyc(reason);
      }
    }
  };

  if (loading) {
    return (
      <MainCard title="User Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (!user) {
    return (
      <MainCard title="User Details">
        <Typography variant="h6" color="error">
          User not found
        </Typography>
        <Button variant="contained" startIcon={<IconArrowLeft />} onClick={handleBackToUsers} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </MainCard>
    );
  }

  return (
    <MainCard
      title="User Details"
      secondary={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<IconArrowLeft />} onClick={handleBackToUsers}>
            Back
          </Button>
          <Button variant="contained" color="primary" startIcon={<IconEdit />} onClick={handleEditUser}>
            Edit
          </Button>
          <Button variant="contained" color="error" startIcon={<IconTrash />} onClick={handleDeleteUser}>
            Delete
          </Button>
        </Stack>
      }
    >
      <Box sx={{ p: 1 }}>
        <Grid container spacing={1}>
          {/* Header section with Avatar */}
          <Grid size={12} sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
            <Stack direction="row" alignItems="center" spacing={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar 
                  src={user.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : `${BASE_URL}${user.profileImage}`) : ''} 
                  sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: 'primary.light', color: 'primary.main', mb: 1 }}
                >
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </Avatar>
                <Typography variant="caption" display="block">Profile Image</Typography>
              </Box>

              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  User ID: {user.userId}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="column" spacing={1.5} alignItems="flex-end">
              {user.sellerInfo && !user.sellerInfo.kycApproved && (
                <Button 
                  variant="outlined" 
                  color="primary"
                  size="small"
                  onClick={handleApproveClick}
                  startIcon={<IconEdit size="18" />}
                  sx={{ 
                    borderRadius: '6px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.75rem'
                  }}
                >
                  KYC
                </Button>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary', 
                    fontWeight: 500, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em'
                  }}
                >
                  Profile Status
                </Typography>
                <Chip
                  label={user.status ? 'Active' : 'Inactive'}
                  color={user.status ? 'success' : 'error'}
                  size="small"
                  sx={{ 
                    fontWeight: 700, 
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem'
                  }}
                />
              </Box>

              {user.sellerInfo && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary', 
                      fontWeight: 500, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em'
                    }}
                  >
                    KYC Status
                  </Typography>
                  <Chip
                    label={user.sellerInfo.kycApproved ? 'Approved' : 'Pending'}
                    color={user.sellerInfo.kycApproved ? 'success' : 'warning'}
                    size="small"
                    sx={{ 
                      fontWeight: 700, 
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>
              )}
            </Stack>
          </Grid>

          {/* Row 1: Basic Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <DetailItem label="First Name" value={user.firstName} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <DetailItem label="Last Name" value={user.lastName} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <DetailItem label="Email ID" value={user.email} />
          </Grid>

          {/* Row 2: Status & Contact */}
          <Grid size={{ xs: 12, md: 4 }}>
            <DetailItem 
              label="Status" 
              value={
                <Typography sx={{ fontWeight: 600, color: user.status ? 'success.main' : 'error.main' }}>
                  {user.status ? 'Active' : 'Inactive'}
                </Typography>
              } 
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <DetailItem label="Phone Number" value={user.phone || '-'} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <DetailItem 
              label="Roles" 
              value={
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {user.roles?.map((roleId) => (
                    <Typography 
                      key={roleId} 
                      variant="body1" 
                      sx={{ fontWeight: 600 }}
                    >
                      {getRoleName(roleId)}
                    </Typography>
                  ))}
                </Box>
              } 
            />
          </Grid>

          {/* Row 3: Account Meta */}
          <Grid size={{ xs: 12, md: 4 }}>
            <DetailItem label="Created By" value={user.createdBy || '-'} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <DetailItem label="Created Date" value={user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <DetailItem label="Modified By" value={user.updatedBy || '-'} />
          </Grid>
         
           {/* Row 4: Account Meta */}
         
          <Grid size={{ xs: 12, md: 4 }}>
            <DetailItem label="Modified Date" value={user.updatedAt ? new Date(user.updatedAt).toLocaleString() : '-'} />
          </Grid>

          {/* User Addresses Section */}
          {user.addresses && user.addresses.length > 0 && (
            <>
              <Grid size={12} sx={{ mt: 2, mb: 1 }}>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>User Addresses</Typography>
              </Grid>
              {user.addresses.map((address, index) => (
                <Grid size={12} key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Address {index + 1}</Typography>
                  <Grid container spacing={1}>
                    {address.name && (
                      <Grid size={{ xs: 12, md: 4 }}>
                        <DetailItem label="Recipient Name" value={address.name} />
                      </Grid>
                    )}
                    {address.email && (
                      <Grid size={{ xs: 12, md: 4 }}>
                        <DetailItem label="Recipient Email" value={address.email} />
                      </Grid>
                    )}
                    {address.phone && (
                      <Grid size={{ xs: 12, md: 4 }}>
                        <DetailItem label="Recipient Phone" value={address.phone} />
                      </Grid>
                    )}
                    <Grid size={{ xs: 12, md: 3 }}>
                      <DetailItem label="Door No" value={address.doorNo} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <DetailItem label="Street" value={address.street} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <DetailItem label="Landmark" value={address.landmark} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <DetailItem label="City" value={address.city} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <DetailItem label="District" value={address.district} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <DetailItem label="State" value={address.state} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <DetailItem label="Country" value={address.country} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <DetailItem label="Pincode" value={address.pincode} />
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </>
          )}

          {/* Seller Information Section */}
          {user.sellerInfo && (
            <>
              <Grid size={12} sx={{ mt: 2, mb: 2 }}>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>Company Information</Typography>
              </Grid>

              {user.sellerInfo.shopLogo && (
                <Grid size={12} sx={{ mb: 3 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary', 
                      fontWeight: 500, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      display: 'block',
                      mb: 1
                    }}
                  >
                    Company Logo
                  </Typography>
                  <Avatar 
                    src={user.sellerInfo.shopLogo.startsWith('http') ? user.sellerInfo.shopLogo : `${BASE_URL}${user.sellerInfo.shopLogo}`} 
                    sx={{ width: 120, height: 120, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
                    variant="rounded"
                  />
                </Grid>
              )}
              
              <Grid size={{ xs: 12, md: 4 }}>
                <DetailItem label="Company Name" value={user.sellerInfo.shopName} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <DetailItem label="GSTIN" value={user.sellerInfo.gstin || '-'} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <DetailItem label="PAN Number" value={user.sellerInfo.panNumber || '-'} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <DetailItem 
                  label="KYC Status" 
                  value={
                    <Typography sx={{ fontWeight: 600, color: user.sellerInfo.kycApproved ? 'success.main' : 'warning.main' }}>
                      {user.sellerInfo.kycApproved ? 'Approved' : 'Pending'}
                    </Typography>
                  } 
                />
              </Grid>

              {/* Business Address Section */}
              {user.sellerInfo.shopAddress && (
                <>
                  <Grid size={12} sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>Business Address</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DetailItem label="Door No" value={user.sellerInfo.shopAddress.doorNo} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DetailItem label="Street" value={user.sellerInfo.shopAddress.street} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DetailItem label="Landmark" value={user.sellerInfo.shopAddress.landmark} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DetailItem label="City" value={user.sellerInfo.shopAddress.city} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DetailItem label="District" value={user.sellerInfo.shopAddress.district} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DetailItem label="State" value={user.sellerInfo.shopAddress.state} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DetailItem label="Country" value={user.sellerInfo.shopAddress.country} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DetailItem label="Pincode" value={user.sellerInfo.shopAddress.pincode} />
                  </Grid>
                </>
              )}

              {/* Bank Details Section */}
              {user.sellerInfo.bankDetails && (
                <>
                  <Grid size={12} sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>Bank Details</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DetailItem label="Account Holder" value={user.sellerInfo.bankDetails.accountHolderName} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DetailItem label="Account Number" value={user.sellerInfo.bankDetails.accountNumber} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DetailItem label="Bank Name" value={user.sellerInfo.bankDetails.bankName} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DetailItem label="IFSC Code" value={user.sellerInfo.bankDetails.ifscCode} />
                  </Grid>
                </>
              )}
            </>
          )}
        </Grid>
      </Box>
    </MainCard>
  );
};

export default UserDetail;
