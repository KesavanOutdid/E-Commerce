import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { IconPlus, IconEye, IconEdit } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { useRoles } from '../../hooks/roles/RolesHooks';
import { useEffect } from 'react';

const Roles = () => {
  const navigate = useNavigate();
  const {
    roles,
    loading,
    openDialog,
    editMode,
    formData,
    isDirty,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    updateFormData
  } = useRoles();

  const handleViewRole = (roleId) => {
    navigate(`/roles/${roleId}`);
  };

  return (
    <MainCard 
      title="Roles Management"
      secondary={
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<IconPlus />} 
          onClick={() => handleOpenDialog()}
        >
          Add Role
        </Button>
      }
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table size="small" sx={{ minWidth: '100%'}}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ py: 2, px: 1, fontSize: '1.1rem', fontWeight: 600, width: '60px' }}>S.No</TableCell>
                <TableCell sx={{ py: 2, px: 1, fontSize: '1.1rem', fontWeight: 600, width: '100px' }}>Role ID</TableCell>
                <TableCell sx={{ py: 2, px: 1, fontSize: '1.1rem', fontWeight: 600, width: '200px' }}>Role Name</TableCell>
                <TableCell sx={{ py: 2, px: 1, fontSize: '1.1rem', fontWeight: 600, width: '180px' }}>Created By</TableCell>
                <TableCell sx={{ py: 2, px: 1, fontSize: '1.1rem', fontWeight: 600, width: '180px' }}>Updated By</TableCell>
                <TableCell sx={{ py: 2, px: 1, fontSize: '1.1rem', fontWeight: 600, width: '150px' }}>Status</TableCell>
                <TableCell align="center" sx={{ py: 2, px: 1, fontSize: '1.1rem', fontWeight: 600, width: '100px' }}>View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role, index) => (
                <TableRow key={role.roleId} hover>
                  <TableCell sx={{ py: 1.5, px: 1, fontSize: '1rem' }}>{index + 1}</TableCell>
                  <TableCell sx={{ py: 1.5, px: 1, fontSize: '1rem' }}>{role.roleId}</TableCell>
                  <TableCell sx={{ py: 1.5, px: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                      {role.roleName}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, px: 1, fontSize: '1rem' }}>
                    {role.createdby || role.createdBy || '-'}
                  </TableCell>
                  <TableCell sx={{ py: 1.5, px: 1, fontSize: '1rem' }}>
                    {role.updatedby || role.updatedBy || '-'}
                  </TableCell>
                  <TableCell sx={{ py: 1.5, px: 1 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: '1rem',
                        color: role.status ? 'success.main' : 'error.main' 
                      }}
                    >
                      {role.status ? 'Active' : 'Inactive'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.5, px: 1 }}>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton 
                        color="info" 
                        size="medium" 
                        onClick={() => handleViewRole(role.roleId)} 
                        title="View"
                      >
                        <IconEye size={22} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Role' : 'Add New Role'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Role Name"
                value={formData.roleName}
                onChange={(e) => updateFormData('roleName', e.target.value)}
                required
                disabled={editMode}
              />
            </Grid>
            {editMode && (
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
            )}
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
            {editMode ? 'Save Changes' : 'Create Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default Roles;
