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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  Divider
} from '@mui/material';
import { IconArrowLeft, IconEdit, IconDeviceFloppy } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { useRoleDetail } from '../../hooks/roles/RolesHooks';
import { usePermissions } from '../../hooks/roles/PermissionHooks';

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

  const {
    permissions,
    modules,
    loading: permissionsLoading,
    saving,
    isDirty: isPermissionsDirty,
    updatePermission,
    savePermissions
  } = usePermissions(roleId);

  if (loading || permissionsLoading) {
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
            <DetailItem label="Created By" value={role.createdby || role.createdBy || '-'} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Role Permissions</Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<IconDeviceFloppy />} 
            disabled={!isPermissionsDirty || saving}
            onClick={savePermissions}
          >
            {saving ? 'Saving...' : 'Save Permissions'}
          </Button>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>Module</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>View</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Create</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Update</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Delete</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Approve</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {modules.map((m) => {
                const perm = permissions.find(p => p.module === m.module) || {};
                return (
                  <TableRow key={m.module} hover>
                    <TableCell component="th" scope="row">
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {m.module}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {m.actions.includes('view') && (
                        <Checkbox 
                          checked={!!perm.canView} 
                          onChange={(e) => updatePermission(m.module, null, 'canView', e.target.checked)} 
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {m.actions.includes('create') && (
                        <Checkbox 
                          checked={!!perm.canCreate} 
                          onChange={(e) => updatePermission(m.module, null, 'canCreate', e.target.checked)} 
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {m.actions.includes('update') && (
                        <Checkbox 
                          checked={!!perm.canUpdate} 
                          onChange={(e) => updatePermission(m.module, null, 'canUpdate', e.target.checked)} 
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {m.actions.includes('delete') && (
                        <Checkbox 
                          checked={!!perm.canDelete} 
                          onChange={(e) => updatePermission(m.module, null, 'canDelete', e.target.checked)} 
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {m.actions.includes('approve') && (
                        <Checkbox 
                          checked={!!perm.canApprove} 
                          onChange={(e) => updatePermission(m.module, null, 'canApprove', e.target.checked)} 
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
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
