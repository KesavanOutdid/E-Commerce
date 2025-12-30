import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Stack,
  Typography,
  Avatar
} from '@mui/material';
import { IconDeviceFloppy, IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import MainCard from 'ui-component/cards/MainCard';
import { useProfile } from '../../hooks/profile/ProfileHooks';

const UpdateProfile = () => {
  const navigate = useNavigate();
  const { profile, loading, saving, formData, isDirty, updateProfileData, handleUpdateProfile } = useProfile();

  if (loading) {
    return (
      <MainCard title="Update Profile">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard
      title="Update Profile"
      secondary={
        <Button variant="outlined" startIcon={<IconArrowLeft />} onClick={() => navigate('/user/view-profile')}>
          Back to Profile
        </Button>
      }
    >
      <form onSubmit={handleUpdateProfile}>
        <Grid container spacing={3}>
          <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Avatar 
              src={formData.profileImage} 
              sx={{ width: 100, height: 100, mb: 1, fontSize: '2.5rem', bgcolor: 'primary.light', color: 'primary.main' }}
            >
              {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
            </Avatar>
            <Typography variant="caption" color="textSecondary">Profile Image URL</Typography>
            <TextField
              fullWidth
              size="small"
              value={formData.profileImage}
              onChange={(e) => updateProfileData('profileImage', e.target.value)}
              placeholder="https://example.com/image.png"
              sx={{ maxWidth: 400, mt: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={(e) => updateProfileData('firstName', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => updateProfileData('lastName', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => updateProfileData('phone', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              value={profile?.email || ''}
              disabled
              helperText="Email cannot be changed"
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" color="secondary" onClick={() => navigate('/user/view-profile')}>
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

export default UpdateProfile;
