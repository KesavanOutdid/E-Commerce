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
import { IconDeviceFloppy, IconArrowLeft, IconCamera } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import MainCard from 'ui-component/cards/MainCard';
import { useProfile } from '../../hooks/profile/ProfileHooks';
import { BASE_URL } from '../../config/apiConfig';

const UpdateProfile = () => {
  const navigate = useNavigate();
  const { profile, loading, saving, formData, isDirty, updateProfileData, handleUpdateProfile } = useProfile();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateProfileData('profileImage', file);
    }
  };

  if (loading) {
    return (
      <MainCard title="Update Profile">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  const getAvatarSrc = () => {
    if (formData.profileImage instanceof File) {
      return URL.createObjectURL(formData.profileImage);
    }
    if (formData.profileImage) {
      return formData.profileImage.startsWith('http') 
        ? formData.profileImage 
        : `${BASE_URL}${formData.profileImage}`;
    }
    return '';
  };

  return (
    <MainCard
      title="Update Profile"
      secondary={
        <Button variant="outlined" startIcon={<IconArrowLeft />} onClick={() => navigate(-1)}>
          Back to Profile
        </Button>
      }
    >
      <form onSubmit={handleUpdateProfile}>
        <Grid container spacing={3}>
          <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                src={getAvatarSrc()} 
                sx={{ width: 120, height: 120, mb: 1, fontSize: '3rem', bgcolor: 'primary.light', color: 'primary.main', border: '2px solid', borderColor: 'primary.main' }}
              >
                {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
              </Avatar>
              <Button
                variant="contained"
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  right: 0,
                  minWidth: 0,
                  width: 35,
                  height: 35,
                  borderRadius: '50%',
                  p: 0
                }}
              >
                <IconCamera size={20} />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
            </Box>
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
              label="Password"
              value={formData.password}
              onChange={(e) => updateProfileData('password', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
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
