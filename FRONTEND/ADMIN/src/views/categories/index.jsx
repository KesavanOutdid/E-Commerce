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
    Typography,
    Stack,
    CircularProgress,
    Switch,
    FormControlLabel
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconEye } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import MainCard from 'ui-component/cards/MainCard';
import { useCategories } from '../../hooks/categories/useCategories';

const Categories = () => {
    const {
        categories,
        loading,
        openDialog,
        editMode,
        formData,
        pagination,
        handleOpenDialog,
        handleCloseDialog,
        handleSubmit,
        handleDeleteCategory,
        handlePageChange,
        updateFormData
    } = useCategories();

    const navigate = useNavigate();

    return (
        <MainCard
            title="Category Management"
            secondary={
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<IconPlus />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Category
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
                                <TableCell>Created By</TableCell>
                                <TableCell>Updated By</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {categories.map((category, index) => (
                                <TableRow key={category._id || category.id}>
                                    <TableCell>{(pagination.currentPage - 1) * pagination.pageSize + index + 1}</TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle1" fontWeight={500}>
                                            {category.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{category.createdBy || '-'}</TableCell>
                                    <TableCell>{category.updatedby || '-'}</TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                color: category.status ? 'success.main' : 'error.main'
                                            }}
                                        >
                                            {category.status ? 'Active' : 'Inactive'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <IconButton color="secondary" size="small" onClick={() => navigate(`/categories/${category._id || category.id}`)} title="View">
                                                <IconEye />
                                            </IconButton>
                                            <IconButton color="primary" size="small" onClick={() => handleOpenDialog(category)} title="Edit">
                                                <IconEdit />
                                            </IconButton>
                                            <IconButton color="error" size="small" onClick={() => handleDeleteCategory(category._id || category.id)} title="Delete">
                                                <IconTrash />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {categories.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography variant="body1" sx={{ py: 3 }}>
                                            No categories found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {!loading && pagination.totalItems > 0 && (
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
                <DialogTitle>{editMode ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Category Name"
                                value={formData.name}
                                onChange={(e) => updateFormData('name', e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.status}
                                        onChange={(e) => updateFormData('status', e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Active"
                            />
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

export default Categories;
