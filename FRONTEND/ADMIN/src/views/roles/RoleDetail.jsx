import React from 'react';
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
  MenuItem,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { useRoleDetail } from '../../hooks/roles/RolesHooks';

const DetailItem = ({ label, value, status }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
      {label}
    </Typography>
    {status !== undefined ? (
      <Chip
        label={status ? 'Active' : 'Inactive'}
        color={status ? 'success' : 'default'}
        size="small"
      />
    ) : (
      <Typography variant="body1" fontWeight={500}>
        {value || '-'}
      </Typography>
    )}
  </Box>
);

const RoleDetail = () => {
  const { roleId } = useParams();
  const { 
    role, 
    loading: roleLoading, 
    openDialog,
    formData,
    isDirty: roleDirty,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    updateFormData,
    handleBackToRoles 
  } = useRoleDetail(roleId);

  if (roleLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!role) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Role not found</Typography>
        <Button startIcon={<IconArrowLeft />} onClick={handleBackToRoles} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={handleBackToRoles} size="small">
            <IconArrowLeft />
          </IconButton>
          <Typography variant="h3">{role.roleName}</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<IconEdit />}
            onClick={handleOpenDialog}
          >
            Edit
          </Button>
        </Stack>
      }
    >
      <Box sx={{ p: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
              Basic Information
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <DetailItem label="Role Name" value={role.roleName} />
              </Grid>
              <Grid item xs={12} md={4}>
                <DetailItem label="Role ID" value={role.roleId} />
              </Grid>
              <Grid item xs={12} md={4}>
                <DetailItem label="Status" status={role.status} />
              </Grid>
              <Grid item xs={12} md={4}>
                <DetailItem label="Created By" value={role.createdby || role.createdBy} />
              </Grid>
              <Grid item xs={12} md={4}>
                <DetailItem label="Created At" value={role.createdAt ? new Date(role.createdAt).toLocaleString() : '-'} />
              </Grid>
              <Grid item xs={12} md={4}>
                <DetailItem label="Updated At" value={role.modifiedAt ? new Date(role.modifiedAt).toLocaleString() : '-'} />
              </Grid>
            </Grid>
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
            disabled={!roleDirty}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default RoleDetail;
