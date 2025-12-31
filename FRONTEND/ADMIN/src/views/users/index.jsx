import {
  Box,
  Button,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  Stack
} from '@mui/material';
import { IconPlus, IconEye, IconEdit } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { useUsers } from '../../hooks/users/UsersHooks';

const Users = () => {
  const {
    users,
    roles,
    loading,
    openDialog,
    editMode,
    formData,
    pagination,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    handleViewUser,
    handlePageChange,
    updateFormData
  } = useUsers();

  return (
    <MainCard 
      title="Users Management"
      secondary={
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<IconPlus />} 
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      }
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SNo</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.userId}>
                  <TableCell>{(pagination.currentPage - 1) * pagination.pageSize + index + 1}</TableCell>
                  <TableCell>
                    <Typography >
                      {user.firstName} {user.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    {user.roleNames?.map((roleName, index) => (
                      <Typography key={index} variant="body2" sx={{ display: 'inline-block', mr: 1 }}>
                        {roleName}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600, 
                        color: user.status ? 'success.main' : 'error.main' 
                      }}
                    >
                      {user.status ? 'Active' : 'Inactive'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton color="info" size="small" onClick={() => handleViewUser(user.userId)} title="View">
                        <IconEye />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && (
        <TablePagination
          component="div"
          count={pagination.totalItems}
          page={pagination.currentPage - 1}
          onPageChange={handlePageChange}
          rowsPerPage={pagination.pageSize}
          rowsPerPageOptions={[10]}
        />
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => updateFormData('firstName', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => updateFormData('lastName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                helperText={editMode ? 'Leave blank to keep current password' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Roles</InputLabel>
                <Select
                  multiple
                  value={formData.roles}
                  onChange={(e) => updateFormData('roles', e.target.value)}
                  label="Roles"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const role = roles.find(r => r.roleId === value);
                        return (
                          <Typography key={value} variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                            {role ? role.roleName : value}
                          </Typography>
                        );
                      })}
                    </Box>
                  )}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.roleId} value={role.roleId}>
                      {role.roleName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default Users;
