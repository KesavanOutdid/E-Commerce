import { useParams } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
  Stack
} from '@mui/material';
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { useUserDetail } from '../../hooks/users/UserDetailHooks';

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
  const { user, loading, getRoleName, handleBackToUsers, handleEditUser, handleDeleteUser } = useUserDetail(userId);

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
          <Grid item xs={12} sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar 
              src={user.profileImage} 
              sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: 'primary.light', color: 'primary.main' }}
            >
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                User ID: {user.userId}
              </Typography>
            </Box>
          </Grid>

          {/* Row 1: Basic Info */}
          <Grid item xs={12} md={4}>
            <DetailItem label="First Name" value={user.firstName} />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetailItem label="Last Name" value={user.lastName} />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetailItem label="Email ID" value={user.email} />
          </Grid>

          {/* Row 2: Status & Contact */}
          <Grid item xs={12} md={4}>
            <DetailItem 
              label="Status" 
              value={
                <Typography sx={{ fontWeight: 600, color: user.status ? 'success.main' : 'error.main' }}>
                  {user.status ? 'Active' : 'Inactive'}
                </Typography>
              } 
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetailItem label="Phone Number" value={user.phone || '-'} />
          </Grid>
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
            <DetailItem label="Created Date" value={user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'} />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetailItem label="Modified Date" value={user.updatedAt ? new Date(user.updatedAt).toLocaleString() : '-'} />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetailItem label="Created By" value={user.createdBy || '-'} />
          </Grid>

          {/* Seller Information Section */}
          {user.sellerInfo && (
            <>
              <Grid item xs={12} sx={{ mt: 2, mb: 2 }}>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>Seller Information</Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <DetailItem label="Shop Name" value={user.sellerInfo.shopName} />
              </Grid>
              <Grid item xs={12} md={4}>
                <DetailItem label="GSTIN" value={user.sellerInfo.gstin || '-'} />
              </Grid>
              <Grid item xs={12} md={4}>
                <DetailItem label="PAN Number" value={user.sellerInfo.panNumber || '-'} />
              </Grid>

              <Grid item xs={12} md={4}>
                <DetailItem 
                  label="KYC Status" 
                  value={
                    <Typography sx={{ fontWeight: 600, color: user.sellerInfo.kycApproved ? 'success.main' : 'warning.main' }}>
                      {user.sellerInfo.kycApproved ? 'Approved' : 'Pending'}
                    </Typography>
                  } 
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DetailItem 
                  label="Live Status" 
                  value={
                    <Typography sx={{ fontWeight: 600, color: user.sellerInfo.isLive ? 'success.main' : 'text.secondary' }}>
                      {user.sellerInfo.isLive ? 'Live' : 'Offline'}
                    </Typography>
                  } 
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DetailItem label="Commission %" value={user.sellerInfo.commissionPercentage ? `${user.sellerInfo.commissionPercentage}%` : '-'} />
              </Grid>

              {/* Bank Details Section */}
              {user.sellerInfo.bankDetails && (
                <>
                  <Grid item xs={12} sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>Bank Details</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <DetailItem label="Account Holder" value={user.sellerInfo.bankDetails.accountHolderName} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <DetailItem label="Account Number" value={user.sellerInfo.bankDetails.accountNumber} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <DetailItem label="Bank Name" value={user.sellerInfo.bankDetails.bankName} />
                  </Grid>
                  <Grid item xs={12} md={4}>
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
