import React from 'react';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
  Divider
} from '@mui/material';
import { IconEdit } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import MainCard from 'ui-component/cards/MainCard';
import { useProfile } from '../../hooks/profile/ProfileHooks';
import { BASE_URL } from '../../config/apiConfig';

const DetailItem = ({ label, value }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      {value || '-'}
    </Typography>
  </Box>
);

const ViewProfile = () => {
  const navigate = useNavigate();
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <MainCard title="My Profile">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (!profile) return null;

  return (
    <MainCard
      title="My Profile"
      secondary={
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<IconEdit />} 
          onClick={() => navigate('/user/update-profile')}
        >
          Edit Profile
        </Button>
      }
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
          <Avatar 
            src={profile.profileImage ? (profile.profileImage.startsWith('http') ? profile.profileImage : `${BASE_URL}${profile.profileImage}`) : ''} 
            sx={{ width: 100, height: 100, fontSize: '2.5rem', bgcolor: 'primary.light', color: 'primary.main' }}
          >
            {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {profile.firstName} {profile.lastName}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {profile.roleNames?.join(', ') || 'Administrator'}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Divider />
        </Grid>

        <Grid item xs={12} md={6}>
          <DetailItem label="First Name" value={profile.firstName} />
        </Grid>
        <Grid item xs={12} md={6}>
          <DetailItem label="Last Name" value={profile.lastName} />
        </Grid>
        <Grid item xs={12} md={6}>
          <DetailItem label="Email Address" value={profile.email} />
        </Grid>
        <Grid item xs={12} md={6}>
          <DetailItem label="Phone Number" value={profile.phone} />
        </Grid>
        <Grid item xs={12} md={6}>
          <DetailItem label="Account Status" value={profile.status ? 'Active' : 'Inactive'} />
        </Grid>
        <Grid item xs={12} md={6}>
          <DetailItem label="User ID" value={profile.userId} />
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default ViewProfile;
