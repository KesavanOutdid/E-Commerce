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
  Paper,
  Chip,
  Divider,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox
} from '@mui/material';
import { IconArrowLeft, IconEdit, IconTrash, IconShieldLock, IconDeviceFloppy, IconChevronDown } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { useRoleDetail } from '../../hooks/roles/RolesHooks';
import { usePermissions } from '../../hooks/roles/PermissionHooks';

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

  const {
    permissions,
    modules,
    loading: permLoading,
    saving: permSaving,
    isDirty: permDirty,
    updatePermission,
    savePermissions
  } = usePermissions(roleId);

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

          <Grid item xs={12} sx={{ mt: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
              <Typography variant="h4" sx={{ color: 'primary.main' }}>
                Role Permissions
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<IconDeviceFloppy />}
                onClick={savePermissions}
                disabled={!permDirty || permSaving}
              >
                {permSaving ? 'Saving...' : 'Save Permissions'}
              </Button>
            </Stack>

            {permLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ border: '1px solid #eee', elevation: 0 }}>
                <Table size="small">
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
                    {Array.from(new Set(modules.map(m => m.group))).map((group) => (
                      <React.Fragment key={group}>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                          <TableCell colSpan={6} sx={{ fontWeight: 700, py: 1 }}>
                            {group}
                          </TableCell>
                        </TableRow>
                        {modules
                          .filter(m => m.group === group)
                          .map((m) => {
                            const perm = permissions.find(p => p.module === m.module) || {};
                            return (
                              <TableRow key={m.module} hover>
                                <TableCell sx={{ fontWeight: 600, pl: 4 }}>{m.module}</TableCell>
                                <TableCell align="center">
                                  {m.actions.includes('view') && (
                                    <Checkbox 
                                      size="small"
                                      checked={!!perm.canView} 
                                      onChange={(e) => updatePermission(m.module, null, 'canView', e.target.checked)} 
                                    />
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  {m.actions.includes('create') && (
                                    <Checkbox 
                                      size="small"
                                      checked={!!perm.canCreate} 
                                      onChange={(e) => updatePermission(m.module, null, 'canCreate', e.target.checked)} 
                                    />
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  {m.actions.includes('update') && (
                                    <Checkbox 
                                      size="small"
                                      checked={!!perm.canUpdate} 
                                      onChange={(e) => updatePermission(m.module, null, 'canUpdate', e.target.checked)} 
                                    />
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  {m.actions.includes('delete') && (
                                    <Checkbox 
                                      size="small"
                                      checked={!!perm.canDelete} 
                                      onChange={(e) => updatePermission(m.module, null, 'canDelete', e.target.checked)} 
                                    />
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  {m.actions.includes('approve') && (
                                    <Checkbox 
                                      size="small"
                                      checked={!!perm.canApprove} 
                                      onChange={(e) => updatePermission(m.module, null, 'canApprove', e.target.checked)} 
                                    />
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
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
