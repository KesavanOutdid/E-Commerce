import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { IconArrowLeft, IconEdit } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { useRoleDetail } from '../../hooks/roles/RolesHooks';

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
  </Box>
);

const RoleDetail = () => {
  const { roleId } = useParams();
  const { 
    role, 
    loading, 
    openDialog,
    formData,
    isDirty,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    updateFormData,
    handleBackToRoles 
  } = useRoleDetail(roleId);

  if (loading) {
    return (
      <MainCard title="Role Details">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (!role) {
    return (
      <MainCard title="Role Details">
        <Typography variant="h6" color="error">
          Role not found
        </Typography>
        <Button variant="contained" startIcon={<IconArrowLeft />} onClick={handleBackToRoles} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </MainCard>
    );
  }

  return (
    <MainCard
      title="Role Details"
      secondary={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<IconArrowLeft />} onClick={handleBackToRoles}>
            Back
          </Button>
          <Button variant="contained" color="primary" startIcon={<IconEdit />} onClick={handleOpenDialog}>
            Edit
          </Button>
        </Stack>
      }
    >
      <Box sx={{ p: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <DetailItem label="Role Name" value={role.roleName} />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetailItem label="Role ID" value={role.roleId} />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetailItem 
              label="Status" 
              value={role.status ? 'Active' : 'Inactive'} 
              color={role.status ? 'success.main' : 'error.main'}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <DetailItem label="Created Date" value={role.createdAt ? new Date(role.createdAt).toLocaleString() : '-'} />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetailItem label="Modified Date" value={role.modifiedAt ? new Date(role.modifiedAt).toLocaleString() : '-'} />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetailItem label="Created By" value={role.createdBy || '-'} />
          </Grid>
        </Grid>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Role Status</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Role Name"
                value={formData.roleName}
                disabled
              />
            </Grid>
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
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default RoleDetail;
